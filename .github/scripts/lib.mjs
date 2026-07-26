/**
 * Shared helpers for the CI scripts in this folder.
 *
 * `gray-matter` is the same frontmatter parser the website uses
 * (src/lib/blogs.ts over in the frontend repo), so what CI accepts and what the
 * site publishes can't drift apart.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

/** Repo root, resolved from this file rather than from the cwd. */
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const POSTS_DIR = join(REPO_ROOT, "posts");
export const AUTHORS_FILE = join(REPO_ROOT, "authors.json");

/**
 * Extensions a cover may use, in the precedence order the website applies (see
 * COVER_EXTENSIONS in its src/lib/blogs.ts — these two lists must agree).
 */
export const COVER_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

/** The cover file for a slug, as a repo-relative path, or null if there isn't one. */
export function findCover(slug) {
  for (const extension of COVER_EXTENSIONS) {
    const path = `images/${slug}/cover.${extension}`;
    if (existsSync(join(REPO_ROOT, path))) return path;
  }
  return null;
}

/** Every cover a slug has. More than one is ambiguous and worth reporting. */
export function findAllCovers(slug) {
  return COVER_EXTENSIONS.map((extension) => `images/${slug}/cover.${extension}`)
    .filter((path) => existsSync(join(REPO_ROOT, path)));
}

/** Mirrors the slug rule in src/lib/blogs.ts — anything else 404s on the site. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Every `posts/*.md` file, parsed.
 *
 * Nothing in CI writes back to these files — covers are matched by path, so a
 * post's markdown is only ever read.
 */
export function listPosts() {
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const { data, content } = matter(
        readFileSync(join(POSTS_DIR, name), "utf8"),
      );
      return {
        slug: name.replace(/\.md$/, ""),
        file: `posts/${name}`,
        data,
        content,
      };
    });
}

export function readAuthors() {
  try {
    return JSON.parse(readFileSync(AUTHORS_FILE, "utf8"));
  } catch (error) {
    return { __error: error.message };
  }
}

/**
 * Reading time in whole minutes, matching `calculateReadingTime` in the
 * frontend's src/lib/blogs.ts so a generated card's byline agrees with the
 * figure shown on the post itself.
 */
export function readingTime(content) {
  const prose = content.replace(/```[\s\S]*?```/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Width and height of a PNG or JPEG, read straight from the file header.
 *
 * Worth the ~40 lines to keep this repo dependency-light for something CI runs
 * on every PR. Returns null for anything it can't parse, which callers treat as
 * "unverifiable" rather than "wrong".
 */
export function imageSize(buffer) {
  // PNG: an 8-byte signature, then the IHDR chunk with width/height at 16..24.
  if (
    buffer.length > 24 &&
    buffer.readUInt32BE(0) === 0x89504e47 &&
    buffer.readUInt32BE(4) === 0x0d0a1a0a
  ) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // JPEG: walk the marker segments until a start-of-frame (SOFn) carries the
  // dimensions. SOF4/SOF8/SOFC are not frame markers, hence the exclusions.
  if (buffer.length > 4 && buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      const isStartOfFrame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;

      if (isStartOfFrame) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  return null;
}

/** The 1200×630 spec, as a ratio. */
export const COVER_RATIO = 1200 / 630;
/** Minimum width for a cover — narrower than this looks soft in a timeline. */
export const COVER_MIN_WIDTH = 1200;
/** Ratio slack, so 2400×1260 and other exact multiples aren't rejected. */
export const COVER_RATIO_TOLERANCE = 0.02;

export function isValidCoverSize({ width, height }) {
  if (width < COVER_MIN_WIDTH) return false;
  const ratio = width / height;
  return Math.abs(ratio - COVER_RATIO) / COVER_RATIO <= COVER_RATIO_TOLERANCE;
}
