---
title: "How to Run a Real A/B Test With Flagsmith Experimentation"
description: "A walkthrough of Overlap, a live timezone meeting planner, with one multivariate flag, one metric and one running Flagsmith experiment behind the button that matters."
datePublished: 2026-11-18
author: aayush-sharma
tags: ["technical", "flagsmith", "hackathon"]
---

An A/B test is how you find out whether a change to your product actually helped. Two versions of the same thing go in front of real users at the same time, you count which version got more of them to do the thing you wanted, and that is your answer.

The idea is easy and the plumbing is not. Both versions have to run at once, each user has to stay on whichever one they were given, and whatever they do afterwards has to be tied back to the version they saw. That is a lot to build before you learn anything, which is why a change to a signup flow or a checkout usually ships on somebody's opinion instead.

Flagsmith Experimentation is that plumbing, sitting on the feature flags you already have. The two versions become values on a flag, the success event is one call in your code, and Flagsmith reports the probability that each version is the better one.

Two of our hackathons this month run on it. **[Toggle Wars](https://www.wemakedevs.org/hackathons/flagsmith)** is online from 26 to 29 November and asks you to do exactly that on something you build. **[Festive Hacks](https://www.wemakedevs.org/hackathons/festivehacks)** runs the day before, in person at BIEC in Bengaluru, on the floor of WeAreDevelopers Conference India.

Flagsmith is one of the three sponsor tools every Festive Hacks project has to use, and second place there is ₹1 lakh in cash for the best use of it. So whichever one you are going to, the setup is the same.

I built something to run one on, and this is how it went.

## The app this runs on

Overlap sorts out what time three people in different countries can actually meet, and it is at **[overlap-gdzp.onrender.com](https://overlap-gdzp.onrender.com)**. It runs on a free instance, so the first request after a quiet spell takes about a minute to wake.

![Overlap with a three person plan and the best meeting time](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/overlap-plan.png)

Add the people you are meeting and it picks the hour that falls inside everyone's working day. Kunal is in London when he is not travelling, Sachin and I are in India, and that question used to cost us a few messages a week.

The plan lives in the URL, so there is no sign up and no database. You copy the link, send it on, and whoever opens it adds themselves in one click. If nobody copies that link the app does nothing at all, so that button is the one place worth testing. The question I ran is whether labelling it "Get everyone's times" gets more people to press it than "Copy invite link" does.

Below the suggestion is a strip of the next 24 hours, one row per person in their own local time.

![The 24 hour strip and the values Flagsmith served on this request](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/overlap-grid-and-flags.png)

The footer prints what Flagsmith served on that request, and the first card names the variation this visitor landed in.

## How the pieces fit together

![Architecture of Overlap and Flagsmith Experimentation](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/architecture.png)

The browser keeps a random visitor id in local storage and Flagsmith buckets on it. Each request asks Flagsmith which variation that id gets, and the same call records the exposure. When the visitor copies the link, the server sends the success event under the same id and Flagsmith matches the two.

## Round one: two versions of the same button, both live

Toggle Wars splits a round into four moves, and the first is a multivariate flag holding the versions you want to compare.

Mine is `invite_cta`. The control is the old wording, `Copy invite link`, and the variation is `Get everyone's times`, which names the outcome instead of the mechanism.

![The invite_cta multivariate flag in Flagsmith](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/flagsmith-invite-cta-flag.png)

Only multivariate flags can be experimented on, so the flag and its variations have to exist first. Once the experiment starts Flagsmith locks the values, which stops you changing what you are measuring halfway through.

## Round two: deciding what counts as success before you look

The second move is the metric, and it is worth picking before you have seen a single number. Mine is `invite_link_copied`, set to occurrence, so it counts visitors who did it at least once rather than clicks.

![The invite_link_copied metric](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/flagsmith-metric.png)

Flagsmith computes metrics from a data warehouse, and the managed one is already wired up, so there is nothing to set up here unless you want your own ClickHouse or Databricks behind it.

## Round three: splitting the traffic without the page flickering

The third move is how many visitors enter and how they are divided. I put all of them in and split evenly.

Bucketing is deterministic on the identifier you pass the SDK, which is what stops the button changing its wording on reload. It is also why the app makes one visitor id and keeps it instead of a new one per request.

## Wiring it in takes two calls

Events have to be turned on:

```python
flagsmith = Flagsmith(
    environment_key=os.environ["FLAGSMITH_ENVIRONMENT_KEY"],
    enable_events=True,
    default_flag_handler=lambda name: DEFAULTS.get(name, DefaultFlag(False, None)),
)
```

One call resolves the variation for a visitor and records the exposure:

```python
flag = flagsmith.get_experiment_flag("invite_cta", identifier=visitor_id)
label = str(flag.value)
```

Another sends the conversion when the copy succeeds:

```python
flagsmith.track_event("invite_link_copied", identifier=visitor_id)
```

That is the whole integration. The `default_flag_handler` keeps the button sensible when Flagsmith cannot be reached, which on a free instance with a cold start does happen.

## Round four: reading the result without fooling yourself

![The running experiment and its results](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/flagsmith-experiment.png)

Five hundred and two visitors are enrolled. Flagsmith calls `Variant_1` the winner at 84% and suggests rolling it out.

![Exposures, occurrence rates and the credible interval for each variation](images/how-to-run-a-real-ab-test-with-flagsmith-experimentation/flagsmith-analysis.png)

The table underneath is where the real reading is. The control went to 247 visitors and 30.4% copied the link, the variation went to 255 and 34.9% copied it. The 95% credible interval on that 14.9% lift runs from -14.1% to 44.0%, so the direction is fairly clear and the size is not. Only more traffic narrows that.

I would leave it running rather than switch the default on an 84% that still has noise in it, and judges will care that you can say which of those two readings you took and why.

One disclosure. The 502 visitors are traffic I pushed through the demo, not people who wanted a meeting, so read the direction as arithmetic rather than as a finding about button copy.

When a result does settle, you end the experiment and set the winning value on the same flag. Every visitor has it on their next request.

## Toggle Wars, 26 to 29 November

Online, free, solo or in a team, with $5,000 in prizes plus a PS5 and AirPods. Three tracks, and you enter the one your idea fits.

**Test Something Real**, $2,000 in cash, is the track this walkthrough belongs to. Build an app and run an actual A/B test on it. Judges want a clear question, both versions behind a flag, a metric fed by real events, and results you can explain.

**AI Agents and Feature Flags**, $1,000 in cash, is for an agent or tool that operates Flagsmith for you, such as setting up an experiment from a prompt. It should use the Flagsmith CLI, API or MCP server, save real time, keep a human in the approval path, and produce output someone can read.

**Build on Open Source Flagsmith** takes the PS5 and GTA 6 bundle. Self-host Flagsmith and build around it: an integration, a dashboard, a plugin, a starter template.

There is also a bonus prize. One person who stars Flagsmith on GitHub is picked at random and wins AirPods.

Every project is scored the same way whatever the track: whether Flagsmith does real work in it, whether it solves a real problem, whether the idea goes somewhere new, and whether the demo video shows the problem, the build and where Flagsmith fits.

Register at **[wemakedevs.org/hackathons/flagsmith](https://www.wemakedevs.org/hackathons/flagsmith)**.

## Festive Hacks, 25 November, in person

If you are in Bengaluru the day before Toggle Wars starts, Festive Hacks runs at BIEC on the floor of WeAreDevelopers Conference India. Projects have to use all three sponsor tools and Flagsmith is one of them, so the flag, the metric and the experiment from this walkthrough carry straight over.

The brief is to pick one real festive season problem and ship something that works. Second place is ₹1 lakh in cash for the best use of Flagsmith, and the winning team flies to Berlin for the WeAreDevelopers World Congress. You apply on Luma, and accepted hackers get a free conference pass.

Details at **[wemakedevs.org/hackathons/festivehacks](https://www.wemakedevs.org/hackathons/festivehacks)**.

## What to do between now and the 26th

Sign up for Flagsmith Cloud, make a project, and create one multivariate flag with two values. Ten minutes, and it is the step people discover late. Flagsmith also publishes a setup prompt you can paste into Claude Code or any coding agent, which creates the flag, the metric and the experiment and writes the integration for you to approve.

Over the next few days, settle the question you want answered rather than the app you want to build. A good hackathon experiment is one sentence long and usually sits at the moment a user decides to do the thing your product exists for.

By the weekend, deploy it somewhere public with the flag reading from Flagsmith, even if the experiment is not running yet. Free hosting is enough. Everything after that is traffic, and traffic is the one thing you cannot add at the last minute.

Start on the 26th with a working app and a question, which beats an empty editor.
