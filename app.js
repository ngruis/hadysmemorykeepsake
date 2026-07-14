const gallery = document.querySelector("#gallery");
const emptyState = document.querySelector("#emptyState");
const dialog = document.querySelector("#keepsakeDialog");
const dialogImage = document.querySelector("#dialogImage");
const dialogText = document.querySelector("#dialogText");
const closeButton = dialog.querySelector(".dialog-close");

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  return response.json();
}

function getMessageMap(messages) {
  return new Map(messages.map((message) => [message.imageId, message]));
}

function openKeepsake(image, message) {
  dialogImage.src = image.src;
  dialogImage.alt = image.alt || image.title || "";
  setImageRotation(dialogImage, image);

  if (message) {
    dialogText.hidden = false;
    dialogText.innerHTML = `
      <h2>${escapeHtml(message.title || "A memory")}</h2>
      <p>${escapeHtml(message.message || "")}</p>
    `;
  } else {
    dialogText.hidden = true;
    dialogText.innerHTML = "";
  }

  dialog.showModal();
}

function renderGallery(images, messages) {
  const messageMap = getMessageMap(messages);
  gallery.innerHTML = "";
  emptyState.hidden = images.length > 0;

  images.forEach((image) => {
    const message = messageMap.get(image.id);
    const card = document.createElement("button");
    card.className = "keepsake-card";
    card.type = "button";
    card.setAttribute(
      "aria-label",
      message
        ? `Open message for ${image.title || image.id}`
        : `Open image preview for ${image.title || image.id}`,
    );

    card.innerHTML = `
      <img src="${escapeAttribute(image.src)}" alt="${escapeAttribute(image.alt || image.title || "")}" loading="lazy" />
      <span class="image-fallback">${escapeHtml(image.title || image.id)}</span>
      ${message ? '<span class="message-mark" aria-hidden="true">+</span>' : ""}
    `;

    const cardImage = card.querySelector("img");
    setImageRotation(cardImage, image);

    cardImage.addEventListener("error", () => {
      card.classList.add("is-missing-image");
    });

    card.addEventListener("click", () => openKeepsake(image, message));
    gallery.append(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function setImageRotation(element, image) {
  element.style.transform = image.rotation ? `rotate(${image.rotation}deg)` : "";
}

closeButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

try {
  const [images, messages] = await Promise.all([
    loadJson("data/images.json"),
    loadJson("data/messages.json"),
  ]);

  renderGallery(images, messages);
} catch (error) {
  console.error(error);
  emptyState.hidden = false;
  emptyState.textContent = "The gallery data could not be loaded.";
}
