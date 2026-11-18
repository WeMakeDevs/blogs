---
title: "Toggle Wars: Four Days to Find Out Which Version Wins"
description: "Toggle Wars runs online from 26 to 29 November. Build something with Flagsmith, run a real A/B test on it with Experimentation, and take one of three track prizes."
datePublished: 2026-11-18
author: aayush-sharma
tags: ["hackathon", "flagsmith", "wemakedevs"]
---

Most changes ship without a control group. The feature goes out to everyone at once, the numbers move a bit over the next week, and the move gets attributed to whoever argued hardest for it. Nobody is being dishonest about this. There is just nothing to compare against, so the team ends up reading the chart and telling itself a story.

Feature flags fix the first half of that. The change ships turned off, you turn it on for the people you choose, and you turn it back off without a deploy. Experimentation fixes the second half. The same flag holds both versions, you name the event that counts as success, and the result tells you which version is ahead and how sure you can be about it.

Toggle Wars is four days to run that loop end to end on something you built yourself. It is online, free, and open to anyone, solo or in a team of any size. Hacking starts at 8 AM IST on Wednesday 26 November and submissions close at 8 PM IST on Sunday 29 November. More than a thousand people have registered already, and you join them on the [Toggle Wars page](https://www.wemakedevs.org/hackathons/flagsmith).

## How a round is played

Four steps, and they are the same four whatever you build.

You **create a flag**, and it is a multivariate one, so it holds the versions you want to compare rather than just on and off. You **pick a metric**, which is the event that counts as success: a click, a sign-up, a file uploaded, whatever your app is actually for. You **split the traffic** and decide how many of your users are in the test and how they are divided. Then you **ship the winner**, because Flagsmith gives you a win probability for each version and you roll the winner out through the same flag you were already using.

The part people underestimate is the metric. A version can look better on the surface and lose on the thing you care about, and you only find that out if you picked the right event before you started.

![The four rounds of a Toggle Wars experiment](images/toggle-wars-flagsmith-experimentation-hackathon/rounds.png)

## Getting set up with Flagsmith

Flagsmith is open source. You can start free on Flagsmith Cloud, or run the whole thing yourself with Docker if you would rather own it. There are SDKs for JavaScript, React, Python, Java, Node.js, Go and Flutter, so whatever you are building in is almost certainly covered.

Experimentation runs on top of the flags you already have. It takes the events your app sends and uses a Bayesian stats engine to work out the winner, which is why you get a win probability rather than a yes or no. You can use the managed data warehouse or bring your own ClickHouse or Databricks.

This is what that looks like once a test is live. The flag, the metric, the traffic split and the win probability all sit on one screen, and the rollout stays on the same flag you shipped behind.

![A running experiment in Flagsmith with its flag, metric, traffic split and win probability](images/toggle-wars-flagsmith-experimentation-hackathon/flagsmith-experiment.png)

If you want the whole loop in front of you before the 26th, we wrote it up with a real app and real traffic: [how to run a real A/B test with Flagsmith Experimentation](https://www.wemakedevs.org/blogs/how-to-run-a-real-ab-test-with-flagsmith-experimentation).

There is also a setup prompt on the hackathon page for coding agents. Paste it into Claude Code or whatever you use, and it creates the flag, the metric and the experiment, and adds the code to your app once you approve it. You are still expected to understand and explain what you shipped, so read what it did before you build on top of it. The Flagsmith team is in their Discord through the four days if you get stuck.

## Three tracks, three prizes

Pick the one your idea fits. Each track has one winner.

**Track 01, Test Something Real**, takes **$2,000 in cash**. Build an app and run an actual A/B test on it with Experimentation. The judges want a clear question, both versions behind a flag, a metric built from real events, and results you can explain out loud.

**Track 02, AI Agents and Feature Flags**, takes **$1,000 in cash**. Build an agent or a tool that works with Flagsmith on your behalf, like setting up an experiment from a prompt. This one is scored on use of the Flagsmith CLI, API or MCP server, whether it saves real time, whether a human approves the changes it makes, and whether its output is clear.

**Track 03, Build on Open Source Flagsmith**, takes the **PS5 and GTA 6 bundle**. Run Flagsmith yourself and build around it: an integration, a dashboard, a plugin, a starter template. What matters here is that it is self-hosted and that somebody else can pick it up and reuse it.

There is also a bonus that costs you nothing. One person who stars Flagsmith on GitHub is picked at random and wins a pair of AirPods, so go and star it now rather than on the last day.

![Three tracks and what each one wins](images/toggle-wars-flagsmith-experimentation-hackathon/tracks.png)

## What the judges look at

Every project gets scored on the same four things, whichever track it is in.

They look at your **use of Flagsmith**, meaning whether it is a core part of the project and whether the flags and experiments are doing real work rather than sitting there for show. They look at **impact**, which is whether a developer or a team would actually use this. They look at **creativity**, so either a new idea or a familiar one taken somewhere new. And they look at the **demo video**, which has to show the problem, what you built, and where Flagsmith fits.

The demo video is the one people leave until the last hour and then regret. It is a quarter of the scorecard and it is the only part of your project most judges will see in full.

On explaining your results, one thing worth knowing before Sunday. A win probability is not a verdict. In the test below the dashboard reads 84% and a +14.9% lift, but the credible interval still runs from -14.1% to +44.0%, which crosses zero. That is the model telling you it has not seen enough traffic to call it. Saying that out loud in your demo is a stronger answer than reading the big green number off the screen.

![Exposures, occurrence rate, credible interval and win probability for each variation](images/toggle-wars-flagsmith-experimentation-hackathon/flagsmith-analysis.png)

## What to do between now and the 26th

Today, register on the [Toggle Wars page](https://www.wemakedevs.org/hackathons/flagsmith) and star Flagsmith on GitHub. Both take about two minutes, and the star puts you in the AirPods draw whether or not you end up submitting.

Tomorrow and Friday, create a Flagsmith account, drop an SDK into something you already have running, and put one flag around something trivial. The goal is just to see a value change in your app from the dashboard. Once you have seen that, the rest of it stops feeling abstract.

Over the weekend, run the whole loop once on a throwaway app: multivariate flag, a metric, a traffic split, and enough fake traffic to watch the win probability move. Four days is plenty to build something good, and it is a lot less plenty if day one goes on installing SDKs.

Monday and Tuesday, pick your track and write down the question you want answered. Narrow is better. "Does a shorter form get more sign-ups" is a question you can settle by Sunday. "Does our onboarding work" is not.

Then on Wednesday the 26th at 8 AM IST you start, and you have Thursday and Friday to build and instrument it properly. Record the demo video on Saturday rather than Sunday, and submit before 8 PM IST on the 29th with time to spare.

Register at **[wemakedevs.org/hackathons/flagsmith](https://www.wemakedevs.org/hackathons/flagsmith)**, and we will see you on the 26th.
