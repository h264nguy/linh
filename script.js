
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const galleryInput = document.getElementById("galleryInput");
const galleryGrid = document.getElementById("galleryGrid");

const imageModal = document.getElementById("imageModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalRemoveBtn = document.getElementById("modalRemoveBtn");

const defaultGallery = [
  { src: "assets/img/gallery-cherry-1.jpg" },
  { src: "assets/img/gallery-cherry-2.jpg" },
  { src: "assets/img/gallery-cherry-3.jpg" },
  { src: "assets/img/gallery-extra-01.jpg" },
  { src: "assets/img/gallery-extra-02.jpg" },
  { src: "assets/img/gallery-extra-03.jpg" },
  { src: "assets/img/gallery-extra-04.jpg" },
  { src: "assets/img/gallery-extra-05.jpg" },
  { src: "assets/img/gallery-extra-06.jpg" },
  { src: "assets/img/gallery-extra-07.jpg" },
  { src: "assets/img/gallery-extra-08.jpg" },
  { src: "assets/img/gallery-extra-09.jpg" },
  { src: "assets/img/gallery-extra-10.jpg" },
  { src: "assets/img/gallery-extra-11.jpg" }
,
  { src: "assets/img/gallery-extra-12.jpg" }
];

let currentModalIndex = null;
let currentModalType = null;

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getSavedGallery() {
  return JSON.parse(localStorage.getItem("linhGallery") || "[]");
}

function saveGallery(images) {
  localStorage.setItem("linhGallery", JSON.stringify(images));
}

function renderGallery(uploadedImages) {
  galleryGrid.innerHTML = "";

  defaultGallery.forEach((item, index) => {
    galleryGrid.insertAdjacentHTML("beforeend", `
      <article class="gallery-item reveal visible clickable default-photo" data-default-index="${index}">
        <div class="photo-frame">
          <img src="${item.src}" alt="Gallery photo ${index + 1}">
        </div>
      </article>
    `);
  });

  uploadedImages.forEach((src, index) => {
    galleryGrid.insertAdjacentHTML("beforeend", `
      <article class="gallery-item reveal visible clickable uploaded-photo" data-index="${index}">
        <div class="photo-frame">
          <img src="${src}" alt="Uploaded gallery photo ${index + 1}">
        </div>
      </article>
    `);
  });
}

function openModal(src, type = "default", index = null) {
  modalImage.src = src;
  currentModalType = type;
  currentModalIndex = index;

  if (type === "uploaded" && index !== null) {
    modalRemoveBtn.style.display = "inline-flex";
  } else {
    modalRemoveBtn.style.display = "none";
  }

  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
  currentModalType = null;
  currentModalIndex = null;
  document.body.style.overflow = "";
}

galleryGrid.addEventListener("click", (event) => {
  const defaultItem = event.target.closest(".gallery-item.default-photo");
  const uploadedItem = event.target.closest(".gallery-item.uploaded-photo");

  if (uploadedItem) {
    const img = uploadedItem.querySelector("img");
    const index = Number(uploadedItem.dataset.index);
    if (img) openModal(img.src, "uploaded", index);
    return;
  }

  if (defaultItem) {
    const img = defaultItem.querySelector("img");
    const index = Number(defaultItem.dataset.defaultIndex);
    if (img) openModal(img.src, "default", index);
  }
});

galleryInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files);
  const existing = getSavedGallery();

  try {
    const newImages = await Promise.all(files.map(readImage));
    const updated = [...existing, ...newImages].slice(0, 30);
    saveGallery(updated);
    renderGallery(updated);
  } catch {
    alert("Please upload image files only.");
  }

  galleryInput.value = "";
});

modalRemoveBtn.addEventListener("click", () => {
  if (currentModalType !== "uploaded" || currentModalIndex === null) return;

  const images = getSavedGallery();
  images.splice(currentModalIndex, 1);
  saveGallery(images);
  renderGallery(images);
  closeModal();
});

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal.classList.contains("open")) {
    closeModal();
  }
});

renderGallery(getSavedGallery());

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
