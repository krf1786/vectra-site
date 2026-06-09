const themeButtons = document.querySelectorAll("[data-theme]");
const viewButtons = document.querySelectorAll("[data-view]");
const dialog = document.getElementById("conceptDialog");
const dialogLogo = document.getElementById("dialogLogo");
const dialogNumber = document.getElementById("dialogNumber");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    themeButtons.forEach((item) => item.classList.toggle("active", item === button));
    document.body.classList.toggle("light-preview", button.dataset.theme === "light");
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewButtons.forEach((item) => item.classList.toggle("active", item === button));
    document.body.classList.toggle("mark-view", button.dataset.view === "mark");
  });
});

document.querySelectorAll(".concept-card").forEach((card) => {
  card.querySelector(".concept-preview").addEventListener("click", () => {
    const image = card.querySelector(
      document.body.classList.contains("mark-view") ? ".mark-logo" : ".full-logo",
    );
    dialogLogo.src = image.src;
    dialogLogo.alt = image.alt;
    dialogNumber.textContent = card.querySelector(".concept-copy span").textContent;
    dialogTitle.textContent = card.querySelector("h2").textContent;
    dialogText.textContent = card.querySelector(".concept-copy p").textContent;
    dialog.showModal();
  });
});

dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    dialog.close();
  }
});
