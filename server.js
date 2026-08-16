const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

const PORT = process.env.PORT || 3000;


/* ===============================
   CORS
================================ */

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "*"
    );

    next();

});


/* ===============================
   CATEGORY DETECTION
================================ */

function detectCategory(article) {

    const text =
        `${article.title || ""} ${article.contentSnippet || ""}`
            .toLowerCase();


    if (
        text.includes("esports") ||
        text.includes("esport") ||
        text.includes("tournament") ||
        text.includes("championship") ||
        text.includes("valorant") ||
        text.includes("league of legends") ||
        text.includes("counter-strike") ||
        text.includes("cs2")
    ) {

        return "Esports";

    }


    if (
        text.includes("racing") ||
        text.includes("formula 1") ||
        text.includes("f1") ||
        text.includes("motorsport") ||
        text.includes("gran turismo") ||
        text.includes("forza") ||
        text.includes("need for speed")
    ) {

        return "Racing";

    }


    if (
        text.includes("rpg") ||
        text.includes("role-playing") ||
        text.includes("pokemon") ||
        text.includes("final fantasy") ||
        text.includes("elden ring") ||
        text.includes("baldur")
    ) {

        return "RPG";

    }


    if (
        text.includes("minecraft") ||
        text.includes("palworld") ||
        text.includes("roblox") ||
        text.includes("terraria") ||
        text.includes("sandbox")
    ) {

        return "Sandbox";

    }


    if (
        text.includes("adventure") ||
        text.includes("zelda") ||
        text.includes("uncharted") ||
        text.includes("tomb raider")
    ) {

        return "Adventure";

    }


    if (
        text.includes("call of duty") ||
        text.includes("battlefield") ||
        text.includes("gta") ||
        text.includes("grand theft auto") ||
        text.includes("fortnite") ||
        text.includes("apex legends") ||
        text.includes("doom")
    ) {

        return "Action";

    }


    return "Action";

}


/* ===============================
   GET LIVE GAMING NEWS
================================ */

async function getLiveNews() {

    const feed =
        await parser.parseURL(
            "https://news.google.com/rss/search?q=gaming&hl=en-IN&gl=IN&ceid=IN:en"
        );


    return feed.items
        .slice(0, 30)
        .map((item, index) => {

            return {

                id: index + 1,

                title:
                    item.title ||
                    "Gaming News",

                description:
                    item.contentSnippet ||
                    "Latest gaming news.",

                link:
                    item.link ||
                    "#",

                date:
                    item.pubDate ||
                    "Today",

                source:
                    item.creator ||
                    "Gaming News",

                category:
                    detectCategory(item),

                image:
                    "🎮",

                trendingScore:
                    Math.max(
                        100 - index * 3,
                        10
                    )

            };

        });

}


/* ===============================
   HOME
================================ */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "🎮 GamePulse API is running!",

            version:
                "4.0.0"

        });

    }
);


/* ===============================
   LIVE NEWS
================================ */

app.get(
    "/api/live-news",
    async (req, res) => {

        try {

            const news =
                await getLiveNews();


            res.json({

                success: true,

                count:
                    news.length,

                news:
                    news

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

    }
);


/* ===============================
   TRENDING
================================ */

app.get(
    "/api/trending",
    async (req, res) => {

        try {

            const news =
                await getLiveNews();


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

                count:
                    trending.length,

                news:
                    trending

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

    }
);


/* ===============================
   SEARCH + CATEGORY
================================ */

app.get(
    "/api/news",
    async (req, res) => {

        try {

            const search =
                (
                    req.query.search ||
                    ""
                )
                    .toLowerCase();


            const category =
                (
                    req.query.category ||
                    "all"
                )
                    .toLowerCase();


            let news =
                await getLiveNews();


            /* SEARCH */

            if (search) {

                news =
                    news.filter(
                        article =>

                            article.title
                                .toLowerCase()
                                .includes(search)

                            ||

                            article.description
                                .toLowerCase()
                                .includes(search)

                            ||

                            article.source
                                .toLowerCase()
                                .includes(search)

                    );

            }


            /* CATEGORY */

            if (
                category &&
                category !== "all"
            ) {

                news =
                    news.filter(
                        article =>

                            article.category
                                .toLowerCase() ===
                            category

                    );

            }


            res.json({

                success: true,

                count:
                    news.length,

                category:
                    category,

                news:
                    news

            });

        } catch (error) {

            console.error(
                "Search/category error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to search news."

            });

        }

    }
);


/* ===============================
   START SERVER
================================ */

app.listen(
    PORT,
    () => {

        console.log(
            `🎮 GamePulse API running on port ${PORT}`
        );

    }
);