# Hady's Memory Keepsake

A static image gallery where selected images open keepsake messages.

## How the content works

- Add every image you want displayed to `assets/images/`.
- List every displayed image in `data/images.json`.
- Add messages only for selected images in `data/messages.json`.
- The `id` in `images.json` must match the `imageId` in `messages.json`.

Images without messages still appear in the gallery. By default, clicking them opens a larger image preview.

## Cloudflare Pages settings

Use these when connecting the GitHub repo to Cloudflare Pages:

- Framework preset: None
- Build command: leave blank, or use `exit 0`
- Build output directory: `/`
- Production branch: `main`

Cloudflare will publish the site at a free `*.pages.dev` URL.
