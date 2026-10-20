import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPosts } from "../assets/search.mjs";

const posts = [
  { slug: "alpha", title: "Alpha", text: "A note about Ruby" },
  { slug: "zebra", title: "Zebra", text: "A note about Ruby and CSS" },
  { slug: "oldest", title: "An older note", text: "A note on databases" },
];
const slugs = (query = "") => selectPosts(posts, query).map(post => post.slug);

test("filtering preserves the server-rendered post order", () => {
  assert.deepEqual(slugs(), ["alpha", "zebra", "oldest"]);
  assert.deepEqual(posts.map(post => post.slug), ["alpha", "zebra", "oldest"]);
});
test("title-only search ignores body content and requires every query word", () => {
  assert.deepEqual(slugs("ALPHA"), ["alpha"]);
  assert.deepEqual(slugs("ruby"), []);
  assert.deepEqual(slugs("  An \n older "), ["oldest"]);
  assert.deepEqual(slugs("Ruby databases"), []);
});
test("empty queries and no matches", () => {
  assert.deepEqual(slugs("   "), slugs());
  assert.deepEqual(slugs("missing"), []);
  assert.deepEqual(slugs("note"), ["oldest"]);
  assert.deepEqual(selectPosts([], "word"), []);
});
