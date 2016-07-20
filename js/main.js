"use strict";

var btn = document.querySelector(".news-btn");
var newsContainer = document.querySelector(".news");
var templateElement = document.querySelector("template");
var elementToClone;

if ("content" in templateElement) {
	elementToClone = templateElement.content.querySelector(".news-item");
} else {
	elementToClone = templateElement.querySelector('.news-item');
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

	xhr.onerror = function () {
		console.warn("Что-то пошло не так!");
	};

	xhr.timeout = LOAD_TIMEOUT;

	xhr.ontimeout = function () {
		console.warn("Нет ответа от сервера!");
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
	var element = elementToClone.cloneNode(true);
	var imageFromData = element.querySelector('img');
	element.querySelector(".news-item__date").textContent = data.date;
	element.querySelector(".news-item__title").textContent = data.title;
	element.querySelector(".news-item__preview").textContent = data.preview;
	element.querySelector(".news-item__url").href = data.url;
	container.appendChild(element);
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
	return element;
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

//Добавляет обработчик события кнопке входа
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

/**
 * Дисейблит кнопку
 */
submit.setAttribute('disabled', true);

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

form.validate(
		{
			rules : {
				username : {required : true, minlength: 2},
				password : "required"
			},
			messages : {
				username : {
					required : "Введите ваше имя",
					minlength : "Введите не менее, чем 2 символа."
				},
				password : "Введите пароль"
			}
		}
);


