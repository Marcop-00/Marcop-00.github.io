import { copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBlog, site, writeBlog } from './blog.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const posts = await loadBlog(root);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'robots.txt', '.nojekyll']) {
  await copyFile(new URL(file, root), new URL(file, output));
}
await cp(new URL('assets/', root), new URL('assets/', output), {
  recursive: true,
  filter: path => !basename(path).startsWith('.')
});
await writeBlog(root, output, posts);
const pagePaths = ['', 'blog.html', ...posts.map(post => `blog/${post.slug}/`)];
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagePaths.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`Static site prepared in ${fileURLToPath(output)} (${posts.length} published blog posts)`);
