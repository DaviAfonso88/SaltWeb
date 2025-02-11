"use strict";

// Function to add event listener to multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  elements.forEach((element) => element.addEventListener(eventType, callback));
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
  const body = document.body;
  navbar.classList.remove("active");
  body.classList.remove("active");
};

// Menu mobile
const menu = document.querySelector(".menu-icon");
const navbar = document.querySelector(".navbar");

if (menu && navbar) {
  menu.addEventListener("click", () => {
    menu.classList.toggle("move");
    navbar.classList.toggle("open-menu");
    const isOpen = navbar.classList.contains("open-menu");
    menu.setAttribute("aria-expanded", isOpen);
  });
}

// Header
let headerList = document.querySelector("header");

window.addEventListener("scroll", () => {
  headerList.classList.toggle("shadow", window.scrollY > 0);
});

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");
addEventOnElements(navTogglers, "click", toggleNav);
addEventOnElements(navLinks, "click", closeNav);

function handleSelectChange() {
  const selectElement = document.getElementById("prayer-request");
  const selectedValue = selectElement.value;
  if (selectedValue) {
    if (selectedValue.startsWith("#")) {
      // Anchor link handling
      document
        .querySelector(selectedValue)
        .scrollIntoView({ behavior: "smooth" });
    } else {
      // Redirect to another page
      window.location.href = selectedValue;
    }
  }
}

// Header dropdown

// Add o event listener ao select da navbar
const prayerRequestSelect = document.getElementById("prayer-request");
if (prayerRequestSelect) {
  prayerRequestSelect.addEventListener("change", handleSelectChange);
}

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

    letters.split("").forEach((char, i) => {
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
  const totalScrollPercent =
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
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
  revealElements.forEach((element) => {
    const elementIsInScreen =
      element.getBoundingClientRect().top < window.innerHeight / 1.15;
    if (elementIsInScreen) element.classList.add("revealed");
    else element.classList.remove("revealed");
  });
};
window.addEventListener("scroll", scrollReveal);
scrollReveal();

// Detects when the video exits full-screen mode or is paused
function handleExitFullScreenOrPause() {
  var videoSection = document.querySelector(".video-top");
  videoSection.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("fullscreenchange", function () {
  if (!document.fullscreenElement) {
    // If you exited full screen mode, perform the function
    handleExitFullScreenOrPause();
  }
});

document.addEventListener("pause", function () {
  // When the video is paused, execute the function
  handleExitFullScreenOrPause();
});

// Swiper
var swiper = new Swiper(".services-content", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: {
    delay: 50000,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

// Email validation
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("input_group");
  const submitButton = document.getElementById("button-submit");
  const envelopeIcon = document.getElementById("envelope-icon");
  const spinnerIcon = document.getElementById("spinner-icon");

  form.addEventListener("submit", function (event) {
    submitButton.disabled = true;
    envelopeIcon.style.display = "none";
    spinnerIcon.style.display = "inline-block";
  });
});

// Copy QRCode
function copyQRCode() {
  const pixCode =
    "00020126460014br.gov.bcb.pix0124juventudepibls@gmail.com5204000053039865802BR5924THIAGO SILVA OLIVEIRA ME6006Brasil62290525202406171502PAVXOCX9BNYDD6304B848";
  navigator.clipboard
    .writeText(pixCode)
    .then(() => {
      const button = document.querySelector(".copy-button");
      button.textContent = "Copiado!";
      setTimeout(() => {
        button.textContent = "Copiar Código Pix";
      }, 5000);
    })
    .catch((err) => {
      alert("Falha ao copiar o código Pix.");
    });
}

// Função para abrir o modal
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

// Função para fechar o modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Função para redirecionar ao WhatsApp
function redirectToWhatsApp() {
  // Substitua o número abaixo com o número real para redirecionamento
  window.location.href = "https://wa.me/1234567890"; // Exemplo de link para WhatsApp
}
