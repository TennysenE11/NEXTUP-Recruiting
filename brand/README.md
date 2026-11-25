# OpenSpot brand files

- `openspot-logo-original.png`: the logo artwork as supplied.
- `openspot-logo.svg`: the same logo traced to vector paths, white and purple on black.
- `openspot-logo-light.svg`: mark and wordmark side by side in black and purple, for light backgrounds.
- `openspot-mark.svg`: the mark alone, white and purple, for dark backgrounds.
- Logo purple: `#6827e2` (measured from the artwork). The app and website use `#6c2ee6` for buttons and links, which is the same color to the eye.

`trace_logo.py` redoes the tracing from the original PNG (needs `numpy`, `Pillow` and `potracer`).

The app icons in `recruiting/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) use the mark on black.
