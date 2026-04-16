# Satisfactory Production Planner

An interactive visual flowchart planner for Satisfactory 1.0/1.1 — select any item, set a target rate, and see the full production chain with machine counts, power draw, foundation footprints, alternate recipe toggles, and Somersloop support.

## Features

- Visual flowchart showing exactly which machines feed into which
- Machine nodes drawn as actual foundation footprints (1 grid square = 1 foundation / 8m)
- Alternate recipe toggles with community tier ratings (S/A/B)
- Somersloop calculator (2x output at 2x power)
- Foundation cost estimates with walkway overhead
- Pan, zoom, click nodes for details

## Run locally

You need [Node.js](https://nodejs.org/) 18 or higher installed.

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Deploy to GitHub Pages (the easy way)

### 1. Create a new repo on GitHub

Go to https://github.com/new. Name it whatever you want (e.g., `satisfactory-planner`). Make it **Public**. Don't initialize with a README.

### 2. Update the base path

Open `vite.config.js` and change the `base` to match your repo name:

```js
base: '/YOUR-REPO-NAME/',
```

For example, if your repo is `jcrow/satisfactory-tools`, use `base: '/satisfactory-tools/'`.

### 3. Push your code

In this folder, run:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### 4. Enable GitHub Pages

On your repo's GitHub page:
1. Click **Settings** (top right)
2. Click **Pages** (left sidebar)
3. Under "Build and deployment" → "Source", select **GitHub Actions**

That's it! The workflow in `.github/workflows/deploy.yml` will run automatically on every push to `main`. Check the **Actions** tab to watch the build. When it finishes (takes ~1-2 minutes), your site will be live at:

```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

### Updating later

Just commit and push to `main`:

```bash
git add .
git commit -m "update planner"
git push
```

The site auto-rebuilds and redeploys.

## Alternative: Deploy to Cloudflare Pages / Vercel / Netlify

If you don't want to use GitHub Pages, these all support one-click deploys from a GitHub repo:

- **Cloudflare Pages**: https://pages.cloudflare.com → connect your repo, no config needed
- **Vercel**: https://vercel.com/new → import your repo, auto-detects Vite
- **Netlify**: https://app.netlify.com/start → connect repo, build command `npm run build`, publish directory `dist`

All three are free for personal projects and give you a nicer URL than GitHub Pages.

## File structure

```
satisfactory-planner/
├── .github/workflows/deploy.yml  ← GitHub Actions deploy workflow
├── src/
│   ├── App.jsx                   ← The planner component
│   └── main.jsx                  ← React entry point
├── index.html                    ← HTML shell
├── vite.config.js                ← Vite config (edit base path here)
├── package.json                  ← Dependencies
└── .gitignore
```
