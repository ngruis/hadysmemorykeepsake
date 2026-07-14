const gallery = document.querySelector("#gallery");
const emptyState = document.querySelector("#emptyState");
const dialog = document.querySelector("#keepsakeDialog");
const dialogImage = document.querySelector("#dialogImage");
const dialogText = document.querySelector("#dialogText");
const closeButton = dialog.querySelector(".dialog-close");
const previousButton = dialog.querySelector(".dialog-nav-prev");
const nextButton = dialog.querySelector(".dialog-nav-next");

let activeImages = [];
let activeMessageMap = new Map();
let activeImageIndex = 0;

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

function openKeepsake(image, message, shouldShowModal = true) {
  dialogImage.src = image.src;
  dialogImage.alt = image.alt || image.title || "";
  setImageRotation(dialogImage, image);
  dialog.classList.toggle("is-image-only", !message);

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

  if (shouldShowModal) {
    dialog.showModal();
  }
}

function openGalleryImage(index) {
  if (!activeImages.length) {
    return;
  }

  activeImageIndex = (index + activeImages.length) % activeImages.length;
  const image = activeImages[activeImageIndex];
  openKeepsake(image, activeMessageMap.get(image.id), !dialog.open);
}

function renderGallery(images, messages) {
  const messageMap = getMessageMap(messages);
  const orderedImages = getOrderedImages(images, messageMap);
  activeImages = orderedImages;
  activeMessageMap = messageMap;
  gallery.innerHTML = "";
  emptyState.hidden = images.length > 0;

  orderedImages.forEach((image, index) => {
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

    card.addEventListener("click", () => openGalleryImage(index));
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

function getOrderedImages(images, messageMap) {
  return [...images].sort((left, right) => {
    const leftHasMessage = messageMap.has(left.id);
    const rightHasMessage = messageMap.has(right.id);

    if (leftHasMessage === rightHasMessage) {
      return 0;
    }

    return leftHasMessage ? -1 : 1;
  });
}

function setImageRotation(element, image) {
  element.style.transform = image.rotation ? `rotate(${image.rotation}deg)` : "";
}

closeButton.addEventListener("click", () => dialog.close());

previousButton.addEventListener("click", () => openGalleryImage(activeImageIndex - 1));
nextButton.addEventListener("click", () => openGalleryImage(activeImageIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!dialog.open) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    openGalleryImage(activeImageIndex - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    openGalleryImage(activeImageIndex + 1);
  }
});

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
