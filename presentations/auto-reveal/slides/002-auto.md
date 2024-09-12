### auto-reveal

- Author slides in Markdown
- Built on Vite
- Maintainable & shareable themes

Note:
Inspired by Ember's philosophy

---

## How it works

---

```sh
cd majestik-møøse
mkdir slides
touch slides/000-slide.md

pnpm init
pnpm add auto-reveal auto-reveal-theme-fp
pnpm run auto-reveal
```

---

`slides/000-slide.md`

```md
  # First slide
```

---

<!-- .slide: data-bg-ocean -->

# First slide

---

`slides/000-slide.md`

```md
  # First slide

  Note:
  Presenter notes here

  ---

  ## Second slide
```

---

<!-- .slide: data-bg-ocean -->

# First slide

Note:
Presenter notes here

---

<!-- .slide: data-bg-ocean -->

## Mynd you, møøse bites Kan be pretty nasti

---

<!-- .slide: data-bg-plum -->

I apologise again for the fault in the slides…

---

- Each `.md` file becomes a horizontal slide
- Each `---` becomes a vertical slide

```txt
├── package.json
└── slides
    ├── 000-Møøse-choreographed-by.md ✨
    ├── ...
    └── 004-Antler-care-by.md  ✨
```

Note:
Md are sorted by `.localeCompare()`

---

Need to add images? Put them in `./public`

```txt
├── package.json
├── public
│   ├── ...
│   └── reveal.svg ✨
└── slides
    ├── 000-Møøse-choreographed-by.md
    ├── ...
    └── 004-Antler-care-by.md
```

---

## Creating _your_ theme

---

```sh
mkdir auto-reveal-theme-holygrail
cd auto-reveal-theme-holygrail
npm init
touch theme.css
# If you want to configure Reveal further:
# touch config.json
```

---

`package.json`

```json
{
	"name": "auto-reveal-theme-holygrail",
	"main": "theme.css",
	"files": ["config.json", "theme.css"],
	"keywords": ["auto-reveal-theme"]
}
```

---

### Todo until v1.0

- More themes, including the Reveal.js defaults
- Support for pnpm create
- Build website
- Write new slides
