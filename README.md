# Ojas Ayurveda — Treatment Centre Website

A premium, single-page website for an Ayurveda treatment centre. Hand-built, unique design
(emerald + antique gold + ivory), authentic Kerala-Panchakarma content, and **WhatsApp-first booking**.

> **"Ojas Ayurveda", the address, hours, email and the stat numbers are placeholders.**
> Replace them with your real details before publishing (see *Customise* below).

---

## View it

Just open **`index.html`** in a browser. For best results (and to avoid any browser file
restrictions) serve it locally:

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

The web fonts (Fraunces + Manrope) load from Google Fonts, so keep the machine online for the
intended look; if offline, the site falls back to clean system fonts and still works.

---

## File structure

```
index.html            → all page markup + inline SVG icons/illustrations
assets/css/styles.css → the full design system (colours, type, layout, responsive, animation)
assets/js/main.js     → header, mobile menu, accordions, dosha tabs, counters,
                        carousel, gallery lightbox, scroll reveals, WhatsApp booking form
assets/img/           → photos (hero, centre, therapies, gallery) — replace with your own
```

---

## The WhatsApp button (your key requirement)

Every "Book on WhatsApp" / "Book Appointment" button — the floating button, the top nav, the hero,
the signature band, the FAQ, the contact section and the footer — opens WhatsApp to:

```
+91 80758 96213   (wa.me/918075896213)
```

with the message pre-filled:

```
Hey I need an appointment
```

The **booking form** in the Contact section is a bonus: it opens WhatsApp with that same opening
line **plus** the visitor's name, phone, chosen therapy and note — no backend needed.

### To change the number or message
- **In the HTML** — find & replace `918075896213?text=Hey%20I%20need%20an%20appointment`
  (appears on 7 links). Format is `wa.me/<countrycode><number>?text=<url-encoded message>`.
  *(80758 96213 is an Indian number, so the country code `91` was added.)*
- **In `assets/js/main.js`** (for the form) — edit the two constants at the top:
  ```js
  var WA_NUMBER = '918075896213';
  var WA_MSG    = 'Hey I need an appointment';
  ```
- Also update the visible phone numbers (`tel:+918075896213`) and the caption under the big
  contact button if you change the number.

---

## Customise

| What | Where |
|------|-------|
| **Brand name** ("Ojas Ayurveda") | `index.html` — header, hero, footer, `<title>`/meta. Two other name ideas: *Rasayana Ayurveda*, *Dhatri Ayurveda*. |
| **Physician name** (Dr. Anand Nampoothiri) | `index.html` — hero, about signature |
| **Address / hours / email** | `index.html` — Contact section (`.contact__list`) and footer (`.footer__contact`) |
| **Stat numbers** (15+, 25+, 4, 5,000+) | `index.html` — `.stats` section, `data-count` attributes. Confirm with your real figures. |
| **Therapies, doshas, FAQ, testimonials** | `index.html` — plain text inside each section |
| **Photos** | Replace files in `assets/img/` (keep the same names, or update the `src`/`data-src` paths). Recommended: your own centre & therapy photos. |
| **Colours** | `assets/css/styles.css` — the `:root` variables at the very top |

### Replacing images
Keep filenames to avoid editing HTML: `hero.jpg`, `centre.jpg`, `oilpour.jpg`, `massage.jpg`,
`stones.jpg`, `aroma.jpg`, `face.jpg`, `oilbottle.jpg`. Use landscape for `hero/massage/stones/aroma`
and portrait for `centre/face/oilbottle/oilpour`. The current placeholders are royalty-free
Unsplash photos — swap them for your own for authenticity.

---

## Good to know
- Fully responsive (mobile → desktop), keyboard accessible, and respects reduced-motion.
- Content is written in grounded, wellness-appropriate language and includes a medical disclaimer
  ("supports wellbeing… not a substitute for medical care"). Keep that framing when editing.
- No build step, no dependencies — it's plain HTML/CSS/JS.
