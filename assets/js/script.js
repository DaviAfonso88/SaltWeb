'use strict';

// Função para adicionar evento em múltiplos elementos
const addEventOnElements = function (elements, eventType, callback) {
  elements.forEach(element => element.addEventListener(eventType, callback));
};

// Função para adicionar classe 'loaded' ao elemento de loading após o carregamento da página
window.addEventListener("load", function () {
  const loadingElement = document.querySelector("[data-loading]");
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});

// Função para exibir ou ocultar o menu mobile
const toggleNav = function () {
  const navbar = document.querySelector("[data-navbar]");
  const overlay = document.querySelector("[data-overlay]");
  const body = document.body;
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  body.classList.toggle("active");
};

const closeNav = function () {
  const navbar = document.querySelector("[data-navbar]");
  const overlay = document.querySelector("[data-overlay]");
  const body = document.body;
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  body.classList.remove("active");
};

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");
addEventOnElements(navTogglers, "click", toggleNav);
addEventOnElements(navLinks, "click", closeNav);

// Função para ativar ou desativar classe 'active' no header baseado no scroll
const header = document.querySelector("[data-header]");
const activeElementOnScroll = function () {
  const scrollThreshold = 50;
  if (window.scrollY > scrollThreshold) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
};
window.addEventListener("scroll", activeElementOnScroll);

// Iniciar animação do texto na seção hero
const letterBoxes = document.querySelectorAll("[data-letter-effect]");
// Função para animar o texto
const setLetterEffect = function () {
  const activeLetterBoxIndex = Math.floor(Math.random() * letterBoxes.length);
  const totalLetterBoxDelay = 0.05 * letterBoxes[activeLetterBoxIndex].textContent.trim().length;
  letterBoxes.forEach((letterBox, index) => {
    const isCurrentBoxActive = index === activeLetterBoxIndex;
    letterBox.innerHTML = letterBox.textContent.trim().split('').map((char, i) => `<span style="animation-delay: ${0.05 * i}s;" class="${isCurrentBoxActive ? 'in' : 'out'} ${char === ' ' ? 'space' : ''}">${char}</span>`).join('');
    if (isCurrentBoxActive) letterBox.classList.add("active");
    else letterBox.classList.remove("active");
  });
  setTimeout(setLetterEffect, (totalLetterBoxDelay * 1000) + 3000);
};
window.addEventListener("load", setLetterEffect);

// Função para exibir ou ocultar o botão "Back to Top"
const backTopBtn = document.querySelector("[data-back-top-btn]");
window.addEventListener("scroll", function () {
  const scrollThresholdPercent = 5;
  const totalScrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  backTopBtn.textContent = `${totalScrollPercent.toFixed(0)}%`;
  if (totalScrollPercent > scrollThresholdPercent) {
    backTopBtn.classList.add("show");
  } else {
    backTopBtn.classList.remove("show");
  }
});

// Função para exibir elementos conforme eles entram na tela
const revealElements = document.querySelectorAll("[data-reveal]");
const scrollReveal = function () {
  revealElements.forEach(element => {
    const elementIsInScreen = element.getBoundingClientRect().top < window.innerHeight / 1.15;
    if (elementIsInScreen) element.classList.add("revealed");
    else element.classList.remove("revealed");
  });
};
window.addEventListener("scroll", scrollReveal);
scrollReveal();

// Slider
const items = document.querySelectorAll('.slider .list .item');
const thumbnails = document.querySelectorAll('.thumbnail .item');
let itemActive = 0;
let refreshInterval;

const goToSlide = index => {
  clearInterval(refreshInterval);
  itemActive = (index + items.length) % items.length;
  updateSlider();
};

const updateSlider = () => {
  items.forEach(item => item.classList.remove('active'));
  thumbnails.forEach(thumbnail => thumbnail.classList.remove('active'));
  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');
  startAutoSlide();
};

const startAutoSlide = () => {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    goToSlide(itemActive + 1);
  }, 10000);
};

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener('click', () => {
    goToSlide(index);
  });
});

// startAutoSlide();

// function toggleVideo(){
//   event.preventDefault();
//   const trailer = document.querySelector('.trailer');
//   const video = document.querySelector('video');
//   video.pause();
//   trailer.classList.toggle('active');
// }
