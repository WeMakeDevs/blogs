---
title: How to Root-Cause a Kubernetes Incident With NudgeBee
description: A real failure on a real cluster. The agent read the evidence, told me my premise was wrong, and was right.
datePublished: 2026-11-23
author: aayush-sharma
tags: [technical, nudgebee, kubernetes, hackathon]
---

Most Kubernetes incidents are not mysteries about Kubernetes. The pods are running, the dashboard is green, and a customer still cannot buy a telescope. The cause usually sits one or two hops away from the symptom, in a memory limit or a dependency or a config value that nothing on the pod view will ever surface. Finding it means walking that chain by hand: logs here, an event there, a deployment manifest you half remember.

NudgeBee automates that walk: an agent runs in your cluster, a knowledge graph gets built out of what it collects, and you ask in plain language what is wrong. The part that decides whether it is useful is what comes back: quoted log lines, manifests and timestamps, or a confident paragraph.

It is also one of the three sponsor tools at Festive Hacks on 25 November, so everything below runs on a cluster you can stand up in about fifteen minutes. The numbers, the log lines and one fairly embarrassing correction are all real.

## The app this runs on

The demo is the OpenTelemetry Astronomy Shop, the reference microservices app the OpenTelemetry project maintains. It sells telescopes, and behind the storefront sit around twenty services: frontend, product-catalog, cart, checkout, payment, shipping, recommendations, Kafka, and a load generator that keeps buying things so there is always traffic.

![The Astronomy Shop storefront running on the kind cluster](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/astronomy-shop.jpg)

It also ships flagd and a set of feature flags that break things on purpose, which is how I planned to stage the incident. That plan did not survive contact with the cluster, and the post is better for it.

## Getting a cluster NudgeBee can see

Three commands for the cluster and the app:

```bash
kind create cluster --name nudgebee-demo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install otel-demo open-telemetry/opentelemetry-demo -n demo --create-namespace
```

Then create a Kubernetes account under Admin, Integrations, Kubernetes Clusters, mark it non-production, and run the installer with the key it hands you:

```bash
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
bash installation.sh -a <agent-key> -d true
```

The `-d true` disables the eBPF node agent, which cannot attach its probes on kind because the nodes are containers sharing the host kernel. You lose network metrics, L7 traces and profiling. You keep inventory, events, metrics, logs and recommendations, which is everything used below.

![Where NudgeBee sits in relation to the cluster](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/architecture.jpg)

There are two components, both Helm charts, and the agent streams out of your cluster on 443, so nothing listens for inbound traffic, and the install is read-only until you deliberately change that. That last detail comes back at the end.

Inventory landed in about four minutes.

![The cluster as NudgeBee sees it: 3 nodes, 42 applications, 54 pods](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/cluster-summary.jpg)

Three nodes, 42 applications, 54 pods, and a set of insights that are unflattering rather than reassuring: frequent restarts, two OOMKill events, CPU throttling, node saturation. I read that as laptop noise and moved on, which is the mistake the rest of this post is about.

## It argues with your alerts before you ask it anything

