---
title: "How to Win Toggle Wars"
description: "The Toggle Wars scorecard line by line, how to read an experiment result without overselling it, and the wiring mistakes that quietly invalidate a submission."
datePublished: 2026-11-20
author: kunal-kushwaha
tags: ["feature-flags", "flagsmith", "hackathon"]
---

Most hackathon projects lose points in the same few places, and almost none of those places are about how good the code is. They are about whether the thing runs, whether a judge can tell what problem it solves in the first thirty seconds, and whether the clever part is doing any actual work.

Toggle Wars is judged on a published scorecard, which means you can read what you are being marked on before you start. Below is what each line is really asking, followed by the specific technical mistakes that make a result worthless without anybody noticing until judging.

## The four criteria

- **Use of Flagsmith:** Whether Flagsmith is a core part of the project and whether the flags or experiments do real work. The test is simple: delete Flagsmith from your submission, and if it behaves identically you have not scored on this line. The strongest entries are the ones where the flag is the mechanism rather than a wrapper around one.
- **Impact:** Whether a developer or a team would actually use this. Honesty about scope helps you more than overselling does, because a small tool that solves one annoyance completely reads better than a platform that solves five things halfway.
- **Creativity:** Either a new idea or a familiar idea taken somewhere new, and both of those count. Plenty of winning projects are an obvious thing that nobody had bothered to build yet.
- **Demo video:** Whether the video clearly shows the problem, what you built, and how Flagsmith fits into it. This is a quarter of the scorecard and it is the only part of your project most judges will watch all the way through.

On that last one, two or three minutes is plenty: fifteen seconds on the problem, most of the time on the thing working, and a clear look at the Flagsmith side.

## What each track wants on top of that

- **Track 01, Test Something Real:** A clear question to test, both versions behind a flag, a metric built from real events, and results you can explain. That last requirement is where people stumble, and the section below is mostly about it.
- **Track 02, AI Agents and Feature Flags:** Use of the Flagsmith CLI, API or MCP server, time actually saved, a human approving the changes it makes, and clear output. The human approval step is explicitly on the list, so show it happening in the video. There is a [setup prompt for coding agents](https://docs.flagsmith.com/experimentation/set-up-with-a-coding-agent) on the hackathon page if you want to see that path wired up before you build your own on top of it.
- **Track 03, Build on Open Source Flagsmith:** Self-hosted Flagsmith, integrations and plugins, developer tooling, and something others can easily reuse. A README somebody can follow, sane defaults and a working example will do more for this score than another feature will.

## Four wiring mistakes that invalidate a result

These are not style problems. Each one produces a dashboard that looks perfectly healthy and numbers underneath it that mean nothing at all.

- **An unstable identifier:** Variation assignment is derived from the identifier you pass to `get_experiment_flag`, so passing a fresh UUID per request reassigns the same visitor over and over. Your split will look like a clean 50/50 while no individual user has had a consistent experience. Use an id that survives the session, and generate and persist one for anonymous visitors.
- **Exposures on one side only:** Both variations should accumulate exposures roughly in line with your weights. Zero on one side almost always means you are reading the flag in one place and rendering from another.
- **Exposures rising while conversions stay flat:** Your metric event is not firing. Call `track_event` with the same identifier you used for the variation, at the moment the thing actually happens rather than on page load.
- **A boolean converted late:** If you started with an on/off flag and made it multivariate on day three, everything collected before that was recorded against a flag with one value. Start multivariate.

Finding any of these on Friday costs you twenty minutes. Finding them on Sunday costs you the submission.

## Reading the result without overselling it

This is the single thing most likely to separate a good Track 01 entry from a winning one, and it costs nothing to get right.

Flagsmith reports a win probability for each variation, produced by a Bayesian engine running over your events, and the [Experimentation docs](https://docs.flagsmith.com/experimentation) go through how the results are presented. It is not a pass or a fail and it is not a significance test, so a variation sitting at 84% is the model's current belief rather than a verdict.

![When is a result a result: a credible interval that crosses zero against one that clears it](images/how-to-win-toggle-wars/credible-interval.jpg)

The number worth reading next to the win probability is the credible interval on the difference. While that interval still spans zero, the data remains consistent with the variation being worse as well as better, and the honest conclusion is that you do not have enough traffic to call it. A result that reads "+14.9% lift, 84% probability, interval from -14.1% to +44.0%" is not a win, whatever the colour of the number on the dashboard.

Two things follow from that. Decide roughly how much traffic you need before you start, rather than stopping the moment the number looks good, because checking repeatedly and shipping on the first favourable reading is how noise gets promoted to a conclusion. And if your interval is still wide on Sunday, say so in the demo. Explaining that the interval crosses zero and describing what it would take to close it shows you understand the tool, whereas reading the big green number off the screen shows the opposite, and judges have seen plenty of both.

It is also worth tracking one metric you do not expect to move, as a guardrail. If your winning variation also halved something else you cared about, you want to be the one who found that.

## The rest of the submission

- **The README cannot assume your laptop:** Somebody else has to set this up, so list the environment variables, give a real run command, and say what should happen when it works. For Track 03 this is not admin, it is the thing being scored.
- **Keys do not belong in the repo:** Server-side environment keys are secret and belong in environment variables, and a committed key is the kind of detail that follows a project around.
- **The video cannot be recorded in the last hour:** It shows, and it is 25% of the score.

## What to do between now and the 29th

Today is the 19th, which leaves a full week before anything starts, and the difference between teams usually comes down to how much of the setup happened before day one.

- **Today and tomorrow:** Register on the Toggle Wars page and star [Flagsmith on GitHub](https://github.com/Flagsmith/flagsmith), which also enters you in the AirPods draw. Then create a project on [Flagsmith](https://dub.sh/flagsmith), drop an SDK into something you already have running, and read one flag from the dashboard.
- **This weekend:** Run the whole loop once on something disposable: a multivariate flag, a metric, a traffic split, and a few hundred scripted sessions. Run both variations identical while you do it, so you see what noise looks like before it matters.
- **Monday to Wednesday:** Pick your track and write the question down in one sentence. If you cannot say what would count as a win in that sentence, the question is still too broad. Sort out your team as well, because two people who have built together before usually get further in four days than four who met at check-in.
- **Thursday the 26th, 8 AM IST:** Start, and spend the first day on the thing itself rather than on configuration, because the configuration is already done.
- **Friday:** Get the flag, the metric and the experiment live and start sending real traffic through, then run the four checks above. From here the numbers need time more than they need your attention.
- **Saturday:** More traffic, write the README, and record the demo video. Saturday rather than Sunday.
- **Sunday the 29th:** Buffer. Read the result properly, write down what more traffic would take, and submit well before 8 PM IST.

## The prizes, briefly

![The Toggle Wars hackathon page](images/how-to-win-toggle-wars/toggle-wars-hackathon.jpg)

Track 01 takes $2,000 in cash, Track 02 takes $1,000, and Track 03 takes the PS5 and GTA 6 bundle. One person who stars Flagsmith on GitHub wins a pair of AirPods.

Toggle Wars runs 26 to 29 November, online and free, solo or in a team of any size. Register at [wemakedevs.org/hackathons/flagsmith](https://www.wemakedevs.org/hackathons/flagsmith).
