'use strict';

// Function to add event listener to multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  elements.forEach(element => element.addEventListener(eventType, callback));
};

// Function to add 'loaded' class to loading element after page load
window.addEventListener("load", function () {
  const loadingElement = document.querySelector("[data-loading]");
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});

// Function to toggle mobile menu
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

// Function to activate or deactivate 'active' class on header based on scroll
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

// Initialize text animation in hero section
const letterBoxes = document.querySelectorAll("[data-letter-effect]");
let activeLetterBoxIndex = 0;
let lastActiveLetterBoxIndex = 0;

const setLetterEffect = () => {
  letterBoxes.forEach((letterBox, index) => {
    const isCurrentBoxActive = index === activeLetterBoxIndex;
    const letters = letterBox.textContent.trim();
    letterBox.innerHTML = ""; // Limpar o conteúdo do elemento

    letters.split('').forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.animationDelay = `${0.05 * i}s`;
      span.classList.add(isCurrentBoxActive ? "in" : "out");
      if (char === " ") span.classList.add("space");
      letterBox.appendChild(span);
    });

    if (isCurrentBoxActive) letterBox.classList.add("active");
    else letterBox.classList.remove("active");
  });

  setTimeout(updateActiveLetterBoxIndex, getTotalLetterBoxDelay());
};

const updateActiveLetterBoxIndex = () => {
  lastActiveLetterBoxIndex = activeLetterBoxIndex;
  activeLetterBoxIndex = (activeLetterBoxIndex + 1) % letterBoxes.length;
  setLetterEffect();
};

const getTotalLetterBoxDelay = () => {
  const letters = letterBoxes[activeLetterBoxIndex].textContent.trim();
  return 0.05 * letters.length * 1000 + 3000;
};

window.addEventListener("load", setLetterEffect);

// Function to show or hide "Back to Top" button
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

// Function to reveal elements as they enter the screen
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
const thumbnails = document.querySelectorAll('.swiper-wrapper .swiper-slide');
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


    var swiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      pagination: {
        el: ".swiper-pagination",
      },
    });
