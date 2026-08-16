const API_URL = "http://127.0.0.1:3000";

let currentCategory = "all";


// ===============================
// LOAD LIVE NEWS
// ===============================

async function loadLiveNews() {

    try {

        const response =
            await fetch(`${API_URL}/api/live-news`);

        if (!response.ok) {
            throw new Error("Live news request failed");
        }

        const data =
            await response.json();

        if (!data.success) {
            throw new Error("Live news unavailable");
        }

        displayNews(data.news);

        console.log(
            "🔥 Live GamePulse News:",
            data.news
        );

    } catch (error) {

        console.error(
            "Live News Error:",
            error
        );

        // Fall back to local API news
        loadNews();

    }

}


// ===============================
// LOAD LOCAL / SEARCH NEWS
// ===============================

async function loadNews(
    search = "",
    category = "all"
) {

    try {

        let url =
            `${API_URL}/api/news?`;

        if (search) {

            url +=
                `search=${encodeURIComponent(search)}&`;

        }

        if (
            category &&
            category !== "all"
        ) {

            url +=
                `category=${encodeURIComponent(category)}`;

        }

        const response =
            await fetch(url);

        const data =
            await response.json();

        displayNews(data.news);

    } catch (error) {

        console.error(
            "GamePulse API Error:",
            error
        );

    }

}


// ===============================
// DISPLAY NEWS
// ===============================

function displayNews(news) {

    const container =
        document.querySelector(
            ".news-container"
        );

    if (!container) return;

    container.innerHTML = "";


    if (
        !news ||
        news.length === 0
    ) {

        container.innerHTML = `

            <div class="no-results">

                <h3>
                    No news found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    news.forEach(article => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "news-card";


        card.innerHTML = `

            <div class="image">

                ${
                    article.image ||
                    "🎮"
                }

            </div>


            <div class="content">

                <small>
                    ${
                        article.category ||
                        "Gaming"
                    }
                </small>


                <h3>
                    ${article.title}
                </h3>


                <p>
                    ${
                        article.description ||
                        "Latest gaming news."
                    }
                </p>


                <div class="news-bottom">

                    <span>
                        ${
                            article.source ||
                            article.studio ||
                            "GamePulse"
                        }
                    </span>


                    ${
                        article.link

                        ?

                        `
                        <a
                            href="${article.link}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Original Story →
                        </a>
                        `

                        :

                        `
                        <a
                            href="article.html?id=${article.id}"
                        >
                            Read Story →
                        </a>
                        `

                    }

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


// ===============================
// SEARCH
// ===============================

function setupSearch() {

    const input =
        document.querySelector(
            'input[placeholder*="gaming news"]'
        );

    const button =
        [
            ...document.querySelectorAll(
                "button"
            )
        ].find(button =>
            button.textContent
                .trim()
                .toLowerCase() ===
            "search"
        );


    if (!input || !button) return;


    button.addEventListener(
        "click",
        () => {

            loadNews(
                input.value.trim(),
                currentCategory
            );

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                loadNews(
                    input.value.trim(),
                    currentCategory
                );

            }

        }
    );

}


// ===============================
// FILTERS
// ===============================

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".filters button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    btn =>
                        btn.classList
                            .remove("active")
                );


                button.classList.add(
                    "active"
                );


                const category =
                    button.textContent
                        .trim();


                currentCategory =
                    category
                        .toLowerCase() ===
                    "all"

                    ? "all"

                    : category;


                const input =
                    document.querySelector(
                        'input[placeholder*="gaming news"]'
                    );


                loadNews(
                    input
                        ? input.value.trim()
                        : "",
                    currentCategory
                );

            }
        );

    });

}


// ===============================
// START GAMEPULSE
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLiveNews();

        setupSearch();

        setupFilters();

        loadTrending();

    }
);
async function loadTrending() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/trending`
            );

        const data =
            await response.json();

        if (!data.success) return;

        const container =
            document.getElementById(
                "trendingContainer"
            );

        if (!container) return;

        container.innerHTML = "";

        data.news.forEach(article => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "trending-card";

            card.innerHTML = `

                <div class="trending-rank">
                    #${article.id}
                </div>

                <div class="trending-info">

                    <small>
                        🔥 TRENDING
                    </small>

                    <h3>
                        ${article.title}
                    </h3>

                    <p>
                        ${article.source}
                    </p>

                    <a
                        href="${article.link}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read Story →
                    </a>

                </div>

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Trending error:",
            error
        );

    }

}
// =========================================
// AUTO REFRESH LIVE NEWS
// =========================================

setInterval(() => {

    const container =
    document.querySelector(".news-container");

if (container) {
    container.innerHTML = `
        <div class="loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            Loading GamePulse...
        </div>
    `;
}loadLiveNews();
    loadTrending();

    console.log("🔄 GamePulse news refreshed");

}, 5 * 60 * 1000);