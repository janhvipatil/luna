# Demo recording

`record-demo.cjs` records the ~1:45 product demo used in the final presentation:
idea bank → three AI options → storyboard (timeline, script view, shot ideas) →
real café photo → preview → post caption + export → bring-your-own Gemini key.

## Demo data

The demo café is fictional: **Maison Crumb**, a new French bakery in Torsplan
(modelled on the café interviews). Before recording, set on the demo account:

- Venue (Profile → About your café): Maison Crumb · Bakery · cardamom bun ·
  Torsplan · "cosy French bakery, baked on site every morning"
- Brand look: white captions, serif font
- Three ideas in the idea bank (one mentioning "sold out in an hour")

`maison-crumb-buns.jpg` ("Cardamom buns", Wikimedia Commons, CC0) stands in for
the café's own photo.

## Run

```sh
DEMO_EMAIL=you@example.com DEMO_PASSWORD=... BASE=https://luna-henna-theta.vercel.app \
  NODE_PATH=$(npm root -g) node scripts/demo/record-demo.cjs
```

The script prints `MARK export_start` / `export_done` times; speed that span up
(the browser export records in real time) when converting to MP4.
