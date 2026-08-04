# Plantain Leaf AR Prototype

A first proof of concept using **MindAR image tracking + Three.js**.

The phone camera recognises the printed empty plantain leaf, then displays a
transparent photographic food layer aligned over the leaf.

## Included

- `index.html` — camera-based AR experience
- `preview.html` — non-camera alignment and reveal preview
- `assets/target-empty-leaf.png` — image that must be compiled as a MindAR target
- `assets/food-overlay.png` — transparent food-and-shadow overlay
- `assets/expected-food-leaf.png` — visual reference
- `assets/alignment-check.png` — offline alignment check
- `src/main.js` — MindAR + Three.js scene and reveal animation
- `src/styles.css` — mobile scanner UI

## Required one-time step: create targets.mind

MindAR preprocesses tracking images into a `.mind` file.

1. Open the official MindAR Image Targets Compiler:
   https://hiukim.github.io/mind-ar-js-doc/tools/compile/
2. Upload `assets/target-empty-leaf.png`.
3. Click **Start**.
4. Review the visualised feature points.
5. Download the generated file.
6. Rename it to `targets.mind` if needed.
7. Put it here:

   `assets/targets.mind`

Remove `assets/targets.mind.REPLACE_ME.txt` after adding the compiled file.

## Test the visual alignment first

Run a local web server from this project folder:

### Python

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080/preview.html
```

The food should animate into place without showing a replacement white
background.

## Test AR on a desktop webcam

After adding `assets/targets.mind`:

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080/
```

Tap **Start AR**, then show `assets/target-empty-leaf.png` on another screen or
print it.

## Test AR on a phone

Mobile camera access normally requires an **HTTPS** URL. Deploy this entire
folder to an HTTPS static host such as Cloudflare Pages, Vercel, Netlify or
GitHub Pages.

Then:

1. Open the HTTPS URL on the phone.
2. Tap **Start AR**.
3. Allow camera permission.
4. Point the camera at a printout of `assets/target-empty-leaf.png`.
5. The food layer should reveal over the printed leaf.

Do not open `index.html` directly using a `file://` address.

## Newspaper production notes

This cropped target is suitable for the prototype because the leaf fills most of
the tracking image. Before printing the final advertisement:

- Add an asymmetric headline, brand mark or corner decoration near the leaf.
- Compile the final press-ready artwork again.
- Test from an actual newsprint press proof, not only a laser print.
- Keep the tracked region away from folds and page gutters.
- Add a QR code that opens the deployed HTTPS page.
- Use separate QR URLs for publication, city and campaign attribution.

## Next iteration

For a richer reveal, divide `food-overlay.png` into individual dish layers and
animate the rice, bowls, papad, banana and sides one after another.
