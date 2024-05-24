// Pedidos

// Function to add 'loaded' class to loading element after page load
window.addEventListener("load", function () {
  const loadingElement = document.querySelector("[data-loading]");
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});

let menu = document.querySelector(".menu-icon");
let navbar = document.querySelector(".navbar");

menu.onclick = () => {
  menu.classList.toggle("move");
  navbar.classList.toggle("open-menu");
};

// Header

let headerList = document.querySelector("header");

window.addEventListener("scroll", () => {
  headerList.classList.toggle("shadow", window.scrollY > 0);
});

document.getElementById("form").addEventListener("submit", function (event) {
  var prayerRequest = document.getElementById("prayer-request").value;
  if (!prayerRequest) {
    event.preventDefault();
    alert("Por favor, selecione um pedido de oração.");
  }
});
