const API_URL =
    "https://gamepulse-api-ecat.onrender.com";


/* =========================================
   ELEMENTS
========================================= */

const newsContainer =
    document.querySelector(
        ".news-container"
    );

const trendingContainer =
    document.getElementById(
        "trendingContainer"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );

const filterButtons =
    document.querySelectorAll(
        ".filters button"
    );


let currentCategory = "all";
let currentSearch = "";


/* =========================================
   IMAGE / LOGO
========================================= */

function getLogo(article) {

    if (!article.logo) {

        return `
            <div class="company-logo fallback-logo">
                🎮
            </div>
        `;

    }


    return `
        <img
            class="company-logo"
            src="${article.logo}"
            alt="${escapeHTML(
                article.company || "Gaming company"
            )} logo"
            loading="lazy"
            onerror="this.outerHTML='<div class=&quot;company-logo fallback-logo&quot;>🎮</div>'"
        >
    `;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   NEWS CARD
========================================= */

function createNewsCard(article) {

    const title =
        escapeHTML(article.title);

    const description =
        escapeHTML(
            article.description
        );

    const company =
        escapeHTML(
            article.company ||
            "Gaming"
        );

    const category =
        escapeHTML(
            article.category ||
            "Gaming"
        );

    const date =
        escapeHTML(
            article.date ||
            "Today"
        );


    return `

        <article class="news-card">

            <div class="news-card-top">

                ${getLogo(article)}

                <div class="company-info">

                    <strong>
                        ${company}
                    </strong>

                    <span>
                        ${category}
                    </span>

                </div>

            </div>


            <div class="news-card-body">

                <h3>
                    ${title}
                </h3>

                <p>
                    ${description}
                </p>

            </div>


            <div class="news-card-footer">

                <span>
                    ${date}
                </span>


                <a
                    href="article.html?id=${encodeURIComponent(
                        article.id
                    )}"
                >
                    Read Story →
                </a>

            </div>

        </article>

    `;

}


/* =========================================
   TRENDING CARD
========================================= */

function createTrendingCard(article) {

    const title =
        escapeHTML(article.title);

    const company =
        escapeHTML(
            article.company ||
            "Gaming"
        );


    return `

        <article class="trending-card">

            ${getLogo(article)}

            <div>

                <span>
                    ${company}
                </span>

                <h3>
                    ${title}
                </h3>

                <a
                    href="article.html?id=${encodeURIComponent(
                        article.id
                    )}"
                >
                    Read Story →
                </a>

            </div>

        </article>

    `;

}


/* =========================================
   LOAD NEWS
========================================= */

async function loadNews() {

    if (!newsContainer) {
        return;
    }


    newsContainer.innerHTML = `

        <p>
            Loading news...
        </p>

    `;


    try {

        const params =
            new URLSearchParams();


        if (currentSearch) {

            params.set(
                "search",
                currentSearch
            );

        }


        if (
            currentCategory &&
            currentCategory !== "all"
        ) {

            params.set(
                "category",
                currentCategory
            );

        }


        const response =
            await fetch(
                `${API_URL}/api/news?${params.toString()}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.news
        ) {

            throw new Error(
                "Invalid API response"
            );

        }


        if (
            data.news.length === 0
        ) {

            newsContainer.innerHTML = `

                <div class="no-results">

                    <h3>
                        No news found
                    </h3>

                    <p>
                        Try another search or category.
                    </p>

                </div>

            `;

            return;

        }


        newsContainer.innerHTML =
            data.news
                .map(
                    createNewsCard
                )
                .join("");


    } catch (error) {

        console.error(
            "News loading error:",
            error
        );


        newsContainer.innerHTML = `

            <div class="no-results">

                <h3>
                    Unable to load news
                </h3>

                <p>
                    Please try again.
                </p>

            </div>

        `;

    }

}


/* =========================================
   LOAD TRENDING
========================================= */

async function loadTrending() {

    if (!trendingContainer) {
        return;
    }


    trendingContainer.innerHTML = `

        <p>
            Loading trending news...
        </p>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/trending`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.news
        ) {

            throw new Error(
                "Invalid trending response"
            );

        }


        if (
            data.news.length === 0
        ) {

            trendingContainer.innerHTML = `

                <p>
                    No trending news available.
                </p>

            `;

            return;

        }


        trendingContainer.innerHTML =
            data.news
                .map(
                    createTrendingCard
                )
                .join("");


    } catch (error) {

        console.error(
            "Trending loading error:",
            error
        );


        trendingContainer.innerHTML = `

            <p>
                Unable to load trending news.
            </p>

        `;

    }

}


/* =========================================
   SEARCH
========================================= */

function performSearch() {

    currentSearch =
        searchInput
            ? searchInput.value.trim()
            : "";


    loadNews();

}


/* =========================================
   SEARCH BUTTON
========================================= */

if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


/* =========================================
   ENTER KEY SEARCH
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                performSearch();

            }

        }
    );

}


/* =========================================
   CATEGORY FILTERS
========================================= */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            currentCategory =
                (
                    button.dataset.category ||
                    "all"
                ).toLowerCase();


            loadNews();

        }
    );

});


/* =========================================
   INITIAL LOAD
========================================= */

loadNews();

loadTrending();