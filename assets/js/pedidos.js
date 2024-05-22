// Pedidos

// Function to add 'loaded' class to loading element after page load
window.addEventListener("load", function () {
  const loadingElement = document.querySelector("[data-loading]");
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});

const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const message = document.getElementById("message");
const prayerRequest = document.getElementById("prayer-request");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  checkForm();
});

email.addEventListener("blur", () => {
  checkInputEmail();
});

username.addEventListener("blur", () => {
  checkInputUsername();
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

email.addEventListener("input", () => {
  clearError(email);
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

  if (usernameValue === "" || usernameValue.length < MIN_USERNAME_LENGTH) {
    errorInput(
      username,
      `O nome de deve ter pelo menos ${MIN_USERNAME_LENGTH} caracteres.`
    );
  } else if (!USERNAME_REGEX.test(usernameValue)) {
    errorInput(
      username,
      "O nome de usuário deve conter apenas letras e espaços."
    );
  } else {
    const formItem = username.parentElement;
    formItem.className = "form-content";
  }
}

function checkInputEmail() {
  const emailValue = email.value.trim();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailValue === "") {
    errorInput(email, "O email é obrigatório.");
  } else if (!EMAIL_REGEX.test(emailValue)) {
    errorInput(email, "Insira um email válido.");
  } else {
    const formItem = email.parentElement;
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
  checkInputUsername();
  checkInputEmail();
  checkInputMessage();
  checkInputPrayerRequest();

  const formItems = form.querySelectorAll(".form-content");

  const isValid = [...formItems].every((item) => {
    return item.className === "form-content";
  });

  if (isValid) {
    showFormMessage();
    setTimeout(function () {
      window.location.reload();
    }, 4000);
  }
}

function showFormMessage() {
  const formMessage = document.getElementById("formMessage");
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
