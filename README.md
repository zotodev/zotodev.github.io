# Zoto Blog

A minimal Markdown blog at https://zotodev.github.io, built with Jekyll and published by GitHub Actions.

## Publish a post

1. Copy `templates/post.md` into `_posts/YYYY-MM-DD-your-slug.md`.
2. Set `title` and `description` in the YAML front matter. Quote both values.
3. Write your article below the closing `---` line.
4. Commit to `main`, or merge a pull request. A successful build publishes automatically.

```markdown
---
title: "A new idea"
description: "What this post is about, in one sentence."
---

Your article goes here.
```

Example filename: `_posts/2026-10-20-a-new-idea.md`. Its URL is `/posts/a-new-idea/`.

The filename is the source of truth for date and slug. Use valid dates, lowercase letters or digits, and single hyphens between words. Slugs must be unique across all dates. Do not set `date`, `slug`, `permalink`, `layout`, or `published` in post metadata. Every post gets the shared article layout automatically.

Posts appear newest first. Posts on the same date sort alphabetically by slug. Backdated posts go into their chronological position. Editing a title or body does not change the order or URL. Keep published filenames stable so links keep working. The homepage, RSS, and sitemap update automatically.

## Drafts and future posts

Keep drafts in `_drafts/your-slug.md`; move them into `_posts/` with a date-prefixed filename to publish. Drafts are excluded from production. This is a public repository: draft source files are publicly readable. Never commit private content or secrets.

Dates use Asia/Kolkata. Future-dated posts stay hidden until a build on or after that date. There is no scheduled publishing job. To publish an eligible future post, run **Actions → Validate, build, and publish → Run workflow**, or make a new commit to `main`.

## Images and links

Put images in `assets/images/<post-slug>/` and include meaningful alternative text:

```markdown
![A description of the image](/assets/images/a-new-idea/example.webp)
```

Link to other articles using `/posts/their-slug/`. Use fenced code blocks with a language name for syntax highlighting.

## Local development

Use Ruby 3.3 and Bundler:

```sh
bundle install
bundle exec ruby scripts/validate_posts.rb
bundle exec ruby test/site_test.rb
bundle exec jekyll serve
```

Open http://localhost:4000. Tests use temporary copies and never publish their articles. To preview drafts locally, use `bundle exec jekyll serve --drafts`.

## Deployment

GitHub Pages must use **GitHub Actions** as its build source. The workflow validates conventions, tests behavior, builds Jekyll, and deploys only on `main` or manual runs. Pull requests validate and build without deploying. Failed builds leave the previous live site intact.

The validator runs inside Jekyll too, so an ordinary local build also rejects invalid posts. Keep the Gemfile lock committed for reproducible builds. No database, CMS, analytics, external fonts, or frontend framework is required.
