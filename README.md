# BlogSearch: The Anti-SEO Search Engine

### The Problem
Google search results for tech and product management advice are increasingly dominated by heavily SEO-optimized corporate content. Authentic, deep-dive personal blogs and essays (like Paul Graham, WaitButWhy, or Pragmatic Engineer) are buried. 

### The Solution
BlogSearch is a custom, full-stack search engine designed to exclusively index and surface high-quality, authentic personal blogs. 

### Tech Stack & Architecture
* **Frontend:** React.js, Vite, Tailwind CSS v4, Lucide Icons.
* **Backend:** Node.js, Express.js.
* **Ingestion Engine:** `rss-parser`, `axios`, `cheerio` (Custom scraper that strips HTML noise and extracts clean article text).
* **Search Engine:** `Fuse.js` (In-memory fuzzy search with custom weightings for titles and content snippets).

### How It Works
1. **The Scraper:** A Node.js script iterates through a curated JSON list of RSS feeds.
2. **Text Extraction:** It fetches the raw HTML of new articles and uses Cheerio to strip away navbars, footers, and ads, saving only the raw text to a local JSON database.
3. **The API:** An Express server loads this data into RAM and indexes it using Fuse.js.
4. **The UI:** A React frontend queries the API with a 300ms debounce, providing lightning-fast, typo-tolerant search results.

### Run Locally
1. Clone the repo.
2. Run `npm install` in both the `/client` and `/server` directories.
3. In `/server`, run `node scraper.js` to build the database.
4. In `/server`, run `node index.js` to start the search API (Port 5001).
5. In `/client`, run `npm run dev` to start the frontend UI.
