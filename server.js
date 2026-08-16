const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

const PORT = 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});


// ===============================
// GET LIVE GAMING NEWS
// ===============================

async function getLiveNews() {

    const feed = await parser.parseURL(
        "https://news.google.com/rss/search?q=gaming&hl=en-IN&gl=IN&ceid=IN:en"
    );

    return feed.items.slice(0, 30).map((item, index) => ({
        id: index + 1,
        title: item.title || "Gaming News",
        description:
            item.contentSnippet ||
            "Latest gaming news.",
        link: item.link || "#",
        date: item.pubDate || "Today",
        source:
            item.creator ||
            "Gaming News",
        category: "Gaming",
        image: "🎮",
        trendingScore:
            Math.max(100 - index * 3, 10)
    }));
}


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "🎮 GamePulse API is running!",
        version: "3.0.0"
    });

});


// ===============================
// LIVE NEWS
// ===============================

app.get("/api/live-news", async (req, res) => {

    try {

        const news = await getLiveNews();

        res.json({
            success: true,
            count: news.length,
            news: news
        });

    } catch (error) {

        console.error(
            "Live news error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch live news."
        });

    }

});


// ===============================
// TRENDING
// ===============================

app.get("/api/trending", async (req, res) => {

    try {

        const news = await getLiveNews();

        const trending =
            news
                .sort(
                    (a, b) =>
                        b.trendingScore -
                        a.trendingScore
                )
                .slice(0, 6);

        res.json({
            success: true,
            count: trending.length,
            news: trending
        });

    } catch (error) {

        console.error(
            "Trending error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch trending news."
        });

    }

});


// ===============================
// SEARCH
// ===============================

app.get("/api/news", async (req, res) => {

    try {

        const search =
            (req.query.search || "")
                .toLowerCase();

        let news = await getLiveNews();

        if (search) {

            news = news.filter(article =>

                article.title
                    .toLowerCase()
                    .includes(search) ||

                article.description
                    .toLowerCase()
                    .includes(search) ||

                article.source
                    .toLowerCase()
                    .includes(search)

            );

        }

        res.json({
            success: true,
            count: news.length,
            news: news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Unable to search news."
        });

    }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `🎮 GamePulse API running on port ${PORT}`
    );

});