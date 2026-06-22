# oriz-pincode-api

Indian PIN code lookup — given a 6-digit PIN, returns district and state. Monthly snapshot of the official [data.gov.in All India Pincode Directory](https://data.gov.in/resource/all-india-pincode-directory).

Part of the [Oriz](https://oriz.in) family.

## What you get

- Static JSON files hosted on GitHub Pages — no backend, no rate limits, no API key.
- A small PWA-installable docs page with a live lookup playground.
- Monthly automated refresh from the upstream CSV.

## Endpoints

Base URL: `https://pincode.api.oriz.in` (or `https://chirag127.github.io/oriz-pincode-api`).

| Path | What |
|---|---|
| `/data/latest.json` | Current snapshot. |
| `/data/pincodes.json` | Same payload, stable filename. |

Schema:

```jsonc
{
  "source": "https://data.gov.in/resource/all-india-pincode-directory",
  "fetchedAt": "2026-06-22T…",
  "upstreamUsed": true,
  "count": 154797,
  "pincodes": [
    { "pincode": "400001", "district": "Mumbai", "state": "Maharashtra", "officeName": "Mumbai GPO" }
  ]
}
```

Client-side lookup is trivial:

```js
const data = await fetch("https://pincode.api.oriz.in/data/latest.json").then((r) => r.json());
const hit = data.pincodes.find((p) => p.pincode === "400001");
```

## Schedule

GitHub Actions cron `0 1 1-7 * 1` — first Monday of each month at 01:00 UTC (06:30 IST). If upstream is unreachable, the previous snapshot is retained and a small fallback set of 20 major-city PINs is used for cold-start seeding.

## Credit

Source data: **[data.gov.in — All India Pincode Directory](https://data.gov.in/resource/all-india-pincode-directory)**, published by the Department of Posts, Government of India, under the [Government Open Data License – India](https://data.gov.in/government-open-data-license-india).

## License

MIT — see [LICENSE](./LICENSE).
