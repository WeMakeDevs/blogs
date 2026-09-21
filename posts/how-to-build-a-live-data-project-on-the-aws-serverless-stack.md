---
title: "How to Build a Live-Data Project on the AWS Serverless Stack"
description: "The Ship It track at First Commit hackathon asks for something running on AWS with a URL a judge can open. The managed services behind that URL are [Lambda](https://aws.amazon.com/lambda/), [API Gateway](https://aws.amazon.com/api-gateway/), [DynamoDB](https://aws.amazon.com/dynamodb/), [S3](https://aws.amazon.com/s3/), [Amplify Hosting](https://aws.amazon.com/amplify/hosting/), [App Runner](https://aws.amazon.com/apprunner/), [Cognito](https://aws.amazon.com/cognito/), [EventBridge](https://aws.amazon.com/eventbridge/) and [Step Functions](https://aws.amazon.com/step-functions/). None of them needs a server you keep alive, and a weekend is enough time to wire a real product out of them."
datePublished: 2026-09-18
author: aayush-sharma
tags: ["hackathon", "wemakedevs", "aws"]
---

This article works through one complete project built on that stack. CitationPulse takes an academic PDF, pulls every DOI identifier out of its reference list, and checks each one against live Crossref and OpenAlex metadata to find corrections, retractions, broken identifiers and open-access copies. It is deployed with AWS CDK and it lives at a public Amplify URL.

The design decision worth copying is that there is no model in this project at all. A regular expression finds the identifiers, two public scholarly APIs answer what those identifiers point at, and every line on screen traces back to a record you can open yourself. 

Five techniques do most of the work, and each one transfers to whatever you decide to build this weekend. The last section spells them out, so read the parts below for the pattern as much as for this particular project.

## What the Demo Application is About?

![citationpulse-upload](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/1.png)

A reference list is a set of promises. Each entry says a paper exists, says what it found, and says you can go and read it. Between the day a bibliography is written and the day someone reads it, some of those promises quietly stop being true. Some of those papers are corrected after publication, a few are retracted outright, and some identifiers were mistyped and now resolve to nothing.

CitationPulse reads the reference list and reports what each identifier resolves to right now. It returns one of four outcomes per citation.

- **Resolved**: the identifier is live, and the metadata behind it is shown.
- **Correction alert**: the publisher has deposited a correction or an erratum for that work.
- **Retraction alert**: the publisher has deposited a retraction for that work.
- **Unresolved**: neither Crossref nor OpenAlex has a record for that identifier.

"Unresolved" is deliberately not the same thing as "fake". A DOI can be absent for dull reasons, including a book chapter that never had one, and the wording refuses to turn a gap in metadata into an accusation. The application also does not summarize the paper, score its quality or rank its references, because none of those are things this data can honestly support.

## Architecture & Prerequisites

![Codex Image 18 Sept 2026, 15_13_44](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/2.jpg)

*Ten AWS services, two public APIs, and a worker with no inbound address of its own.*

| REQUIREMENT | WHY |
| --- | --- |
| Node.js 20 or newer | The CDK application, the Lambda handlers and the React frontend |
| Python 3.12 | The worker, and its test suite |
| Docker, running | The worker image is built locally and pushed by CDK |
| AWS CLI v2, authenticated | CDK bootstraps and deploys through it |
| An AWS account | Registered First Commit participants get $100 in AWS credits towards it |
| `jq`, `zip` and `curl` | Used by the deploy and teardown scripts |

```bash
npm install
npm --prefix frontend install
npm test
AWS_REGION=us-east-1 npm run deploy
```

One command deploys the stack, builds and pushes the worker container, publishes the frontend to Amplify Hosting and prints the public URL. With that in place, the build order below is worth following as written, because it is the order that keeps you able to check your own work at every step in the hackathon.

There is one warning worth reading before you deploy. An EKS cluster carries a control-plane charge for every hour it exists, whether or not anything is running on it. Destroy the stack if not needed anymore.

## Problem 1: People Need Accounts by Tomorrow

Writing sign-up, email verification, password reset and token refresh will eat your Friday, and none of it is the thing you are being judged on.

