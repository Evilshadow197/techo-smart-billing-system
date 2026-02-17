const LOW_STOCK_THRESHOLD = 5;

const state = {
  categories: [],
  items: [],
  bills: [],
  currentBill: [],
};

const selectors = {
  pages: document.querySelectorAll(".page"),
  navButtons: document.querySelectorAll(".nav-button"),
  statTotalStock: document.querySelector("#stat-total-stock"),
  statItemCount: document.querySelector("#stat-item-count"),
  statTodaySales: document.querySelector("#stat-today-sales"),
  statBillsToday: document.querySelector("#stat-bills-today"),
  statLowStock: document.querySelector("#stat-low-stock"),
  recentBills: document.querySelector("#recent-bills"),
  categoryForm: document.querySelector("#category-form"),
  categoryName: document.querySelector("#category-name"),
  categoryItemForm: document.querySelector("#category-item-form"),
  itemCategory: document.querySelector("#item-category"),
  itemName: document.querySelector("#item-name"),
  itemPrice: document.querySelector("#item-price"),
  itemQuantity: document.querySelector("#item-quantity"),
  uncategorizedForm: document.querySelector("#uncategorized-form"),
  uncatName: document.querySelector("#uncat-name"),
  uncatPrice: document.querySelector("#uncat-price"),
  uncatQuantity: document.querySelector("#uncat-quantity"),
  inventoryList: document.querySelector("#inventory-list"),
  billCategory: document.querySelector("#bill-category"),
  billItem: document.querySelector("#bill-item"),
  billPrice: document.querySelector("#bill-price"),
  billQuantity: document.querySelector("#bill-quantity"),
  billItemForm: document.querySelector("#bill-item-form"),
  billCustomer: document.querySelector("#bill-customer"),
  billWhatsapp: document.querySelector("#bill-whatsapp"),
  billNotes: document.querySelector("#bill-notes"),
  billMetaForm: document.querySelector("#bill-meta-form"),
  billSummary: document.querySelector("#bill-summary"),
  billTotal: document.querySelector("#bill-total"),
  billNumber: document.querySelector("#bill-number"),
  printBill: document.querySelector("#print-bill"),
  sendWhatsapp: document.querySelector("#send-whatsapp"),
  finalizeBill: document.querySelector("#finalize-bill"),
  quickNewBill: document.querySelector("#quick-new-bill"),
  printArea: document.querySelector("#print-area"),
};

const storage = {
  load() {
    const data = JSON.parse(localStorage.getItem("techo-data")) || null;
    if (data) {
      state.categories = data.categories || [];
      state.items = data.items || [];
      state.bills = data.bills || [];
    }
  },
  save() {
    localStorage.setItem(
      "techo-data",
      JSON.stringify({
        categories: state.categories,
        items: state.items,
        bills: state.bills,
      })
    );
  },
};

const utils = {
  currency(value) {
    return `₹${value.toFixed(2)}`;
  },
  todayString() {
    return new Date().toISOString().split("T")[0];
  },
  generateId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  },
  escape(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

const navigation = {
  init() {
    selectors.navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = button.dataset.page;
        selectors.navButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        selectors.pages.forEach((section) => {
          section.classList.toggle("active", section.id === page);
        });
      });
    });
  },
  goTo(pageId) {
    document.querySelector(`[data-page="${pageId}"]`).click();
  },
};

function initializeDefaults() {
  if (state.categories.length === 0 && state.items.length === 0) {
    const starterCategory = { id: utils.generateId("cat"), name: "General" };
    state.categories.push(starterCategory);
    state.items.push({
      id: utils.generateId("item"),
      name: "Sample Item",
      price: 199,
      quantity: 12,
      categoryId: starterCategory.id,
    });
    storage.save();
  }
}

function renderCategories() {
  const options = state.categories
    .map((category) => `<option value="${category.id}">${utils.escape(category.name)}</option>`)
    .join("");

  selectors.itemCategory.innerHTML = options;
  selectors.billCategory.innerHTML = `<option value="all">All categories</option>${options}`;
}

