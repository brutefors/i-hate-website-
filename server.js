import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// API 1: MangaDex - Popular Manga
app.get('/api/manga/popular', async (req, res) => {
    try {
        console.log('📚 Fetching popular manga...');
        const response = await fetch('https://api.mangadex.org/manga?limit=24&order[followedCount]=desc&includes[]=cover_art&contentRating[]=safe');
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.data?.length || 0} popular manga`);
        res.json(data);
    } catch (error) {
        console.error('❌ Error fetching popular manga:', error);
        res.status(500).json({ 
            error: 'Failed to fetch popular manga',
            details: error.message 
        });
    }
});

// API 2: MangaDex - Latest Updates
app.get('/api/manga/latest', async (req, res) => {
    try {
        console.log('🆕 Fetching latest manga...');
        const response = await fetch('https://api.mangadex.org/manga?limit=24&order[latestUploadedChapter]=desc&includes[]=cover_art&contentRating[]=safe');
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.data?.length || 0} latest manga`);
        res.json(data);
    } catch (error) {
        console.error('❌ Error fetching latest manga:', error);
        res.status(500).json({ 
            error: 'Failed to fetch latest manga',
            details: error.message 
        });
    }
});

// API 3: MangaDex - Search
app.get('/api/manga/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
        }
        
        console.log(`🔍 Searching manga: ${query}`);
        const response = await fetch(`https://api.mangadex.org/manga?limit=24&title=${encodeURIComponent(query)}&includes[]=cover_art&contentRating[]=safe`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.data?.length || 0} results for: ${query}`);
        res.json(data);
    } catch (error) {
        console.error('❌ Error searching manga:', error);
        res.status(500).json({ 
            error: 'Failed to search manga',
            details: error.message 
        });
    }
});

// API 4: Get Manga Chapters
app.get('/api/manga/:id/chapters', async (req, res) => {
    try {
        const mangaId = req.params.id;
        console.log(`📖 Fetching chapters for manga: ${mangaId}`);
        
        const response = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?limit=50&order[chapter]=desc&translatedLanguage[]=en`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.data?.length || 0} chapters`);
        res.json(data);
    } catch (error) {
        console.error('❌ Error fetching chapters:', error);
        res.status(500).json({ 
            error: 'Failed to fetch chapters',
            details: error.message 
        });
    }
});

// API 5: Get Chapter Pages
app.get('/api/chapter/:id', async (req, res) => {
    try {
        const chapterId = req.params.id;
        console.log(`🖼️ Fetching pages for chapter: ${chapterId}`);
        
        const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ Found ${data.chapter?.data?.length || 0} pages`);
        res.json(data);
    } catch (error) {
        console.error('❌ Error fetching chapter pages:', error);
        res.status(500).json({ 
            error: 'Failed to fetch chapter pages',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MyMangazen API is running!',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
    console.log(`🚀 MyMangazen Server running on port ${PORT}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});