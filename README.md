[![GitHub issues](https://img.shields.io/github/issues/thewakingsands/blue-mage)](https://github.com/thewakingsands/blue-mage/issues)
[![GitHub license](https://img.shields.io/github/license/thewakingsands/blue-mage)](https://github.com/thewakingsands/blue-mage/blob/master/LICENSE)

A book for blue mages.

### Usage

| Role    | Provider       | URL                                       | Build             |
| ------- | -------------- | ----------------------------------------- | ----------------- |
| Primary | EdgeOne        | https://bluemagic.badend.cn/              | `yarn build`      |
| Mirror  | Cloudflare     | https://blue-mage.badend.cn/              | `yarn build`      |
| Mirror  | GitHub Pages   | https://blog.badend.cn/blue-mage/         | `yarn build:subpath` |

All three serve the same content; every build emits
`<link rel="canonical" href="https://bluemagic.badend.cn/" />` so search engines
treat the two mirrors as duplicates of the primary.

The GitHub Pages mirror is served from a **sub-path**, so it must be built with
`yarn build:subpath` (`base=/blue-mage/`). Vite rewrites the HTML references, the
CSS icon-mask `url()`s and the `new Worker(...)` URL accordingly — no source
changes are needed.

### Caching

`public/_headers` (copied to `dist/_headers`) is consumed by Cloudflare Workers
Static Assets only:

- `/assets/*` — one year, `immutable`. Everything under it is content-hashed,
  including the spell icons (moved to `src/assets/icons/` so Vite hashes them).
- `/` and `/index.html` — `max-age=0, must-revalidate`, so new deployments are
  picked up immediately.
- `favicon.ico` / `og-image.png` — one day; `robots.txt` / `sitemap.xml` — one hour.

Do **not** add a `/*` rule with `Cache-Control`: Cloudflare merges matching rules
and would concatenate two `max-age` values. See
[ADR-0006](docs/adr/0006-static-asset-caching.md).

EdgeOne already does the right thing for `/assets/*`; its other paths are configured
in the console. GitHub Pages cannot set response headers (fixed at `max-age=600`).

Verify after deploying with `yarn verify:cache` (`--local` skips the network).