Amazon Cognito does all of it, and API Gateway checks the resulting token before your code runs. The whole of the authorization layer is this:

```ts
const jwtAuthorizer = new authorizers.HttpJwtAuthorizer(
  "CognitoAuthorizer",
  `https://cognito-idp.${this.region}.${this.urlSuffix}/${userPool.userPoolId}`,
  { jwtAudience: [userPoolClient.userPoolClientId] },
);
```

Attach that to every route and no unauthenticated request ever reaches a function. Inside a handler, the signed-in user is one line:

```ts
const userId = event.requestContext.authorizer.jwt.claims.sub;
```

**Use this when** your project has more than one user, or when a demo needs to show that one person cannot see another person's data. Budget about thirty minutes, including the frontend.

## Problem 2: The File Is Too Big for Your API

API Gateway will not carry a 10 MB upload, and it should not have to. The fix is a presigned URL: your Lambda signs a one-time permission slip, and the browser uploads straight to S3.

```ts
const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: uploadBucket,
  Key: `private/${userId}/${analysisId}/paper.pdf`,
  ContentType: body.contentType,
  ContentLength: body.size,
}), { expiresIn: 15 * 60 });
```

Three things in that call are worth keeping. The key starts with the user's Cognito id, so one person's files can never collide with another's. Pinning `ContentType` and `ContentLength` means the URL cannot be reused to upload something else. Fifteen minutes is long enough for a slow connection and short enough that a leaked URL is worthless by the time anyone finds it.

**Use this when** users upload anything: images, audio, video, documents, datasets. It is the same six lines every time.

## Problem 3: Your Job Takes Longer Than Lambda Allows

This is the one that kills good projects. CitationPulse has to download a PDF, parse eighteen pages, and make fifty-two calls to two APIs it does not control. Plenty of projects have a step like that: transcribing audio, rendering video, scraping a site, calling a slow third-party service.

You have three options on this track, and picking the right one takes a minute:

| YOUR SLOW STEP | REACH FOR |
| --- | --- |
| Finishes inside 15 minutes, bursty | Lambda with a longer timeout |
| Takes minutes, or needs a library that will not fit in a function | A container on EKS or App Runner, fed by a queue |
| Serves HTTP continuously | App Runner |

CitationPulse sits in the middle row. The trick that makes it work is the **task token**. Step Functions puts a job on a queue along with a token, then stops. Whoever picks up that message holds the right to finish the workflow.

```ts
const queueTask = new tasks.SqsSendMessage(this, "Queue citation audit", {
  queue: analysisQueue,
  integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
  messageBody: sfn.TaskInput.fromObject({
    taskToken: sfn.JsonPath.taskToken,
    analysisId: sfn.JsonPath.stringAt("$.analysisId"),
  }),
  taskTimeout: sfn.Timeout.duration(Duration.minutes(12)),
});
```

Nothing runs while it waits, and nothing costs you per minute. The worker on the other side is an ordinary loop:

```python
while True:
    response = sqs.receive_message(QueueUrl=QUEUE_URL, WaitTimeSeconds=20, VisibilityTimeout=900)
    ...
    sfn.send_task_success(taskToken=token, output=json.dumps(result))
