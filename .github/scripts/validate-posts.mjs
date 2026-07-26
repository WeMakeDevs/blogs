/**
 * Checks every post in `posts/` against the rules in README.md, so a
 * contributor hears about a broken frontmatter field on their PR instead of
 * finding their post silently missing from the site.
 *
 *   node .github/scripts/validate-posts.mjs
 *   node .github/scripts/validate-posts.mjs --require-cover
 *
 * `--require-cover` additionally insists that every published post has a
 * `coverImage`. That's only run on `main`, *after* generate-covers.mjs has had
 * its turn — on a PR it would block contributors for something CI fixes for
 * them.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  findAllCovers,
  imageSize,
  isValidCoverSize,
  listPosts,
  readAuthors,
  REPO_ROOT,
  SLUG_PATTERN,
} from "./lib.mjs";

const requireCover = process.argv.includes("--require-cover");

const problems = [];
const warnings = [];

const fail = (file, message) => problems.push({ file, message });
const warn = (file, message) => warnings.push({ file, message });

const authors = readAuthors();
if (authors.__error) {
  fail("authors.json", `is not valid JSON — ${authors.__error}`);
}

/** Repo-relative asset path -> does the file exist? */
function assetExists(assetPath) {
  return existsSync(join(REPO_ROOT, assetPath));
}

function checkCover(post) {
  const { file, slug } = post;

  const covers = findAllCovers(slug);

  if (covers.length === 0) {
    if (requireCover) {
      fail(
        file,
        `has no images/${slug}/cover.* file, and cover generation did not supply one`,
      );
    }
    return;
  }

  if (covers.length > 1) {
    fail(
      file,
      `has more than one cover (${covers.join(", ")}). Keep exactly one — the ` +
        `site would pick ${covers[0]} and silently ignore the rest`,
    );
  }

  const coverPath = covers[0];
  const size = imageSize(readFileSync(join(REPO_ROOT, coverPath)));

  if (!size) {
    // A format the header reader doesn't know. Don't block the PR over it.
    warn(
      file,
      `could not read the dimensions of ${coverPath} — is it a PNG or JPEG?`,
    );
    return;
  }

  if (!isValidCoverSize(size)) {
    fail(
      file,
      `${coverPath} is ${size.width}×${size.height}. Covers must be 1200×630 ` +
        `(or the same 1.91:1 shape, at least 1200px wide) — see README.md`,
    );
  }
}

/** Markdown image references, which have the same repo-root path rule. */
function checkInlineImages(post) {
  const withoutCode = post.content.replace(/```[\s\S]*?```/g, "");

  for (const match of withoutCode.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const target = match[1];
    if (/^https?:\/\//.test(target) || target.startsWith("data:")) continue;

    if (target.startsWith("/")) {
      fail(post.file, `image \`${target}\` starts with a slash — drop it`);
    } else if (!assetExists(target.replace(/^\.\//, ""))) {
      fail(post.file, `image \`${target}\` does not exist in this repo`);
    }
  }
}

for (const post of listPosts()) {
  const { data, file, slug } = post;

  if (!SLUG_PATTERN.test(slug)) {
    fail(file, "filename must be lowercase letters, digits and hyphens only");
  }

  if (typeof data.title !== "string" || !data.title.trim()) {
    fail(file, "`title` is required");
  }

  const date = data.datePublished;
  const dateText =
    date instanceof Date ? date.toISOString().slice(0, 10) : String(date ?? "");
  if (!date) {
    fail(file, "`datePublished` is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(Date.parse(dateText))) {
    fail(file, `\`datePublished: ${dateText}\` is not a valid YYYY-MM-DD date`);
  }

  // The field was retired in favour of the images/<slug>/cover.* convention.
  // Leaving it in place would read as configuration that does nothing.
  if (data.coverImage !== undefined) {
    fail(
      file,
      `remove the \`coverImage\` line — the cover is now picked up automatically ` +
        `from images/${slug}/cover.png (or .jpg/.jpeg/.webp)`,
    );
  }

  if (data.author !== undefined && !authors.__error) {
    if (!authors[data.author]) {
      fail(
        file,
        `\`author: ${data.author}\` is not a key in authors.json — add yourself there first`,
      );
    }
  }

  checkInlineImages(post);

  // A draft isn't published, so it isn't held to the cover requirement yet.
  if (data.draft === true) continue;
  checkCover(post);
}

for (const { file, message } of warnings) {
  console.log(`::warning file=${file}::${file} ${message}`);
}

if (problems.length === 0) {
  console.log(`All posts look good${requireCover ? " and every one has a cover" : ""}.`);
  process.exit(0);
}

for (const { file, message } of problems) {
  console.log(`::error file=${file}::${file} ${message}`);
}
console.error(`\n${problems.length} problem(s) found. See README.md for the rules.`);
process.exit(1);
