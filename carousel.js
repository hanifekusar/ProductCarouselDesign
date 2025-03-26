(() => {
    const STORAGE_KEY = 'lcw_products';
    const FAVORITES_KEY = 'lcw_favorites';
    const PRODUCTS_URL = 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json';
    let products = [];
    let currentIndex = 0;

    const init = () => {
        buildHTML();
        buildCSS();
        setEvents();
    };

    const getVisibleCount = () => {
        const slider = document.querySelector('.carousel-slider');
        const item = document.querySelector('.product-card');
        if (!slider || !item) return 1;

        const sliderWidth = slider.offsetWidth;
        const itemWidth = item.offsetWidth;

        return Math.floor(sliderWidth / itemWidth);
    };

    const buildHTML = async () => {
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

        products = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!products) {
            const res = await fetch(PRODUCTS_URL);
            products = await res.json();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        }

        const section = document.createElement('div');
        section.innerHTML = `
            <div class="carousel-container">
                <p class="carousel-title">You Might Also Like</p>
                <div class="carousel">
                    <button type="button" aria-label="previous" class="carousel-arrow carousel-arrow-left">&#10094;</button>
                    <div class="carousel-slider">
                        <div class="carousel-tray">
                        ${products.map(({ id, url, img, name, price }) => `
                            <div class="product-card">
                                <a href="${url}" target="_blank">
                                    <img src="${img}" alt="${name}" />
                                </a>
                                <div class="like-button" data-id="${id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                                        <path
                                            fill="${favorites.includes(id) ? '#007BFF' : 'none'}"
                                            stroke="${favorites.includes(id) ? '#007BFF' : '#555'}"
                                            stroke-width="1.5px"
                                            d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532
                                            4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008
                                            8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4
                                            5.461 5.461 0 0 0 .163-2.012z"
                                            transform="translate(.756 -1.076)">
                                        </path>
                                    </svg>
                                </div>
                                <p class="product-name">${name}</p>
                                <div class="card-content-spacer"></div>
                                <div class="product-price">${price} TL</div>
                            </div>`).join('')}
                        </div>
                    </div>
                    <button type="button" aria-label="next" class="carousel-arrow carousel-arrow-right">&#10095;</button>
                </div>
            </div>
        `;
        document.querySelector('.product-detail')?.insertAdjacentElement('afterend', section);
        updateCarousel();
    };

    const buildCSS = () => {
        const css = `
            .carousel-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 12px;
            }

            .carousel-title {
                font-size: 20px;
                font-weight: bold;
                margin: 40px 0 20px;
                font-family: 'Open Sans', sans-serif;
            }

            .carousel {
                position: relative;
                display: flex;
                align-items: center;
                overflow: hidden;
            }

            .carousel-slider {
                overflow: hidden;
                width: 100%;
            }

            .carousel-tray {
                display: flex;
                transition: transform 0.4s ease-in-out;
            }

            .product-card {
                flex: 0 0 calc(100% / 6);
                padding: 10px;
                box-sizing: border-box;
                border: 1px solid #eee;
                border-radius: 6px;
                background: #fff;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                position: relative;
                text-align: left;
                height: auto;
                min-height: 300px;
            }

            .card-content-spacer {
                flex-grow: 1;
            }

            .product-card img {
                width: 100%;
                object-fit: contain;
                margin-bottom: 10px;
            }

            .like-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: white;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 4px;
                box-shadow: 0 0 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            .product-name {
                font-size: 14px;
                margin: 0 0 6px;
                color: #333;
                line-height: 1.3;
                overflow: visible;
            }

            .product-price {
                font-weight: bold;
                color: #003;
                font-size: 15px;
            }

            .carousel-arrow {
                background: none;
                border: none;
                font-size: 30px;
                color: #555;
                cursor: pointer;
                padding: 10px;
                z-index: 10;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            }

            .carousel-arrow-left {
                left: 0;
            }

            .carousel-arrow-right {
                right: 0;
            }

            @media (max-width: 1024px) {
                .product-card {
                    flex: 0 0 calc(100% / 4);
                }
            }

            @media (max-width: 768px) {
                .product-card {
                    flex: 0 0 calc(100% / 2);
                }
            }

            @media (max-width: 480px) {
                .product-card {
                    flex: 0 0 100%;
                }
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const setEvents = () => {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.carousel-arrow-left')) {
                currentIndex = Math.max(0, currentIndex - 1);
                updateCarousel();
            } else if (e.target.closest('.carousel-arrow-right')) {
                const max = products.length - getVisibleCount();
                currentIndex = Math.min(max, currentIndex + 1);
                updateCarousel();
            } else if (e.target.closest('.like-button')) {
                const btn = e.target.closest('.like-button');
                const id = parseInt(btn.dataset.id);
                const path = btn.querySelector('path');
                let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

                if (favorites.includes(id)) {
                    favorites = favorites.filter(f => f !== id);
                    path.setAttribute('stroke', '#555');
                    path.setAttribute('fill', 'none');
                } else {
                    favorites.push(id);
                    path.setAttribute('stroke', '#007BFF');
                    path.setAttribute('fill', '#007BFF');
                }

                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            }
        });

        window.addEventListener('resize', () => {
            const visibleCount = getVisibleCount();
            const maxIndex = Math.max(0, products.length - visibleCount);
            currentIndex = Math.min(currentIndex, maxIndex);
            updateCarousel();
        });
    };

    const updateCarousel = () => {
        const tray = document.querySelector('.carousel .carousel-tray');
        const item = document.querySelector('.carousel .product-card');

        if (tray && item) {
            const shift = currentIndex * item.offsetWidth;
            tray.style.transform = `translateX(-${shift}px)`;
        }
    };

    init();
})();
