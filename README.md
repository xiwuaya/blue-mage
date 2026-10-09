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
CSS `url('/icons/*.svg')` masks and the `new Worker(...)` URL accordingly — no
source changes are needed.
