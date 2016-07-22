"use strict";

(function () {

//Подгрузка новостей

	var btn = document.querySelector(".news-btn");
	var newsContainer = document.querySelector(".news");
	var templateElement = document.querySelector("template");
	var newsBoxElement;

	if ("content" in templateElement) {
		newsBoxElement = templateElement.content.querySelector(".news-item");
	} else {
		newsBoxElement = templateElement.querySelector(".news-item");
	}

	/** @constant {number} */
	var LOAD_TIMEOUT = 10000;

	/* @constant {String} */
	var NEWS_DATA_URL = "news.json";

	/** @type {Array.<Object>} */
	var news = [];

	/** @param {function(Array.<Object>)} callback */
	var getNews = function (callback) {
		var xhr = new XMLHttpRequest();

		/**@param {Progress Event} evt */
		xhr.onload = function (evt) {
			var loadedData = JSON.parse(evt.target.response);
			callback(loadedData);
		};

		xhr.timeout = LOAD_TIMEOUT;

		xhr.onerror = xhr.ontimeout = function () {
			newsContainer.classList.add(".news--failure");
		};

		xhr.open("GET", NEWS_DATA_URL);
		xhr.send();
	};

	/**
	 * @param {Object} data
	 * @param {HTMLElement} container
	 * @return {HTMLElement}
	 */
	var getNewsElement = function (data, container) {
		var newsBox = newsBoxElement.cloneNode(true);
		var imageFromData = newsBox.querySelector('img');
		newsBox.querySelector(".news-item__date").textContent = data.date;
		newsBox.querySelector(".news-item__title").textContent = data.title;
		newsBox.querySelector(".news-item__preview").textContent = data.preview;
		newsBox.querySelector(".news-item__url").href = data.url;
		container.appendChild(newsBox);
		/**
		 * @type {Image}
		 */
		var image = new Image();
		var imageLoadTimeout;
		image.onload = function() {
			clearTimeout(imageLoadTimeout);
			imageFromData.src = image.src;
			imageFromData.width = '205';
			imageFromData.height = '146';
		};
		image.onerror = function() {
			imageFromData.classList.add('news-item__image--no-photo');
		};
		image.src = data.image;
		if (!image.src) {
			imageFromData.classList.add('news-item__image--no-photo');
		}
		imageLoadTimeout = setTimeout(function() {
			imageFromData.src = "";
			imageFromData.classList.add('news-item__image--no-photo');
		}, LOAD_TIMEOUT);
		return newsBox;
	};

	/** @param {Array.<Object>} news */
	var renderNews = function (news) {
		news.forEach(function (newsItem) {
			getNewsElement(newsItem, newsContainer);
		});
	};

	var onBtnClick =function (evt) {
		evt.preventDefault();
		getNews(function (loadedNews) {
			news = loadedNews;
			renderNews(news);
		});
	};

	btn.addEventListener("click", onBtnClick);


//Мобильное меню
	var navMain = document.querySelector('.main-nav');
	var navToggle = document.querySelector('.main-nav__toggle');

	navToggle.addEventListener('click', function() {
		if (navMain.classList.contains('main-nav--closed')) {
			navMain.classList.remove('main-nav--closed');
			navMain.classList.add('main-nav--opened');
		} else {
			navMain.classList.add('main-nav--closed');
			navMain.classList.remove('main-nav--opened');
		}
	});


//Форма обратной связи

	var feedback = document.querySelector(".feedback__btn");

	var overlay = document.querySelector(".modal-overlay");
	var popup = document.querySelector(".modal-content");
	var form = popup.querySelector(".form");
	var close = popup.querySelector(".modal-content__close");

	//Функция, показывающая попап
	function showPopup() {
		overlay.classList.add("modal-overlay--show");
		popup.classList.add("modal-content--show");
	}

	//Функция, скрывающая попап
	function hidePopup() {
		popup.classList.remove("modal-content--show");
		overlay.classList.remove("modal-overlay--show");
	}

	//Добавляет обработчик события кнопке обратной связи
	feedback.addEventListener("click", function(event) {
		event.preventDefault();
		showPopup();
	});

	//Добавляет обработчик события закрывающей кнопке
	close.addEventListener("click", function(event) {
		event.preventDefault();
		hidePopup();
	});

	//Обработчик события: закрытие попапа по нажатию клавиши esc
	window.addEventListener("keydown", function(event) {
		if (event.keyCode === 27) {
			if (popup.classList.contains("modal-content--show")) {
				hidePopup();
			}
		}
	});

	var submit = form.querySelector(".form__btn");
	var text = form.querySelector(".form__text");
	var tel = form.querySelector(".form__tel");
	var email = form.querySelector(".form__email");
	var textarea = form.querySelector(".form__textarea");

	 // Дисейблит кнопку
	submit.setAttribute('disabled', true);

	//Валидация полей формы
	var validateFields = function () {
		if (text.value && textarea.value && (tel.value || email.value)) {
			submit.removeAttribute('disabled');
		} else {
			submit.setAttribute('disabled', true);
		}
	};

	text.oninput = textarea.oninput = tel.oninput = email.oninput = function () {
		validateFields();
	};

	//Ответ от сервера

	/* @constant {String} */
	var SUCCESS_DATA_URL = "success.json";

	/* @constant {String} */
	var ERROR_1_DATA_URL = "error-1.json";

	/* @constant {String} */
	var ERROR_2_DATA_URL = "error-2.json";

	var answer;

	var answerContainer = document.querySelector(".modal-content");
	var templateElem = document.querySelector("#server-answer");
	var messageBoxElement;
	var messageBox;

	if ("content" in templateElement) {
		messageBoxElement = templateElem.content.querySelector(".answer");
	} else {
		messageBoxElement = templateElem.querySelector(".answer");
	}

	form.onsubmit = function (evt) {
		evt.preventDefault();
		var formData = new FormData(document.forms.form);
		var xhr = new XMLHttpRequest();
		//Необходимо подставить url отправки формы, указан тестовый
		xhr.open("POST", "https://echo.htmlacademy.ru/");

		xhr.send(formData);
		getAnswer(function (loadedAnswer) {
			answer = loadedAnswer;
			renderAnswer(answer);
			var closeAnswer = document.querySelector("#answer-close");
			//Добавляет обработчик события закрывающей кнопке
			closeAnswer.addEventListener("click", function(event) {
				event.preventDefault();
				hideAnswer();
			});
		});
	};

	function hideAnswer () {
			messageBox.classList.add("answer--hide");
	}

	/**
	 * @param {Object} data
	 * @param {HTMLElement} container
	 * @return {HTMLElement}
	 */
	var getAnswerElement = function (data, container) {
		messageBox = messageBoxElement.cloneNode(true);
		if (data.msg) {
			messageBox.querySelector(".answer__msg").textContent = data.msg;
		} else {
			messageBox.querySelector(".answer__msg").textContent = data;
		}
		container.appendChild(messageBox);
		return messageBox;
	};

	/** @param {function(Object)} callback */
	var getAnswer = function (callback) {
		var xhr = new XMLHttpRequest();

		/**@param {Progress Event} evt */
		xhr.onload = function (evt) {
			var preLoadedAnswer = JSON.parse(evt.target.response);

			if (preLoadedAnswer.success === true) {
				loadedAnswer = preLoadedAnswer;
				popup.classList.add("modal-content--sent");
				form.classList.add("form--sent");
			} else if (preLoadedAnswer.success === false) {
				if (preLoadedAnswer.fields) {
					var loadedAnswer = preLoadedAnswer.fields[0].error;
					email.classList.add("form__input--error");
				} else {
					loadedAnswer = preLoadedAnswer;
				}
			}

			callback(loadedAnswer);
		};

		xhr.timeout = LOAD_TIMEOUT;

		xhr.onerror = xhr.ontimeout = function () {
			answerContainer.classList.add(".modal-content--failure");
		};

		//Подставляем один url из трех возможных для демонстрации работы: SUCCESS_DATA_URL, ERROR_1_DATA_URL, ERROR_2_DATA_URL,
		xhr.open("GET", SUCCESS_DATA_URL);
		xhr.send();
	};

	/** @param {Object} answer */
	var renderAnswer = function (answer) {
		getAnswerElement(answer, answerContainer);
	};
})();
