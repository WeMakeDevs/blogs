---
title: "From First Idea to Working Demo: How to Plan a Cloud Project"
description: "Knowing what a cloud service does is a different skill from knowing which services your own project needs. Courses, documentation and tutorials cover the first one thoroughly, but very little covers the second, which is why a student who can confidently explain what Lambda and DynamoDB are will still stall when the task is to plan a project from scratch."
datePublished: 2026-09-15
author: sachin-sharma
tags: ["hackathon", "wemakedevs", "aws"]
---


Knowing what a cloud service does is a different skill from knowing which services your own project needs. Courses, documentation and tutorials cover the first one thoroughly, but very little covers the second, which is why a student who can confidently explain what Lambda and DynamoDB are will still stall when the task is to plan a project from scratch.

What is missing at that point is not technical knowledge but the sequence of decisions that turns an idea into something that runs. Getting that sequence right matters most when there is a deadline attached, because a bad start leaves no time to recover from it.

A hackathon is the sharpest version of that constraint. WeMakeDevs regularly help students learn what is new in tech through global hackathons, and this time we have partnered with [AWS Builder Center](https://bit.ly/abc-login) to bring you the [Bharat Builds Tour](https://www.wemakedevs.org/aws). The opening stop, First Commit, gives university students exactly four days, from 17 to 20 September 2026, online across India with an optional [in-person build day](https://luma.com/first-commit) in Bangalore on 19 September, to build something real using AWS cloud technologies.

This article covers the decisions that fill those four days, from choosing a problem to recording the final demo. You need no prior experience with cloud services, and the examples use AWS because that is what First Commit is built around, although the same approach works for any hackathon and any stack.

The most common mistake is to pick the services first and look for a problem afterwards. Cloud services are easy to acquire, and each one takes about a minute to sign up for. A team can collect four of them before anybody has written down who the project is for, and by the second evening they have a database, a hosting service and a model while still looking for a problem the stack can justify.

The order that works is the reverse one. Decide who the user is, describe the one thing that has to happen for them, and let the services follow from that.


![Flowchart](images/how-to-plan-a-cloud-project/1.png)
## Start With "WHO IS IT FOR?"

Most ideas begin as a category rather than as a problem. "Something for healthcare" or "a tool that uses AI" does not tell you what to build, because it names a field instead of the people in it and what goes wrong for them.

Answer four questions in writing before you write any code.

- Who faces this problem? Name the group, and then one real example from that group you could actually describe.
- When does the problem show up for them?
- How do they handle it today?
- What do they get back once your project works, whether that is a page, a message, a file, an alert or an API response?

Naming one example does not shrink the problem. The group is who the project is for, and the example is who you build the first version for, because you cannot design an output for the average of ten thousand people.

The last question is where most ideas fall apart. If you cannot describe what the user ends up with, you will not be able to show it in a three-minute demo either. "Shop owners stay more organised" cannot be demonstrated, while "a shop owner photographs a supplier bill and gets back the total and due date in ten seconds" can be demonstrated in about fifteen.

## Reduce It to One Flow

Judges look at whether one thing works from beginning to end, not at how many things were started.

![Flowchart3](images/how-to-plan-a-cloud-project/2.png)

Anything that does not sit on that line is optional for the next four days. Login screens, admin dashboards, settings pages and onboarding can be described in the demo instead of being built. One flow that works will always read better than six screens that do not.

## Pick the Services Your Flow Needs

Go through your flow and ask what each part actually requires. Work in plain categories first, because product names come after you know what you are looking for.



| What happens in your flow | What it needs |
| -------- | -------- |
| A file, photo or form arrives     | Storage     |
| Something has to be remembered after the user leaves     | A database     |
| Data gets checked, converted or combined     | Compute     |
| One step has to kick off the next one     | An event or a workflow     |
| A judgement is too messy to write as a rule     | A model     |

Now check the list you have made. If you cannot point at a service and say which part of the demo it makes possible, remove it before it starts costing you debugging time.

First Commit hackathon gives you two ways to build:

- Build It -> stays on your own machine with the open source AWS stack, which is Strands Agents SDK, Cedar, SAM CLI with LocalStack, PartyRock and OpenSearch, and it needs no AWS account and no card. 
- Ship It -> deploys the project on AWS and hands the judges a live URL, using services such as Lambda, API Gateway, DynamoDB, S3, Amazon Bedrock, EventBridge, Step Functions, Cognito, Amplify Hosting and App Runner.

## Build End to End Flow First

The usual mistake is to finish the frontend, then the API, then the database, and discover on the last evening that none of it connects. Get a thin version of the whole flow running first, with sample data if that is what it takes, and then improve one step at a time.

![Flowchart3](images/how-to-plan-a-cloud-project/3.png)

Treat the fourth day as a freeze rather than a build day. Anything not working by Sunday morning is something you describe in the demo, not something you attempt.

## Showcase Your Build Using a Demo

First Commit asks for a three-minute demo, which is shorter than most teams expect. Spend roughly twenty seconds on the user and the problem, ninety seconds on the flow actually running, thirty seconds on the architecture, and the rest on one failure case and what you would build next.

Plan that failure case in advance, because live demos break on inputs nobody prepared for. Bad input should produce a readable message rather than a stack trace, and slow processing should show a visible state, since a spinner that never resolves looks exactly like a crash.

Record the screen instead of talking over slides, show real output rather than describing it, and say plainly what is not built. Judges score idea and impact, whether it is built on AWS, what you learned, execution and the demo itself, and none of that rewards hiding the rough edges.

## Put it Into Practice at First Commit


![Screenshot 2026-09-15 at 4.23.21 PM](images/how-to-plan-a-cloud-project/4.jpg)
Registration is free and open to university students across India aged eighteen and above, alone or in teams of up to four. The problem statement is open, which is to build something that solves a real problem, whether it is one you deal with yourself, one the people around you face every day, or a clunky process nobody has bothered to fix.

This stop carries ₹20 worth in cash, credits and gadgets.

- Ship It, Build It and Best UI awards, each combining cash with AWS credits
- AWS credits for four runners-up
- Gaming keyboards for the five best project write-ups
- Fast-track Amazon interviews for students behind the strongest projects
- AWS credits for every registered participant who verifies their student status on AWS Builder Center
- Workshops with AWS experts
- Swag kit for top teams and everyone joining offline

Spend the days before the hackathon choosing a problem and sketching the flow. The building starts when the clock does.

**[Check in for First Commit](https://www.wemakedevs.org/aws/first-commit)** and **[apply for the Bangalore build day](https://luma.com/first-commit)**.
