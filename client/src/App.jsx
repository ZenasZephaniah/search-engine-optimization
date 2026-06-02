import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, ExternalLink } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch results whenever the query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsSearching(true);
      try {
        // Example of what it should look like:
        const response = await axios.get(`https://blog-search-backend-xyz.onrender.com/api/search?q=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
      setIsSearching(false);
    };

    // Small delay (debounce) so we don't spam the backend on every single keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Header / Search Bar Section */}
      <div className="pt-20 pb-10 px-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen size={40} className="text-blue-600" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">BlogSearch</h1>
        </div>

        <div className="w-full max-w-2xl relative shadow-sm rounded-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-md"
            placeholder="Search deep-dives, PM advice, tech essays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Search Results Section */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        {isSearching && <p className="text-center text-gray-500">Searching the archives...</p>}
        
        {!isSearching && results.length === 0 && query !== '' && (
          <p className="text-center text-gray-500 mt-10">No articles found for "{query}". Try a different keyword.</p>
        )}

        <div className="space-y-8 mt-6">
          {results.map((article, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="font-semibold text-blue-600">{article.blogName}</span>
                <span>•</span>
                <span>{article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : 'Recent'}</span>
              </div>
              
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="group">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 group-hover:underline flex items-center gap-2">
                  {article.title}
                  <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
              </a>
              
              <p className="text-gray-600 leading-relaxed">
                {article.contentSnippet}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;