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

  if (message) {
    dialogText.innerHTML = `
      <h2>${escapeHtml(message.title || "A memory")}</h2>
      <p>${escapeHtml(message.message || "")}</p>
    `;
  } else {
    dialogText.innerHTML = `
      <h2>${escapeHtml(image.title || "Memory")}</h2>
      <p>This image does not have a message yet.</p>
    `;
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

    card.querySelector("img").addEventListener("error", () => {
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
