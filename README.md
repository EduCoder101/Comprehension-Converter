# Comprehension Hub (Astro)

Interactive online reading tests with instant marking and detailed results.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Build for production

```bash
npm run build
```

Output is in `dist/`. Deploy the contents of `dist/` to your host (e.g. GitHub Pages).

## Host on GitHub

### Option A: Without Node.js (e.g. school IT restrictions)

No installs required. The `docs/` folder contains a ready-to-serve static copy of the hub and all tools.

1. **Create a new repository** on GitHub (e.g. `comprehension-converter`). Do not add a README or .gitignore there.

2. **Push your code** (run in the project folder in Command Prompt or PowerShell):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/comprehension-converter.git
   git push -u origin main
   ```

3. **Turn on GitHub Pages**  
   On the repo: **Settings → Pages**. Under **Build and deployment**:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /docs  
   Click Save.

4. **Done.** The site will be at:

   `https://YOUR_USERNAME.github.io/comprehension-converter/`

   When you later change `index.html` or any file in `public/`, run **`sync-static-to-docs.bat`** (double-click) or in PowerShell **`.\sync-static-to-docs.ps1`**, then commit and push so `docs/` stays up to date.

---

### Option B: With Node.js (builds the Astro site)

If you can install Node.js, you can use the Astro-built site and automatic deploys.

1. **Create a new repository** on GitHub (e.g. `comprehension-converter`). Do not add a README or .gitignore there.

2. **Set the base path** (if your repo name is different) in `astro.config.mjs`: change `base: '/comprehension-converter/'` to match your repo name.

3. **Initialise Git and push** (run in the project folder):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/comprehension-converter.git
   git push -u origin main
   ```

4. **Turn on GitHub Pages**  
   On the repo: **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.

5. Each push to `main` will build and deploy automatically. Site URL:

   `https://YOUR_USERNAME.github.io/comprehension-converter/`

## Project structure

- `src/pages/index.astro` — hub homepage
- `src/components/` — Hero, Tools, Test Library, How It Works, Teacher Zone, Footer
- `src/layouts/Layout.astro` — shared layout and global styles
- `public/` — static files served as-is (Test Generator, Results Analyser, test HTML files)
