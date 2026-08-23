---
title: "The Hangover Part AI: A Week of Building AI That Doesn't Forget"
description: "A look back at The Hangover Part AI hackathon, where 8,500+ developers explored how AI systems can build, retrieve, and manage persistent memory. From winning projects to standout open-source contributions, this recap highlights what developers built with Cognee."
datePublished: 2026-08-22
author: sachin-sharma
tags: ["hackathon", "wemakedevs"]
---

## Introduction
Between June 29 and July 5, 2026, [WeMakeDevs](https://www.wemakedevs.org) and [Cognee](https://www.cognee.ai) ran [The Hangover Part AI: Where's My Context?](https://www.wemakedevs.org/hackathons/cognee), a week long hackathon built around to solve the problems of LLMs forgetting context when a session is restarted.

In 2026 AI agents can work with more context than ever. The harder problem is deciding what should be remembered, how different pieces of information connect, and how the right memory is retrieved when it matters.

That was the challenge behind *The Hangover Part AI: Where’s My Context?* Builders used Cognee’s self-hosted hybrid graph-vector memory layer to turn scattered context into structured, persistent memory, with the freedom to build anything they could imagine.

## The Hackathon at a Glance
![Screenshot 2026-08-01 at 3.25.32 PM](images/hangover-wrap-up-blog/hangover-wrap-up-blog-1.jpg)

- 8,500+ registrations
- 1200+ project submissions
- Participants from 30+ countries
- $10,000 in prizes, 
- Job interviews at Cognee

What made the week interesting was how differently people interpreted "memory". Some treated it as retrieval while some treated it as state. And the two projects that won treated it as something closer to a living system: one that has to be curated, corrected, and occasionally emptied out.


## Community Highlights

![ChatGPT Image Aug 4, 2026 at 12_44_06 PM](images/hangover-wrap-up-blog/hangover-wrap-up-blog-2.jpg)

The Hangover Hackathon was not a quiet build-and-submit event. Developers shared the journey as it happened: the first idea, the broken prototype, the breakthrough, and finally, the working demo.

Throughout the hackathon, participants built in public, exchanged technical learnings, showcased how they were using Cognee, and brought others along as their projects evolved. What began as individual experiments quickly became a lively stream of progress, problem-solving, and creative approaches to building AI systems with better memory.

## Track 1 Winner · Best Use of Open Source: Lethe

![banner](images/hangover-wrap-up-blog/hangover-wrap-up-blog-3.jpg)

Built by [Vinayak Sonthalia](https://x.com/vinncodes_), [Lethe](https://vinayaksonthalia-lethe.hf.space) is an on-call memory for SRE teams. It ingests messy runbooks, builds a knowledge graph and vector index out of plain prose with no schema, and answers on-call questions with grounded, cited answers.

![hero-flip](images/hangover-wrap-up-blog/hangover-wrap-up-blog-4.jpg)

What made Lethe stand out was its ability to keep information up to date. Instead of only remembering old runbooks, it can also forget systems that have been removed, preventing outdated advice during critical incidents. Built on Cognee, it turns unstructured documentation into a searchable knowledge graph and provides clear, source-backed answers, making it a practical assistant for SRE teams handling real-world outages.


**Repository Link:** https://github.com/vinayaksonthalia/lethe
**Demo Video:** https://youtu.be/3840gxTZWxY

## Track 2 Winner · Best Use of Cognee Cloud: Classroom Memory

![Screenshot 2026-08-01 at 1.01.44 PM](images/hangover-wrap-up-blog/hangover-wrap-up-blog-5.jpg)

Built by [Rajdeep Singh](https://www.linkedin.com/in/rajdeepsingh5/), [Classroom Memory](https://classroom-memory.vercel.app) reimagines how learning platforms support both students and teachers. Instead of only storing quizzes and scores, it gives every student a personalized learning memory that tracks what they already know, what they are struggling with, and what they should learn next. Using Cognee Cloud, the platform builds a memory for each student that evolves as they answer questions and interact with the system.

![Screenshot 2026-08-04 at 1.23.56 PM](images/hangover-wrap-up-blog/hangover-wrap-up-blog-6.jpg)

What made Classroom Memory stand out was its teacher-focused intelligence. Rather than simply highlighting weak topics, it reasons over prerequisite relationships to recommend the best concept to teach next. For example, instead of suggesting that a class struggling with recursion should practice recursion again, it recognizes that students first need a stronger understanding of functions. This graph-based approach helps teachers plan lessons more effectively while giving every student a more personalized learning experience.

**Repository Link:** https://github.com/RajdeepKushwaha5/ClassroomMemory
**Demo Video:** https://www.youtube.com/watch?v=2AUA_g0S3Ks

## The Open Source Track: Top 20 Merged PRs

The Open Source track gave developers a chance to contribute directly to the Cognee GitHub repository by fixing issues and improving the project. It brought together contributors who wanted to build something that would benefit the entire community.

Contributors could submit up to five PRs, with the top 20 accepted submissions earning $100 each. The quality of contributions was so strong that the review queue is still active. Here are twenty PRs that stood out, ranked by the maintainers.

1. iOS Swift async/await SDK + xcframework packaging (#38)

* This [PR](https://github.com/topoteretes/cognee-rs/pull/38) adds native iOS support to Cognee by introducing a Swift SDK packaged as an `XCFramework`. It lets developers use Cognee in iPhone and iPad apps with simple Swift APIs for adding data, searching, recalling memories, and configuring the SDK.
* The PR also adds offline tests and a GitHub Actions workflow to make sure the SDK works correctly across different iOS targets. This contribution makes Cognee easier to use for iOS developers and strengthens its open-source ecosystem.

2. Optimize embeddings generation & engines (#34)

* This [PR](https://github.com/topoteretes/cognee-rs/pull/34) improves Cognee's performance by removing duplicate embedding generation during the cognify process. Instead of creating the same embeddings twice, the system now reuses existing ones, reducing unnecessary work and making the process much faster.
* The update also improves Ollama and OpenAI-compatible embedding engines by adding batch processing and parallel requests. Together, these changes reduce embedding requests by nearly **48%**, speeding up Cognify while lowering API usage and compute costs.

3. Opt-in `litellm_native` structured-output framework (#3812)

* This [PR](https://github.com/topoteretes/cognee/pull/3812) adds `LiteLLM Native` as a new structured output option alongside the existing Instructor and `BAML frameworks`. Developers can now use LiteLLM's built-in structured output support while keeping Instructor as the default, so existing projects continue to work without any changes.
* The new adapter supports multiple AI providers through a single implementation, automatically choosing the best approach for each provider. It also includes smart retries for validation errors and better handling of rate limits and authentication errors, making structured outputs more reliable and easier to use across different LLM providers.

4. Gmail DLT connector - incremental sync + forget-on-delete (#3752)

* This [PR](https://github.com/topoteretes/cognee/pull/3752) adds a Gmail connector that lets developers import emails directly into Cognee using the existing `DLT ingestion pipeline`. It supports OAuth authentication and incremental syncing, so only new or updated emails are processed, making ingestion faster and more efficient.
* The connector also supports forget-on-delete, automatically removing deleted or trashed emails from Cognee's memory to keep data up to date. With built-in tests, demo examples, and seamless integration into Cognee's ingestion system, this contribution makes it much easier to build AI applications that can securely work with Gmail data.

5. Slack-export DLT connector + table-scoped orphan cleanup (#3778)

* This [PR](https://github.com/topoteretes/cognee/pull/3778) adds a Slack export connector that lets developers import Slack workspace exports directly into Cognee through the existing DLT ingestion pipeline. It processes channels, users, messages, and thread replies, making Slack conversations searchable while preserving message links and user information.
* The PR also improves data synchronization by limiting orphan cleanup to only the Slack data being updated, preventing unrelated datasets from being affected. With example projects, documentation, and a comprehensive test suite, this contribution makes it easier to build AI applications that can understand and search Slack conversations.

6. Notion Connector with Incremental Sync (#3767)
* This [PR](https://github.com/topoteretes/cognee/pull/3767) adds a DLT-based Notion connector with incremental syncing and forget-on-delete support, making it easier to bring Notion pages into Cognee's memory.

7. Confluence Connector with Incremental Sync (#3738)

* This [PR](https://github.com/topoteretes/cognee/pull/3738) adds a DLT-based Confluence connector with incremental syncing, comment support, and safe cleanup of deleted pages.
8. Native Aider CLI Integration for Cognee (#198)

* This [PR](https://github.com/topoteretes/cognee-integrations/pull/198) adds native Cognee memory support to the Aider CLI, with documentation, setup, and testing guidance for developers.

9. Turso (libSQL) as a Vector Database Option (#3639)

* This [PR](https://github.com/topoteretes/cognee/pull/3639) adds Turso (libSQL) as a vector database option, with vector search, filtering, multi-user support, and comprehensive tests.

10. MCP Sampling Support for Reusing Host LLMs (#3760)

* This [PR](https://github.com/topoteretes/cognee/pull/3760) lets Cognee reuse an LLM already connected to an MCP host such as Claude Code or Cursor, reducing setup requirements for coding-agent workflows.

11. Semantic Memory Map (#3826)

* This [PR](https://github.com/topoteretes/cognee/pull/3826) adds a semantic graph visualization that groups concepts by meaning, with clustering, ontology filters, and recall overlays.

12. Video Ingestion via Audio Transcription (#3912)

* This [PR](https://github.com/topoteretes/cognee/pull/3912) adds video ingestion by extracting and transcribing audio tracks, including timestamps, documentation, and extensive tests.

13. Per-Stage LLM Model Routing (#3806)

* This [PR](https://github.com/topoteretes/cognee/pull/3806) enables different LLMs for extraction, summarization, and querying, helping developers optimize model choice and token costs while remaining backward compatible.

14. Dry-Run Token Estimator and Quota Retry Guard (#3793)

* This [PR](https://github.com/topoteretes/cognee/pull/3793) adds dry-run token and cost estimates before execution and improves quota error handling by avoiding retries that cannot succeed.

15. Bounded Subgraph Visualization by Default (#3768)

* This [PR](https://github.com/topoteretes/cognee/pull/3768) makes graph visualization faster and more manageable by showing a bounded, relevant subgraph by default while retaining an option to display the full graph.

16. One-Command Evaluation Runner and DeepEval Add-on (#3817)

* This [PR](https://github.com/topoteretes/cognee/pull/3817) adds a one-command evaluation runner and makes DeepEval optional, with reproducible results, organized outputs, documentation, and tests.

17. Langfuse Integration via OpenTelemetry (#3723)

* This [PR](https://github.com/topoteretes/cognee/pull/3723) adds native Langfuse support through Cognee's existing OpenTelemetry pipeline, including LLM generation details, configuration checks, and tests.

18. WebAssembly Support for Cognee's Logic Crates (#25)

* This [PR](https://github.com/topoteretes/cognee-rs/pull/25) adds WebAssembly support to three Cognee Rust crates and verifies their functionality in both Node.js and a headless Chrome browser.

19. Slack Bot Powered by Cognee Memory (#3845)

* This [PR](https://github.com/topoteretes/cognee/pull/3845) adds a Slack bot powered by Cognee memory, with citations, batching, opt-in/opt-out controls, forget commands, and extensive tests.

20. Telegram Bot Powered by Cognee Memory (#3725)

* This [PR](https://github.com/topoteretes/cognee/pull/3725) adds a Telegram bot with per-chat Cognee memory, cited answers, memory deletion, and opt-in/opt-out controls.

## Connect With Us

If you're a company building tools, platforms, or services for developers and want to reach a large and active developer community, we'd love to collaborate.

Visit our website or send us an email at [contact@wemakedevs.org](mailto:contact@wemakedevs.org)

Follow us and join our newsletter or technical groups for global events, resources and amazing opportunities: https://www.wemakedevs.org