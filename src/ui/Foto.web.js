// Foto suasana di web: <img> asli dengan srcset + lazy loading (tanpa optimizer berbayar).
import { createElement } from 'react';

export function Foto({ slug, alt, style }) {
  return createElement('img', {
    src: `/images/acara/${slug}-840.webp`,
    srcSet: `/images/acara/${slug}-480.webp 480w, /images/acara/${slug}-840.webp 840w`,
    sizes: '(min-width: 768px) 370px, 100vw',
    width: 840,
    height: 473,
    alt,
    loading: 'lazy',
    decoding: 'async',
    style: { display: 'block', width: '100%', height: 'auto', aspectRatio: '840 / 473', objectFit: 'cover', ...style },
  });
}
