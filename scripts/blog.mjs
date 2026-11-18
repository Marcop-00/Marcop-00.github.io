import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

export const site = 'https://marcop-00.github.io/';
const categories = ['Experiences', 'Projects', 'Space', 'Events'];
const dateLabels = { experience: 'Experience date', linkedin: 'LinkedIn post date' };
const blogTitle = 'Blog — Marco Pernisco';
const blogDescription = 'Stories from projects, events and experiences, with personal reflections and original photos.';
const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = value => value.replace(/[&<>"']/g, char => htmlEntities[char]);
const isText = value => typeof value === 'string' && value.trim().length > 0;
const isTextList = list => Array.isArray(list) && list.every(isText);

function requireField(condition, message) {
  if (!condition) throw new Error(message);
}

function isDate(value) {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}(-\d{2}){0,2}$/.test(value)) return false;
  const [year, month = '01', day = '01'] = value.split('-');
  const fullDate = `${year}-${month}-${day}`;
  const date = new Date(`${fullDate}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(fullDate);
}

function getHttpsUrl(value) {
  const url = typeof value === 'string' && URL.parse(value);
  return url && url.protocol === 'https:' && !url.username && !url.password ? url : null;
}

async function readPost(directory, slug) {
  try {
    requireField(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), 'Use a lowercase, hyphen-separated folder name.');
    const post = JSON.parse(await readFile(new URL('post.json', directory), 'utf8'));
    requireField(typeof post?.draft === 'boolean', '"draft" must be true or false.');
    if (post.draft) return null;

    requireField(isText(post.title) && isText(post.description), 'Add a title and short description.');
    requireField(categories.includes(post.category), `Choose a category from ${categories.join(', ')}.`);
    requireField(Object.hasOwn(dateLabels, post.date?.type) && isDate(post.date.value),
      'Use a valid date (YYYY, YYYY-MM or YYYY-MM-DD) and type (experience or linkedin).');
    requireField(isTextList(post.paragraphs) && post.paragraphs.length > 0, 'Add at least one paragraph.');
    requireField(post.sections === undefined || (Array.isArray(post.sections) && post.sections.every(section =>
      isText(section?.heading) && isTextList(section.paragraphs) && section.paragraphs.length > 0)),
      'Use section headings with at least one paragraph in each section.');
    requireField(isTextList(post.tags), '"tags" must be an array of text labels.');
    requireField(Array.isArray(post.links) && post.links.every(link => isText(link?.label) && getHttpsUrl(link.url)),
      '"links" must be an array of labels and HTTPS URLs.');

    const linkedin = getHttpsUrl(post.linkedinUrl);
    requireField(post.linkedinUrl === undefined || (linkedin && /^(?:www\.)?linkedin\.com$/.test(linkedin.host)
      && /^\/(?:posts|feed\/update|pulse)\/[^/]+/.test(linkedin.pathname)),
      'Use an original LinkedIn post permalink, or omit "linkedinUrl" for blog-only articles.');

    requireField(Array.isArray(post.images) && post.images.length > 0, 'Add at least one original photo.');
    const filenames = new Set();
    for (const image of post.images) {
      requireField(typeof image?.file === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:avif|webp|jpe?g|png)$/.test(image.file),
        'Use local photos/ filenames such as group-photo.webp.');
      requireField(!filenames.has(image.file), `Duplicate photo: ${image.file}.`);
      requireField(isText(image.alt), `Add alt text for ${image.file}.`);
      requireField([image.width, image.height].every(size => Number.isSafeInteger(size) && size > 0),
        `Add the actual pixel dimensions for ${image.file}.`);
      requireField(image.caption === undefined || isText(image.caption), `Invalid caption for ${image.file}.`);
      const photo = await lstat(new URL(`photos/${image.file}`, directory));
      requireField(photo.isFile() && photo.size > 0, `Use a non-empty local file for ${image.file}.`);
      filenames.add(image.file);
    }
    const cover = post.images.find(image => image.file === post.cover);
    requireField(cover, '"cover" must match the filename of one of the photos.');

    return { ...post, cover, slug, directory };
  } catch (error) {
    throw new Error(`Blog (${slug}): ${error.message}`, { cause: error });
  }
}

export async function loadBlog(root) {
  const content = new URL('content/blog/', root);
  const entries = await readdir(content, { withFileTypes: true });
  const directories = entries.filter(entry => entry.isDirectory());
  const posts = await Promise.all(directories.map(({ name }) => readPost(new URL(`${name}/`, content), name)));
  return posts.filter(Boolean).sort((a, b) => b.date.value.localeCompare(a.date.value) || a.slug.localeCompare(b.slug));
}

function renderMetadata(title, description, path, image, article = '') {
  const url = new URL(path, site).href;
  return `<title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:type" content="${article ? 'article' : 'website'}">
  <meta property="og:locale" content="en_GB">
  <meta property="og:site_name" content="Marco Pernisco">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${new URL(image.path, site).href}">
  <meta property="og:image:alt" content="${escapeHTML(image.alt)}">${article}`;
}

function renderDate({ value, type }) {
  const label = dateLabels[type];
  if (value.length === 4) return `${label} · ${value}`;
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: value.length === 10 ? 'numeric' : undefined
  }).format(date);
  return `${label} · <time datetime="${value}">${formatted}</time>`;
}

function renderImage(image, path, loading = 'lazy') {
  return `<img src="${path}" alt="${escapeHTML(image.alt)}" width="${image.width}" height="${image.height}" loading="${loading}" decoding="async">`;
}

function renderPostMeta(post) {
  return `<p class="blog-meta mono"><span>${post.category}</span> <span>${renderDate(post.date)}</span></p>`;
}

function renderCard(post) {
  return `<article class="blog-card">
          <a class="blog-card-link" href="blog/${post.slug}/" aria-labelledby="title-${post.slug}">
            <div class="blog-image">${renderImage(post.cover, `blog/${post.slug}/photos/${post.cover.file}`)}</div>
            <div class="blog-card-content">
              ${renderPostMeta(post)}
              <h2 id="title-${post.slug}">${escapeHTML(post.title)}</h2>
              <p class="blog-card-description">${escapeHTML(post.description)}</p>
              <span class="blog-card-cta">Read article <span aria-hidden="true">↗</span></span>
            </div>
          </a>
        </article>`;
}

function renderArchive(posts) {
  return `<section class="blog-page-header container section" aria-labelledby="blog-title">
      <h1 id="blog-title">Questions, ideas <span class="blue-text">and discoveries.</span></h1>
      <p class="section-intro">${blogDescription}</p>
    </section>
    <section class="blog-page-content container" aria-label="Blog posts">
      ${posts.length ? `<div class="blog-grid">
        ${posts.map(renderCard).join('\n        ')}
      </div>` : '<p class="blog-empty">No articles yet.</p>'}
    </section>`;
}

function renderPhoto(image, isCover = false) {
  const path = `photos/${image.file}`;
  return `<figure class="article-photo${isCover ? ' article-cover' : ''}">
          <a class="article-photo-link" href="${path}" data-photo>
            ${renderImage(image, path, isCover ? 'eager' : 'lazy')}
            <span class="article-photo-zoom" aria-hidden="true">+</span>
          </a>${image.caption ? `\n          <figcaption>${escapeHTML(image.caption)}</figcaption>` : ''}
        </figure>`;
}

function renderArticle(post) {
  const photos = post.images.filter(image => image !== post.cover);
  const articleLinks = [
    ...(post.linkedinUrl ? [{ label: 'View original post on LinkedIn', url: post.linkedinUrl }] : []),
    ...post.links
  ];
  return `<article class="blog-article container" aria-labelledby="article-title">
      <header class="article-header article-column">
        <a class="text-link article-back" href="../../blog.html"><span aria-hidden="true">←</span> Back to blog</a>
        ${renderPostMeta(post)}
        <h1 id="article-title">${escapeHTML(post.title)}</h1>
        <p class="article-description">${escapeHTML(post.description)}</p>
      </header>
      ${renderPhoto(post.cover, true)}
      <div class="article-body article-column">
        ${post.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('\n        ')}
        ${(post.sections ?? []).map(section => `<section class="article-section">
          <h2>${escapeHTML(section.heading)}</h2>
          ${section.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('\n          ')}
        </section>`).join('\n        ')}
      </div>
      ${photos.length ? `<section class="article-gallery" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Photos</h2>
        <div class="article-gallery-grid">
          ${photos.map(image => renderPhoto(image)).join('\n          ')}
        </div>
      </section>` : ''}
      <footer class="article-footer article-column">
        ${post.tags.length ? `<ul class="tags article-tags" aria-label="Tags">${post.tags.map(tag => `<li><span>${escapeHTML(tag)}</span></li>`).join('')}</ul>` : ''}
        ${articleLinks.length ? `<ul class="article-links" aria-label="Article links">
          ${articleLinks.map(link => `<li><a class="text-link" href="${escapeHTML(link.url)}">${escapeHTML(link.label)} <span aria-hidden="true">↗</span></a></li>`).join('\n          ')}
        </ul>` : ''}
      </footer>
    </article>`;
}

function renderGalleryDialog(post) {
  return `<dialog class="photo-viewer" aria-labelledby="photo-viewer-title">
    <div class="photo-viewer-inner">
      <header class="photo-viewer-header">
        <h2 id="photo-viewer-title">Photos</h2>
        <button type="button" class="photo-viewer-close" aria-label="Close photo viewer" autofocus>×</button>
      </header>
      ${renderImage(post.cover, `photos/${post.cover.file}`)}
      <p class="photo-viewer-caption" hidden></p>
      <div class="photo-viewer-controls">
        <button type="button" data-previous${post.images.length === 1 ? ' hidden' : ''}><span aria-hidden="true">←</span> Previous</button>
        <p class="photo-viewer-counter" aria-hidden="true"></p>
        <button type="button" data-next${post.images.length === 1 ? ' hidden' : ''}>Next <span aria-hidden="true">→</span></button>
      </div>
      <p class="photo-viewer-status" role="status"></p>
    </div>
  </dialog>`;
}

export async function writeBlog(root, output, posts) {
  const [template, stylesheet] = await Promise.all([
    readFile(new URL('scripts/templates/blog.html', root), 'utf8'),
    readFile(new URL('style.css', output))
  ]);
  const styleVersion = createHash('sha256').update(stylesheet).digest('hex').slice(0, 12);
  const page = values => {
    const fields = { ...values, styleVersion };
    return template.replace(/{{(\w+)}}/g, (_, key) => fields[key]);
  };
  const shareImage = { path: 'assets/favicon.png', alt: 'Marco Pernisco portfolio logo' };
  await writeFile(new URL('blog.html', output), page({
    metadata: renderMetadata(blogTitle, blogDescription, 'blog.html', shareImage),
    root: '', current: ' aria-current="page"', galleryScript: '', galleryDialog: '',
    content: renderArchive(posts)
  }));

  if (posts.length) await copyFile(new URL('scripts/gallery.js', root), new URL('gallery.js', output));
  for (const post of posts) {
    const path = `blog/${post.slug}/`;
    const destination = new URL(path, output);
    await mkdir(new URL('photos/', destination), { recursive: true });
    await Promise.all(post.images.map(({ file }) =>
      copyFile(new URL(`photos/${file}`, post.directory), new URL(`photos/${file}`, destination))));

    const image = { path: `${path}photos/${post.cover.file}`, alt: post.cover.alt };
    const tags = post.tags.map(tag => `\n  <meta property="article:tag" content="${escapeHTML(tag)}">`).join('');
    const article = `\n  <meta property="article:section" content="${post.category}">${tags}`;
    await writeFile(new URL('index.html', destination), page({
      metadata: renderMetadata(`${post.title} — Marco Pernisco`, post.description, path, image, article),
      root: '../../', current: '',
      galleryScript: '<script src="../../gallery.js" defer></script>',
      galleryDialog: renderGalleryDialog(post),
      content: renderArticle(post)
    }));
  }
}
