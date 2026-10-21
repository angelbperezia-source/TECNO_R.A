"use strict";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const modal = document.getElementById("product-modal");
const form = document.getElementById("product-form");
const saveButton = document.getElementById("save-product");
const formError = document.getElementById("form-error");
let products = [];
let editingId = null;
let toastTimeout;

function formatMoney(value) {
  const amount = new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
  return `$ ${amount}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function showPageError(message) {
  const alert = document.getElementById("page-error");
  alert.textContent = message;
  alert.classList.add("visible");
}

function clearPageError() {
  const alert = document.getElementById("page-error");
  alert.textContent = "";
  alert.classList.remove("visible");
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor respondió con un formato inesperado. Comprueba que XAMPP esté ejecutando PHP.");
  }

  if (!response.ok) {
    throw new Error(data.error || `Error del servidor (${response.status}).`);
  }

  return data;
}

function stockStatus(stock) {
  if (stock <= 0) return { label: "Agotado", className: "out" };
  if (stock <= 5) return { label: "Stock bajo", className: "low" };
  return { label: "Disponible", className: "" };
}

function createProductCell(product) {
  const cell = document.createElement("td");
  const wrapper = document.createElement("div");
  const icon = document.createElement("span");
  const name = document.createElement("span");

  wrapper.className = "product-cell";
  icon.className = "product-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "▧";
  name.textContent = product.nombre;
  wrapper.append(icon, name);
  cell.append(wrapper);
  return cell;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visibleProducts = products.filter((product) =>
    String(product.nombre).toLocaleLowerCase().includes(query)
  );

  productList.replaceChildren();
  document.getElementById("inventory-count").textContent =
    `${visibleProducts.length} ${visibleProducts.length === 1 ? "producto" : "productos"}`;

  if (visibleProducts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    const message = document.createElement("div");
    cell.colSpan = 5;
    cell.className = "empty-state";

    if (products.length === 0) {
      const title = document.createElement("strong");
      title.textContent = "Tu inventario está vacío";
      message.append(title, document.createTextNode("Agrega tu primer producto para comenzar."));
    } else {
      message.textContent = "No hay productos que coincidan con la búsqueda.";
    }

    cell.append(message);
    row.append(cell);
    productList.append(row);
    return;
  }

  for (const product of visibleProducts) {
    const row = document.createElement("tr");
    row.append(createProductCell(product));

    const price = document.createElement("td");
    price.textContent = formatMoney(product.precio);
    row.append(price);

    const stock = document.createElement("td");
    stock.textContent = `${product.stock} ${Number(product.stock) === 1 ? "unidad" : "unidades"}`;
    row.append(stock);

    const statusCell = document.createElement("td");
    const status = stockStatus(Number(product.stock));
    const pill = document.createElement("span");
    pill.className = `stock-pill ${status.className}`.trim();
    pill.textContent = status.label;
    statusCell.append(pill);
    row.append(statusCell);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = String(product.id);
    editButton.setAttribute("aria-label", `Editar ${product.nombre}`);
    editButton.title = "Editar";
    editButton.textContent = "✎";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-button delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = String(product.id);
    deleteButton.setAttribute("aria-label", `Eliminar ${product.nombre}`);
    deleteButton.title = "Eliminar";
    deleteButton.textContent = "⌫";

    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(actionsCell);
    productList.append(row);
  }
}

function updateStats() {
  const units = products.reduce((sum, product) => sum + Number(product.stock), 0);
  const value = products.reduce(
    (sum, product) => sum + Number(product.precio) * Number(product.stock),
    0
  );
  document.getElementById("stat-products").textContent = String(products.length);
  document.getElementById("stat-units").textContent = new Intl.NumberFormat("es").format(units);
  document.getElementById("stat-value").textContent = formatMoney(value);
}

async function loadProducts() {
  clearPageError();
  try {
    const data = await requestJson("listar.php");
    if (!Array.isArray(data)) {
      throw new Error(data.error || "No se pudo leer el inventario.");
    }
    products = data;
    updateStats();
    renderProducts();
  } catch (error) {
    showPageError(error.message);
    productList.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "loading-state";
    cell.colSpan = 5;
    cell.textContent = "No se pudo cargar el inventario.";
    row.append(cell);
    productList.append(row);
    document.getElementById("inventory-count").textContent = "Error al cargar";
  }
}

function openModal(product = null) {
  editingId = product ? Number(product.id) : null;
  form.reset();
  formError.textContent = "";
  document.getElementById("modal-title").textContent = product ? "Editar producto" : "Agregar producto";
  saveButton.textContent = product ? "Guardar cambios" : "Guardar producto";

  if (product) {
    document.getElementById("product-name").value = product.nombre;
    document.getElementById("product-price").value = product.precio;
    document.getElementById("product-stock").value = product.stock;
  }

  modal.classList.add("open");
  document.getElementById("product-name").focus();
}

function closeModal() {
  modal.classList.remove("open");
  formError.textContent = "";
}

document.getElementById("new-product").addEventListener("click", () => openModal());
document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("cancel-modal").addEventListener("click", closeModal);
searchInput.addEventListener("input", renderProducts);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

productList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const product = products.find((item) => Number(item.id) === Number(button.dataset.id));
  if (!product) return;

  if (button.dataset.action === "edit") {
    openModal(product);
    return;
  }

  if (!window.confirm(`¿Quieres eliminar "${product.nombre}" del inventario?`)) return;

  try {
    await requestJson("eliminar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
    await loadProducts();
    showToast("Producto eliminado.");
  } catch (error) {
    showPageError(error.message);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";

  const nombre = document.getElementById("product-name").value.trim();
  const precio = Number(document.getElementById("product-price").value);
  const stockValue = document.getElementById("product-stock").value;
  const stock = Number(stockValue);

  if (!nombre || !Number.isFinite(precio) || precio < 0 || !Number.isInteger(stock) || stock < 0) {
    formError.textContent = "Ingresa un nombre, un precio válido y una cantidad entera de cero o más.";
    return;
  }

  const product = { nombre, precio, stock };
  const url = editingId === null ? "agregar.php" : "editar.php";
  if (editingId !== null) product.id = editingId;

  saveButton.disabled = true;
  saveButton.textContent = "Guardando…";

  try {
    await requestJson(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    closeModal();
    await loadProducts();
    showToast(editingId === null ? "Producto agregado al inventario." : "Cambios guardados.");
  } catch (error) {
    formError.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = editingId === null ? "Guardar producto" : "Guardar cambios";
  }
});

loadProducts();
