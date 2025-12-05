# Advent of Code 2025 — Solutions (Public)

This repository contains only the solution code (the `day*/` folders) from my Advent of Code 2025 workspace.

Why this repo exists
- My original workspace included private input files that the puzzle authors asked not to publish. This repo contains only the solution code — no input files.

How to use
- Clone the repo.
- Add your own `inputs/` files locally (the original code expects inputs in `../inputs/...` relative to each day folder).
- Run a day's script from its folder. Example (PowerShell):

```powershell
Set-Location -Path .\day5
node .\day5-3.js
```

Notes
- I did not change the solutions' behavior; they still read inputs from `../inputs/...`.
- Before publishing, double-check any hard-coded paths or secrets.

If you want, I can:
- Create a `package.json` with scripts to run each day.
- Add small wrapper scripts that let you `node run.js day5-3` and point to an inputs folder.
- Create and push a GitHub repo for you (you will need to provide a token or create the repo yourself and then push).