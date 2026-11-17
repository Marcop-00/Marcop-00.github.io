import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBlog, writeBlog } from './blog.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const posts = await loadBlog(root);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', '.nojekyll', 'IMG_0082.jpeg']) {
  await copyFile(new URL(file, root), new URL(file, output));
}
await cp(new URL('assets/', root), new URL('assets/', output), {
  recursive: true,
  filter: path => !basename(path).startsWith('.')
});
await writeBlog(root, output, posts);
console.log(`Static site prepared in ${fileURLToPath(output)} (${posts.length} published blog posts)`);
