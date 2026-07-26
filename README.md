# WeMakeDevs blog content

This repo holds the posts published at **wemakedevs.org/blogs**. The website reads
from here directly — merge a post to `main` and it goes live within a few
minutes. Nobody needs to deploy anything.

You do not need to run the website locally to contribute. If you can write
Markdown and open a pull request, you have everything you need.

---

## Publishing a post

1. Add one Markdown file to `posts/`. The filename becomes the URL:
   `posts/my-post.md` → `wemakedevs.org/blogs/my-post`
   Use lowercase letters, numbers and hyphens only.
2. Add your images to `images/my-post/`, including `cover.png` — the 1200×630
   image used on the card and in link previews.
3. If this is your first post, add yourself to `authors.json`.
4. Open a PR.

That's it. Three files at most, and two of them only once.

> **Pick your filename carefully.** It's the URL, and renaming it later breaks
> every link to your post.

---

## The frontmatter

Every post starts with a block like this, between `---` lines:

```markdown
---
title: "Scaling Kubernetes to 10,000 pods"
description: "What broke, what we changed, and the metrics that told us it worked."
datePublished: 2026-07-24
author: kunal-kushwaha
tags: ["kubernetes", "devops"]
---
```

**Required:** `title` and `datePublished`. A post missing either is skipped —
it won't appear on the site and won't break anything either.

**Everything else is optional**, but you want `description` (it's what people read
on the blog index) and `tags` (the filter buttons).

There is no `coverImage` field — the cover is found by filename. See below.

| Field | What it does |
| --- | --- |
| `title` | **Required.** Quote it if it contains a `:` |
| `datePublished` | **Required.** `YYYY-MM-DD`. Controls ordering |
| `description` | 1–2 sentences, shown on cards and in search results |
| `author` | A key from `authors.json` |
| `tags` | Reuse existing tags where you can, rather than inventing near-duplicates |
| `draft` | `true` hides the post — safe to merge unfinished work |
| `seoTitle` / `seoDescription` | Only if these should differ from the on-page text |
| `canonicalUrl` | If the post was published elsewhere first |

Reading time is calculated automatically. Don't write it yourself.

---

## The cover image

**Name it `cover.png` and put it in your post's image folder. 1200 × 630 pixels.**

```
posts/my-post.md            ->  images/my-post/cover.png
```

You don't declare it anywhere. The site looks for `images/<your-slug>/cover.png`
(or `.jpg`, `.jpeg`, `.webp`) and uses whatever it finds, so the filename is the
whole configuration. Get the name right and it works; there's nothing else to
keep in sync.

This one image does two jobs. On the site it's the picture on your post's card
and at the top of the post. Off the site it's the **link preview** — the card
people see when your post is shared on X, LinkedIn, Slack, WhatsApp or Discord.
Those platforms all expect 1200×630 (a 1.91:1 rectangle), and it's the second
job that makes the size matter: get it wrong and every share of your post is
cropped badly, at the exact moment you most want it to look good.

| | |
| --- | --- |
| **Dimensions** | 1200 × 630. A larger image of the same 1.91:1 shape (2400×1260) is fine; a different shape is not |
| **Format** | `.png`, `.jpg`, `.jpeg` or `.webp` |
| **File size** | Under 1 MB. Compress it — [Squoosh](https://squoosh.app) does this in a browser |
| **Filename** | `cover`, exactly. `hero.png` or `cover-final.png` will not be found |
| **Where** | `images/<your-post-slug>/` — the same folder as the rest of your images |

A check on your PR will tell you if the name or the dimensions are off, so you
don't have to measure by hand. Only keep one `cover.*` file per post; two is
ambiguous and the check will say so.

Two things worth knowing while you design it:

- **Previews render small.** That 1200px card is often shown about 500px wide in
  a timeline. Anything you'd call "body text" will be unreadable. Use a few
  large words, not a paragraph.
- **Keep the edges quiet.** Some clients crop to a square or round the corners.
  Leave roughly 60px of breathing room around anything that must survive.

### If you don't add one

You get one anyway. When your post is merged, a branded card is generated from
your title, tags, author and date and committed to `images/<your-slug>/cover.png`.
Your markdown isn't touched — the file appearing at that path *is* the whole
change. Every published post ends up with a cover one way or the other.

So skipping it is a real option — it just means your post looks like every other
coverless post instead of looking like yours. If you have an image worth using,
use it.

---

## Adding yourself to `authors.json`

```json
{
  "your-name": {
    "name": "Your Name",
    "role": "What you do",
    "avatar": "images/authors/you.png",
    "bio": "A sentence or two. This is what makes the author card appear at the end of your posts.",
    "x": "your_handle",
    "github": "your-username"
  }
}
```

Only `name` is required. For `x`, `github` and `linkedin` use **just your
username**, not the full URL — the site builds the links. Avatars should be
square and at least 128×128.

---

## Writing the post

Normal Markdown, plus GitHub extensions (tables, task lists, strikethrough).
Four things worth knowing:

### Don't write a `# Heading`

The site renders your `title` as the page heading. Start your sections at `##`.
Your `##` and `###` headings become the table of contents on the right.

### Images use paths from the repo root

```markdown
![A description of the image](images/my-post/diagram.png)
```

Not `./diagram.png` and not `/images/...`. Just the path as it appears in this repo.

### Code blocks can do more than you'd expect

````markdown
```ts filename="src/server.ts" showLineNumbers {4-6} /importantThing/
const importantThing = doWork();
```
````

That gives you a filename header, line numbers, highlighted lines 4–6, and every
occurrence of `importantThing` highlighted. All four parts are optional.

### Two components are available

```markdown
<YouTubeEmbed url="https://www.youtube.com/watch?v=VIDEO_ID" />

<Callout type="warning" title="Heads up">
This drains the node pool. Don't run it on a Friday.
</Callout>
```

`type` is `note`, `tip`, `warning` or `danger`. If you use any other component
name it'll show up as plain text on the page — harmless, but it'll look wrong,
so stick to these two.

---

## The one gotcha

Posts are processed as MDX, which treats `<` and `{` as special characters.

Writing `x < 5` or `{ "a": 1 }` in a normal paragraph can confuse it. **Put them
in backticks** — `` `x < 5` `` — and everything is fine. This is the only
Markdown rule here that isn't standard Markdown.

If a post does trip over this, the site publishes it anyway with those
characters escaped; you'll just lose any `<Callout>` or `<YouTubeEmbed>` in that
post until it's fixed.

---

## Linking to another post

Use a relative path to the file and the site turns it into the right URL:

```markdown
See [our CI rewrite](./why-we-rewrote-our-ci-in-go.md).
```

---

## Checking your work before you merge

**A check runs on your PR** and covers the mechanical things: frontmatter that
won't parse, a missing `title` or `datePublished`, an `author` who isn't in
`authors.json`, image paths that point at nothing, and a cover image of the
wrong shape. If it's green, your post will appear on the site.

It can't tell you whether the post *reads* well, so:

- **GitHub's own Markdown preview** catches most formatting mistakes. Use the
  "Preview" tab when editing, or view the file on your PR's Files Changed tab.
- **Check image paths render**, not just that they resolve — the check only
  knows the file exists, not that it's the image you meant.

`posts/markdown-torture-test.md` is a reference post that exercises every
supported feature. Copy from it if you're unsure how something is written.