```

`WaitTimeSeconds=20` is long polling, so an idle worker makes three calls a minute instead of thousands. `VisibilityTimeout=900` gives it fifteen minutes of exclusive ownership, so if it dies the message comes back for someone else.

Order those three timeouts deliberately, because getting them wrong is a classic way to lose a demo. The visibility timeout is fifteen minutes, the workflow task timeout is twelve, and the workflow itself gives up at fifteen. The job's lease always outlasts the deadline anyone is waiting on.

![aws-stepfunctions-graph](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/3.png)

*Two boxes. The second only runs when the first fails.*

The whole round trip took four seconds, and the console says where they went:

![aws-stepfunctions-events](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/4.png)

*The message hits the queue at 151 milliseconds. Everything between there and 3.999 seconds happened on the container.*

**Use this when** your slow step is anything a judge would otherwise watch a spinner for. The user gets an answer immediately, and the work finishes on its own.

## Problem 4: Something Will Fail on Stage

It always does, usually in front of an audience. The difference between a project that recovers and one that hangs is about fifteen lines, written before you need them.

**Catch the failure in the workflow**, so a dead worker still writes a reason someone can read:

```ts
queueTask.addCatch(failureTask, { resultPath: "$.workflowError" });
```

**Give the queue somewhere to put poison messages**, so one bad input cannot loop forever:

```ts
deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 2 },
```

![aws-sqs-queues](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/5.png)
*A dead letter queue with nothing in it is exactly the outcome you want, and the reason to create one on day one.*

**Make every write safe to repeat.** Queues redeliver and users double-click, so condition each update on the state it expects:

```ts
UpdateExpression: "SET #status = :queued, updatedAt = :updatedAt",
ConditionExpression: "#status = :awaiting AND userId = :userId",
```

A second click finds the wrong status, fails the condition and changes nothing. That single expression gives you idempotency and an ownership check in one round trip, with no locking to write.

**Handle the message totally.** Success reports success, failure reports a readable reason, and either way the message gets deleted:

```python
try:
    sfn.send_task_success(taskToken=token, output=json.dumps(process_job(job)))
except Exception as error:
    set_status(analysis_id, "FAILED", error=f"{type(error).__name__}: {error}"[:500])
    sfn.send_task_failure(taskToken=token, error=type(error).__name__[:256])
finally:
    sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=message["ReceiptHandle"])
