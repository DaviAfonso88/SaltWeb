"use strict";

// Function to handle select change
function handleSelectChange(selectElement) {
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

//Validation Form
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  const submitButton = document.getElementById("submit-button");
  const spinnerIcon = document.getElementById("spinner");

  form.addEventListener("submit", function (event) {
    var message = document.getElementById("message").value;
    if (message.length > 600) {
      event.preventDefault();
      alert("Por favor, limite sua mensagem a 600 caracteres.");
    }
    submitButton.disabled = true;
    submitButton.textContent = "Enviando ";
    spinnerIcon.style.display = "inline-block";
    submitButton.appendChild(spinnerIcon);
  });
});
