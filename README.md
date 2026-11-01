# Kota Shift — standalone playable prototype v0.1

A **new game project**, separate from the existing Virtual Life game. Browser-based single-player isometric life sandbox, with assets sourced unchanged from the owner's `virtual-life-source.zip` export. **No AI-rendered sprites.** The original repo `lafrich/virtual-life-asset-pipeline` defines the canonical `v6b` style and should be the generator used for *future* asset production.

## Run

From this folder, start a local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a desktop or mobile browser on the same machine. No build step or npm install needed. The game stores progress in the browser's `localStorage`.

## Controls

- WASD / arrow keys: move in four isometric directions
- E: interact with the nearest person or station
- I: bag (8 slots); P: phone (online course); C: needs/status
- On mobile, use the on-screen D-pad, action button and tabs

## Playable prototype systems

- Office shift check-in/out, salary and late deductions
- A food stall to buy food and coffee, and food consumption from the bag
- A salvage stall to search for and sell items
- Neighbour NPCs with dialogue
- Needs: hunger, energy, hygiene, bladder, mood
- Rest / washing from a room menu, phone course / skill progression
- Day/time system, local saves, changeable player avatar

## Art source / integration

- `assets/provenance.json`: original path, dimensions, SHA-256 for every copied PNG. The files are pixel-for-pixel unchanged.
- Character sheets: original v6b sprites (64×112 frame, 6 columns, orientation rows); frame/pivot conventions follow `README.md` and `STYLE.md` of `lafrich/virtual-life-asset-pipeline`.
- Every tile / object / character is rendered with nearest-neighbour (no smoothing), from a separate image file.
- For future content: run the **actual Python generator** in `virtual-life-asset-pipeline` using Pillow + NumPy + the specified fonts, inspect 1× and 4× output, audit colours/alpha and import the verified PNGs here. Do not treat this prototype as a substitute for the generator itself.
- The **live** Virtual Life game and its `index.html` have not been modified or deployed.

## Testing

`python3 tools/test_browser.py` requires Chromium and Python Playwright. This embeds the assets in a test-only browser page to work around sandbox navigation restrictions. It tests rendering, movement, work interaction, bag and mobile view. The browser is **not** a multiplayer backend.

## Known gaps / next iteration

- Single-player prototype; no login, database, authoritative game clock, multiplayer or network synchronization yet.
- Room actions use menus, not in-world beds/bathroom props and animation.
- No new gameplay animations for fart, wall-facing urination or sleeping/sitting; these were specific feedback on the original game and have **not** been applied to Kota Shift.
- Current content is a compact demo map with mostly office furniture arranged into several activity zones; it is not a complete Indonesian town or a fully produced bedroom.
- Asset-pipeline `./run_all.sh verify` was **not** executed as part of this package because the separately hosted generator repository isn't included in this ZIP or in the uploaded source; smoke tests here validate this browser prototype only.

## GitHub

This ZIP is ready to upload as a **separate repository**, e.g. `lafrich/kota-shift`. It hasn't been pushed to GitHub. Example steps after creating a blank repo:

```bash
git init
git add .
git commit -m "Create Kota Shift v0.1 playable prototype with original v6b assets"
git branch -M main
git remote add origin https://github.com/lafrich/kota-shift.git
git push -u origin main
```
