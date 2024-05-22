// Function to add 'loaded' class to loading element after page load
window.addEventListener("load", function () {
  const loadingElement = document.querySelector("[data-loading]");
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});

const form = document.getElementById("form");
const username = document.getElementById("username");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
const prayerRequest = document.getElementById("prayer-request");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  checkForm();
});

username.addEventListener("blur", () => {
  checkInputUsername();
});

phone.addEventListener("blur", () => {
  checkInputPhone();
});

message.addEventListener("blur", () => {
  checkInputMessage();
});

prayerRequest.addEventListener("blur", () => {
  checkInputPrayerRequest();
});

username.addEventListener("input", () => {
  clearError(username);
});

phone.addEventListener("input", () => {
  clearError(phone);
  formatPhoneNumber();
});

message.addEventListener("input", () => {
  clearError(message);
});

prayerRequest.addEventListener("input", () => {
  clearError(prayerRequest);
});

function checkInputUsername() {
  const usernameValue = username.value.trim();
  const MIN_USERNAME_LENGTH = 3;
  const USERNAME_REGEX = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]*$/;

  if (!USERNAME_REGEX.test(usernameValue)) {
    errorInput(username, "O nome deve conter apenas letras e espaços.");
  } else {
    const formItem = username.parentElement;
    formItem.className = "form-content";
  }
}

function formatPhoneNumber() {
  let phoneValue = phone.value.replace(/\D/g, "");
  const PHONE_LENGTH = 11;

  if (phoneValue.length > PHONE_LENGTH) {
    phoneValue = phoneValue.slice(0, PHONE_LENGTH);
  }

  if (phoneValue.length <= 2) {
    phone.value = `(${phoneValue}`;
  } else if (phoneValue.length <= 7) {
    phone.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2)}`;
  } else {
    phone.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(
      2,
      7
    )}-${phoneValue.slice(7)}`;
  }
}

function checkInputPhone() {
  const phoneValue = phone.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
  const PHONE_REGEX = /^\d{11}$/;

  if (phoneValue !== "" && !PHONE_REGEX.test(phoneValue)) {
    errorInput(phone, "Insira um número de celular válido com DDD.");
  } else {
    const formItem = phone.parentElement;
    formItem.className = "form-content";
  }
}

function checkInputMessage() {
  const messageValue = message.value;

  if (messageValue === "") {
    errorInput(message, "A mensagem é obrigatória.");
  } else {
    const formItem = message.parentElement;
    formItem.className = "form-content";
  }
}

function checkInputPrayerRequest() {
  const prayerRequestValue = prayerRequest.value;

  if (prayerRequestValue === "") {
    errorInput(prayerRequest, "Selecione um pedido de oração.");
  } else {
    const formItem = prayerRequest.parentElement;
    formItem.className = "form-content";
  }
}

function checkForm() {
  checkInputMessage();
  checkInputPrayerRequest();
  checkInputUsername();
  checkInputPhone();

  const formItems = form.querySelectorAll(".form-content");

  const isValid = [...formItems].every((item) => {
    return item.className === "form-content";
  });

  if (isValid) {
    showFormMessage();
    setTimeout(function () {
      window.location.reload();
    }, 3000);
  }
}

function showFormMessage() {
  const formMessage = document.getElementById("popup");
  formMessage.style.display = "block";
}

function errorInput(input, message) {
  const formItem = input.parentElement;
  const textMessage = formItem.querySelector("a");

  textMessage.innerText = message;

  formItem.className = "form-content error";
}

function clearError(input) {
  const formItem = input.parentElement;
  const textMessage = formItem.querySelector("a");

  formItem.classList.remove("error");
  textMessage.innerText = "";
}

// Header
let headerList = document.querySelector("header");

window.addEventListener("scroll", () => {
  headerList.classList.toggle("shadow", window.scrollY > 0);
});

let menu = document.querySelector(".menu-icon");
let navbar = document.querySelector(".navbar");

menu.onclick = () => {
  menu.classList.toggle("move");
  navbar.classList.toggle("open-menu");
};