![NuBi's briefing: 31 events in, 30 issues out, 17 ranked above P3](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/nubi-briefing.jpg)

Read the middle and right panels rather than the first. Thirty-one events came in, thirty issues came out, and NuBi ranked fifteen of them *below* the severity their source assigned, seven above, agreeing with the source on eight.

That ratio is the thing worth judging. A triage layer that always agrees with Prometheus has added nothing, and one that only ever downgrades is a mute button with a nicer font. The P0 in this window was `EtcdInsufficientMembers`, which on a single control-plane kind cluster is true, permanent and uninteresting.

## When the fault you injected does nothing

The plan was to turn on `productCatalogFailure`, which makes product-catalog fail for exactly one product, and watch the storefront break in a way that looks like somebody else's problem. I flipped it in the demo's own flag UI, saved, reloaded to confirm it said `on`, and the shop carried on selling telescopes.

The useful move here is not to retry the toggle. It is to ask the cluster what it thinks is true:

> In the demo namespace, show me the flagd container logs from the last 15 minutes. Has it reloaded its configuration file, and what is the current value of the productCatalogFailure flag?

![The question, and what it set off: 56 tasks, one approval, 7m 41s](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/nubi-question.jpg)

Fifty-six tasks, one approval, twelve sources, seven minutes forty-one seconds. It found the pod, pulled logs from all three containers, read the ConfigMap, the pod spec, the init container and the volume mounts, port-forwarded to flagd's OFREP endpoint to evaluate the flag directly, and read an upstream flagd issue about file watching.

![The answer, with flagd's own fsnotify events](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/flagd-evidence.jpg)

The flag evaluated to `false` on every path, and the log lines say why:

- **flagd watches a file, not the ConfigMap:** it starts with `--uri file:./etc/flagd/demo.flagd.json`, and an init container copies the ConfigMap into that path at pod start.
- **flagd-ui writes to that same file:** it runs as a sidecar in the same pod with the directory mounted read-write, so the edit really did reach disk.
- **the watcher saw the write as a delete:** `CHMOD` at 08:41:04 then `REMOVE` at 08:41:44, and the same pair again two minutes later.
- **so the config in memory stayed the original one:** the ConfigMap version, where both branches of the targeting rule return `off`.

![How the config actually reaches flagd, and where it stops](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/flagd-config-path.jpg)

A UI, a file, a watcher and a ConfigMap disagreeing with each other, settled in under eight minutes with artefacts rather than a theory.

![What one question set off, start to finish](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/investigation-flow.jpg)

## It stops at the write boundary, and it should

So I asked it to apply the fix: patch the ConfigMap, restart the deployment. It asked for approval twice, once per mutating command, showing the exact command each time. I approved both. Then:

![The agent refusing its own remediation because writes are disabled](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/agent-readonly-refusal.jpg)

```
kubectl rollout restart deployment flagd -n demo
Status: Failed (Exit Code: 1)
kubectl: restart is not a read-only subcommand of rollout (allowed: history, status);
enable runner.enableWritePermissions for writes
```

It is worth being precise about where that boundary sits, because I had it wrong at first. The runner's Kubernetes service account can patch that ConfigMap and that deployment, so RBAC was never what stopped it. The refusal came from the command guard inside the runner, which allows `rollout history` and `rollout status` and rejects `rollout restart` as a mutating verb. Approving in the chat does not lift it. Lifting it means setting `runner.enableWritePermissions` at install time, which is a decision for whoever owns the cluster and grants a great deal more than one restart.

For a hackathon project this is worth copying rather than routing around. An agent that reads everything and changes nothing until a specific permission is enabled is the one a platform team would actually install, and the judging criteria ask for human approval explicitly.

## The pods are green and the page is broken

Then, while I was still trying to get that flag to land, the storefront started returning 500s on its own. I read the two as connected, because of course I did:

![The product page with no name, no image and a price of zero](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/broken-product-page.jpg)

The page renders, the cart works, nothing crashed, and there is simply no product in it. The API underneath returns a bare `500 Internal Server Error`. That looked like my fault injection arriving late, so I asked the obvious question with that assumption built straight into it:

> The storefront in the demo namespace is returning 500s on one product page and checkout is failing for it, but the frontend and product-catalog pods are all green with no restarts. What is the root cause?

![NuBi's plan: two ranked hypotheses before it starts](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/nubi-hypotheses.jpg)

It starts by writing down what it intends to prove. Two hypotheses, ranked: the feature flag, likely high, and a missing OpenSearch dependency, likely medium. Then it goes and tests them.

## The answer, which was not the one I wanted

![The causality chain, five whys deep](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/rca-causality-chain.jpg)

The first line of the summary corrects me. Not the flag:

- **Symptom:** product pages return 500 and checkout fails.
- **Why:** frontend and checkout cannot reach product-catalog over gRPC, logging `14 UNAVAILABLE: connect ECONNREFUSED 10.96.208.146:8080` and aborting with `failed to prepare order: failed to get product`.
- **Why:** the product-catalog pod is in CrashLoopBackOff.
- **Why:** the cgroup OOM killer is sending SIGKILL, exit code 137.
- **Root cause:** the deployment is capped at `limits.memory: 32Mi` with `GOMEMLIMIT=16MiB`, and the working set climbs past 25.8 MiB under normal traffic plus a telemetry exporter retrying forever against a host that does not exist.

![The evidence chain behind it](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/rca-evidence-chain.jpg)

Every link is a cited step: the Kubernetes events, the deployment manifest, 316 product requests in the frontend logs, the live pod status showing five restarts, and `container_memory_working_set_bytes` at 27,058,176 immediately before the kill.

The line that settles it is the third one. The 500s were hitting `0PUK6V6EV0`, `2ZYFJ3GM2N`, `66VCHSJNUP`, `HQTGWGPNH4` and others, not only the product my flag targeted. A flag that fails one product cannot produce that. A catalog that is dead cannot produce anything else.

And the telemetry exporter failing against `opensearch` was my doing: I installed the demo with `--set opensearch.enabled=false` to save memory on a laptop, which left the pipeline pointed at a service that no longer exists, retrying forever inside a 32Mi ceiling.

I checked it myself before writing this, which is the whole point of an answer made of artefacts. By the time I tested the five product IDs it had named, the pod had recovered and every one of them returned 200. That is exactly what a crash loop looks like from outside and exactly what a feature flag does not.

## The fault I meant to plant, found without being told

With product-catalog restored to a 64Mi request and a 128Mi limit, the flag finally went in the way it was supposed to: `productCatalogFailure` targeting `OLJCESPC7Z` only, with the default and the non-matching branch left at `off`. A direct `GetProduct` for that SKU returns gRPC `13 INTERNAL` with `Error: Product Catalog Fail Feature Flag Enabled`, and a control SKU returns `0 OK`.

From the outside the shop looks fine, which is the interesting part:

![The targeted product page: shell, zero price, recommendations still rendering](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/flag-broken-product.jpg)

Note that this is the same visual signature as the crash loop earlier. One product page with no name, no image and a price of zero, caused in one case by a dead catalog and in the other by a flag aimed at one SKU. The edge cannot tell you which.

So this time I gave away nothing, and asked whether anything was wrong at all:

> The storefront in the demo namespace looks healthy from the outside: product pages render and orders complete. Is any service in that namespace still returning errors internally? If so, which calls fail, and why do they fail for some requests and not others?

![The answer: the flag, the targeting rule, and why the failure is intermittent](images/how-to-root-cause-a-kubernetes-incident-with-nudgebee/sku-causality-chain.jpg)

Sixty-three tasks later it named the flag, quoted the targeting rule out of the ConfigMap, looked up `OLJCESPC7Z` in the Postgres seed data to confirm it is the National Park Foundation Explorascope, and then explained the part I had not thought about:

- **the direct product endpoint fails every time:** `/api/products/OLJCESPC7Z` returns 500, other SKUs return 200.
- **the recommendations endpoint fails intermittently:** the recommendation service picks a subset of products, the frontend resolves each one through `getProduct`, and the whole request fails only when the targeted SKU happens to be in that subset.
- **the pages and the order pipeline keep working:** server-side rendering for other products does not block on the client-side recommendation fetch, and checkout, cart, payment and shipping are untouched.

I went and measured it. Five calls to the product endpoint returned 500 five times out of five. Five calls to the recommendations endpoint returned 500 twice and 200 three times, which is exactly the behaviour it described and not something I would have found by refreshing a page a couple of times. Adding the targeted telescope to the cart silently does nothing and the cart stays empty, which is the one user-visible symptom in the whole thing and the one nobody would open a ticket about.

It also got one thing wrong, or rather asserted one thing it had not checked. It said checkout succeeds when the purchased items do not include the targeted SKU, framed as fact. That happens to be true, but only because you cannot get that item into a cart at all, which is a different mechanism from the one implied. It flagged a related gap honestly in the same paragraph, saying it could not verify how the browser handles the failed fetch because container exec is blocked by the read-only access. One claim labelled unverified, one not. Read both kinds the same way.

## How to read these answers

Three habits did the work, and they transfer to any agent you point at a cluster.

- **Ask for the evidence, not the conclusion:** show me the logs and tell me the current value produced timestamps and a literal ConfigMap. Why is my flag broken would have produced a plausible paragraph.
- **Name the scope:** every question above named the namespace. The cluster has 54 pods and most are irrelevant to any given question.
- **Let it contradict you:** the premise I wrote into my own question was wrong, and the useful answer was the one that said so in its first line. An agent that agrees with your framing is telling you about your framing.

The footer under every answer says that AI-generated content may include hallucinations and to double-check critical details. That is the right amount of self-confidence, and it matches how the answers are built: the strong parts are the quoted artefacts, not the prose around them.

## What it costs to try

The Community edition is free and self-hosted, source-available under BSL 1.1, with the agents under Apache 2.0. The cloud free tier covers two clusters. Everything here ran on the free tier plus one kind cluster.

- **Give Docker real memory:** 10 GB or more, or the demo will OOMKill before you get anywhere. Mine did, and that became the incident.
- **Leave the optional components alone:** disabling a dependency to save memory can leave an exporter pointed at a service that no longer resolves.
- **Rightsizing needs history:** cost recommendations want roughly an hour of data, so a fresh cluster shows nothing there at first. On this one it eventually offered 208.

## Festive Hacks, 25 November, Bengaluru

Festive Hacks runs on 25 November at BIEC in Bengaluru, on the floor of WeAreDevelopers Conference India. Every project has to use all three sponsor tools: Flagsmith for feature flags and experimentation, NudgeBee for agentic ops, and Sarvam AI for Indian-language models. Judging is by Kunal Kushwaha, Hitesh Choudhary and Saiyam Pathak.

The grand prize is a fully sponsored VIP trip to Berlin for the whole team for WeAreDevelopers World Congress 2027, alongside 1 Lakh rupees in cash and Keychron keyboards. Accepted hackers get a free conference pass, and conference tickets are 999 rupees with the code WEMAKEDEVS999. Apply from the [Festive Hacks page](https://www.wemakedevs.org/hackathons/festivehacks), and the [resources page](https://www.wemakedevs.org/hackathons/festivehacks/resources) collects the quickstarts for all three tools.

Four things worth building on the NudgeBee side, going by what it is actually good at:

- **a workflow that closes a loop you close by hand today:** the Workflow Builder has Kubernetes tasks, CI/CD tasks, HTTP calls and approval steps, so a runbook living in Confluence can become something that runs with a human gate on the mutating step.
- **an investigation that ends in a ticket or a pull request:** connect GitHub or Jira and carry the evidence across, so the artefact outlives the chat.
- **something that treats read-only as the feature:** a drift reporter, a pre-merge checker, a reviewer, anything you want nowhere near a write.
- **a rightsizing story:** this cluster had a 32Mi limit that took the catalog down. Turning a recommendation into an approved, scheduled change is a real workflow and a demo people recognise.

## What to do between now and the 25th

Today is the 23rd, so there are two days, and that is plenty if you spend them on setup rather than on the idea.

**Today.** Sign up, create the kind cluster, install the demo and the agent with the four commands above, and let it run for an hour so the metrics have something to say. While it fills, read the [quickstart](https://docs.nudgebee.com/docs/) and the [root cause walkthrough](https://docs.nudgebee.com/docs/features/ai/use-cases/incident-rca/).

**Tomorrow.** Break something on purpose and ask about it in the words you would use with a colleague. Do it now rather than on the day, because what you want on the floor is a feel for which questions produce evidence, and that takes one afternoon to build.

**On the 25th.** Bring a question whose shape you already know, and let the agent do one job end to end with a human where it matters. That beats a platform half-built by lunchtime, every time.
