---
title: "How to Build a Real-Data AI Project on the AWS Open Source Stack"
description: "Everything in this tutorial is open source and runs on your own laptop. Five techniques from one real project, each of which transfers to whatever you build in First Commit hackathon."
datePublished: 2026-09-18
author: aayush-sharma
tags: ["hackathon", "wemakedevs", "aws"]
---


The Build It track at [First Commit hackathon](https://www.wemakedevs.org/aws/first-commit) is built on AWS's open source projects: [Cedar](https://cedarpolicy.com/en), [Strands Agents SDK](https://strandsagents.com/), [OpenSearch](https://opensearch.org/), [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) and [LocalStack](https://www.localstack.cloud/). These are AWS engineering, released openly, and they run on your laptop with the same APIs and the same semantics you get in the cloud.

This article works through one complete project built on exactly that stack. SchemeProof takes the facts a person is willing to supply and checks them against the rules of Indian public-benefit schemes, showing the official clause behind every condition it evaluates. The current corpus covers 27 conditions across 8 programs, from school scholarships to pensions to unorganised-worker registration.

The design decision worth copying is that the model never decides eligibility. Ordinary Python evaluates every condition, every condition cites a clause in a live government document, and a local model is asked only to explain a result that has already been computed.

Five techniques do most of the work, and each one transfers to whatever you decide to build this weekend. The last section spells them out, so read the parts below for the pattern as much as for this particular project.

## What the Demo Application is About?

![image](images/how-to-build-a-real-data-ai-project-on-the-aws-open-source-stack/1.png)


SchemeProof evaluates **27 cited conditions across 8 programs**: the National Means-cum-Merit Scholarship Scheme, PM-Vidyalaxmi interest subvention, PMAY-U 2.0, the Indira Gandhi old age, widow and disability pensions, the National Family Benefit Scheme, and e-Shram registration.

It returns one of three deliberately modest outcomes.

- **Potential match:** every encoded condition is satisfied.
- **Needs information:** no supplied fact fails, but at least one required fact is unknown.
- **Unlikely:** at least one supplied fact conflicts with an encoded condition.

"Potential match" is deliberately not the same thing as "approved". Final eligibility belongs to the authority running the scheme, and the wording refuses to blur that.

## Architecture & Prerequisites

![Screenshot 2026-09-18 at 1.03.00 AM](images/how-to-build-a-real-data-ai-project-on-the-aws-open-source-stack/2.jpg)

| Requirement | Why |
| --- | --- |
| Docker with Compose | Runs LocalStack and OpenSearch |
| Python 3.12 | The application and the bootstrap scripts |
| AWS SAM CLI | Builds and invokes the Lambda handler locally |
| Ollama with `llama3.2:3b` | The local model that writes explanations |
| Internet access, once | The bootstrap downloads live government sources |

Everything here runs locally against the same AWS APIs you would call in production, so the code you write this weekend is the code you would deploy.

```bash
ollama pull llama3.2:3b
make setup
make infra
```

With above installed, the build order below is worth following as written, because it is the order that keeps you able to check your own work at every step in the hackathon.

## Part 1: Write the Rules as Data, Not as a Prompt

Every eligibility condition has to live somewhere, and there are two places to put it. You can describe it in a prompt and ask a model to apply it, or you can write it down as a comparison and let code evaluate it.

SchemeProof writes all 27 conditions down as data. Somebody reads the official document once, finds the sentence that states the condition, and records three things: the comparison to make, the value to compare against, and the words that justify it.

That reading is the whole of the upfront work. What it buys is a condition you can write a test against, correct in seconds when a scheme changes, and point back at the exact line of the document it came from.

A single condition looks like this. It is the income ceiling for the school scholarship:

```json
{
  "field": "annual_income",
  "label": "Parental income is no more than ₹3.5 lakh per year",
  "operator": "lte",
  "value": 350000,
  "page": 5,
  "quote": "parental income from all sources is not more than Rs. 3,50,000 per annum"
}
```

Each key is doing a separate job: 
- `operator` and `value` are the comparison, kept as a machine-readable pair rather than a sentence something has to interpret. 
- `label` is the only part a person reads. 
- `page` and `quote` are the receipt: which page of the official document this came from, and the words on it. 

### Evaluating One Condition

Two functions do the evaluating, and they work at different levels.

The first handles a single condition. It takes that condition and the person's profile, and answers one question: is this met, not met, or unknown?

```python
def evaluate_rule(rule: dict, profile: dict) -> RuleResult:
    actual = profile.get(rule["field"])
    expected = rule["value"]
    operator = rule["operator"]

    if actual is None or actual == "":
        status = "missing"
    elif operator == "eq":
        status = "met" if actual == expected else "not_met"
    elif operator == "lte":
        status = "met" if float(actual) <= float(expected) else "not_met"
    elif operator == "between":
        lower, upper = expected
        status = "met" if float(lower) <= float(actual) <= float(upper) else "not_met"
    elif operator == "class7_threshold":
        threshold = 50 if profile.get("social_category") in {"sc", "st"} else 55
        status = "met" if float(actual) >= threshold else "not_met"
        expected = threshold
```

Notice the check that happens before any operator is considered. If the profile has nothing for that field, the condition becomes `missing` and no comparison is attempted. A fact nobody supplied is not treated as false, and it is never inferred from the facts that were supplied.

The last operator, `class7_threshold`, is a real piece of policy rather than a generic comparison. The marks requirement is 55 percent, relaxed to 50 percent for SC and ST students. Encoding it as its own operator means the relaxation is written once, tested once, and applied identically on every run.

### Turning Conditions Into an Answer

The second function sits above the first. It runs every condition belonging to one scheme, counts how many came back in each state, and turns those counts into that scheme's answer:

```python
rules = [evaluate_rule(rule, profile) for rule in scheme["rules"]]
failed = sum(r.status == "not_met" for r in rules)
missing = sum(r.status == "missing" for r in rules)

if failed:
    status = "unlikely"
elif missing:
    status = "needs_information"
else:
    status = "potential_match"
```

The order of those checks is what gives the three answers their meaning. One failed condition is enough to make a scheme unlikely, because a contradicted rule cannot be outvoted by the rules that passed. If nothing failed but something is still unknown, the honest answer is that more information is needed. Only when every condition is met does the scheme become a potential match.

Neither function calls a model, and neither one is able to.

Running this against a Class VIII student whose parents earn ₹2.4 lakh, with school type and marks left blank, gives:

```text
  National Means-cum-Merit Scholarship Scheme  ->  NEEDS_INFORMATION
    [PASS   ] Parental income is no more than ₹3.5 lakh per year
              you: 240000   rule: 350000
              page 5: "parental income from all sources is not more than Rs. 3,50,000"
    [UNKNOWN] Studies in a government, government-aided, or local-body school
              you: None   rule: ['government', 'government_aided', 'local_body']
              page 5: "State Government, Government-aided and local body schools"
    [UNKNOWN] Meets the Class VII marks threshold (55%, or 50% for SC/ST)
              you: None   rule: 55
              page 5: "minimum of 55% marks ... relaxable by 5% for SC/ST students"
```

Three things are visible in that output and none of them required a model. The condition that was checked shows the supplied value against the rule value. The two that could not be checked are named rather than assumed. Every line carries the page it came from.

![image2](images/how-to-build-a-real-data-ai-project-on-the-aws-open-source-stack/3.png)

## Part 2: Documents Are Real With a Hash

Citing a page costs nothing and proves nothing. Showing that the page really says what you claim is the part almost nobody does, and it is the part that survives questioning.

No government document is shipped inside this project. On the first run, the application downloads each source directly from its government domain, checks that the response really is the PDF or HTML it was supposed to be rather than an error page, hashes the exact bytes with SHA-256, and stores them in **Amazon S3**. It then splits those documents into individual PDF pages and HTML sections and indexes each unit in **OpenSearch**, so the text can be searched later.

Storing a hash matters because it turns a citation into something checkable. If the stored bytes ever change, the hash changes, and the check fails loudly instead of quietly citing a document that no longer says what you claimed.

A verification step reads all of that back and prints:

```text
Verified 5 official source objects and 27 rule citations against indexed source bytes.
OpenSearch contains 131 searchable PDF pages / HTML sections.
```

That one step makes three separate assertions. The list of stored objects matches the list of sources the project is configured to use. Every stored object still hashes to the digest recorded when it was downloaded. And every rule quote genuinely appears in the indexed page it cites, carrying the same source hash.

![image3](images/how-to-build-a-real-data-ai-project-on-the-aws-open-source-stack/4.png)

Two design choices here are worth copying. The download fails closed, so an HTTP error, a PDF that turns out not to be a PDF, or a transfer that stops halfway will halt the process rather than quietly leave you with a thinner set of documents. And those counts are allowed to change, because a government page can be edited at any time. A verification number that moves is evidence you fetched something live, while a number that never moves usually means the data was bundled.

> **Under a four-day clock:** this is the highest-return twenty minutes in the whole build. Most projects claim real data and cannot show it. One command that re-hashes your sources in front of a judge answers the hardest question in the room before anyone asks it.

## Part 3: Decide Who Can See a Profile With Cedar

A profile here holds income, age, disability status and housing details. Deciding who may read it is not something to scatter across request handlers, where the rules quietly drift apart.

[Cedar](https://www.cedarpolicy.com/) is AWS's open source policy language for exactly this. It runs inside your process with no service to call, and it asks the same question every time: may this **principal** perform this **action** on this **resource**? Here the principal is a person, the action is something like viewing or assisting a check, and the resource is the saved check itself.

Policies come in two kinds, and the difference between them matters. A `permit` grants something, a `forbid` denies it, and a `forbid` always wins when both apply. The whole policy for this application is five rules:

```cedar
permit (principal, action == Action::"CreateCheck", resource)
when { resource.owner == principal };

permit (principal, action == Action::"ViewCheck", resource)
when { resource.owner == principal };

permit (principal, action == Action::"AssistCheck", resource)
when { principal.role == "helper" && resource.shared == true };

@id("private-profile")
forbid (principal, action == Action::"AssistCheck", resource)
when { resource.shared == false };

@id("no-self-assistance")
forbid (principal, action == Action::"AssistCheck", resource)
when { resource.owner == principal };
```

Because a `forbid` always beats a `permit`, somebody adding a more generous permit next month cannot accidentally expose a profile the owner kept private. That guarantee is very hard to make about a pile of hand-written conditionals.

The `@id` labels on the two forbid rules are how the application explains itself. Cedar reports which policy caused a denial, so the label can be mapped to a sentence a person understands rather than a bare 403:

```python
DENIALS = {
    "private-profile": "Cedar denied access: the citizen kept this profile private.",
    "no-self-assistance": "Cedar denied access: a user cannot assist their own check.",
}
```

Running five cases against those policies, where Meera is a citizen and Sana is a community helper:

```text
ALLOW  meera ViewCheck    chk-1  her own check
         Allowed by Cedar policy.
DENY   sana  ViewCheck    chk-1  helper reading a shared check directly
         Cedar denied access: no policy permits this action.
ALLOW  sana  AssistCheck  chk-1  helper assisting an opted-in check
         Allowed by Cedar policy.
DENY   sana  AssistCheck  chk-2  helper assisting a private check
         Cedar denied access: the citizen kept this profile private.
DENY   sana  AssistCheck  chk-3  helper assisting her own check
         Cedar denied access: a user cannot assist their own check.
```

The second result is the one worth pausing on. Sana is denied `ViewCheck` on a check that was deliberately shared with her, because sharing grants the `AssistCheck` action and nothing else. She reaches the check through that action instead, and it returns a redacted view. Opting in to receive help therefore never becomes opting in to full disclosure, and the difference is enforced by the policy rather than remembered by whoever writes the next endpoint.

## Part 4: Let the Model Explain

The model appears only now, once the answer already exists.

[Strands Agents SDK](https://strandsagents.com/) is AWS's open source agent SDK. It treats the model as a swappable provider, which here means one running locally through Ollama, and the same code points at Amazon Bedrock without a rewrite.

The agent is handed the finished result and asked for two sentences:

```python
agent = Agent(
    model=OllamaModel(host=host, model_id=model_id, temperature=0),
    callback_handler=None,
    system_prompt=(
        "Return JSON with one key named summary. Write two short sentences using only supplied scheme names "
        "and statuses. Say potential match, never eligible or approved. State that official verification is required."
    ),
)
```

`temperature=0` is doing quiet work. It asks the model for its most predictable output rather than a varied one, so the same result produces the same sentence every time. A demo that rephrases itself on every run is a demo that can phrase something badly on the run that counts.

A system prompt is a request rather than a guarantee, so the reply is checked before anything uses it. The model returns text, that text is parsed as JSON, and the `summary` field it contains has to pass two tests:

```python
summary = str(json.loads(reply).get("summary", "")).strip()

if summary and "official" in summary.lower() and not any(
    word in summary.lower() for word in ("approved", "guaranteed", "definitely eligible")
):
    return summary
```

The summary must mention official verification, and it must avoid the words that would turn a cited starting point into a promise. If either test fails, the model's sentence is discarded and one assembled from the result itself is returned instead:

```python
matched = ", ".join(item["name"] for item in potential_matches)
return f"Your supplied profile meets every encoded rule for {matched}. Official verification is still required."
```

This is the pattern worth taking to any project with a model in it. Decide what the model may not do, write that contract into code, check its output against the contract, and keep a correct answer ready for when it fails. Because the deterministic path has already produced a complete result, the model can be entirely unavailable and the application still works.

## What Each AWS Technology Is Doing

| Technology | Its job here | Why this one |
| --- | --- | --- |
| **Amazon S3** | Holds the exact downloaded bytes of every government PDF and HTML page, keyed by hash | Object storage is the right home for evidence that must not change, and the hash is what makes a citation checkable |
| **Amazon DynamoDB** | Stores saved checks by id | Single-key reads, no joins, no migrations to manage while the clock runs |
| **AWS Lambda**, through SAM | Runs the handler that matches a profile against the schemes | A short burst of work triggered by a request is precisely Lambda's shape |
| **OpenSearch** | Full-text search across 131 extracted pages and sections | A citation is only verifiable if you can search the real document text |
| **Cedar** | Owner-only access, and opt-in sharing that returns a redacted view | Policy lives outside application code, and forbid beats permit |
| **Strands Agents SDK** | Calls the local model for the explanation | Model-agnostic, so the same code points at Amazon Bedrock without a rewrite |
| **LocalStack** | Serves S3 and DynamoDB on the laptop | Identical APIs, so the same calls run against AWS unchanged |

**Firecracker** and **Corretto** appear in the Build It track list and this project does not use them. Firecracker is the microVM technology Lambda runs on in production, and LocalStack uses containers instead, so nothing here touches it. Corretto is Amazon's OpenJDK distribution, which would be relevant when running OpenSearch directly on the JVM rather than in Docker.

## Five Techniques You Can Reuse on Any Project

Take away the welfare schemes and five techniques remain. Each one is cheap, each shows well in a demo, and each fits something completely different:

1. **Rules as data:** Anything with conditions belongs in a file of operators and values rather than in a paragraph you hope gets read correctly. Hostel allocation, exam form validation, fee waivers, lab safety sign-offs. A new rule becomes a data edit, and it can be tested.

2. **Documents you can prove:** Download the source, check it is the document type you expected, hash the bytes, store them, index what you extracted, then write the one command that proves your quotes still exist. This fits anything that quotes something authoritative: college handbooks, legal aid guidance, clinical protocols, standards, RTI responses.

3. **Authorization as policy:** The moment a second kind of user exists, put the rules in Cedar. Peer review where authors must not review themselves, a marketplace where sellers see only their own orders, a record a patient shares with one doctor.

4. **A constrained, checked model:** Define what the model may not do, check its output against that, and keep a deterministic answer ready. This applies to every model feature you will ever ship.

5. **The whole stack locally:** LocalStack and SAM let you build the architecture you would actually deploy, with S3, DynamoDB and Lambda behaving as they do in the cloud. Point the same code at AWS endpoints and it runs unchanged.

## Why This Holds Up Under a Four-Day Clock

First Commit gives you four days, which is enough to build something real and not enough to recover from a bad start. Three decisions here were made because of that constraint rather than despite it.

1. **Rules as data cost nothing to change**: Adding a ninth scheme is a data edit rather than a code change, which on the final morning is the difference between twenty minutes and an afternoon.

2. **The deterministic path works without the model**: Ollama can be down, the laptop can be slow, the reply can be nonsense, and a complete cited result still comes back. Demos fail on the machine that matters, and a project that degrades rather than collapses is one you can still present.

3. **Verification is a command rather than a claim**: The hash check and the test suite both finish in about a second and both produce output you can put on screen. Judges weigh idea and impact, whether it is built on AWS, what you learned, execution and the demo, and a reproducible check speaks to four of those five at once.

If you are building on the Build It track this weekend, copy the trust boundary above everything else. Decide early what your model is not allowed to do, write that into the code, and you will spend the last day polishing instead of defending.

First Commit runs from 17 to 20 September 2026, online across India, with an in-person build day in Bangalore on 19 September. One submission is considered for Build It, Ship It and Best UI together, so there is nothing to choose at registration.

**[Check in for First Commit](https://www.wemakedevs.org/aws/first-commit)** and join the community on [Discord](https://discord.gg/wemakedevs) for team formation and mentorship.

---

***Disclaimer:** SchemeProof is not a government application or an approval engine. Scheme rules and portals change, and a result is a cited starting point that must be verified on the official portal.*
