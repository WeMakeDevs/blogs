# AGENTS.md

This repo holds the posts published at **wemakedevs.org/blogs**. Merging to
`main` publishes; there is no deploy step. See `README.md` for the full
human-facing guide — this file is the short version for agents.

## Writing a post

1. **One Markdown file in `posts/`.** The filename is the URL:
   `posts/my-post.md` → `wemakedevs.org/blogs/my-post`. Lowercase letters,
   numbers and hyphens only. Never rename it later — that breaks every link.
2. **Images go in `images/<slug>/`**, where `<slug>` matches the post filename.
3. **New author?** Add a key to `authors.json`.

### Frontmatter

```markdown
---
title: "Scaling Kubernetes to 10,000 pods"
description: "What broke, what we changed, and the metrics that told us it worked."
datePublished: 2026-07-24
author: kunal-kushwaha
tags: ["kubernetes", "devops"]
---
```

- **Required:** `title`, `datePublished` (`YYYY-MM-DD`). A post missing either is
  silently skipped — it won't appear on the site.
- **Strongly wanted:** `description` (shown on cards/search) and `tags` (filter
  buttons — reuse existing tags rather than inventing near-duplicates).
- **Optional:** `author` (a key in `authors.json`), `draft: true` (hides the
  post, safe to merge), `seoTitle` / `seoDescription`, `canonicalUrl`.
- Quote `title` if it contains a `:`.
- Reading time is computed automatically. Do not write it.

### Body rules

- **No `# Heading`.** The `title` is rendered as the page heading; start
  sections at `##`. `##`/`###` become the table of contents.
- **Image paths are from the repo root:** `![alt](images/my-post/diagram.png)`.
  Not `./diagram.png`, not `/images/...`.
- **Links to other posts** use a relative file path:
  `[our CI rewrite](./why-we-rewrote-our-ci-in-go.md)`.
- **Code blocks** support `ts filename="src/server.ts" showLineNumbers {4-6} /importantThing/`
  — all four parts optional.
- **Only two components exist:** `<YouTubeEmbed url="..." />` and
  `<Callout type="note|tip|warning|danger" title="...">…</Callout>`. Any other
  component name renders as plain text.
- **The MDX gotcha:** posts are processed as MDX, so bare `<` and `{` in prose
  can break parsing. Wrap them in backticks — `` `x < 5` ``, `` `{ "a": 1 }` ``.

`posts/markdown-torture-test.md` exercises every supported feature — copy from
it when unsure.

## Cover images — you don't need one

**A cover image is optional.** If `images/<slug>/cover.*` is missing when the
post is merged, CI generates a branded card from the title, tags, author and
date and commits it to `images/<slug>/cover.png`. The markdown is not touched.
Every published post ends up with a cover either way.

So: **do not fabricate, download, or block on a cover image.** Ship the post
without one and let generation handle it. Only add a file when a real,
purpose-made image exists.

If you *do* add one:

| | |
| --- | --- |
| **Filename** | `cover`, exactly — `hero.png` / `cover-final.png` will not be found. One `cover.*` per post; two is ambiguous and fails the check |
| **Dimensions** | 1200 × 630 (or a larger image of the same 1.91:1 shape) |
| **Format** | `.png`, `.jpg`, `.jpeg` or `.webp` |
| **Size** | Under 1 MB |
| **Where** | `images/<slug>/` |

## Before you commit — always check this list

Run through every item. A PR check covers the mechanical ones, but verify them
locally first rather than waiting on CI.

- [ ] Filename is the intended URL slug: lowercase, hyphens, no spaces or
      underscores, and it is **not** a rename of an existing published post.
- [ ] Frontmatter parses and has both `title` and `datePublished`
      (`YYYY-MM-DD`).
- [ ] `title` is quoted if it contains a `:`.
- [ ] `description` and `tags` are present; tags reuse existing ones.
- [ ] `author` exists as a key in `authors.json` (or is omitted).
- [ ] No `# H1` in the body — sections start at `##`.
- [ ] Every image path resolves and is repo-root-relative
      (`images/<slug>/...`), and the files are actually committed.
- [ ] Bare `<` and `{` in prose are wrapped in backticks.
- [ ] Only `<YouTubeEmbed>` and `<Callout>` are used; `Callout` `type` is one of
      `note`, `tip`, `warning`, `danger`.
- [ ] Cross-post links use relative `./post-name.md` paths and point at files
      that exist.
- [ ] Cover: either absent (it'll be generated) **or** exactly one
      `images/<slug>/cover.*` at 1200×630, under 1 MB.
- [ ] `draft: true` is removed if the post is meant to go live — and present if
      it isn't finished.

## Authors

```json
{
  "your-name": {
    "name": "Your Name",
    "role": "What you do",
    "avatar": "images/authors/you.png",
    "bio": "A sentence or two.",
    "x": "your_handle",
    "github": "your-username"
  }
}
```

Only `name` is required. For `x`, `github` and `linkedin` use **just the
username**, not a URL. Avatars: square, at least 128×128.
