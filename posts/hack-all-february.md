---
title: "Hack All February: A Month of Building in Public"
description: "Four back-to-back hackathons, 20,000+ participants and $40,000+ in prizes. Here's everything the community built during Hack All February."
datePublished: 2026-03-12
author: kunal-kushwaha
tags: ["hackathon", "technical"]
coverImage: images/hack-all-february/cover.jpeg
---

In February 2026, [WeMakeDevs](https://www.wemakedevs.org) turned the entire month into a celebration of building with [Hack All February](https://www.wemakedevs.org/february).

The idea was simple - **four weeks, four back-to-back hackathons, and a focus on building new things**. Participants competed for $40,000+ in cash prizes, a Samsung Galaxy Flip 7, and job interviews at top tech companies.

## Hack All February at a Glance

![The Hack All February schedule, with each of the four hackathon weeks mapped onto a racing circuit](images/hack-all-february/circuit.jpeg)

The scale of the event showed how powerful community driven building can be.

- 20,000+ participants across four hackathons
- 1500+ project submissions
- Participants from 20+ countries
- $40,000+ in prizes

From generative UI to powerful AI agents, the creativity across the community was incredible.

More than just competing for prizes, developers documented their journeys, shared their progress online, and helped each other along the way. It truly became a month of building in public.

## Community Highlights

Hack All February was not just about submitting projects. Throughout the month, developers actively shared their progress, learnings, and experiences while building.

Social media was filled with demos, build logs, and project showcases as participants pushed their ideas forward.

Here's what some participants had to say:

![Participant testimonials shared on X during the hackathons](images/hack-all-february/testimonials.jpeg)

The excitement across the community showed how powerful collaborative building can be when developers come together with a shared goal.

## Breaking Hackathon Boundaries: Automate Me If You Can

While every week had its own theme and energy, [Week 3: Automate Me If You Can](https://www.wemakedevs.org/hackathons/accomplish) was unique. Most hackathons focus on building new apps from scratch. However, for this one, we shifted the focus towards automation and open-source contribution.

Using Accomplish, an open-source AI coworker that lives on your desktop, participants were challenged to either automate something from their daily workflow or dive deep into the Accomplish codebase.

We created two winning tracks:

1. **The Automate Track**: For developers who built creative automation workflows.
2. **The Open Source Track**: For contributors who picked up GitHub issues and got their Pull Requests merged.

Our objective was simple. We wanted to see automation that solves real problems while also empowering developers to leave a lasting impact on the Accomplish ecosystem through meaningful open-source contributions.

### The Automation Track

The submissions for the Automate Track proved that when developers are given a powerful tool like Accomplish, they find creative ways to save time and simplify everyday workflows.

Here are some of the top automations:

1. **AI Onboarding Automation System**: Setting up a new employee is usually a manual and time-consuming process. One participant built a system using Accomplish AI that automates the entire workflow. Workspaces, repositories, meetings, and notifications are all created automatically from a single configuration file.

2. **Competitor Monitoring Tool**: For indie hackers and startup builders, market research can take hours. This automation handles it with a single command. It browses competitor websites, extracts pricing and feature information, and generates a structured competitive intelligence report.

3. **[Automated Job Application](https://www.loom.com/share/e698457295c7403fb3f6e882a6880427)**: Anyone who has applied for multiple jobs knows the repetitive copy-paste cycle involved. This developer used Accomplish to extract job details directly from a link and automatically fill out application fields.

4. **ORCA Study Orchestrator**: Built to tackle exam-season chaos, this academic workflow tool takes PDFs of notes and books and automatically generates flashcards, quizzes, and revision plans to help students study more efficiently.

5. **AI Marketplace Finder**: A simple but useful automation. Enter a product name and a budget, and Accomplish instantly opens Facebook Marketplace with filtered results ready to browse.

Two of those come with demos worth watching in full.

**ORCA Study Orchestrator**

<YouTubeEmbed url="https://www.youtube.com/watch?v=TFdNxzd8j1U" />

**AI Marketplace Finder**

<YouTubeEmbed url="https://www.youtube.com/watch?v=w25F39Iuw14" />

### Merged PRs: The Open Source Track

This was the first time we introduced an Open Source Track, and it quickly gained popularity. Hundreds of developers wanted to contribute to the Accomplish project.

Many pull requests were opened, and the response from the community was overwhelming. While several PRs are still under review or being worked on before the final merge, the contributions so far have been impressive.

Here are five standout PRs that highlight the depth and quality of these contributions:

**1. [Persistent Task Favourites with Store-Based Sync (#546)](https://github.com/accomplish-ai/accomplish/pull/546)**

- This PR introduces persistent task favourites in Accomplish AI. Users can now star successful task executions and save them for future use.
- A new `is_favorite` column was added to the database to store these favourites. Once saved, they become easily accessible and can be reused with a single click.
- From a technical perspective, the feature uses a store-based synchronization approach with optimistic updates. The UI updates instantly when a task is marked as favourite, while a background process handles Electron IPC communication and saves the data to local storage.

**2. [Multi-Modal File Attachments & PDF Extraction (#585)](https://github.com/accomplish-ai/accomplish/pull/585)**

- This PR adds a file attachment feature that allows users to upload documents and images to provide additional context for tasks.
- Users can attach up to five files per task either by dragging and dropping them into the input bar or by using the new "Attach files" option in the plus menu.
- When a PDF is uploaded, the system automatically extracts the text from the document and includes it in the prompt. This allows the AI agent to read and use the document's content while performing the task.

**3. [HuggingFace Transformers.js Local Provider (#604)](https://github.com/accomplish-ai/accomplish/pull/604)**

- This PR adds HuggingFace Transformers.js as a local inference provider. It allows users to run AI models directly on their own machine using a lightweight local server instead of relying on cloud providers.
- This is especially useful for users who want better privacy and full control over their data.
- The integration includes a settings panel where users can enter their local server URL, test the connection, and fetch available models. Behind the scenes, the system uses ONNX Runtime to run models efficiently on local hardware.
- The PR also includes improvements such as secure communication between the desktop app and the local server, along with multi-language support to make the interface accessible to more users.

**4. [Expansion of Cloud Inference Providers (#605)](https://github.com/accomplish-ai/accomplish/pull/605)**

- This PR expands Accomplish by adding support for four new AI cloud providers: Nebius AI, Together AI, Fireworks AI, and Groq.
- Users can now add their API keys and access a wider range of fast and specialized AI models.
- The developer also improved the provider integration system using a data-driven structure. Instead of writing complex logic for every provider individually, the system now follows a standardized template. This keeps the codebase cleaner and makes it much easier to add new providers in the future.

**5. [Native Desktop Automation MCP Tool (#633)](https://github.com/accomplish-ai/accomplish/pull/633)**

- This PR introduces `desktop-control`, a tool that allows AI agents to interact directly with a user's operating system.
- It works across macOS, Windows, and Linux without complex setup.
- With this capability, the AI agent can take screenshots, move the mouse, click, type text, and manage open windows. This allows the agent to perform real actions directly on the user's computer.

## What Our Sponsors Had to Say

Hack All February would not have been possible without the support of our sponsors. Their tools, guidance, and enthusiasm helped developers push their ideas further and build meaningful projects throughout the month.

Sponsors were particularly excited to see the creativity and technical depth coming from the WeMakeDevs community.

Here is what some of them shared about their experience:

![Testimonial from Or Hiltch, CEO of Accomplish.ai, on the impact of the hackathon](images/hack-all-february/accomplish-testimonial.png)

## Connect With Us

If you're a company building tools, platforms, or services for developers and want to reach a large and active developer community, we'd love to collaborate.

Visit our website or send us an email on [contact@wemakedevs.org](mailto:contact@wemakedevs.org)

Follow us and join our newsletter or technical groups for global events, resources and amazing opportunities: https://www.wemakedevs.org