function renderInventory() {
  selectors.inventoryList.innerHTML = "";
  const grouped = new Map();
  state.categories.forEach((category) => {
    grouped.set(category.id, { name: category.name, items: [] });
  });

  state.items.forEach((item) => {
    if (item.categoryId && grouped.has(item.categoryId)) {
      grouped.get(item.categoryId).items.push(item);
    }
  });

  grouped.forEach((data, categoryId) => {
    const card = document.createElement("div");
    card.className = "inventory-card";
    const title = document.createElement("div");
    title.innerHTML = `
      <div class="panel-header">
        <h3>${utils.escape(data.name)}</h3>
        <div class="inventory-actions">
          <button class="secondary" data-delete-category="${categoryId}">Delete Category</button>
        </div>
      </div>
    `;
    card.appendChild(title);

    if (data.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No items yet in this category.";
      card.appendChild(empty);
    }

    data.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = `inventory-item ${item.quantity <= LOW_STOCK_THRESHOLD ? "low" : ""}`;
      row.innerHTML = `
        <span>${utils.escape(item.name)}</span>
        <span>${utils.currency(item.price)}</span>
        <span>Qty: ${item.quantity}</span>
        <div class="inventory-actions">
          <button class="secondary" data-edit-item="${item.id}">Edit</button>
          <button class="delete secondary" data-delete-item="${item.id}">Delete</button>
        </div>
      `;
      card.appendChild(row);
    });

    selectors.inventoryList.appendChild(card);
  });

  const uncategorized = state.items.filter((item) => !item.categoryId);
  if (uncategorized.length > 0) {
    const card = document.createElement("div");
    card.className = "inventory-card";
    card.innerHTML = "<h3>Uncategorized Items</h3>";
    uncategorized.forEach((item) => {
      const row = document.createElement("div");
      row.className = `inventory-item ${item.quantity <= LOW_STOCK_THRESHOLD ? "low" : ""}`;
      row.innerHTML = `
        <span>${utils.escape(item.name)}</span>
        <span>${utils.currency(item.price)}</span>
        <span>Qty: ${item.quantity}</span>
        <div class="inventory-actions">
          <button class="secondary" data-edit-item="${item.id}">Edit</button>
          <button class="delete secondary" data-delete-item="${item.id}">Delete</button>
        </div>
      `;
      card.appendChild(row);
    });
    selectors.inventoryList.appendChild(card);
  }
}

function renderDashboard() {
  const totalStock = state.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  selectors.statTotalStock.textContent = totalStock;
  selectors.statItemCount.textContent = state.items.length;

  const today = utils.todayString();
  const todaysBills = state.bills.filter((bill) => bill.date === today);
  const todaysRevenue = todaysBills.reduce((sum, bill) => sum + bill.total, 0);

  selectors.statTodaySales.textContent = utils.currency(todaysRevenue);
  selectors.statBillsToday.textContent = todaysBills.length;

  const lowStockCount = state.items.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD).length;
  selectors.statLowStock.textContent = lowStockCount;

  renderRecentBills(todaysBills.slice(-5).reverse());
}

