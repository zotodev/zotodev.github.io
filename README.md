# Zoto Blog

Live at https://zotodev.github.io. One repository, Markdown posts, and automatic GitHub Pages publishing.

## Write a post

Create `_posts/YYYY-MM-DD-your-slug.md`:

```markdown
---
title: "Your article title"
---

Write your content here.
```

Commit to `main` or merge a pull request. GitHub Actions checks and publishes the site. The homepage, search, RSS, and sitemap update automatically.

The filename supplies the publication date and URL. Example: `_posts/2026-10-20-a-new-idea.md` becomes `/posts/a-new-idea/`. Use a real date and a unique lowercase, hyphen-separated slug. Keep published filenames stable; edits to a title or body do not change the URL or date. Do not override `date`, `slug`, `permalink`, `layout`, or `published`. Older `description` metadata is optional and never displayed.

Put images in `assets/images/<post-slug>/` and use descriptive alternative text:

```markdown
![A description of the image](/assets/images/a-new-idea/example.webp)
```

Use `_drafts/your-slug.md` for drafts. They do not appear on the site or in search, but their source is public in this repository. Dates use Asia/Kolkata. Future posts appear only after a build on or after their date; run the workflow manually when needed.

## Search and organization

Posts start newest first, with slug order breaking date ties. Search matches every query word against published titles only, without regard to case. It uses the titles already on the page, so no content index or additional search request is needed. A loading skeleton appears while typed searches update. The search query is kept in the URL. No external search service is used. Without JavaScript, the newest-first list and articles still work.

## Development

Use Ruby 3.3, Bundler, and Node.js for the small JavaScript tests:

```sh
bundle install
bundle exec ruby test/site_test.rb
node --test test/search_test.mjs
bundle exec jekyll serve --destination ../build
```

Open http://localhost:4000. Tests use temporary posts, never published fixtures. To preview drafts, add `--drafts`. Convention validation runs as part of the tests before every production build. Failed tests or builds preserve the previous live site.

GitHub Pages uses GitHub Actions as its source. There is one workflow; pull requests check and build without deploying. There is no database, CMS, frontend framework, or search dependency.

## Hosting and caching

The workflow builds Jekyll into static HTML, CSS, JavaScript, and images, then deploys them with GitHub Pages' official artifact and deployment actions. No server runtime, custom HTTP headers, or service worker is required.

CSS and JavaScript URLs have a build version so a newly loaded page gets its matching assets. The original Zoto JPEG uses a content-versioned filename for the header, favicon, and sharing image. When changing the logo, use a new filename and update its references.

GitHub Pages controls the HTML cache headers. Asset versioning cannot update a document already open in a tab; refresh it to load a deployment. Browser back/forward navigation can also restore an older document.
