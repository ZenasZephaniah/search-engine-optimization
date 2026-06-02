const fs = require('fs');
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const parser = new Parser();

// Helper function to extract clean text from an article URL
async function scrapeArticleText(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Remove junk elements we don't want to search through
        $('script, style, noscript, nav, footer, header, aside').remove();

        // Try to get text from an <article> tag first, fallback to <body>
        let text = $('article').text();
        if (!text) {
            text = $('body').text();
        }

        // Clean up the text (remove extra spaces and newlines)
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        return cleanText;
    } catch (error) {
        console.error(`❌ Failed to scrape ${url}: ${error.message}`);
        return null;
    }
}

// Main function to run the ingestion process
async function runIngestion() {
    console.log('🚀 Starting Data Ingestion...');

    // 1. Read the seed data
    const rawData = fs.readFileSync('./data/seed_blogs.json');
    const blogs = JSON.parse(rawData);

    const extractedArticles = [];

    // 2. Loop through each blog
    for (const blog of blogs) {
        console.log(`\n📡 Fetching RSS for: ${blog.name}`);
        
        try {
            const feed = await parser.parseURL(blog.rss_feed);
            
            // Just get the top 2 most recent articles for testing purposes
            const recentItems = feed.items.slice(0, 2);

            for (const item of recentItems) {
                console.log(`   -> Found article: ${item.title}`);
                
                // 3. Scrape the article content
                 // Fix relative URLs (like Manas Saloi's blog)
                let articleUrl = item.link;
                if (!articleUrl.startsWith('http')) {
                    articleUrl = new URL(item.link, blog.url).href;
                }   

                const content = await scrapeArticleText(articleUrl);
                
                
                if (content) {
                    extractedArticles.push({
                        blogName: blog.name,
                        title: item.title,
                        link: item.link,
                        publishedDate: item.pubDate,
                        contentSnippet: content.substring(0, 150) + '...' // Save a snippet for now
                    });
                    console.log(`      ✅ Successfully scraped!`);
                }
            }
        } catch (error) {
            console.error(`❌ Error parsing RSS for ${blog.name}: ${error.message}`);
        }
    }

    // 4. Save the results to a file to verify it worked
    fs.writeFileSync('./data/scraped_articles.json', JSON.stringify(extractedArticles, null, 2));
    console.log('\n🎉 Ingestion complete! Check server/data/scraped_articles.json');
}

runIngestion();
