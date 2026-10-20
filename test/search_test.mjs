import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPosts } from "../assets/search.mjs";

const posts = [
  { slug: "zebra", title: "Zebra", date: "2001-02-02", text: "A note about Ruby and CSS" },
  { slug: "oldest", title: "An older note", date: "2001-01-01", text: "A note on databases" },
  { slug: "alpha", title: "Alpha", date: "2001-02-02", text: "A note about Ruby" },
];
const slugs = (query = "", sort = "newest") => selectPosts(posts, query, sort).map(post => post.slug);

test("newest, oldest, title, and deterministic date ties", () => {
  assert.deepEqual(slugs(), ["alpha", "zebra", "oldest"]);
  assert.deepEqual(slugs("", "oldest"), ["oldest", "alpha", "zebra"]);
  assert.deepEqual(slugs("", "title"), ["alpha", "oldest", "zebra"]);
  assert.deepEqual(posts.map(post => post.slug), ["zebra", "oldest", "alpha"]);
});
test("title-only search ignores body content and requires every query word", () => {
  assert.deepEqual(slugs("ALPHA"), ["alpha"]);
  assert.deepEqual(slugs("ruby"), []);
  assert.deepEqual(slugs("  An \n older "), ["oldest"]);
  assert.deepEqual(slugs("Ruby databases"), []);
});
test("empty queries, no matches, and sorted search results", () => {
  assert.deepEqual(slugs("   "), slugs());
  assert.deepEqual(slugs("missing"), []);
  assert.deepEqual(slugs("note", "title"), ["oldest"]);
  assert.deepEqual(selectPosts([], "word", "oldest"), []);
});