function renderRecentBills(bills) {
  selectors.recentBills.innerHTML = "";
  const header = document.createElement("div");
  header.className = "table-row header";
  header.innerHTML = "<span>Bill</span><span>Customer</span><span>Total</span><span>Date</span>";
  selectors.recentBills.appendChild(header);

  if (bills.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No bills generated today.";
    selectors.recentBills.appendChild(empty);
    return;
  }

  bills.forEach((bill) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span>${utils.escape(bill.number)}</span>
      <span>${utils.escape(bill.customer || "Walk-in")}</span>
      <span>${utils.currency(bill.total)}</span>
      <span>${bill.date}</span>
    `;
    selectors.recentBills.appendChild(row);
  });
}

function renderBillingOptions() {
  const categoryValue = selectors.billCategory.value || "all";
  let items = state.items;
  if (categoryValue !== "all") {
    items = state.items.filter((item) => item.categoryId === categoryValue);
  }

  selectors.billItem.innerHTML = items
    .map((item) => `<option value="${item.id}">${utils.escape(item.name)}</option>`)
    .join("");

  if (items.length > 0) {
    const selected = items[0];
    selectors.billPrice.value = utils.currency(selected.price);
  } else {
    selectors.billPrice.value = "";
  }
}

function renderBillSummary() {
  selectors.billSummary.innerHTML = "";
  if (state.currentBill.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No items added yet.";
    selectors.billSummary.appendChild(empty);
  }

  state.currentBill.forEach((line) => {
    const row = document.createElement("div");
    row.className = "bill-line";
    row.innerHTML = `
      <span>${utils.escape(line.name)}</span>
      <span>${utils.currency(line.price)}</span>
      <span>${line.quantity}</span>
      <span>${utils.currency(line.total)}</span>
      <button data-remove-line="${line.id}">Remove</button>
    `;
    selectors.billSummary.appendChild(row);
  });

  const total = state.currentBill.reduce((sum, line) => sum + line.total, 0);
  selectors.billTotal.textContent = utils.currency(total);
}

function refreshAll() {
  renderCategories();
  renderInventory();
  renderDashboard();
  renderBillingOptions();
  renderBillSummary();
  updateBillNumber();
}

function updateBillNumber() {
  const nextNumber = state.bills.length + 1;
  selectors.billNumber.textContent = `Bill #${String(nextNumber).padStart(4, "0")}`;
}

function addCategory(event) {
  event.preventDefault();
  const name = selectors.categoryName.value.trim();
  if (!name) return;
  state.categories.push({ id: utils.generateId("cat"), name });
  selectors.categoryName.value = "";
  storage.save();
  refreshAll();
}

function addItem(event) {
  event.preventDefault();
  const item = {
    id: utils.generateId("item"),
    name: selectors.itemName.value.trim(),
    price: Number(selectors.itemPrice.value),
    quantity: Number(selectors.itemQuantity.value),
    categoryId: selectors.itemCategory.value,
  };
  state.items.push(item);
  selectors.categoryItemForm.reset();
  storage.save();
  refreshAll();
}

function addUncategorizedItem(event) {
  event.preventDefault();
  const item = {
    id: utils.generateId("item"),
    name: selectors.uncatName.value.trim(),
    price: Number(selectors.uncatPrice.value),
    quantity: Number(selectors.uncatQuantity.value),
    categoryId: null,
  };
  state.items.push(item);
  selectors.uncategorizedForm.reset();
  storage.save();
  refreshAll();
}

function deleteCategory(categoryId) {
  const confirmDelete = window.confirm(
    "Delete this category and all items inside it? This cannot be undone."
  );
  if (!confirmDelete) return;
  state.categories = state.categories.filter((category) => category.id !== categoryId);
  state.items = state.items.filter((item) => item.categoryId !== categoryId);
  storage.save();
  refreshAll();
}

function deleteItem(itemId) {
  state.items = state.items.filter((item) => item.id !== itemId);
  storage.save();
  refreshAll();
}

function editItem(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  const updatedName = window.prompt("Update item name", item.name);
  if (!updatedName) return;
  const updatedPrice = window.prompt("Update price", item.price);
  if (updatedPrice === null) return;
  const updatedQuantity = window.prompt("Update quantity", item.quantity);
  if (updatedQuantity === null) return;
  item.name = updatedName.trim();
  item.price = Number(updatedPrice);
  item.quantity = Number(updatedQuantity);
  storage.save();
  refreshAll();
}

function handleInventoryClicks(event) {
  const { deleteCategory: categoryId, deleteItem: itemId, editItem: editId } = event.target.dataset;
  if (categoryId) deleteCategory(categoryId);
  if (itemId) deleteItem(itemId);
  if (editId) editItem(editId);
}

function handleBillCategoryChange() {
  renderBillingOptions();
}

function handleBillItemChange() {
  const itemId = selectors.billItem.value;
  const item = state.items.find((entry) => entry.id === itemId);
  selectors.billPrice.value = item ? utils.currency(item.price) : "";
}

function addBillLine(event) {
  event.preventDefault();
  const itemId = selectors.billItem.value;
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  const quantity = Number(selectors.billQuantity.value);
  if (quantity <= 0) return;
  if (quantity > item.quantity) {
    window.alert("Not enough stock available.");
    return;
  }
  const line = {
    id: utils.generateId("line"),
    itemId: item.id,
    name: item.name,
    price: item.price,
    quantity,
    total: item.price * quantity,
  };
  state.currentBill.push(line);
  selectors.billItemForm.reset();
  selectors.billQuantity.value = 1;
  renderBillingOptions();
  renderBillSummary();
}

function removeBillLine(lineId) {
  state.currentBill = state.currentBill.filter((line) => line.id !== lineId);
  renderBillSummary();
}

function finalizeBill() {
  if (state.currentBill.length === 0) {
    window.alert("Add at least one item to the bill.");
    return;
  }
  const total = state.currentBill.reduce((sum, line) => sum + line.total, 0);
  const bill = {
    id: utils.generateId("bill"),
    number: selectors.billNumber.textContent.replace("Bill #", "B-"),
    date: utils.todayString(),
    customer: selectors.billCustomer.value.trim(),
    whatsapp: selectors.billWhatsapp.value.trim(),
    notes: selectors.billNotes.value.trim(),
    items: state.currentBill,
    total,
  };

  bill.items.forEach((line) => {
    const item = state.items.find((entry) => entry.id === line.itemId);
    if (item) {
      item.quantity -= line.quantity;
    }
  });

  state.bills.push(bill);
  state.currentBill = [];
  selectors.billItemForm.reset();
  selectors.billMetaForm.reset();
  storage.save();
  refreshAll();
  window.alert("Bill saved successfully.");
}

function generatePrintMarkup() {
  const total = state.currentBill.reduce((sum, line) => sum + line.total, 0);
  const itemsMarkup = state.currentBill
    .map(
      (line) => `
      <tr>
        <td>${utils.escape(line.name)}</td>
        <td>${line.quantity}</td>
        <td>${utils.currency(line.price)}</td>
        <td>${utils.currency(line.total)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <h2>Techo</h2>
    <p>Powered by Engravz</p>
    <p>${new Date().toLocaleString()}</p>
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left">Item</th>
          <th align="left">Qty</th>
          <th align="left">Price</th>
          <th align="left">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsMarkup}
      </tbody>
    </table>
    <h3 style="text-align:right;">Grand Total: ${utils.currency(total)}</h3>
  `;
}

function printBill() {
  if (state.currentBill.length === 0) {
    window.alert("Add items to print the bill preview.");
    return;
  }
  selectors.printArea.innerHTML = generatePrintMarkup();
  window.print();
}

function sendWhatsapp() {
  if (state.currentBill.length === 0) {
    window.alert("Add items to send the bill.");
    return;
  }
  const number = selectors.billWhatsapp.value.trim();
  if (!number) {
    window.alert("Enter a WhatsApp number first.");
    return;
  }

  const total = state.currentBill.reduce((sum, line) => sum + line.total, 0);
  const lines = state.currentBill
    .map((line) => `${line.name} x${line.quantity} = ${utils.currency(line.total)}`)
    .join("\n");
  const message = `Techo Bill\n${lines}\nTotal: ${utils.currency(total)}`;
  const url = `https://wa.me/${encodeURIComponent(number.replace(/\s+/g, ""))}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function handleBillSummaryClick(event) {
  const lineId = event.target.dataset.removeLine;
  if (lineId) removeBillLine(lineId);
}

function handleQuickNewBill() {
  navigation.goTo("billing");
}

function registerEvents() {
  selectors.categoryForm.addEventListener("submit", addCategory);
  selectors.categoryItemForm.addEventListener("submit", addItem);
  selectors.uncategorizedForm.addEventListener("submit", addUncategorizedItem);
  selectors.inventoryList.addEventListener("click", handleInventoryClicks);
  selectors.billCategory.addEventListener("change", handleBillCategoryChange);
  selectors.billItem.addEventListener("change", handleBillItemChange);
  selectors.billItemForm.addEventListener("submit", addBillLine);
  selectors.billSummary.addEventListener("click", handleBillSummaryClick);
  selectors.printBill.addEventListener("click", printBill);
  selectors.sendWhatsapp.addEventListener("click", sendWhatsapp);
  selectors.finalizeBill.addEventListener("click", finalizeBill);
  selectors.quickNewBill.addEventListener("click", handleQuickNewBill);
}

function start() {
  storage.load();
  initializeDefaults();
  navigation.init();
  registerEvents();
  refreshAll();
}

start();
