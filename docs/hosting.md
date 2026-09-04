# Hosting notes

## Why Workers, not Pages

Cloudflare now steers new projects to Workers rather than Pages, and Workers Static Assets covers
everything this site needs. `wrangler.jsonc` declares `assets.directory` with **no `main` entry
point**, which makes this an assets-only Worker: there is no script to invoke, so no request is
ever billed.

## What this costs

| Traffic | Cost |
| --- | --- |
| 10k visitors/mo | $0 |
| 100k visitors/mo | $0 |
| 1M visitors/mo | $0, or $5 if you want the Paid plan's headroom and observability |

Static asset requests are free and unmetered on both plans. The only ways to start paying are
things this site deliberately does not do: server-side rendering (Worker invocations), Durable
Objects (billed on wall-clock duration, including idle-in-memory), or write-heavy KV/D1.

## Thresholds that would change the setup

- **Any single asset over 25 MiB** → serve it from R2 instead of static assets. Not currently
  relevant: the rack is generated in JavaScript, so the largest asset is the three.js chunk at
  roughly 480 KB (~120 KB gzipped).
- **Worker bundle approaching 3 MB gzip (Free) / 10 MB (Paid)** → split code or fetch WASM
  separately. Not relevant while there is no Worker script at all.
- **More than ~100k Worker (not static) invocations/day** → move to the $5 Paid plan.
- **Real-time or multiplayer features** → only then consider Durable Objects, and use the
  WebSocket Hibernation API so idle connections are not billed.

## `_headers`

`public/_headers` sets security headers and immutable caching for `/_astro/*`, whose filenames
Astro content-hashes. Two things to remember:

- `_headers` applies to **static asset responses only**. It does not apply to responses generated
  by Worker code — irrelevant here, but it is the usual trap.
- COOP/COEP are deliberately absent. They are only needed for `SharedArrayBuffer`, i.e.
  multithreaded WASM decoding. This site has no WASM decoder to thread, and adding the headers
  would complicate embedding third-party content for no benefit.

## Custom domain

`wrangler.jsonc` claims `nvl72.dev` and `www.nvl72.dev` as custom domains. The zone must exist in
the Cloudflare account named by `account_id`. If it does not, comment out the `routes` block and
the Worker still serves on its `*.workers.dev` subdomain.

## Credentials

`account_id` is in `wrangler.jsonc` because it is not a secret. The API token is not in the repo
and must not be: pass it as `CLOUDFLARE_API_TOKEN` in the environment at deploy time.

## Re-verify before launch

Cloudflare pricing and limits change. Everything above reflects the research report's 2026
figures; re-check the [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
and [limits](https://developers.cloudflare.com/workers/platform/limits/) pages before relying on
them.
