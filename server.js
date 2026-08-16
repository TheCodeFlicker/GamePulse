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

    res.header(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS"
    );

    next();

});


/* ===============================
   CATEGORY KEYWORDS
================================ */

const categories = {

    esports: [
        "esports",
        "esport",
        "tournament",
        "championship",
        "competitive gaming",
        "league",
        "valorant",
        "counter-strike",
        "counter strike",
        "cs2",
        "overwatch",
        "dota",
        "league of legends",
        "worlds",
        "major",
        "pro player"
    ],


    racing: [
        "racing",
        "racer",
        "motorsport",
        "formula 1",
        "formula one",
        "f1",
        "gran turismo",
        "forza",
        "need for speed",
        "assetto corsa",
        "wrc",
        "nascar",
        "motogp",
        "rally"
    ],


    rpg: [
        "rpg",
        "role-playing",
        "role playing",
        "jrpg",
        "final fantasy",
        "dragon quest",
        "elden ring",
        "baldur's gate",
        "baldur gate",
        "persona",
        "monster hunter",
        "dragon age",
        "the witcher",
        "diablo",
        "path of exile",
        "starfield"
    ],


    sandbox: [
        "sandbox",
        "minecraft",
        "roblox",
        "terraria",
        "palworld",
        "garry's mod",
        "garrys mod",
        "lego",
        "creative mode",
        "building game",
        "open world"
    ],


    adventure: [
        "adventure",
        "zelda",
        "legend of zelda",
        "uncharted",
        "tomb raider",
        "indiana jones",
        "assassin's creed",
        "assassins creed",
        "horizon",
        "death stranding",
        "journey",
        "exploration"
    ],


    action: [
        "action",
        "grand theft auto",
        "gta",
        "call of duty",
        "battlefield",
        "doom",
        "destiny",
        "fortnite",
        "apex legends",
        "resident evil",
        "devil may cry",
        "street fighter",
        "tekken",
        "mortal kombat",
        "action game",
        "shooter",
        "fps",
        "third-person shooter"
    ]

};


/* ===============================
   DETECT CATEGORY
================================ */

function detectCategory(article, index) {

    const text = (

        `${article.title || ""} ` +

        `${article.contentSnippet || ""} ` +

        `${article.content || ""}`

    ).toLowerCase();


    /* Check specific categories first */

    for (const category of [
        "esports",
        "racing",
        "rpg",
        "sandbox",
        "adventure",
        "action"
    ]) {

        const keywords =
            categories[category];


        for (const keyword of keywords) {

            if (
                text.includes(
                    keyword.toLowerCase()
                )
            ) {

                return (
                    category
                        .charAt(0)
                        .toUpperCase() +
                    category.slice(1)
                );

            }

        }

    }


    /*
       If the article cannot be identified,
       rotate it through categories instead
       of putting everything into Action.
    */

    const fallbackCategories = [

        "Action",
        "RPG",
        "Esports",
        "Adventure",
        "Sandbox",
        "Racing"

    ];


    return fallbackCategories[
        index %
        fallbackCategories.length
    ];

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

                id:
                    index + 1,


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
                    detectCategory(
                        item,
                        index
                    ),


                image:
                    "🎮",


                trendingScore:
                    Math.max(
                        100 -
                        index * 3,
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

            success:
                true,

            message:
                "🎮 GamePulse API is running!",

            version:
                "5.0.0"

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

                success:
                    true,

                count:
                    news.length,

                news:
                    news

            });

        }

        catch (error) {

            console.error(
                "Live news error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

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

                success:
                    true,

                count:
                    trending.length,

                news:
                    trending

            });

        }

        catch (error) {

            console.error(
                "Trending error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

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
                    .trim()
                    .toLowerCase();


            const category =
                (
                    req.query.category ||
                    "all"
                )
                    .trim()
                    .toLowerCase();


            let news =
                await getLiveNews();


            /* SEARCH */

            if (search) {

                news =
                    news.filter(
                        article => {

                            const text = (

                                `${article.title} ` +

                                `${article.description} ` +

                                `${article.source}`

                            ).toLowerCase();


                            return text.includes(
                                search
                            );

                        }
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

                success:
                    true,

                count:
                    news.length,

                category:
                    category,

                search:
                    search,

                news:
                    news

            });

        }

        catch (error) {

            console.error(
                "News API error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to fetch news."

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