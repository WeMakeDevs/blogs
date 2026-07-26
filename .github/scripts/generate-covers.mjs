/**
 * Renders a cover image for every published post that doesn't have one, and
 * writes it into the repo alongside the author's own images.
 *
 *   OG_ENDPOINT=... BLOGS_OG_SECRET=... node .github/scripts/generate-covers.mjs
 *
 * The rendering happens in the website (POST /api/og/blog-cover) so the card
 * uses the site's real fonts and colours, and so there's one template to
 * maintain rather than two that drift. What lands here is a plain PNG: from
 * this point on a generated cover is indistinguishable from a hand-made one,
 * which is what keeps the site, the RSS feed and the CDN all fed by the same
 * asset.
 *
 * No markdown is modified. A cover is found at `images/<slug>/cover.<ext>`, so
 * writing the file *is* the whole change — there's no frontmatter line to keep
 * in sync, and no way for the two to disagree.
 *
 * Nothing is committed by this script — the workflow does that if the working
 * tree changed.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { findCover, listPosts, readAuthors, readingTime, REPO_ROOT } from "./lib.mjs";

const endpoint = process.env.OG_ENDPOINT;
const secret = process.env.BLOGS_OG_SECRET;

if (!endpoint || !secret) {
  console.error(
    "OG_ENDPOINT and BLOGS_OG_SECRET must both be set. The secret is shared " +
      "with the website; see BLOGS_REPO.md §7.",
  );
  process.exit(1);
}

const authors = readAuthors();

async function renderCover(post) {
  const author = authors.__error ? undefined : authors[post.data.author];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: post.data.title,
      description: post.data.description ?? post.data.seoDescription,
      tags: Array.isArray(post.data.tags) ? post.data.tags : undefined,
      authorName: author?.name,
      datePublished:
        post.data.datePublished instanceof Date
          ? post.data.datePublished.toISOString().slice(0, 10)
          : String(post.data.datePublished ?? ""),
      readingTime: readingTime(post.content),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${endpoint} responded ${response.status} ${response.statusText}${
        body ? ` — ${body.slice(0, 200)}` : ""
      }`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

const missing = listPosts().filter(
  (post) => post.data.draft !== true && findCover(post.slug) === null,
);

if (missing.length === 0) {
  console.log("Every published post already has a cover. Nothing to do.");
  process.exit(0);
}

console.log(`Generating ${missing.length} cover(s)...`);

const failures = [];

for (const post of missing) {
  const coverPath = `images/${post.slug}/cover.png`;
  const absolutePath = join(REPO_ROOT, coverPath);

  try {
    const png = await renderCover(post);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, png);
    console.log(`  ${post.file} -> ${coverPath}`);
  } catch (error) {
    failures.push(`${post.file}: ${error.message}`);
    console.log(
      `::error file=${post.file}::could not generate a cover — ${error.message}`,
    );
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} cover(s) could not be generated.`);
  process.exit(1);
}
