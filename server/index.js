const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Fuse = require('fuse.js');

const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to talk to this backend
app.use(express.json());

// 1. Load the scraped data into memory
let articles = [];
try {
    const rawData = fs.readFileSync('./data/scraped_articles.json');
    articles = JSON.parse(rawData);
    console.log(`✅ Loaded ${articles.length} articles into memory.`);
} catch (error) {
    console.error("❌ Could not load articles. Did you run the scraper first?");
}

// 2. Configure the Search Engine (Fuse.js)
const fuseOptions = {
    keys: [
        { name: 'title', weight: 0.7 },         // Title matches are most important
        { name: 'contentSnippet', weight: 0.3 }, // Content matches are secondary
        { name: 'blogName', weight: 0.2 }        // Can also search by author
    ],
    includeScore: true, // Gives us a relevance score
    threshold: 0.4,     // 0.0 is exact match, 1.0 is anything. 0.4 handles typos well.
    ignoreLocation: true 
};

const searchEngine = new Fuse(articles, fuseOptions);

// 3. Create the Search API Endpoint
app.get('/api/search', (req, res) => {
    const searchQuery = req.query.q;

    // If search bar is empty, return everything (or an empty array, up to you)
    if (!searchQuery) {
        return res.json(articles); 
    }

    // Perform the fuzzy search
    const results = searchEngine.search(searchQuery);

    // Fuse.js wraps items in a { item, score } object. Let's clean it up to just send the items.
    const cleanResults = results.map(result => result.item);

    res.json(cleanResults);
});

// 4. Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Search Backend running on http://localhost:${PORT}`);
    console.log(`Test the API by clicking: http://localhost:${PORT}/api/search?q=toddler`);
});
