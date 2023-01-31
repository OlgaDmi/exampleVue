// Import Swiper and modules
import {Swiper, Navigation, Pagination, Scrollbar, Controller, EffectFade, Autoplay} from 'swiper';

// Install modules
Swiper.use([Navigation, Pagination, Scrollbar, Controller, EffectFade, Autoplay]);

// создаёт объект Vue только на главной странице
if (document.getElementById("newmain")) {

    window.$vmcart = new Vue({
        el: '#newmain',
        data: {
            // баннеры наверху
            bannersTop: [],
            // текущий таб топ-предложений
            currentTab: 'new',
            // текущий таб журнала
            currentNewsTab: 'all',
            // заголовки табов топ-предложений
            categories: [
                {
                    message: 'Новинки',
                    active: true,
                    href: 'new'
                },
                {
                    message: 'Хиты продаж',
                    active: false,
                    href: 'hit'
                }
            ],
            // заголовки табов журнала
            tabs: [
                {
                    message: 'Все статьи',
                    active: true,
                    href: 'all'
                },
                {
                    message: 'Обзор',
                    active: false,
                    href: 'review'
                },
                {
                    message: 'Как выбрать',
                    active: false,
                    href: 'choice'
                },
                {
                    message: 'Полезные советы',
                    active: false,
                    href: 'advices'
                }
            ],
            // содержимое табов топ-предложений (признак показывать или нет)
            goods: {
                hit: true,
                hots: false,
                new: false
            },
            // топ-предложения (товары)
            topOffersHits: [],
            topOffersHots: [],
            topOffersNew: [],
            // избранное текущего пользователя
            favorites: [],
            // элементы пользовательского интерфейса
            ui: {
                // показывать ли прелоадер топ-предложений
                isShowOffersPreloader: true,
                // показывать ли блок RR (неиспользуется временно)
                isShowRR: false,
                // инициализирован ли слайдер товаров
                isSliderProductsInit: false,
            },
        },
        created() {
            // запрашивает в API информацию для формирования объекта
            console.log('loading...');
            this.loadMainPageData();
            console.log('loaded...');
        },
        mounted() {
            this.$nextTick(function () {
                // Код, который будет запущен только после
                // отрисовки всех представлений
            })
        },
        methods: {
            changeTab: function (tab) {
                this.tabs.forEach(el => {
                    el.active = el === tab;
                })
                this.currentNewsTab = tab.href;
                slideToStart();
            },

            /**
             * Устанавливает активный таб топ-предложений
             * @param item
             */
            changeCategory: function (item) {
                this.categories.forEach(el => {
                    el.active = el === item;
                })
                this.currentTab = item.href;

                // вызвать событие при смене показываемой категории топ-предложений
                this.onChangeTopOffers();
            },

            /**
             * Добавляет товар в корзину (одну единицу)
             * @param item
             */
            addBasket: function (item) {
                // проверяет, что товар ещё не добавляется, чтобы препятствовать повторному клику по кнопке.
                if (item.btn.isProcessing !== true) {
                    // помечает товар, как обрабатывающийся
                    item.btn.isProcessing = true;
                } else {
                    console.log('Повторное нажатие на "добавить в корзину", пока запрос не обработан');
                }
            },

            /**
             * Показывает блок изменения кол-ва товаров в корзине (после добавления одного товара).
             * В зависимости от разрешения экрана, показывает основную или мобильную версию
             * @param item
             */
            showChoiceBlock: function (item) {
                // скрывает кнопку "добавить в корзину"
                item.btn.cart = false;
                // в зависимости от ширины блока
                if (window.innerWidth <= 600) {
                    // для мобильных
                    // скрыть цену
                    item.btn.price = false;
                    // показать мобильный "выбиратор"
                    item.btn.choiceMob = true;
                } else {
                    // показать обычный "выбиратор"
                    item.btn.choice = true;
                }
            },

            /**
             * Показывает блок "добавить в корзину"
             * @param item
             */
            showCartBlock: function (item) {
                item.btn.cart = true;
                if (window.innerWidth <= 600) {
                    item.btn.price = true;
                    item.btn.choiceMob = false;
                } else {
                    item.btn.choice = false;
                }
            },

            /**
             * Увеличивает или уменьшает кол-во товара в корзине
             * @param item
             * @param operation
             */
            changeCount: function (item, operation) {
                // проверяет, что еще не запущена обработка (чтобы не допускать кликов в процессе запроса)
                if (item.btn.isProcessing) return false;

                let useTimeout = true;

                switch (operation) {
                    case 'plus':
                        item.count++
                        break;
                    case 'minus':
                        if (item.count > 0) {
                            item.count--;
                        }
                        if (item.count === 0) {
                            this.showCartBlock(item);
                            useTimeout = false;
                            item.count = 1;
                        }
                        break;
                    default:
                        break;
                }
            },

            /**
             * Показывает модальное окно (обычно с сообщением об ошибке)
             * Не имеет отношения к остальным всплывающим окнам на странице
             * Топорный костыль пока не будет другого ui
             *
             * @param text текст сообщения
             */
            showModal: function (text) {
                const oPopup = new BX.PopupWindow('oder_props_weight', window.body, {
                    autoHide: true,
                    offsetTop: 1,
                    offsetLeft: 0,
                    lightShadow: true,
                    closeIcon: true,
                    closeByEsc: true,
                    overlay: {
                        backgroundColor: '#000', opacity: '60'
                    },
                    events: {
                        onPopupClose: function (popupWindow) {
                            popupWindow.destroy();
                        }
                    }
                });
                const modal = "<div id='bl_modal_weight'><div class='b_conteiner'>" + text + "</div></div>";
                oPopup.setContent(modal);
                oPopup.show();
            },

            /**
             * Общая функция для наполнения "избранного" пользователя
             * Видимо далее нужно вызывать функцию, которая будет "показывать сердечки" избранноого
             *
             * @param data
             */
            renderFavorites(data) {
                console.log('favorites: render');
                Object.entries(data).forEach(([key, item]) => {
                    // console.log(item);

                    let Favorite = {
                        id: null,
                        name: null,
                        productId: null,
                        code: null,
                    }

                    // основная информация
                    Favorite.id = item.ID;
                    Favorite.productId = item.ELEMENT_ID;
                    Favorite.name = item.NAME;
                    Favorite.code = item.CODE;
                    // добавить в массив
                    this.favorites.push(Favorite);

                    // подразумевается, что все данные о товарах уже загружены ранее
                    const topOffers = [
                        'topOffersHits',
                        // 'topOffersHots',
                        'topOffersNew',
                    ];

                    // для каждого типа товаров прорисовывает "избранное"
                    topOffers.forEach(
                        typeTopOffer => {
                            Object.entries(this[typeTopOffer]).forEach(([key, product]) => {
                                if (product.code == Favorite.code) {
                                    product.isFavorite = true;
                                    Vue.set(this[typeTopOffer], key, product);
                                    console.log('favorites: ' + product.code + " в избранном");
                                }
                                // } else  {
                                //     product.isFavorite = false;
                                //     // console.log(product.code + " НЕ в избранном");
                                // }
                            });
                        });
                });
            },

            /**
             * Общая функция для рендеринга топ-предложений
             * @param data
             * @param typeTopOffers - тип топ-предложения (topOffersHots, topOffersHits, topOffersNew)
             */
            renderTopOffers(data, typeTopOffers) {
                console.log('topOffers: render ' + typeTopOffers);
                Object.entries(data.ITEMS).forEach(([key, item]) => {
                    let Product = {
                        id: null,
                        images: [],
                        online: false,
                        super: false,
                        hit: false,
                        new: false,
                        count: 1,
                        name: null,
                        detailURL: null,
                        rating: false,
                        code: null,
                        price: false,
                        priceFormatted: false,
                        oldPrice: false,
                        discount: false,
                        measure: null,
                        type: null,
                        isFavorite: false,
                        isCompare: false,
                        btn: {
                            cart: true,
                            price: true,
                            choice: false,
                            choiceMob: false,
                            isProcessing: false,
                        },
                    }

                    // изображения товара
                    if (Array.isArray(item.images) && item.images.length > 0) {
                        Object.entries(item.images).forEach(([key, image]) => {
                            Product.images.push({
                                src: image.src
                            });
                        });
                    } else {
                        // картинка-заглушка
                        Product.images.push({
                            src: '/uploads/cart/nophoto.jpg'
                        });
                    }

                    // бейджи товара
                    if (item.offer.PROPERTY_REP_IMATRIX_VALUE === 'rep10') {
                        Product.online = true;
                    }
                    if (item.offer.PROPERTY_REP_ACTION_R_VALUE === 'rep1') {
                        Product.super = true;
                    }
                    if (item.offer.PROPERTY_REP_ACTION_FIRST_VALUE === 'rep1') {
                        Product.hit = true;
                    }
                    if (item.offer.PROPERTY_REP_ACTION_NEW_VALUE === 'rep1') {
                        Product.new = true;
                    }

                    // основная информация
                    Product.id = item.ID;
                    Product.name = item.NAME;
                    Product.detailURL = item.detailURL;
                    Product.code = item.PROPERTY_ITEM_CODE_VALUE;
                    Product.measure = item.offer.MEASURE;

                    Product.price = item.price;
                    Product.priceFormatted = parseFloat(item.price).mdPriceFormat(true);
                    Product.oldPrice = item.oldPrice;
                    Product.discount = item.discount;

                    Product.type = typeTopOffers;

                    // добавить в нужный массив
                    this[typeTopOffers].push(Product);
                    // Vue.set(this.productsHits, key, Object.values(value));
                    // console.log(item);
                });

                // маркетинг
                Vue.set(this.marketing[typeTopOffers], 'arImpressions', data.arImpressions);
                Vue.set(this.marketing[typeTopOffers], 'arImpressionsNew', data.arImpressionsNew);
                Vue.set(this.marketing[typeTopOffers], 'allArTrId', data.allArTrId);
            },

            /**
             * Общая функция для рендеринга баннеров
             * @param data
             * @param typeBanners - тип баннера (banners, bannersLeft, bannersRight)
             */
            renderBanners(data, typeBanners) {
                console.log('banners: render ' + typeBanners);
                Object.entries(data).forEach(([key, item]) => {
                    // console.log(item);

                    const Banner = {
                        id: null,
                        src: null,
                        srcBig: null,
                        srcMobile: null,
                        href: null
                    };

                    Banner.srcBig = item.src;
                    Banner.srcMobile = item.srcMobile;
                    Banner.href = item.href;

                    // временный костыль для мобильных
                    if (window.innerWidth <= 600) {
                        Banner.src = Banner.srcMobile;
                    } else {
                        Banner.src = Banner.srcBig;
                    }

                    // добавляет в нужный массив
                    this[typeBanners].push(Banner);
                });
            },

            // слайдеры

            /**
             * Swiper slider для фотографий товаров и самих товаров
             */
            initSliderProducts: function () {
                if (!this.ui.isSliderProductsInit) {
                    console.log('topOffers: swiper init');
                    // товары слайдятся только на небольших экранах
                    if (window.innerWidth <= 1140 && window.innerWidth > 600) {
                        const sliderProducts = new Swiper('.products-slider', {
                            speed: 500,
                            observer: true,
                            slidesPerView: 3,
                            slidesPerGroup: 1,
                            stretch: 5,
                            observeParents: true,
                        });
                    } else if (window.innerWidth <= 600) {
                        const sliderProducts = new Swiper('.products-slider', {
                            speed: 500,
                            observer: true,
                            slidesPerView: 2.35,
                            slidesPerGroup: 1,
                            stretch: 5,
                            observeParents: true,
                        });
                    }

                    const sliderPhoto = new Swiper('.photo-slider', {
                        speed: 500,
                        observer: true,
                        loop: true,
                        observeParents: true,
                        pagination: {
                            el: '.photo-slider-pagination',
                            type: 'bullets',
                        },
                    });

                    this.ui.isSliderProductsInit = true;
                } else {
                    console.error('topOffers: swiper already init!');
                }
            },

            /**
             * Swiper slider main
             */
            initSliderMain: function () {
                console.log('banners: swiper init');
                const newMainSlider = new Swiper('#newmain-slider', {
                    speed: 500,
                    effect: 'fade',
                    loop: true,
                    fadeEffect: {
                        crossFade: true
                    },
                    pagination: {
                        el: '.newmain-slider-pagination',
                        type: 'bullets',
                    },
                    navigation: {
                        nextEl: '.newmain-slider-next',
                        prevEl: '.newmain-slider-prev',
                    },
                    autoplay: {
                        delay: 5000,
                    },
                });
            },

    const articleSlider = new Swiper('.article-slider', {
        speed: 500,
        slidesPerView: 3,
        stretch: 5,
        observer: true,
        spaceBetween: 30,
        navigation: {
            nextEl: '.article-slider-next',
            prevEl: '.article-slider-prev',
        },
        on: {
            slideChange: function (swiper) {
                if (swiper.activeIndex == 0) {
                    $('.article-slider-prev').hide();
                } else {
                    $('.article-slider-prev').show();
                }
            },
        },
    });

    function slideToStart() {
        articleSlider.slideTo(0);
    }

    if (window.innerWidth <= 1140) {
        const articleSlider = new Swiper('.article-slider', {
            speed: 500,
            slidesPerView: 3,
            observer: true,
            spaceBetween: 60,
        });
    }

    if (window.innerWidth <= 600) {
        const articleSlider = new Swiper('.article-slider', {
            speed: 500,
            observer: true,
            slidesPerView: 2,
            spaceBetween: 30,
        });
        const advertsSlider = new Swiper('#adverts-slider', {
            speed: 500,
            loop: true,
            pagination: {
                el: '.adverts-slider-pagination',
                type: 'bullets',
            },
        });
    }
}// if newmain
