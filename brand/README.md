# NEXTUP brand files

- `nextup-logo.svg`: the full logo on black, as supplied (N-and-arrow mark above the wordmark).
- `nextup-logo-light.svg`: the same logo in black and purple for light backgrounds.
- `nextup-mark.svg`: the mark alone, white and purple, for dark backgrounds.
- Brand purple: `#6c2ee6`.

These are vector redraws of the logo image. The wordmark is built from the Saira typeface (SIL Open Font License), set at its widest and heaviest and slanted to match the original. `build_logo.py` regenerates the paths (needs `fonttools`, `brotli` and the `@fontsource-variable/saira` package). If you have the original logo file, it can replace these.

The app icons in `recruiting/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) use the mark on black.
