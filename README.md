# WeMakeDevs blog content

Posts published at **wemakedevs.org/blogs**. The site reads this repo directly —
merge to `main` and the post is live in a few minutes. There's no deploy step, and you don't need to run the site locally.

---

## Publishing a post

1. Add one Markdown file to `posts/`. The filename is the URL:
   `posts/my-post.md` → `wemakedevs.org/blogs/my-post`. Lowercase letters,
   numbers and hyphens only.
2. Put images in `images/my-post/`.
3. First post? Add yourself to `authors.json`.
4. Open a PR.

> **Pick the filename carefully.** It's the URL, and renaming it later breaks
> every link to the post.

---

## Frontmatter

```markdown
---
title: "Scaling Kubernetes to 10,000 pods"
description: "What broke, what we changed, and the metrics that told us it worked."
datePublished: 2026-07-24
author: kunal-kushwaha
tags: ["kubernetes", "devops"]
---
```

`title` and `datePublished` are required — a post missing either is silently
skipped. Everything else is optional, but you want `description` and `tags`.

| Field | What it does |
| --- | --- |
| `title` | **Required.** Quote it if it contains a `:` |
| `datePublished` | **Required.** `YYYY-MM-DD`. Controls ordering |
| `description` | 1–2 sentences, shown on cards and in search |
| `author` | A key from `authors.json` |
| `tags` | Reuse existing tags rather than inventing near-duplicates |
| `draft` | `true` hides the post — safe to merge unfinished work |
| `seoTitle` / `seoDescription` | Only if they should differ from the on-page text |
| `canonicalUrl` | If the post was published elsewhere first |

Reading time is calculated automatically. Don't write it yourself.

---

## Cover image

**You don't need one.** If `images/<slug>/cover.*` is missing at merge time, CI
generates a branded card from the title, tags, author and date and commits it to
`images/<slug>/cover.png`. Your markdown isn't touched. Don't block on a cover.

If you have a real one, name it `cover` and drop it in `images/<slug>/`:

| | |
| --- | --- |
| **Filename** | `cover`, exactly — `hero.png` or `cover-final.png` won't be found. One `cover.*` per post |
| **Dimensions** | 1200 × 630, or a larger image of the same 1.91:1 shape |
| **Format** | `.png`, `.jpg`, `.jpeg` or `.webp` |
| **File size** | Under 1 MB — [Squoosh](https://squoosh.app) compresses in a browser |

It's also the link preview on X, LinkedIn, Slack and Discord, which is why the
shape matters. Previews render around 500px wide, so use a few large words, not
a paragraph, and keep ~60px of quiet space at the edges in case of cropping.

---

## `authors.json`

```json
{
  "your-name": {
    "name": "Your Name",
    "role": "What you do",
    "avatar": "images/authors/you.png",
    "bio": "A sentence or two — this is what makes the author card appear.",
    "x": "your_handle",
    "github": "your-username"
  }
}
```

Only `name` is required. For `x`, `github` and `linkedin` use just the username,
not the full URL. Avatars: square, at least 128×128.

---

## Writing the post

Normal Markdown plus GitHub extensions (tables, task lists, strikethrough).
Five things to know:

**No `# Heading`.** The site renders `title` as the page heading — start
sections at `##`. `##` and `###` become the table of contents.

**Image paths are from the repo root:** `![alt](images/my-post/diagram.png)`.
Not `./diagram.png`, not `/images/...`.

**Links to other posts** use a relative file path — the site turns it into the
right URL: `See [our CI rewrite](./why-we-rewrote-our-ci-in-go.md).`

**Code blocks** take a filename header, line numbers, highlighted lines and
highlighted terms. All four are optional:

````markdown
```ts filename="src/server.ts" showLineNumbers {4-6} /importantThing/
const importantThing = doWork();
```
````

**Two components exist:**

```markdown
<YouTubeEmbed url="https://www.youtube.com/watch?v=VIDEO_ID" />

<Callout type="warning" title="Heads up">
This drains the node pool. Don't run it on a Friday.
</Callout>
```

`type` is `note`, `tip`, `warning` or `danger`. Any other component name renders
as plain text.

---

## The one gotcha

Posts are processed as MDX, so bare `<` and `{` in prose can break parsing. Put
them in backticks — `` `x < 5` ``, `` `{ "a": 1 }` ``. This is the only rule
here that isn't standard Markdown.

If a post does trip over it, the site publishes anyway with those characters
escaped — you just lose any `<Callout>` or `<YouTubeEmbed>` in that post until
it's fixed.

---

## Before you merge

A PR check covers the mechanical things: frontmatter that won't parse, a missing
`title` or `datePublished`, an `author` who isn't in `authors.json`, broken image
paths, and a cover of the wrong shape or size. Green means it'll appear on the
site.

It can't tell you whether the post reads well, so use GitHub's Preview tab, and
eyeball the images actually rendering — the check only knows the file exists,
not that it's the image you meant.

`posts/markdown-torture-test.md` exercises every supported feature. Copy from it
when you're unsure.
