// Web: elemen SVG DOM langsung (react-dom), API mengikuti react-native-svg yang dipakai di aplikasi.
import { createElement } from 'react';

export function Svg({ label, style, children, ...p }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: 'false' };
  return createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', style: { display: 'block', ...style }, ...a11y, ...p }, children);
}
const el = (tag) => function SvgEl(props) { return createElement(tag, props); };
export const Circle = el('circle');
export const ClipPath = el('clipPath');
export const Defs = el('defs');
export const Ellipse = el('ellipse');
export const G = el('g');
export const Line = el('line');
export const LinearGradient = el('linearGradient');
export const Path = el('path');
export const Pattern = el('pattern');
export const Polygon = el('polygon');
export const Rect = el('rect');
export const Stop = el('stop');
export const SvgText = el('text');