```

**Use this when** you want to leave the demo URL running for judges without watching it. Hanging is worse than failing, because a failure tells the user something and a hang tells them nothing.

## Problem 5: The Bill Grows While You Sleep

An open sign-up and a public URL is a bill waiting to happen. CitationPulse caps itself in four places, and the interesting one is a single DynamoDB write:

```ts
UpdateExpression: "ADD analysisCount :one SET updatedAt = :updatedAt",
ConditionExpression: "attribute_not_exists(analysisCount) OR analysisCount < :maximum",
```

The check and the increment are one atomic operation, so fifteen is fifteen no matter how many requests arrive at once. No counter service, no cache, nothing to reconcile.

The rest is set once at deploy time and never thought about again:

```ts
defaultStage.defaultRouteSettings = { throttlingBurstLimit: 5, throttlingRateLimit: 2 };
```

Uploads expire after seven days, DynamoDB rows carry a TTL, log groups retain for one day, and every bucket and table is `RemovalPolicy.DESTROY` with `autoDeleteObjects`, so teardown actually removes things.

![aws-eks-nodegroup](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/6.png)

*One Spot node, with minimum, desired and maximum all set to one. Nothing scales, because nothing needs to.*

One warning if you use EKS. The control plane bills for every hour the cluster exists, running or not. Tag everything with your project name, write the destroy script on the same day as the deploy script, and tear down as soon as your screenshots are taken.

**Use this when** you are about to share a URL. It takes an hour and it is the difference between a demo you leave running and one you are afraid to show anyone.

## What Each AWS Technology Is Doing

| TECHNOLOGY | ITS JOB HERE | WHY THIS ONE |
| --- | --- | --- |
| AWS Amplify Hosting | Serves the React frontend at the public demo URL | A built static site needs hosting and a URL, and nothing else |
| Amazon Cognito | Email sign-up, and the JWT every API call carries | Sign-in is not the interesting part of the project and should not be written by hand |
| API Gateway HTTP API | Four routes, JWT validated before any function runs, throttled at the stage | Authorization and rate limiting sit in front of the code rather than inside it |
| AWS Lambda | Five handlers, each short, on ARM64 | Every request-shaped piece of work finishes in well under a second |
| Amazon S3 | Holds the uploaded PDF, written by the browser through a presigned URL | A 10 MB upload belongs in object storage, not in a request body |
| Amazon DynamoDB | One row per analysis, plus the whole citation report and a demo counter | Conditional writes give idempotency, and a TTL cleans up without a cron job |
| AWS Step Functions | One state that sends a task token and waits for an answer | The wait is free, and a catch means a dead worker still records a reason |
| Amazon SQS | Carries the job and the task token, with long polling and a dead letter queue | Work that outlives a request needs a buffer that survives a worker restart |
| Amazon EKS | Runs the Python worker that reads PDFs and calls two external APIs | Minutes of work with third-party latency is the wrong shape for a function |
| Amazon EventBridge | Carries an AnalysisCompleted event into a log group | An audit trail that costs one rule and no code |

## Five Techniques You Can Reuse on Any Project

Take away the citations and five techniques remain. Each one is cheap, each shows well in a demo, and each fits something completely different:

- **Parse defensively, and test the ugly input**: Real documents are messy in specific, repeatable ways. Collect the cases that break your extraction, turn each into a test, and your parser gets better instead of more fragile. This fits resumes, invoices, transcripts, log files, anything a human formatted.
- **Let a live source answer, and show where it stops**: A public API you cite is stronger evidence than anything you can generate, and stating its coverage limit in your own interface is what makes the rest of your claims credible.
- **A queue between the fast half and the slow half**: Return `202`, put a task token on a queue, and let something without a timeout do the work. Video processing, large exports, scraping, any third-party API you cannot make faster.
- **A worker with no way in**: No Service, no Ingress, permissions granted one at a time, non-root, read-only filesystem, bounded CPU and memory. Six decisions, made once, that remove most of what could go wrong.
- **Writes that are safe to repeat**: Condition every update on the state it expects, name your executions after the thing they process, and make your budget a conditional counter. Retries stop being something you fear.

## The Thing Judges Actually Reward

Every project on this track claims real data, and very few can show where that data stops.

CitationPulse raises a retraction alert only when the publisher deposited a retraction record, and two famous cases behave completely differently. The 2020 Lancet hydroxychloroquine paper carries four deposited records and raises the alert. The 1998 Lancet paper carries none, so the tool reports it as resolved, even though its own Crossref title begins with the word RETRACTED.

That limit is written into the interface rather than hidden. A tool that says what it cannot see is more believable than one that implies it sees everything, and it turns the hardest question in the room into a slide you already prepared.

![citationpulse-result](images/how-to-build-a-live-data-project-on-the-aws-serverless-stack/7.png)

*Twenty-six identifiers, each with what it resolves to now, the sentence it came from, and a link to the record.*

Whatever you build, find the one command that proves your claim and have it ready. Here it is seven parser tests that run in a hundredth of a second with no credentials and no network, and a live smoke test against both APIs.

## Why This Holds Up Under a Four-Day Clock

First Commit gives you four days, which is enough to build something real and not enough to recover from a bad start. Three decisions here were made because of that constraint rather than despite it.

- **The parser can be tested without AWS**: Seven tests run in a hundredth of a second with no credentials and no network, so the riskiest part of the project is also the part you can iterate on fastest.
- **Nothing has to be generated to be useful**: Every number on screen came from a public record, which means there is no prompt to tune on Sunday morning and no output to defend.
- **Verification is a command rather than a claim**: The test suite and a live smoke test against real APIs both produce output you can put on screen. Judges weigh idea and impact, whether it is built on AWS, what you learned, execution and the demo, and a reproducible check speaks to four of those five at once.

If you are building on the Ship It track this weekend, copy the queue above everything else. The moment you have work that takes longer than a request should, put a task token on a queue and let something else finish it, and you will spend the last day polishing instead of fighting timeouts.

First Commit runs from 17 to 20 September 2026, online across India, with an in-person build day in Bangalore on 19 September. One submission is considered for Build It, Ship It and Best UI together, so there is nothing to choose at registration.

[Check in for First Commit](https://www.wemakedevs.org/aws/first-commit) and join the community on [Discord](https://discord.gg/wemakedevs) for team formation and mentorship.

***Disclaimer**: CitationPulse is an educational prototype. Metadata signals are evidence for review rather than a verdict on research quality, the absence of a DOI is not evidence that a reference is invalid, and retraction coverage depends on what publishers have deposited.*
