---
title: "Announcing Environmental Hacks"
description: "Stop two of the Bharat Builds Tour, and the one theme where you already have the field research."
datePublished: 2026-09-29
author: aayush-sharma
tags: ["hackathon", "wemakedevs", "aws"]
---

## Announcing Environmental Hacks

**Stop two of the Bharat Builds Tour, and the one theme where you already have the field research.**

Most environmental problems are already being measured. Air quality, rainfall, groundwater levels, waste volumes and power consumption are all tracked by somebody, and a lot of that data is public. What usually goes missing is the last step, the one where a number turns into something a person can act on this week.

![image](images/announcing-environmental-hacks/1.png)

[Environmental Hacks](https://www.wemakedevs.org/aws/env) is the second stop of the Bharat Builds Tour. It runs from Thursday 8 October to Sunday 11 October, online from anywhere in India, with an [in-person build day](https://luma.com/env) at Delhi Technological University on Saturday 10 October. It is free, it is open to university students across India, and you can enter alone or in a team of up to four.

We picked this theme because it is one of the few areas where students already have the research. You do not need a dataset to know when the water arrives in your area, how your college handles what it throws away, or which weeks of the year everyone suddenly plans around the weather. You have been observing all of this for years without calling it observation.

First Commit finished a little over a week ago and the tour keeps moving. This is stop two of six.

![first-commit-hackathon-banner@2x](images/announcing-environmental-hacks/2.jpg)

## Where Most Environment Projects Stop

Environment hackathons produce a lot of dashboards. Someone finds a rainfall or air quality feed, plots it on a map, colours the concerning parts red, and ships it. I understand why that happens, because it is the most visible thing you can build in four days.

The catch is that a map mostly tells people something they can already sense. The projects that stand out go one step past that and answer what somebody should do differently because of it. A school administrator deciding whether to move assembly indoors tomorrow. A housing society working out which week to book the tanker. A ward office choosing which street the truck visits first. A farmer deciding when to irrigate.

Our first judging criterion is written in exactly that shape. It asks whether your project fixes a real environmental problem, and then it asks what changes for the people living with it. The second half is where most projects lose points, and it is the easiest half to fix if you decide it on day one instead of day four.

You do not need a new data source to do this well. You need to know who you are building for.

## Three Tracks, and You Pick One

![image](images/announcing-environmental-hacks/3.png)

We split the theme into three so that you are not staring at the whole of climate on Thursday morning. Each one is broad enough that almost every part of the country has its own version of it, and specific enough that you can scope a project down to a single campus or neighbourhood and still have it matter.

- **Air:** Help people breathe easier. Track what is in the air, warn the people most exposed to it, and change what happens on the bad days. That covers AQI, pollution exposure, stubble burning, indoor air and school safety.
- **Heat and Water:** Too much water, too little of it, and the heat in between. Heatwaves, floods, monsoon waterlogging, droughts, water tankers, leaks and groundwater all sit here.
- **Waste and Energy:** Close the loop on what a city throws away and cut what it burns. Segregation, recycling, e-waste, informal recyclers, rooftop solar, EV nudges and public transport.

Pick the one where you already have a story. If you have watched your building's water tanker arrive late for three summers running, that is a better starting point than a topic you read about last night.

## If You Want a Starting Point

You do not have to use any of these, and a project that came out of something you actually noticed will almost always beat one picked off a list. But if you are stuck on Thursday morning, these are the shape of thing that tends to do well.

On **Air**, a morning message to one school that combines today's readings with tomorrow's forecast and answers a single question for the principal, which is whether PE and assembly move indoors. Or an exposure planner for people who work outside all day, telling a delivery rider which two hours on their usual route are the cleanest today.

On **Heat and Water**, a tanker predictor for one housing society, where residents log each delivery and the tool works out which week the next one needs booking before the tank runs dry. Or a commute helper during monsoon that knows which of your two usual routes floods first, built from what residents report rather than from sensors nobody installed.

On **Waste and Energy**, a segregation checker where someone photographs a bin, a model reads it, a person confirms what it found, and the building sees its own score move over a month. Or a rooftop solar payback estimator that uses real irradiance for a specific pincode and returns a number of years rather than a general encouragement to go solar.

## Where to Get the Data

You will not have time to collect your own readings in four days, and you do not need to. These are public, free, and enough to build something real on.

| WHERE | WHAT YOU GET |
| --- | --- |
| [CPCB National Air Quality Index](https://airquality.cpcb.gov.in/AQI_India/) | Live AQI and pollutant readings from the official national monitoring network |
| [OpenAQ](https://docs.openaq.org/) | A free, documented API over air quality measurements, if you would rather not scrape a portal |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) | Satellite-detected active fire and thermal anomaly data, refreshed through the day, with its own API |
| [India Meteorological Department](https://mausam.imd.gov.in/) | District-level nowcast warnings, rainfall records and forecast bulletins |
| [India WRIS](https://indiawris.gov.in/) | Groundwater levels, reservoir storage and rainfall, from the National Water Informatics Centre |
| [data.gov.in](https://www.data.gov.in/) | Government datasets across pollution, water, waste and energy, many with open APIs |
| [Registry of Open Data on AWS](https://registry.opendata.aws/) | Sentinel-2, Landsat, NOAA GOES and NASA POWER, already sitting in S3 |

That last row is worth a second look. The Registry of Open Data hosts large public datasets directly on AWS, so you can query satellite imagery or solar irradiance without downloading anything to your laptop. For a hackathon where building on AWS is part of the judging, starting from data that already lives there saves you a day.

A word of caution on all of these. Check what the data actually means before you build on it, because a station that reports hourly and a satellite pass that happens twice a day are very different things to promise a user. Say plainly in your demo where your numbers come from and how fresh they are. That honesty reads as competence, not as a weakness.

## What is on the Line

![image](images/announcing-environmental-hacks/4.png)

Every track has its own winner, so an Air project competes against other Air projects rather than against all of them.

- **Track winner**, one per track: ₹2,00,000 in cash plus $2,000 in AWS credits
- **Four runners-up**, chosen from across all three tracks: $1,000 in AWS credits each
- **Top five blogs**: AirPods for five people

Writing about what you built deserves a real mention. It takes an hour on Sunday evening, it is the part most teams skip, and it is the only part of your weekend that a recruiter can find six months later.

Using an AWS open source project or AWS services is mandatory to win a prize. Beyond that we are looking at whether it works, whether someone outside your team could figure out what to do with it, and your three-minute demo video.

## Delhi Build Day is on the 10th

![image](images/announcing-environmental-hacks/5.png)

We are running the build day at Delhi Technological University and doors open at 8 in the morning and we go until 8 at night. Seats are limited and you apply separately at [luma.com/env](https://luma.com/env). 

Registering for the tour does not automatically get you a seat in the room. If you cannot make it to Delhi, you are not on the back foot. The online track runs the same days, gets the same mentors, and is judged the same way.

## What You Get for Free, and Where to Learn It

[AWS free tier](https://aws.amazon.com/free/?trk=0b623e51-59b3-49a1-a76e-7d43b0f10785&sc_channel=el) comes with up to $200 in free credits, so the infrastructure is not coming out of your pocket. Verifying your student status on [AWS Builder Center](https://bit.ly/abc-login) unlocks $579 worth of rewards, including Skill Builder Premium and a certification voucher, and that is yours whether or not you ever submit a project. Everyone who submits gets a certificate.

The part most people underuse is the workshops. There are hundreds of them on Builder Center, written by AWS engineers, and each one has you build something rather than watch someone explain it. You can filter by service and by level, so you can pick the exact one that matches what your project needs. Some come with a sandbox attached, which is a pre-provisioned AWS environment that gives you eight hours from the moment you activate it. You get one of those a week, so spend it on the workshop that matters rather than the first one you open.

The [Toolbox](https://builder.aws.com/build/tools) is the other one worth a bookmark. It collects SDKs, starter projects and language resources in one place, so you begin scaffolded instead of from an empty folder.

If you want something to read before Thursday, four posts cover most of what you will need:

- [The Only Resource You Need for Bharat Builds](https://www.wemakedevs.org/blogs/the-only-resource-you-need-for-bharat-builds) walks through everything on Builder Center, including how to get the credits and rewards
- [How to Plan a Cloud Project](https://www.wemakedevs.org/blogs/how-to-plan-a-cloud-project) is the one to read if you have an idea and no idea how to scope it
- [How to Build a Live-Data Project on the AWS Serverless Stack](https://www.wemakedevs.org/blogs/how-to-build-a-live-data-project-on-the-aws-serverless-stack) covers the five problems every deployed project runs into, with the code for each
- [How to Build a Real-Data AI Project on the AWS Open Source Stack](https://www.wemakedevs.org/blogs/how-to-build-a-real-data-ai-project-on-the-aws-open-source-stack) is the one to read if you want to work with AWS open source tools locally

One tour registration covers every event, so if you already signed up for First Commit you are in. Entering one event never rules you out of another.

## What to Do This Week

Three things, and none of them take long.

Create your AWS Builder Center profile and verify your student status. Verification can take a day or two if they ask for documents, which is exactly why you do it now and not on the morning of the 8th.

Pick your track, open one of the data sources above, and see what it actually gives you before the clock starts. An hour spent finding out that a feed updates daily rather than hourly is an hour that saves your Saturday.

Write down one sentence describing the person you are building for, not the technology you plan to use. Then apply for the Delhi seat if you can get there, and start asking around for teammates either way.

You do not need to arrive with a finished idea. You need to arrive with a problem you have actually seen, and most of us have a few of those.

---

*Environmental Hacks is the second stop of the Bharat Builds Tour, a six-city hybrid hackathon series run by WeMakeDevs in collaboration with AWS. Registration is free and open to university students across India.*
