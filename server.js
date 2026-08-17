const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

const PORT = process.env.PORT || 3000;


/* =========================================
   CORS
========================================= */

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS"
    );

    next();
});


/* =========================================
   COMPANY DATABASE
========================================= */

const companies = [

    {
        name: "Riot Games",
        slug: "riot",
        keywords: [
            "riot games",
            "valorant",
            "league of legends",
            "league of legends esports",
            "teamfight tactics",
            "legends of runeterra",
            "riot forge"
        ]
    },

    {
        name: "Ubisoft",
        slug: "ubisoft",
        keywords: [
            "ubisoft",
            "assassin's creed",
            "assassins creed",
            "far cry",
            "rainbow six",
            "rainbow six siege",
            "watch dogs",
            "just dance",
            "prince of persia",
            "the division"
        ]
    },

    {
        name: "Garena",
        slug: "garena",
        keywords: [
            "garena",
            "free fire",
            "free fire max",
            "free fire esports"
        ]
    },

    {
        name: "Xbox",
        slug: "xbox",
        keywords: [
            "xbox",
            "xbox game pass",
            "xbox series",
            "xbox series x",
            "xbox series s",
            "xbox games studios",
            "microsoft gaming"
        ]
    },

    {
        name: "PlayStation",
        slug: "playstation",
        keywords: [
            "playstation",
            "playstation 5",
            "playstation 5 pro",
            "ps5",
            "ps plus",
            "playstation studios",
            "sony interactive entertainment"
        ]
    },

    {
        name: "Nintendo",
        slug: "nintendo",
        keywords: [
            "nintendo",
            "nintendo switch",
            "switch 2",
            "nintendo switch 2",
            "mario",
            "zelda",
            "pokemon",
            "pokémon"
        ]
    },

    {
        name: "Rockstar Games",
        slug: "rockstar",
        keywords: [
            "rockstar games",
            "grand theft auto",
            "gta",
            "gta 5",
            "gta v",
            "gta 6",
            "gta vi",
            "red dead redemption"
        ]
    },

    {
        name: "Electronic Arts",
        slug: "ea",
        keywords: [
            "electronic arts",
            "ea games",
            "ea sports",
            "ea fc",
            "fc 26",
            "battlefield",
            "apex legends",
            "the sims",
            "need for speed"
        ]
    },

    {
        name: "Epic Games",
        slug: "epic-games",
        keywords: [
            "epic games",
            "fortnite",
            "epic games store",
            "unreal engine"
        ]
    },

    {
        name: "Valve",
        slug: "valve",
        keywords: [
            "valve",
            "steam",
            "steam deck",
            "counter-strike",
            "counter strike",
            "cs2",
            "half-life",
            "portal"
        ]
    },

    {
        name: "Pocketpair",
        slug: "pocketpair",
        keywords: [
            "pocketpair",
            "palworld"
        ]
    }

];


/* =========================================
   DETECT COMPANY
========================================= */

function detectCompany(article) {

    const text = (

        `${article.title || ""} ` +
        `${article.contentSnippet || ""} ` +
        `${article.content || ""}`

    ).toLowerCase();


    for (const company of companies) {

        for (const keyword of company.keywords) {

            if (
                text.includes(
                    keyword.toLowerCase()
                )
            ) {

                return {
                    name: company.name,
                    slug: company.slug,
                    logo: `/logos/${company.slug}.png`
                };

            }

        }

    }


    return {
        name: "GamePulse",
        slug: "gamepulse",
        logo: null
    };

}


/* =========================================
   CATEGORY DETECTION
========================================= */

function detectCategory(article, index) {

    const text = (

        `${article.title || ""} ` +
        `${article.contentSnippet || ""} ` +
        `${article.content || ""}`

    ).toLowerCase();


    const rules = {

        Esports: [
            "esports",
            "esport",
            "tournament",
            "championship",
            "competitive gaming",
            "pro player",
            "world championship",
            "valorant champions",
            "league of legends worlds"
        ],

        Racing: [
            "racing",
            "motorsport",
            "formula 1",
            "formula one",
            "f1",
            "forza",
            "gran turismo",
            "motogp",
            "nascar",
            "rally"
        ],

        RPG: [
            "rpg",
            "role-playing",
            "role playing",
            "jrpg",
            "final fantasy",
            "dragon quest",
            "elden ring",
            "baldur's gate",
            "persona",
            "monster hunter",
            "dragon age",
            "the witcher",
            "diablo"
        ],

        Sandbox: [
            "sandbox",
            "minecraft",
            "roblox",
            "terraria",
            "palworld",
            "garry's mod",
            "creative mode"
        ],

        Adventure: [
            "adventure",
            "zelda",
            "uncharted",
            "tomb raider",
            "indiana jones",
            "horizon",
            "death stranding",
            "exploration"
        ],

        Action: [
            "action",
            "grand theft auto",
            "gta",
            "call of duty",
            "battlefield",
            "doom",
            "fortnite",
            "apex legends",
            "resident evil",
            "devil may cry",
            "street fighter",
            "tekken",
            "mortal kombat",
            "shooter",
            "fps"
        ]

    };


    for (const category of Object.keys(rules)) {

        for (const keyword of rules[category]) {

            if (
                text.includes(
                    keyword.toLowerCase()
                )
            ) {

                return category;

            }

        }

    }


    const fallback = [
        "Action",
        "RPG",
        "Esports",
        "Adventure",
        "Sandbox",
        "Racing"
    ];

    return fallback[
        index % fallback.length
    ];

}


/* =========================================
   GET LIVE NEWS
========================================= */

async function getLiveNews() {

    const feed = await parser.parseURL(
        "https://news.google.com/rss/search?q=gaming&hl=en-IN&gl=IN&ceid=IN:en"
    );


    return feed.items
        .slice(0, 30)
        .map((item, index) => {

            const company =
                detectCompany(item);


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
                    detectCategory(
                        item,
                        index
                    ),

                company:
                    company.name,

                companySlug:
                    company.slug,

                logo:
                    company.logo,

                image:
                    null,

                trendingScore:
                    Math.max(
                        100 - index * 3,
                        10
                    )

            };

        });

}


/* =========================================
   HOME
========================================= */

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "🎮 GamePulse API is running!",

        version:
            "6.0.0"

    });

});


/* =========================================
   LIVE NEWS
========================================= */

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


/* =========================================
   TRENDING
========================================= */

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


/* =========================================
   SEARCH + CATEGORY
========================================= */

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
                    news.filter(article => {

                        const text = (

                            `${article.title} ` +
                            `${article.description} ` +
                            `${article.source} ` +
                            `${article.company}`

                        ).toLowerCase();


                        return text.includes(
                            search
                        );

                    });

            }


            /* CATEGORY */

            if (
                category &&
                category !== "all"
            ) {

                news =
                    news.filter(article =>

                        article.category
                            .toLowerCase() ===
                        category

                    );

            }


            res.json({

                success: true,

                count:
                    news.length,

                search:
                    search,

                category:
                    category,

                news:
                    news

            });

        } catch (error) {

            console.error(
                "News API error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch news."

            });

        }

    }
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `🎮 GamePulse API running on port ${PORT}`
        );

    }
);