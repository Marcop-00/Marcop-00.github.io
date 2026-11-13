# Marco Pernisco — Portfolio

Personal portfolio in English, built with HTML, CSS and JavaScript. No JavaScript dependencies or compilation step are required. Compatible with GitHub Pages.

## Local preview

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. The site is available in English only, including its static HTML.

## Content and customisation

- `index.html`: home page, project cards, personal profile, experience and contacts.
- `blog.html`: separate blog page, currently showing a coming-soon message.
- `style.css`: orange palette, typography, responsive layouts and project illustrations.
- `script.js`: project details, filters, shared mobile navigation and email copy.
- `IMG_0082.jpeg`: personal photograph in the hero section.
- `assets/favicon.png`: the site's favicon.

Project illustrations represent the subjects of the projects; they are not product screenshots. Each detail view separates the project context from the personal contribution. Content is based on the available CV and profile notes, with the lending project's README used for its technical description.

Email links open the visitor's email application. The site does not send messages through a backend. DM Sans and Manrope load from Google Fonts, with Arial as a fallback. There are no analytics, application cookies or language settings in local storage.

## GitHub Pages

Publish `index.html`, `blog.html`, `style.css`, `script.js`, `IMG_0082.jpeg`, `.nojekyll` and `assets/`. For a standard repository deployment, set Pages to use the root of the desired branch. Local changes do not publish automatically: the configured branch must receive a commit and push.

## Verification and packaging

```sh
node --check script.js
git diff --check
node scripts/build.mjs
```

The build command copies only publishable files into `dist/` for Sites or other static hosting. The private Site identity is stored in `.openai/hosting.json`.

In the browser, check all four filters, project dialogs and Escape dismissal, email copy, and navigation between the home and blog pages. Verify the mobile menu on both pages and widths of 320, 390, 768 and 1440 px. Motion effects respect `prefers-reduced-motion`.

Local backups are stored in `.local-backup/`, excluded from Git and publication. The private Sites deployment uses a separate source copy in `.sites/marco-portfolio/`, also excluded from this repository.
