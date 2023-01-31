import {Swiper, Navigation, Pagination, Scrollbar, Controller} from 'swiper';

Swiper.use([Navigation, Pagination, Scrollbar, Controller]);

if (document.getElementById("newcatalog2022_flypage")) {
    // Vue
    window.$vmcart = new Vue({
        el: '#newcatalog2022_flypage',
        data: {
            // счетчик для открытия карты во вкладке наличие
            flypageMapCounter: 0,
            //модальное окно огромного слайдера
            isShowLargeSwiper: false,
            // индексы вкладок отзывы и наличие
            availableTabIndex: 0,
            reviewTabIndex: 0,
            // информация о товаре
            product: {
                // код ксс товара
                code: null,
                // наименование
                name: null,
                // цена
                price: 0,
                // старая цена
                oldPrice: 0,
                // скидка
                discount: 0,
                // количество товара
                count: 0,
                // признак, что товар в корзине
                isInCart: false,
                // url товара
                url: null,
                // можно ли купить
                isCanBuy: true,
                isCanBuyButNoItemsLeft: false,
                // пользовательский интерфейс
                ui: {
                    // признак, что процесс добавления/изменения корзины уже идёт
                    isProcessing: false,
                    // показывать ли блок "добавление в корзину"
                    isShowAddBasket: true,
                    // показывать ли блок "изменение количества"
                    isShowChangeBasket: false,
                    // текст для "Заказать в один клик"
                    orderOneClickText: 'Заказать в 1 клик'
                },
            },

            // форма "уведомить о снижении цены"
            formPriceDown: {
                error: null,
                email: null,
                isShowResult: false,
                isProcessing: false,
            },

            formCalculator: {
                count: 0,
            },

            mneniyaPro: {
                reviews: [],
                stats: {
                    ReviewsTotalCount: 0,
                },
                scoreTotal: 0,
                ui: {
                    isShowList: false,
                    isShowLineReviews: false,
                }
            },

            user: {
                email: null,
            },

            // доступность товара в магазинах
            availableStoreCount: 0,

            // блоки табов
            isOpenDescription: false,
            isOpenCharacter: false,
            isOpenCalc: false,
            isOpenAvailable: false,
            isOpenReview: false,
            isOpenSert: false,
            isDescrArrowDown: true,
            isCharArrowDown: true,
            isCalcArrowDown: true,
            isAvalArrowDown: true,
            isRevArrowDown: true,
            isSertArrowDown: true,
            ui :{
                isShowAvailableSelector: true,
            }
        },
        created: function () {
            // запрашивает в API информацию для формирования объекта
            console.log('loading...');
            this.loadProductFlypageData();
            console.log('loaded...');
        },
        methods: {
            //переходим на отзывы по клику по отзывам
            slideToReview: function () {
                let target,
                    index = this.calcReviewTabIndex;
                tabContent.slideTo(index);
                tabButtons.slideTo(index);

                if($(window).width() <= 1000) {
                    target = $(".js-review").last();
                } else {
                    target = $(".js-review").first();
                }
                $('html, body').animate({scrollTop: target.offset().top}, 'slow');
            },
            /**
             * Код для вкладки "Наличие" открытие/закрытие таблицы или карты
             */
            // переход на карту во вкладке наличие
            changeToMap: function (name) {
                $('.flypage__product-essence-available-adress-container').hide();
                if(name == 'desktop') {
                    $('.flypage__product-essence-available-display-map').addClass('flypage__product-essence-available_checked');
                    $('.flypage__product-essence-available-display-list').removeClass('flypage__product-essence-available_checked');
                    $('.flypage__product-essence-available-map').show();
                    if(this.flypageMapCounter == 0) {
                        initMapAvail('ymapDesktop'); // инициализация карты только при первом переключении воизбежании дублей карты
                    }
                } else if (name == 'mobile') {
                    $('.flypage__product-essence-mobile .flypage__product-essence-available-display-map').addClass('flypage__product-essence-available_checked');
                    $('.flypage__product-essence-mobile .flypage__product-essence-available-display-list').removeClass('flypage__product-essence-available_checked');
                    $('.flypage__product-essence-mobile .flypage__product-essence-available-map').show();
                    if(this.flypageMapCounter == 0) {
                        initMapAvail('ymapMobile'); // инициализация карты только при первом переключении воизбежании дублей карты
                    }
                }
                this.flypageMapCounter++;
                tabContent.updateAutoHeight();
            },
            //переходим на наличие по клику по кол-ву магазинов
            goToAvailable: function () {
                let target,
                    index = this.calcAvailableTabIndex;
                if($(window).width() <= 1000) {
                    target = $(".js-available-mobile-move");
                    if(!this.isOpenAvailable) {
                        this.isOpenAvailable = true;
                    }
                } else {
                    tabContent.slideTo(index);
                    tabButtons.slideTo(index);
                    target = $(".js-available-desktop-move");
                }
                $('html, body').animate({scrollTop: target.offset().top}, 'slow');
            },
            /**
             * Открытие формы "Уведомить о снижении цены"
             */
            openReportPricedown: function () {
                //$('html, body').animate({scrollTop: 0}, 'slow');
                $('#flypage__pricedown').css('display', 'flex');
                $('.flypage__product-review-form-overlay').show();
            },
            /**
             * Закрытие формы "Уведомить о снижении цены" по клику на крестик
             */
            closeReportPricedown: function () {
                $('#flypage__pricedown').hide();
                $('.flypage__product-review-form-overlay').hide();
            },
            /**
             * Открытие формы "Уведомить о поступлении"
             */
            openReportIncoming: function () {
                //$('html, body').animate({scrollTop: 0}, 'slow');
                $('#flypage__incoming').css('display', 'flex');
                $('.flypage__product-review-form-overlay').show();
            },
            /**
             * Закрытие формы "Уведомить о поступлении" по клику на крестик
             */
            closeReportIncoming: function () {
                $('#flypage__incoming').hide();
                $('.flypage__product-review-form-overlay').hide();
            },
            // функция открытия/закрытия модального окна со свайпером
            showLargeSwiper:  function (status) {
                if(status == 'open') {
                    this.isShowLargeSwiper = true;
                    // двигаем модальные слайдеры для синхронизации
                    if(typeof flSwiperLarge != 'undefined') {
                        flSwiperLarge.update();
                    }
                } else if(status == 'close') {
                    this.isShowLargeSwiper = false;
                }
            },
            /**
             * Обработчик изменения табов
             * @param name
             */
            changeBlock: function (name) {
                switch (name) {
                    case 'description':
                        if (this.isOpenDescription) {
                            this.isOpenDescription = false;
                            this.isDescrArrowDown = true;
                        } else {
                            this.isOpenDescription = true;
                            this.isDescrArrowDown = false;
                        }
                        break;
                    case 'character':
                        if (this.isOpenCharacter) {
                            this.isOpenCharacter = false;
                            this.isCharArrowDown = true;
                        } else {
                            this.isOpenCharacter = true;
                            this.isCharArrowDown = false;
                        }
                        break;
                    case 'calc':
                        if (this.isOpenCalc) {
                            this.isOpenCalc = false;
                            this.isCalcArrowDown = true;
                        } else {
                            this.isOpenCalc = true;
                            this.isCalcArrowDown = false;
                        }
                        break;
                    case 'available':
                        if (this.isOpenAvailable) {
                            this.isOpenAvailable = false;
                            this.isAvalArrowDown = true;
                        } else {
                            this.isOpenAvailable = true;
                            this.isAvalArrowDown = false;
                        }
                        break;
                    case 'review':
                        if (this.isOpenReview) {
                            this.isOpenReview = false;
                            this.isRevArrowDown = true;
                        } else {
                            this.isOpenReview = true;
                            this.isRevArrowDown = false;
                            this.showReviews();
                        }
                        break;
                    case 'sert':
                        if (this.isOpenSert) {
                            this.isOpenSert = false;
                            this.isSertArrowDown = true;
                        } else {
                            this.isOpenSert = true;
                            this.isSertArrowDown = false;
                        }
                        break;
                }
            },

            /**
             * Функция склонения в зависимости от количества (копи-паста из корзины)
             *
             * @param number количество
             * @param words массив склонений, например ["бонус", "бонуса", "бонусов"]
             * @param onlyEnding возвращать только окончание (без цифры)
             *
             * @returns {string} строку типа "1 бонус"
             */
            declOfNum: function (number, words, onlyEnding = false) {
                let prefix = onlyEnding ? '' : number + ' ';
                return prefix + words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
            },

            /**
             * Форматирует цену. Меняет копейки на span, а пустые копейки отсекает.
             *
             * @param $price
             * @return array|string|string[]
             */
            mdPriceFormat2020: function (price) {
                // разделяет по разрядам
                let formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                // заворачивает копейки в sup
                let splitted = formattedPrice.split('.');
                if (splitted.length == 2) {
                    let firstPart = splitted[0];
                    let kopeyki = splitted[1];
                    formattedPrice = firstPart;
                    formattedPrice += '<sup>' + kopeyki + '</sup>';
                }

                return formattedPrice;
            },

            /**
             * Обработчик клика на кнопке "добавить в корзну"
             * Добавляет товар в корзину (одну единицу - по умолчанию, или сколько укажет пользователь на втором шаге)
             * Практически копи-паста с главной страницы
             */
            addBasket: function () {
                console.log('Корзина: добавление в корзину');
                // проверяет, что товар ещё не добавляется, чтобы препятствовать повторному клику по кнопке.
                if (this.product.ui.isProcessing !== true) {
                    if (this.product.count === 0) {
                        this.product.count = 1;
                    }
                    // показывает блок указания кол-ва товаров
                    // показывает сразу, до реального добавления, чтобы пользователь сразу мог добавить несколько товаров (ну такой он быстрый)
                    // если это убрать, то нужно убирать и вызов добавления по тайм-ауту ниже.
                    // this.showChoiceBlock();
                    //


                } else {
                    console.error('Корзина: повторное нажатие на "добавить в корзину", пока запрос не обработан');
                }
            },

            /**
             * Обработчик клика на кнопке "Заказать в 1 клик"
             * Добавляет товар в корзину одну единицу
             * Практически копи-паста функции выше
             */
            orderInOneClick: function () {
                // проверяет, что товар ещё не добавляется, чтобы препятствовать повторному клику по кнопке.
                if (this.product.ui.isProcessing !== true) {
                    if (this.product.count === 0) {
                        this.product.count = 1;
                    }
                } else {
                    console.error('Корзина: повторное нажатие на "Заказать в 1 клик", пока запрос не обработан');
                }
            },

            /**
             * Открывает форму "Оставить отзыв"
             */
            showReviewForm: function () {
                document.querySelector('.flypage__product-review-form').style.display = 'block'
                document.querySelector('.flypage__product-review-form-overlay').style.display = 'block'
                if($(window).width() > 1000) {
                    $('html, body').animate({scrollTop: 0}, 'slow')
                }
            },

            /**
             * Загружает данные об акциях
             */
            loadDiscountData: function () {
            },

            /**
             * Общая функция для показа скидок
             * @param data
             */
            renderDiscount(data) {
                if (data.STATUS === "Y") {
                    let discount = Number(data.DISCOUNT);
                    console.log('Акция: найдена скидка ' + discount + "%");

                    // Пересчитывает цену на основе скидки

                    // рассчитывает коэффициенты скидки
                    let current_price = this.product.price;
                    let discount_value = Math.floor(this.product.price * discount / 100);
                    let new_price = Math.floor(current_price - discount_value);

                    // устанавливает новую цену
                    this.product.price = new_price;

                    if (this.product.oldPrice == 0) {
                        // если у товара не было старой цены
                        this.product.oldPrice = current_price;
                    }
                    if (this.product.discount > 0) {
                        // если у товара уже была скидка, пересчитать её фактический размер
                        let new_discount = 100 - (this.product.price * 100 / Math.floor(this.product.oldPrice));
                        console.log('Акция: новая скидка ' + new_discount + ', округляем...');
                        this.product.discount = Math.floor(new_discount);
                    } else {
                        // иначе установить ту, что пришла из базы
                        this.product.discount = discount;
                    }
                }
            },

            /**
             * Закрытие модальных форм "Уведомить о снижении цены" и "Оставить отзыв" и "Уведомить о поступлении" по клику на оверлей
             */
            closeModalForms: function () {
                $('.flypage__product-review-form').hide();
                $('#flypage__pricedown').hide();
                $('#flypage__incoming').hide();
                $('.flypage__product-review-form-overlay').hide();
                this.$refs.mneniaform.resetForm();
            },

            /**
             * Показывает блок изменения кол-ва товаров в корзине
             * Данная функция нужна на первом шаге, когда товар ещё не в корзине, чтобы можно добавить две штуки.
             */
            showChoiceBlock: function () {
                // скрывает кнопку "добавить в корзину"
                this.product.ui.isShowAddBasket = false;
                // показывает обычный "выбиратор"
                this.product.ui.isShowChangeBasket = true;
            },

            /**
             * Показывает блок товара в зависимости от его состояния (в корзине, не в корзине)
             */
            showCartBlock: function () {
                if (this.product.isInCart === false) {
                    // товар не в корзине
                    console.log('Отрисовка товара: не в корзине')

                    // показывает блок "добавить в корзину"
                    this.product.ui.isShowAddBasket = true;

                    // на компьютерах
                    console.log('Отрисовка товара: десктоп');

                    // скрывает обычный "выбиратор"
                    this.product.ui.isShowChangeBasket = false;

                } else {
                    // товар в корзине
                    console.log('Отрисовка товара: в корзине');

                    //  скрывает блок "добавить в корзину"
                    this.product.ui.isShowAddBasket = false;

                    // на компьютерах
                    console.log('Отрисовка товара: десктоп');

                    // показывает обычный "выбиратор"
                    this.product.ui.isShowChangeBasket = true;
                }
            },

            /**
             * Увеличивает или уменьшает кол-во товара в корзине
             * @param operation
             */
            changeCount: function (operation = null) {
                // проверяет, что еще не запущена обработка (чтобы не допускать кликов в процессе запроса)
                if (this.product.ui.isProcessing) {
                    console.error('Корзина: попытка кликнуть на изменение кол-ва в процессе запроса');
                    return false;
                }

                if (this.product.isInCart) {
                    // элемент в корзине. действует по логике "изменение существующего количества"
                    console.log('Корзина: изменение количества ранее добавленного товара');
                    // TODO: реализовать это в апи бекенда

                    let useTimeout = true;

                    if (this.product.count === '') {
                        // обрабатывает ситуацию, когда почему-то у элемента нет количества
                        this.product.count = 1;
                    }

                    switch (operation) {
                        case 'plus':
                            this.product.count++
                            break;
                        case 'minus':
                            if (this.product.count > 0) {
                                this.product.count--;
                            }
                            if (this.product.count === 0) {
                                this.product.isInCart = false;
                                this.showCartBlock();
                                useTimeout = false;
                                // удалить без таймаута
                            }
                            break;
                        default:
                            break;
                    }

                } else {
                    // элемент не в корзине, увеличивает-уменьшает кол-во, добавляет по тайм-ауту
                    console.log('Корзина: изменение кол-ва перед добавлением.');

                    // приостанавливает имеющееся добавление
                    let useTimeout = true;

                    switch (operation) {
                        case 'plus':
                            this.product.count++
                            break;
                        case 'minus':
                            if (this.product.count > 0) {
                                this.product.count--;
                            }
                            if (this.product.count === 0) {
                                console.log('Корзина: отмена добавления товара в корзину.');
                                // отменяет добавление товара в корзину
                                this.showCartBlock();
                                useTimeout = false;
                            }
                            break;
                        default:
                            break;
                    }

                }
            },

            /**
             * Валидирует электропочту (вспомогательная функция для формы "узнать о снижении цены")
             * @param email
             * @returns {boolean}
             */
            validateEmail: function (email) {
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },

            /**
             * Инициализирует наполнение данными объекта Vue страницы товара
             */
            loadProductFlypageData: function () {
                // устанавливает доступность из глобальной переменной
                this.availableStoreCount = vueAvailableStoreCount;
                // устанавливает код ксс из глобальной переменной
                this.product.code = vueKcc;
                // устанавливает остальные параметры из глобальных переменных
                this.product.name = vueName;
                this.product.url = vueUrl;
                this.user.email = vueEmail;
                this.formPriceDown.email = this.user.email;
                this.product.price = vueProductPrice;
                this.product.oldPrice = vueProductPriceOld;
                this.product.discount = vueProductDiscount;
                this.product.isCanBuy = vueProductIsCanBuy;
                this.product.isCanBuyButNoItemsLeft = vueProductIsCanBuyButNoItemsLeft;

                if (!this.product.isCanBuy || this.product.isCanBuyButNoItemsLeft) {
                    this.ui.isShowAvailableSelector = false;
                }

                if (window.REPRESENTATION_ID == 8) {
                    this.ui.isShowAvailableSelector = false;
                }
                // инициализирует загрузку данных акций
                this.loadDiscountData();
            },

            /**
             * Данный метод в корзине вызывался после добавления товара из блока rr после нажатия на иконку "корзина"
             * Раньше он просто обновлял корзину.
             * Теперь о его предназначение может быть другое
             * @param param
             */
            loadData: function (param) {
                this.updateLittleCard();
            },

            /**
             * Обновляет маленькую корзину (для rr)
             */
            updateLittleCard: function () {
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

            // end of костыли для rr
        },
        mounted() {
            /* подключаем эффект наведения на слайдер главный */
            initMainSlideMoving();
        },
        computed: {
            // считаем какой по счету блок наличия
            calcAvailableTabIndex: function () {
                let index = $('.flypage__product-tabs .js-available-index').index();
                return this.availableTabIndex + index;
            },
            // считаем какой по счету блок отзывов
            calcReviewTabIndex: function () {
                let index = $('.flypage__product-tabs .js-review-index').index();
                return this.reviewTabIndex + index;
            },
        }
    });

    /* подключаем свайперы */

    /**
     * Код переключения вкладок
     */
    let tabs = document.querySelector('.flypage__product-tabs .swiper-wrapper');
    var tabContent = new Swiper('.flypage__product-essence', {
        speed: 0,
        autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 20,
        allowTouchMove: false,
        observer: true,
        on: {
            slideChange: function (swiper) {
                tabs.children[swiper.previousIndex].classList.remove('flypage__product-tabs-active');
                tabs.children[swiper.activeIndex].classList.add('flypage__product-tabs-active');
                tabButtons.slideTo(swiper.activeIndex);
            }
        }
    });
    const tabButtons = new Swiper('.flypage__product-tabs', {
        slidesPerView: 'auto',
        freeMode: true,
        allowTouchMove: false,
        scrollbar: '.swiper-scrollbar',
        mousewheelControl: true,
        on: {
            tap: function (swiper, event) {
                if (event.target.classList.contains('swiper-slide') && !event.target.classList.contains('flypage__product-tabs-active')) {
                    event.target.parentElement.querySelector('.flypage__product-tabs-active').classList.remove('flypage__product-tabs-active');
                    event.target.classList.add('flypage__product-tabs-active');
                    tabContent.slideTo(swiper.clickedIndex);
                }
            },
            slideChange: function (swiper) {
                tabs.children[swiper.previousIndex].classList.remove('flypage__product-tabs-active');
                tabs.children[swiper.activeIndex].classList.add('flypage__product-tabs-active');
                tabButtons.slideTo(swiper.activeIndex);
                tabContent.slideTo(swiper.activeIndex);
            }
        }
    });

    //подключаем базовый свайпер
    const flSwiperBaseVertPics = document.querySelector('#flypage_slider_large_vertical_base .swiper-wrapper');
    let flSwiperBase, flSwiperBaseVert;
    if (document.getElementById("flypage_swiper_base")) {
        let vertLength = $('#flypage_slider_large_vertical_base .swiper-slide').length,
            isLoop = false;
        if(vertLength >= 5) {
            isLoop = true;
        }
        flSwiperBaseVert = new Swiper('#flypage_slider_large_vertical_base', {
            direction: 'vertical',
            slidesPerView: 'auto',
            loop: isLoop,
            loopedSlides: vertLength,
            slideToClickedSlide: true,
            slideActiveClass: 'vertical_base-active',
            navigation: {
                prevEl: '#flypage-slider-vertical-up',
                nextEl: '#flypage-slider-vertical-down',
            },
            on: {
                tap: function (swiper, event) {
                    if (event.target.parentElement.classList.contains("swiper-slide") &&
                        !event.target.parentElement.classList.contains("vertical_base-active")) {
                        // если двигаемся без лууп в обоих слайдерах, то нужно самим навесить класс на верт слайдер
                        if(!isLoop) {
                            $('#flypage_slider_large_vertical_base .swiper-slide').removeClass("vertical_base-active");
                            event.target.parentElement.classList.add("vertical_base-active");
                            if(typeof flSwiperBase != 'undefined') {
                                flSwiperBase.slideToLoop(swiper.clickedIndex);
                            }
                            // сразу двигаем верт слайдер в модальном окне
                            $('#flypage_slider_large_vertical .swiper-slide').removeClass("vertical_large-active");
                            if(typeof flSwiperLargeVertPics != 'undefined') {
                                flSwiperLargeVertPics.children[swiper.clickedIndex].classList.add('vertical_large-active');
                            }
                        }
                    }
                },
            },
        });
        flSwiperBase = new Swiper('#flypage_slider_base-main', {
            effect: 'fade',
            loop: true,
            loopedSlides: vertLength,
            speed: 500,
            slidesPerView: 1,
            pagination: {
                el: '.flypage_swiper_base-pagination',
                type: 'bullets',
            },
            on: {
                // на движение большого слайдера двигаем вертикальный с ним связанный
                slideChange: function (swiper) {
                    // если двигаемся без лууп в обоих слайдерах, то нужно самим навесить класс на верт слайдер
                    if(!isLoop) {
                        $('#flypage_slider_large_vertical_base .swiper-slide').removeClass("vertical_base-active");
                        flSwiperBaseVertPics.children[swiper.realIndex].classList.add('vertical_base-active');
                    }
                }
            }
        });

        flSwiperBase.controller.control = flSwiperBaseVert;
        flSwiperBaseVert.controller.control = flSwiperBase;
    }

    //подключаем огромный свайпер модального окна
    const flSwiperLargeVertPics = document.querySelector("#flypage_slider_large_vertical .swiper-wrapper");
    let flSwiperLarge, flSwiperLargeVert;
    if (document.getElementById("flypage_swiper_large")) {
        let orient, perview, vertLength = $('#flypage_slider_large_vertical .swiper-slide').length,
            isLoop = false;
        if($(window).width() <= 1000) {
            orient = 'horizontal';
            if(vertLength >= 4) {
                isLoop = true;
            }
        } else {
            orient = 'vertical';
            if(vertLength >= 5) {
                isLoop = true;
            }
        }

        flSwiperLargeVert = new Swiper('#flypage_slider_large_vertical', {
            direction: orient,
            slidesPerView: 'auto',
            //observer: true,
            loop: isLoop,
            //observeParents: true,
            loopedSlides: vertLength,
            slideToClickedSlide: true,
            slideActiveClass: 'vertical_large-active',
            navigation: {
                prevEl: '#flypage-slider-vertical-modal-up',
                nextEl: '#flypage-slider-vertical-modal-down',
            },
            on: {
                tap: function (swiper, event) {
                    if (event.target.parentElement.classList.contains("swiper-slide") &&
                        !event.target.parentElement.classList.contains("vertical_large-active")) {
                        // если двигаемся без лууп в обоих слайдерах, то нужно самим навесить класс на верт слайдер
                        if(!isLoop) {
                            $('#flypage_slider_large_vertical .swiper-slide').removeClass("vertical_large-active");
                            event.target.parentElement.classList.add("vertical_large-active");
                            if(flSwiperLarge != 'undefined') {
                                flSwiperLarge.slideToLoop(swiper.clickedIndex);
                            }
                        }
                    }
                },
            },
        });

        flSwiperLarge = new Swiper('#flypage_slider_large-main', {
            effect: 'fade',
            speed: 500,
            slidesPerView: 1,
            loop: true,
            loopedSlides: vertLength,
            observer: true,
           // observeParents: true,
            navigation: {
                nextEl: '.flypage_large-slider-button-next',
                prevEl: '.flypage_large-slider-button-prev'
            },
            on: {
                slideChange: function (swiper) {
                    // если двигаемся без лууп в обоих слайдерах, то нужно самим навесить класс на верт слайдер
                    if(!isLoop) {
                        $('#flypage_slider_large_vertical .swiper-slide').removeClass("vertical_large-active");
                        if(typeof flSwiperLargeVertPics != 'undefined') {
                            flSwiperLargeVertPics.children[swiper.realIndex].classList.add('vertical_large-active');
                        }
                    }
                },
                update: function (swiper) {
                    swiper.slideToLoop(flSwiperBase.realIndex);
                }
            },
        });

        flSwiperLargeVert.controller.control = flSwiperLarge;
        flSwiperLarge.controller.control = flSwiperLargeVert;

    }

    /* подключаем свайперы */


    // код увеличения и передвижения по картинке главного слайдера при наведении
    function initMainSlideMoving() {
            $('#flypage_slider_base-main .js-move-large-slider-active').mousemove(function (e) {
                let blockWidth = $('.flypage__product-body-base-img-move').width(),
                    blockHeight = $('.flypage__product-body-base-img-move').height(),
                    amountMovedX = (e.offsetX * 100) / blockWidth,
                    amountMovedY = (e.offsetY * 100) / blockHeight;

                $(this).css('opacity', '1');
                $('.js-move-large-slider').css('opacity', '0');
                $(this).css('background-position', amountMovedX + '% ' + amountMovedY + '%');
            });

            $('#flypage_slider_base-main .js-move-large-slider-active').mouseout(function (e) {
                $(this).css('opacity', '0');
                $('.js-move-large-slider').css('opacity', '1');
            });
    }

}
