import { BLOG_POSTS } from '$lib/data/blog';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export function load({ params }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) {
    throw error(404, 'Articolo non trovato');
  }
  return { post };
}
