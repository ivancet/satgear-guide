# SatGear Guide (beta)

Used Newtec / iDirect broadcast satellite equipment: **asking prices from public listings, each with its source link**, clearly labelled **estimates** where no public price exists, and an **MCX7000 licence checklist builder** (VI-01 GbE TSoIP UDP/RTP, VP-01/VP-02, DL-0x, DR-01/02, SR-xx, HS-05 ASI, AE-01 Equalink…).

- Static HTML/CSS/JS, no backend, no cookies or analytics.
- Price data lives in `data.js` (date checked, FX rate, sources). Update it by hand and re-run the link check.
- **Contact:** `config.js` → `contactEmail` is intentionally blank. While blank, the request form only builds the text (copy / mailto without recipient). Set it to the inbox that should receive quote/sell requests.

**Beta: asking prices, not sold prices; not affiliated with ST Engineering iDirect / Newtec.**

## Tests
```
node tests/guide.test.js            # engine + data sanity
python3 -m http.server 8767 & python3 tests/e2e.py   # headless browser (Playwright + Chrome)
python3 tests/check_links.py        # every source URL loads (bot-blocked dealers reported as BLOCKED)
```
