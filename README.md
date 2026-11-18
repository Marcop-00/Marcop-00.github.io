# Marco Pernisco — Portfolio

Personal portfolio in English, built with HTML, CSS and JavaScript. A dependency-free Node.js build generates static blog pages for GitHub Pages.

## Local preview

From this directory, with Node.js 24 and Python 3:

```sh
node scripts/build.mjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173 and select **Blog**. Run the build again after editing content.

## Content and customisation

- `index.html`: home page, project cards, personal profile, experience and contacts.
- `content/blog/`: one directory per article. The build produces `dist/blog.html` and a page at `dist/blog/<slug>/index.html` for each published article.
- `scripts/blog.mjs`, `scripts/templates/blog.html` and `scripts/gallery.js`: blog generation, shared page template and photo viewer.
- `style.css`: orange palette, typography, responsive layouts and project illustrations.
- `script.js`: project details, filters, shared mobile navigation and email copy.
- `IMG_0082.jpeg`: personal photograph in the hero section.
- `assets/favicon.png`: the site's favicon.

Project illustrations represent the subjects of the projects; they are not product screenshots. Each detail view separates the project context from the personal contribution. Content is based on the available CV and profile notes, with the lending project's README used for its technical description.

Email links open the visitor's email application. The site does not send messages through a backend. DM Sans and Manrope load from Google Fonts, with Arial as a fallback. There are no analytics, application cookies or language settings in local storage.

## Add a blog article

Create `content/blog/<slug>/post.json` and place the article’s web-ready photos in `content/blog/<slug>/photos/`. Use a stable folder name such as `my-new-article`. That name becomes the public URL at `/blog/my-new-article/`.

```json
{
  "draft": true,
  "title": "My article title",
  "category": "Experiences",
  "date": { "type": "experience", "value": "2026" },
  "description": "",
  "paragraphs": [],
  "tags": [],
  "linkedinUrl": "",
  "cover": "group-photo.webp",
  "images": [
    {
      "file": "group-photo.webp",
      "alt": "Describe what is visible in the photo",
      "width": 1600,
      "height": 1067
    }
  ],
  "links": []
}
```

1. Choose `Experiences`, `Projects`, `Space` or `Events`. Use `experience` for the event date or `linkedin` for the LinkedIn post date. Enter the precision you can verify as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. The archive sorts by the supplied ISO date, newest first.
2. Write a short `description` and put each introductory paragraph in its own string in `paragraphs`. For longer articles, optionally add `sections`, an array of objects with a `heading` and a `paragraphs` array. Add the permalink to your original post in `linkedinUrl`, or omit that field for articles written only for the blog. For optional GitHub, demo or reference links, add entries to `links` with a `label` and an HTTPS `url`.
3. List each photo once in `images`, with its actual exported dimensions, descriptive `alt` text and optional `caption`. Set `cover` to one of those filenames. The cover opens in the viewer first, followed by the remaining photos in array order.
4. Export the original photos as WebP, AVIF or compressed JPEG, keeping their proportions. For example, with `cwebp` installed, use `cwebp -q 82 -resize 1600 0 original.jpg -o group-photo.webp` for a landscape original wider than 1600 px. Use `-resize 0 1600` for a portrait original taller than 1600 px. Use lowercase filenames with hyphens. The archive crops cover previews to fit the cards. The article and photo viewer show the whole image.
5. Set `draft` to `false` once the copy and photos are ready and any links have been checked, then rebuild and preview. The build excludes draft pages and photos from `dist/` and reports missing fields or files for articles marked ready. Draft files committed to a public repository are visible in the repository itself.

## GitHub Pages

Before pushing the blog to `main`, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and publishes `dist/` on pushes to `main`. If the commit is already on GitHub, select **Actions → Deploy portfolio to GitHub Pages → Run workflow** and choose `main`. [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Search engines

The build copies `robots.txt` to the site root and generates `sitemap.xml` with the home page, blog archive and published articles. Drafts are excluded, and the sitemap updates automatically on each build. After deployment, submit `https://marcop-00.github.io/sitemap.xml` in Google Search Console. Keep the Google verification meta tag in `index.html` to retain ownership verification.

## Verification and packaging

```sh
node --check script.js
node --check scripts/gallery.js
git diff --check
node scripts/build.mjs
```

In the browser, check navigation from home to the blog and back, article and photo links, and the mobile menu. On an article with multiple photos, open the viewer with Enter, switch photos with the arrow keys and close it with Escape. Focus should return to the photo link. Check the layout at 320, 390, 768 and 1440 px. Motion effects respect `prefers-reduced-motion`.
