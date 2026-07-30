/**
 * APP.JS - Control del lado del cliente para la SPA PWA de Menú & Compra
 */

// --- NAVEGACIÓN SPA ---
class AppNavigation {
  constructor() {
    this.currentView = 'landing';
  }

  navigate(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      this.currentView = viewId;
    }

    // Actualizar botones de la barra de navegación inferior
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.view === viewId) {
        btn.classList.add('text-brand-400');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-brand-400');
        btn.classList.add('text-slate-400');
      }
    });

    // Renderizar contenidos según la vista elegida
    if (viewId === 'landing') appUi.renderLanding();
    if (viewId === 'shopping') appUi.renderShoppingList();
    if (viewId === 'calendar') appUi.renderWeeklyCalendar();
    if (viewId === 'recipes') appUi.renderRecipes();
    if (viewId === 'settings') appUi.loadSettingsForm();

    // Re-inicializar iconos Lucide
    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.appNav = new AppNavigation();

// --- HELPER DE PARSEO FLEXIBLE DE CANTIDADES (Ej: 1, 1/2, 0.5, 1kg, 500g, 2.5) ---
function parseQuantityAndUnit(rawQtyStr, fallbackUnit = 'uds') {
  if (rawQtyStr === null || rawQtyStr === undefined || rawQtyStr === '') {
    return { quantity: 1, unit: fallbackUnit };
  }
  if (typeof rawQtyStr === 'number') {
    return { quantity: isNaN(rawQtyStr) ? 1 : rawQtyStr, unit: fallbackUnit };
  }

  let str = String(rawQtyStr).trim().replace(',', '.');

  // Soporte para fracciones como "1/2", "1/2kg", "1/2 latas"
  const fractionMatch = str.match(/^(\d+)\/(\d+)\s*([a-zA-ZáéíóúÁÉÍÓÚ]*)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
    const unitStr = fractionMatch[3] ? fractionMatch[3].toLowerCase() : fallbackUnit;
    return {
      quantity: isNaN(num) ? 0.5 : num,
      unit: unitStr || fallbackUnit
    };
  }

  // Coincidir número y unidad opcional (ej: "1.5kg", "1 kg", "500g", "2", "0.5")
  const match = str.match(/^([\d.]+)\s*([a-zA-ZáéíóúÁÉÍÓÚ]*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const unitStr = match[2] ? match[2].toLowerCase() : fallbackUnit;
    return {
      quantity: isNaN(num) ? 1 : num,
      unit: unitStr || fallbackUnit
    };
  }

  const parsedNum = parseFloat(str);
  return {
    quantity: isNaN(parsedNum) ? 1 : parsedNum,
    unit: fallbackUnit
  };
}

// --- LÓGICA DE INTERFAZ DE USUARIO (UI) ---
class AppUI {
  constructor() {
    this.activeCategoryFilter = 'all';
    this.catalogSortMode = 'alpha'; // 'alpha' o 'usage'
    this.assignTarget = null; // { dayIndex, mealType }
    this.initEvents();
  }

  setCatalogSort(mode) {
    this.catalogSortMode = mode;
    this.openCatalogModal();
  }

  initEvents() {
    // Modo Oscuro / Claro
    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => this.toggleTheme());
    }

    // Formulario de añadir producto al vuelo
    const formShopping = document.getElementById('form-add-shopping');
    if (formShopping) {
      formShopping.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('input-shopping-name');
        const catSelect = document.getElementById('select-shopping-category');
        const qtyInput = document.getElementById('input-shopping-qty');

        if (nameInput.value.trim()) {
          const parsed = parseQuantityAndUnit(qtyInput ? qtyInput.value : '1', 'uds');
          appDb.addShoppingItem({
            name: nameInput.value.trim(),
            category: catSelect.value,
            quantity: parsed.quantity,
            unit: parsed.unit,
            status: 'pending'
          });
          nameInput.value = '';
          qtyInput.value = '1';
          this.renderShoppingList();
          this.showToast('Producto añadido a la lista 🛒');
        }
      });
    }

    // Formulario de creación / edición de alimento en el catálogo
    const formProduct = document.getElementById('form-create-product');
    if (formProduct) {
      formProduct.addEventListener('submit', (e) => {
        e.preventDefault();
        const editIdInput = document.getElementById('edit-product-id');
        const nameInput = document.getElementById('new-prod-name');
        const catSelect = document.getElementById('new-prod-category');
        const unitSelect = document.getElementById('new-prod-unit');
        const essentialChk = document.getElementById('new-prod-essential');

        if (nameInput && nameInput.value.trim()) {
          const editId = editIdInput ? editIdInput.value : '';
          const productData = {
            name: nameInput.value.trim(),
            category: catSelect.value,
            unit: unitSelect.value,
            is_essential: essentialChk.checked
          };

          if (editId) {
            appDb.updateProduct(editId, productData);
            this.showToast('Alimento actualizado en el catálogo 🍏');
          } else {
            appDb.addProduct(productData);
            this.showToast('Alimento añadido al catálogo habitual 🍏');
          }

          nameInput.value = '';
          if (editIdInput) editIdInput.value = '';
          this.closeAddProductModal();
          this.openCatalogModal();
        }
      });
    }

    // Formulario de creación / edición de receta / comida
    const formRecipe = document.getElementById('form-create-recipe');
    if (formRecipe) {
      formRecipe.addEventListener('submit', (e) => {
        e.preventDefault();
        const editIdInput = document.getElementById('edit-recipe-id');
        const titleInput = document.getElementById('new-recipe-title');
        const catSelect = document.getElementById('new-recipe-category');
        const mealTargetSelect = document.getElementById('new-recipe-mealtarget');
        const prepTimeInput = document.getElementById('new-recipe-preptime');
        const favChk = document.getElementById('new-recipe-favorite');

        // Extraer ingredientes de las filas
        const ingRows = document.querySelectorAll('#recipe-ingredients-rows .ingredient-row');
        const ingredients = [];
        ingRows.forEach(row => {
          const selectEl = row.querySelector('.ing-select');
          const customNameEl = row.querySelector('.ing-custom-name');
          const qtyEl = row.querySelector('.ing-qty');
          const unitEl = row.querySelector('.ing-unit');

          let ingName = '';
          let ingCategory = 'Frescos';

          if (selectEl) {
            const val = selectEl.value;
            if (val === '__NEW__') {
              ingName = customNameEl ? customNameEl.value.trim() : '';
              const catEl = row.querySelector('.ing-category');
              if (catEl) ingCategory = catEl.value;
            } else if (val) {
              const opt = selectEl.options[selectEl.selectedIndex];
              ingName = opt ? (opt.dataset.name || '').trim() : '';
              ingCategory = opt ? (opt.dataset.cat || 'Frescos') : 'Frescos';
            }
          }

          // Fallback en caso de ingresar directamente en customNameEl
          if (!ingName && customNameEl && customNameEl.value.trim()) {
            ingName = customNameEl.value.trim();
          }

          if (ingName) {
            const rawUnit = unitEl ? unitEl.value : 'uds';
            const parsed = parseQuantityAndUnit(qtyEl ? qtyEl.value : 1, rawUnit);

            let finalUnit = rawUnit;
            if (unitEl && parsed.unit) {
              const opts = Array.from(unitEl.options).map(o => o.value);
              if (opts.includes(parsed.unit)) {
                finalUnit = parsed.unit;
                unitEl.value = parsed.unit;
              }
            }

            ingredients.push({
              name: ingName,
              quantity: parsed.quantity,
              unit: finalUnit,
              category: ingCategory
            });
          }
        });

        if (titleInput && titleInput.value.trim()) {
          const recipeData = {
            title: titleInput.value.trim(),
            category: catSelect.value,
            prep_time: parseInt(prepTimeInput.value) || 20,
            is_favorite: favChk.checked,
            meal_target: mealTargetSelect ? mealTargetSelect.value : 'both',
            ingredients: ingredients
          };

          const editId = editIdInput ? editIdInput.value : '';
          let res;
          if (editId) {
            res = appDb.updateRecipe(editId, recipeData);
            this.showToast('Receta actualizada con éxito ✏️');
          } else {
            res = appDb.addRecipe(recipeData);
            this.showToast('Nueva comida/receta guardada 🧑‍🍳');
          }

          if (res && res.auto_added_products_count > 0) {
            setTimeout(() => {
              this.showToast(`🍏 Se han añadido ${res.auto_added_products_count} nuevos ingredientes al catálogo de alimentos`);
            }, 800);
          }

          titleInput.value = '';
          if (editIdInput) editIdInput.value = '';
          this.closeAddRecipeModal();
          this.renderRecipes();
          this.renderWeeklyCalendar();
        }
      });
    }

    // Monitorización de conexión Online/Offline
    window.addEventListener('online', () => this.updateConnectionStatus(true));
    window.addEventListener('offline', () => this.updateConnectionStatus(false));
    this.updateConnectionStatus(navigator.onLine);

    // Cargar Tema Guardado
    const settings = appDb.getSettings();
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      appDb.saveSettings({ theme: 'light' });
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      appDb.saveSettings({ theme: 'dark' });
    }
    if (window.lucide) lucide.createIcons();
  }

  updateConnectionStatus(isOnline) {
    const dot = document.getElementById('connection-status-dot');
    const text = document.getElementById('connection-status-text');
    if (isOnline) {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse';
      if (text) text.textContent = 'Online';
    } else {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-500 inline-block';
      if (text) text.textContent = 'Modo Offline';
    }
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs border border-slate-700 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-brand-400"></i> ${msg}`;
    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // --- RENDER LANDING (QR) ---
  renderLanding() {
    const shoppingList = appDb.getShoppingList();
    const pendingCount = shoppingList.filter(i => i.status !== 'bought').length;

    const badgeLanding = document.getElementById('badge-landing-shopping-count');
    if (badgeLanding) badgeLanding.textContent = `${pendingCount} pendientes`;

    const badgeNav = document.getElementById('badge-nav-shopping-count');
    if (badgeNav) {
      if (pendingCount > 0) badgeNav.classList.remove('hidden');
      else badgeNav.classList.add('hidden');
    }

    // Menú de Hoy (asumiendo Lunes como día 1 para demo o según día actual)
    const menu = appDb.getWeeklyMenu();
    const todayIndex = new Date().getDay() === 0 ? 7 : new Date().getDay(); // 1: Lunes, 7: Domingo
    const todayData = menu.find(d => d.day_index === todayIndex) || menu[0];

    const todayName = document.getElementById('landing-today-name');
    const todayLunch = document.getElementById('landing-today-lunch');
    const todayDinner = document.getElementById('landing-today-dinner');

    if (todayName) todayName.textContent = todayData.day_name;
    if (todayLunch) {
      const lunchTitle = todayData.lunch.title || 'Sin planificar';
      todayLunch.textContent = lunchTitle;
      if (lunchTitle !== 'Sin planificar') {
        todayLunch.onclick = () => this.openRecipeDetailModal(todayData.lunch.recipe_id, lunchTitle);
        todayLunch.className = 'font-bold text-white light:text-slate-900 text-sm cursor-pointer hover:text-amber-400 transition flex items-center gap-1';
        todayLunch.title = 'Haz clic para ver ingredientes';
      }
    }
    if (todayDinner) {
      const dinnerTitle = todayData.dinner.title || 'Sin planificar';
      todayDinner.textContent = dinnerTitle;
      if (dinnerTitle !== 'Sin planificar') {
        todayDinner.onclick = () => this.openRecipeDetailModal(todayData.dinner.recipe_id, dinnerTitle);
        todayDinner.className = 'font-bold text-white light:text-slate-900 text-sm cursor-pointer hover:text-indigo-400 transition flex items-center gap-1';
        todayDinner.title = 'Haz clic para ver ingredientes';
      }
    }

    this.renderLandingPantryAlerts();
  }

  // --- AVISOS Y ALERTAS INTELIGENTES DE DESPENSA ---
  renderLandingPantryAlerts() {
    const insights = appDb.getProductInsightsAndAlerts();
    const container = document.getElementById('landing-pantry-alerts-container');
    const cardEl = document.getElementById('landing-pantry-alerts-card');
    const countEl = document.getElementById('landing-pantry-alerts-count');

    if (!container) return;

    // Limitar a máximo 2 sugerencias discretas y relevantes
    const alerts = (insights.alerts || []).slice(0, 2);
    if (countEl) countEl.textContent = `${alerts.length} avisos inteligentes`;

    if (alerts.length === 0) {
      if (cardEl) cardEl.classList.add('hidden');
      return;
    } else {
      if (cardEl) cardEl.classList.remove('hidden');
    }

    container.innerHTML = alerts.map(a => `
      <div class="p-3.5 rounded-2xl bg-slate-900/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-700/80">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
            ${a.icon}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-200 light:text-slate-800 leading-snug break-words">${a.message}</p>
            <span class="text-[10px] text-slate-400">Hace ${a.days_ago} días</span>
          </div>
        </div>
        <button onclick="appUi.addAlertToShopping('${a.name.replace(/'/g, "\\'")}', '${a.category}', '${a.unit}')"
          class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold whitespace-nowrap self-end sm:self-auto transition flex items-center gap-1">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> ${a.action_label}
        </button>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  addAlertToShopping(name, category, unit) {
    appDb.addShoppingItem({
      name: name,
      category: category || 'Despensa',
      quantity: 1,
      unit: unit || 'uds',
      status: 'pending',
      added_from_menu: false
    });

    this.renderLandingPantryAlerts();
    this.renderShoppingList();
    this.showToast(`'${name}' añadido a tu Lista de la Compra 🛒`);
  }

  // --- RENDER LISTA DE COMPRA ---
  renderShoppingList() {
    const list = appDb.getShoppingList();
    const container = document.getElementById('shopping-list-container');
    if (!container) return;

    // Calcular contadores por categoría
    const catCounts = {
      all: list.filter(i => i.status !== 'bought').length,
      Frescos: list.filter(i => i.category === 'Frescos' && i.status !== 'bought').length,
      Despensa: list.filter(i => i.category === 'Despensa' && i.status !== 'bought').length,
      Congelados: list.filter(i => i.category === 'Congelados' && i.status !== 'bought').length,
      Especias: list.filter(i => i.category === 'Especias' && i.status !== 'bought').length,
      Salsas: list.filter(i => i.category === 'Salsas' && i.status !== 'bought').length
    };

    Object.keys(catCounts).forEach(cat => {
      const el = document.getElementById(`cat-count-${cat}`);
      if (el) el.textContent = catCounts[cat];
    });

    // Filtrar la lista
    const filteredList = this.activeCategoryFilter === 'all'
      ? list
      : list.filter(i => i.category === this.activeCategoryFilter);

    if (filteredList.length === 0) {
      container.innerHTML = `
        <div class="glass-card p-8 rounded-2xl text-center border text-slate-400">
          <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto text-slate-600 mb-2"></i>
          <p class="font-bold text-base text-slate-300">¡No hay productos en esta categoría!</p>
          <p class="text-xs mt-1">Añade un producto al vuelo o abre el catálogo habitual.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Renderizar tarjetas de producto
    container.innerHTML = filteredList.map(item => {
      const isBought = item.status === 'bought';
      const isLowStock = item.status === 'low_stock';

      return `
        <div class="glass-card p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${isBought ? 'opacity-50 bg-slate-900/40' : ''}">
          <div class="flex items-center gap-3">
            <button onclick="appUi.toggleBought('${item.id}', '${item.status}')" 
              class="w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isBought ? 'bg-brand-500 border-brand-500 text-slate-950' : 'border-slate-600 hover:border-brand-400'}">
              ${isBought ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' : ''}
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-white light:text-slate-900 ${isBought ? 'line-through text-slate-400' : ''}">${item.name}</span>
                ${item.added_from_menu ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Del Menú</span>' : ''}
                ${isLowStock ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Casi agotado</span>' : ''}
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">${item.category}</span>
                <span>${item.quantity} ${item.unit || 'uds'}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Botón Casi Agotado -->
            <button onclick="appUi.setStatus('${item.id}', '${isLowStock ? 'pending' : 'low_stock'}')" title="Marcar casi agotado"
              class="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition">
              <i data-lucide="alert-circle" class="w-4 h-4 ${isLowStock ? 'text-amber-400' : ''}"></i>
            </button>

            <!-- Eliminar -->
            <button onclick="appUi.deleteShoppingItem('${item.id}')" title="Eliminar"
              class="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition">
              <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    this.renderLanding();
  }

  filterCategory(cat) {
    this.activeCategoryFilter = cat;
    document.querySelectorAll('.cat-pill').forEach(btn => {
      if (btn.textContent.includes(cat) || (cat === 'all' && btn.textContent.includes('Todas'))) {
        btn.className = 'cat-pill active px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition bg-brand-600 text-white';
      } else {
        btn.className = 'cat-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    });
    this.renderShoppingList();
  }

  toggleBought(id, currentStatus) {
    const newStatus = currentStatus === 'bought' ? 'pending' : 'bought';
    appDb.updateShoppingStatus(id, newStatus);
    this.renderShoppingList();
  }

  setStatus(id, status) {
    appDb.updateShoppingStatus(id, status);
    this.renderShoppingList();
  }

  deleteShoppingItem(id) {
    appDb.deleteShoppingItem(id);
    this.renderShoppingList();
    this.showToast('Producto eliminado');
  }

  clearBought() {
    appDb.clearBoughtItems();
    this.renderShoppingList();
    this.showToast('Productos comprados eliminados');
  }

  // --- MODAL DE CATÁLOGO Y ALIMENTOS ---
  openCatalogModal() {
    const modal = document.getElementById('modal-catalog');
    const container = document.getElementById('catalog-items-list');
    if (!modal || !container) return;

    const btnAlpha = document.getElementById('btn-catalog-sort-alpha');
    const btnUsage = document.getElementById('btn-catalog-sort-usage');
    const mode = this.catalogSortMode || 'alpha';

    if (btnAlpha && btnUsage) {
      if (mode === 'usage') {
        btnUsage.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-600 text-white shadow-sm';
        btnAlpha.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-slate-800 text-slate-300 hover:bg-slate-700';
      } else {
        btnAlpha.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-brand-600 text-white shadow-sm';
        btnUsage.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold transition bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    }

    const products = appDb.getProducts(mode);
    if (products.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400">
          <p class="text-sm font-semibold">No hay alimentos en el catálogo.</p>
          <button onclick="appUi.openAddProductModal()" class="mt-2 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold">
            + Crear Primer Alimento
          </button>
        </div>
      `;
    } else {
      container.innerHTML = products.map(p => `
        <div class="p-3 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-sm text-white light:text-slate-900">${p.name}</span>
              ${p.is_essential ? '<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">Esencial</span>' : ''}
              ${p.usage_count > 0 ? `<span class="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">🔥 ${p.usage_count} usos</span>` : ''}
            </div>
            <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>${p.category}</span>
              <span>• ${p.unit || p.default_unit || 'uds'}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="appUi.addFromCatalog('${p.name}', '${p.category}', '${p.unit || p.default_unit || 'uds'}')"
              class="px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Añadir
            </button>
            <button onclick="appUi.openEditProductModal('${p.id}')" title="Editar alimento"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="appUi.deleteProductFromCatalog('${p.id}')" title="Eliminar del catálogo"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }

  closeCatalogModal() {
    const modal = document.getElementById('modal-catalog');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  openAddProductModal() {
    this.closeCatalogModal();
    const modal = document.getElementById('modal-add-product');
    const form = document.getElementById('form-create-product');
    const headerTitle = document.getElementById('product-modal-header-title');
    const editIdInput = document.getElementById('edit-product-id');

    if (editIdInput) editIdInput.value = '';
    if (headerTitle) headerTitle.innerHTML = `<i data-lucide="apple" class="w-5 h-5 text-brand-400"></i> Crear Nuevo Alimento`;
    if (form) form.reset();

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) lucide.createIcons();
  }

  openEditProductModal(id) {
    const products = appDb.getProducts();
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    this.closeCatalogModal();
    const modal = document.getElementById('modal-add-product');
    const headerTitle = document.getElementById('product-modal-header-title');
    const editIdInput = document.getElementById('edit-product-id');
    const nameInput = document.getElementById('new-prod-name');
    const catSelect = document.getElementById('new-prod-category');
    const unitSelect = document.getElementById('new-prod-unit');
    const essentialChk = document.getElementById('new-prod-essential');

    if (editIdInput) editIdInput.value = prod.id;
    if (headerTitle) headerTitle.innerHTML = `<i data-lucide="pencil" class="w-5 h-5 text-brand-400"></i> Editar Alimento del Catálogo`;
    if (nameInput) nameInput.value = prod.name;
    if (catSelect) catSelect.value = prod.category || 'Frescos';
    if (unitSelect) unitSelect.value = prod.unit || prod.default_unit || 'uds';
    if (essentialChk) essentialChk.checked = !!prod.is_essential;

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) lucide.createIcons();
  }

  closeAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  deleteProductFromCatalog(id) {
    appDb.deleteProduct(id);
    this.openCatalogModal();
    this.showToast('Alimento eliminado del catálogo');
  }

  addFromCatalog(name, category, unit) {
    appDb.addShoppingItem({ name, category, unit, quantity: 1, status: 'pending' });
    this.renderShoppingList();
    this.showToast(`'${name}' añadido a la lista 🛒`);
  }

  // --- MODAL NFC Y QR NEVERA ---
  openNfcQrModal() {
    const modal = document.getElementById('modal-nfc-qr');
    const input = document.getElementById('nfc-url-input');
    const img = document.getElementById('qr-code-img');
    if (!modal) return;

    const currentUrl = window.location.href;
    if (input) input.value = currentUrl;
    if (img) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }

  closeNfcQrModal() {
    const modal = document.getElementById('modal-nfc-qr');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  copyNfcUrl() {
    const input = document.getElementById('nfc-url-input');
    if (input) {
      navigator.clipboard.writeText(input.value);
      this.showToast('¡Enlace para la pegatina NFC copiado! 📋');
    }
  }

  // --- RENDER CALENDARIO SEMANAL ---
  renderWeeklyCalendar() {
    const menu = appDb.getWeeklyMenu();
    const container = document.getElementById('weekly-calendar-container');
    if (!container) return;

    container.innerHTML = menu.map(day => `
      <div class="glass-card p-4 rounded-2xl border space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 class="font-bold text-base text-white light:text-slate-900 flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-brand-400">${day.day_index}</span>
            ${day.day_name}
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- COMIDA (LUNCH) -->
          ${this.renderMealCard(day.day_index, 'lunch', day.lunch)}

          <!-- CENA (DINNER) -->
          ${this.renderMealCard(day.day_index, 'dinner', day.dinner)}
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderMealCard(dayIndex, mealType, mealData) {
    const isLunch = mealType === 'lunch';
    const isCompleted = mealData.completed;
    const isLocked = mealData.locked;
    const hasTitle = mealData.title && mealData.title !== 'Sin planificar';

    return `
      <div class="p-3.5 rounded-xl bg-slate-900/70 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex flex-col justify-between space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider ${isLunch ? 'text-amber-400' : 'text-indigo-400'} flex items-center gap-1">
              <i data-lucide="${isLunch ? 'sun' : 'moon'}" class="w-3 h-3"></i> ${isLunch ? 'Comida' : 'Cena'}
            </span>
            <h4 onclick="appUi.openRecipeDetailByDayAndType(${dayIndex}, '${mealType}')"
              class="font-bold text-sm text-white light:text-slate-900 mt-1 cursor-pointer hover:text-brand-400 transition flex items-center gap-1.5 ${isCompleted ? 'line-through text-slate-400' : ''}">
              ${mealData.title || 'Sin planificar'}
              ${hasTitle ? '<i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400 hover:text-brand-400 transition"></i>' : ''}
            </h4>
            
            ${hasTitle ? `
              <button type="button" onclick="appUi.openRecipeDetailByDayAndType(${dayIndex}, '${mealType}')"
                class="mt-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold flex items-center gap-1.5 transition">
                <i data-lucide="utensils" class="w-3.5 h-3.5 text-brand-400"></i> Ver ingredientes 🍲
              </button>
            ` : ''}
          </div>
          
          <!-- Botón de Bloqueo de Receta (Favorito) -->
          <button onclick="appUi.toggleMealLock(${dayIndex}, '${mealType}')" title="${isLocked ? 'Desbloquear plato' : 'Bloquear receta en menú IA'}"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition flex-shrink-0">
            <i data-lucide="${isLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5 ${isLocked ? 'text-amber-400' : ''}"></i>
          </button>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 light:border-slate-300/60">
          <button onclick="appUi.toggleMealComplete(${dayIndex}, '${mealType}')"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${isCompleted ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}">
            <i data-lucide="${isCompleted ? 'check-circle-2' : 'circle'}" class="w-3.5 h-3.5"></i>
            ${isCompleted ? 'Realizado' : 'Marcar hecho'}
          </button>

          <button onclick="appUi.openAssignRecipeModal(${dayIndex}, '${mealType}', '')"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Cambiar receta">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  // --- MODAL DETALLE DE INGREDIENTES PARA COCINAR ---
  openRecipeDetailByDayAndType(dayIndex, mealType) {
    const menu = appDb.getWeeklyMenu();
    const day = menu.find(d => Number(d.day_index) === Number(dayIndex));
    if (!day) {
      console.warn('Día no encontrado en el menú semanal:', dayIndex);
      return;
    }
    const meal = day[mealType];
    if (!meal || !meal.title || meal.title === 'Sin planificar') {
      this.showToast('Este día aún no tiene una receta planificada');
      return;
    }
    this.openRecipeDetailModal(meal.recipe_id, meal.title);
  }

  openRecipeDetailModal(recipeId, recipeTitle) {
    if (!recipeTitle || recipeTitle === 'Sin planificar') return;

    const modal = document.getElementById('modal-recipe-detail');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const recipes = appDb.getRecipes();
    let recipe = null;

    if (recipeId) {
      recipe = recipes.find(r => r.id === recipeId);
    }
    if (!recipe && recipeTitle) {
      recipe = recipes.find(r => r.title.toLowerCase().trim() === recipeTitle.toLowerCase().trim());
    }

    const titleEl = document.getElementById('detail-recipe-title');
    const catEl = document.getElementById('detail-recipe-category');
    const targetEl = document.getElementById('detail-recipe-target');
    const prepTimeEl = document.getElementById('detail-recipe-preptime');
    const favEl = document.getElementById('detail-recipe-favorite');
    const ingCountEl = document.getElementById('detail-ingredients-count');
    const listEl = document.getElementById('detail-ingredients-list');
    const btnEdit = document.getElementById('btn-edit-detail-recipe');

    if (titleEl) titleEl.textContent = recipeTitle;

    if (recipe) {
      if (catEl) catEl.textContent = recipe.category || 'Saludable';
      if (targetEl) {
        const target = recipe.meal_target || 'both';
        targetEl.textContent = target === 'lunch' ? '☀️ Comida' : (target === 'dinner' ? '🌙 Cena' : '☀️🌙 Comida/Cena');
      }
      if (prepTimeEl) prepTimeEl.innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5 text-brand-400 inline"></i> ${recipe.prep_time || 20} minutos de preparación`;
      if (favEl) {
        if (recipe.is_favorite) favEl.classList.remove('hidden'); else favEl.classList.add('hidden');
      }

      if (btnEdit) {
        btnEdit.onclick = () => {
          this.closeRecipeDetailModal();
          this.openEditRecipeModal(recipe.id);
        };
      }

      const ings = recipe.ingredients || [];
      if (ingCountEl) ingCountEl.textContent = `${ings.length} ingredientes`;

      if (listEl) {
        if (ings.length === 0) {
          listEl.innerHTML = `<p class="text-xs text-slate-400 italic py-2">No hay ingredientes registrados para esta receta.</p>`;
        } else {
          listEl.innerHTML = ings.map((ing, idx) => `
            <label class="p-2.5 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-3 cursor-pointer hover:border-brand-500/40 transition">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="cook-ing-${idx}" class="w-4 h-4 rounded text-brand-500 bg-slate-950 border-slate-700 focus:ring-0 focus:ring-offset-0" />
                <span class="text-xs font-bold text-white light:text-slate-900">${ing.name}</span>
              </div>
              <div class="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                ${ing.quantity} ${ing.unit || 'uds'}
              </div>
            </label>
          `).join('');
        }
      }
    } else {
      if (catEl) catEl.textContent = 'Personalizado';
      if (targetEl) targetEl.textContent = 'Plato Libre';
      if (prepTimeEl) prepTimeEl.innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5 text-brand-400 inline"></i> 15-20 minutos`;
      if (favEl) favEl.classList.add('hidden');
      if (ingCountEl) ingCountEl.textContent = 'Plato sin receta';

      if (listEl) {
        listEl.innerHTML = `
          <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p class="text-xs text-slate-400">Este plato fue añadido manualmente sin estar guardado en tu recetario.</p>
            <button onclick="appUi.closeRecipeDetailModal(); appUi.openAddRecipeModal();" class="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
              + Crear Receta para '${safeTitleEscaped}'
            </button>
          </div>
        `;
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }

  closeRecipeDetailModal() {
    const modal = document.getElementById('modal-recipe-detail');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  toggleMealComplete(dayIndex, mealType) {
    appDb.toggleMealComplete(dayIndex, mealType);
    this.renderWeeklyCalendar();
    this.renderLanding();
  }

  toggleMealLock(dayIndex, mealType) {
    appDb.toggleMealLock(dayIndex, mealType);
    this.renderWeeklyCalendar();
    this.showToast('Preferencia de plato actualizada 🔒');
  }

  // --- MODAL DE CAMBIO DE RECETA ---
  openAssignRecipeModal(dayIndex, mealType, currentTitle) {
    this.assignTarget = { dayIndex, mealType };
    const modal = document.getElementById('modal-assign-recipe');
    const select = document.getElementById('select-assign-recipe-id');
    const customInput = document.getElementById('input-assign-custom-title');

    if (!modal || !select) return;

    const recipes = appDb.getRecipes();
    select.innerHTML = '<option value="">-- Seleccionar de Recetario --</option>' +
      recipes.map(r => {
        const tag = r.meal_target === 'lunch' ? '☀️ Comida' : r.meal_target === 'dinner' ? '🌙 Cena' : '☀️🌙';
        return `<option value="${r.id}">${tag} | ${r.title} (${r.category})</option>`;
      }).join('');

    if (customInput) customInput.value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeAssignRecipeModal() {
    const modal = document.getElementById('modal-assign-recipe');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  confirmAssignRecipe() {
    if (!this.assignTarget) return;

    const select = document.getElementById('select-assign-recipe-id');
    const customInput = document.getElementById('input-assign-custom-title');
    const recipes = appDb.getRecipes();

    let recipeId = null;
    let recipeTitle = 'Sin planificar';

    if (customInput && customInput.value.trim()) {
      recipeTitle = customInput.value.trim();
    } else if (select && select.value) {
      const selected = recipes.find(r => r.id === select.value);
      if (selected) {
        recipeId = selected.id;
        recipeTitle = selected.title;
      }
    }

    appDb.updateMeal(this.assignTarget.dayIndex, this.assignTarget.mealType, recipeId, recipeTitle);
    this.closeAssignRecipeModal();
    this.renderWeeklyCalendar();
    this.renderLanding();
    this.showToast('Menú actualizado correctamente 📅');
  }

  // --- INTEGRACIÓN MENÚ IA VÍA WEBHOOK N8N ---
  async generateAIMenu() {
    const btn = document.getElementById('btn-generate-ai-menu');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Generando Menú con IA...`;
      if (window.lucide) lucide.createIcons();
    }

    try {
      const result = await appDb.generateAIMenuWithN8n();
      this.renderWeeklyCalendar();
      this.renderLanding();

      if (result.is_simulation) {
        this.showToast('Menú generado mediante simulador inteligente offline 🤖');
      } else {
        this.showToast('¡Menú semanal generado con IA vía n8n! ✨');
      }
    } catch (err) {
      this.showToast('Error al generar menú: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i> <span>Generar Menú Equilibrado (n8n IA)</span>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  // --- REVISIÓN INTERACTIVA DE INGREDIENTES Y DESPANSA ---
  openCheckIngredientsModal() {
    const modal = document.getElementById('modal-check-ingredients');
    const container = document.getElementById('check-ingredients-list');
    const countText = document.getElementById('check-ingredients-count-text');
    if (!modal || !container) return;

    const ingredients = appDb.getWeeklyIngredientsSummary();

    if (countText) {
      countText.textContent = `${ingredients.length} ingredientes en tu menú semanal`;
    }

    if (ingredients.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400">
          <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-600 mb-2"></i>
          <p class="text-sm font-semibold">No hay recetas asignadas en el menú de esta semana.</p>
          <p class="text-xs mt-1 text-slate-500">Planifica tus comidas primero o genera un menú con IA.</p>
        </div>
      `;
    } else {
      container.innerHTML = ingredients.map((ing) => `
        <label class="p-3 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-3 cursor-pointer hover:border-brand-500/40 transition">
          <div class="flex items-center gap-3">
            <input type="checkbox" class="check-ing-item w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-700"
              data-name="${ing.name}" data-cat="${ing.category}" data-qty="${ing.quantity}" data-unit="${ing.unit}" checked />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-white light:text-slate-900">${ing.name}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">${ing.category}</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Receta(s): ${ing.meals.join(', ')}</p>
            </div>
          </div>
          <span class="text-xs font-bold text-brand-400 whitespace-nowrap">${ing.quantity} ${ing.unit}</span>
        </label>
      `).join('');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }

  closeCheckIngredientsModal() {
    const modal = document.getElementById('modal-check-ingredients');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  toggleAllCheckIngredients(checked) {
    const checkboxes = document.querySelectorAll('.check-ing-item');
    checkboxes.forEach(chk => chk.checked = checked);
  }

  confirmImportSelectedIngredients() {
    const checkboxes = document.querySelectorAll('.check-ing-item:checked');
    if (checkboxes.length === 0) {
      this.showToast('No has seleccionado ningún ingrediente para añadir');
      return;
    }

    let addedCount = 0;
    checkboxes.forEach(chk => {
      appDb.addShoppingItem({
        name: chk.dataset.name,
        category: chk.dataset.cat || 'Frescos',
        quantity: parseFloat(chk.dataset.qty) || 1,
        unit: chk.dataset.unit || 'uds',
        status: 'pending',
        added_from_menu: true
      });
      addedCount++;
    });

    this.closeCheckIngredientsModal();
    this.renderShoppingList();
    this.showToast(`Se han añadido ${addedCount} ingredientes a la Lista de la Compra 🛒`);
  }

  filterRecipeCategory(cat) {
    this.activeRecipeCategoryFilter = cat;
    document.querySelectorAll('.recipe-cat-pill').forEach(btn => {
      btn.classList.remove('bg-brand-600', 'text-white', 'active');
      if (!btn.className.includes('amber')) {
        btn.classList.add('bg-slate-800', 'text-slate-300');
      }
    });

    const activeBtn = Array.from(document.querySelectorAll('.recipe-cat-pill')).find(btn => {
      if (cat === 'all' && btn.textContent.includes('Todas')) return true;
      return btn.textContent.includes(cat);
    });

    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
      activeBtn.classList.add('bg-brand-600', 'text-white', 'active');
    }

    this.renderRecipes();
  }

  // --- RENDER RECETAS Y CREADOR DE COMIDAS ---
  renderRecipes() {
    const allRecipes = appDb.getRecipes();
    const activeCat = this.activeRecipeCategoryFilter || 'all';
    const recipes = activeCat === 'all' 
      ? allRecipes 
      : allRecipes.filter(r => r.category === activeCat);

    const container = document.getElementById('recipes-list-container');
    if (!container) return;

    if (recipes.length === 0) {
      container.innerHTML = `
        <div class="glass-card p-8 rounded-2xl text-center border text-slate-400 col-span-full">
          <i data-lucide="chef-hat" class="w-12 h-12 mx-auto text-slate-600 mb-2"></i>
          <p class="font-bold text-base text-slate-300">¡Aún no has creado recetas!</p>
          <button onclick="appUi.openAddRecipeModal()" class="mt-3 px-4 py-2 rounded-xl bg-accent-600 text-white font-bold text-xs">
            + Crear Primera Receta / Comida
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = recipes.map(r => {
      const targetBadge = r.meal_target === 'lunch'
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">☀️ Comida</span>'
        : r.meal_target === 'dinner'
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">🌙 Cena</span>'
        : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">☀️🌙 Comida/Cena</span>';

      return `
        <div class="glass-card p-4 rounded-2xl border space-y-3 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">${r.category}</span>
                  ${targetBadge}
                </div>
                <h3 class="font-bold text-base text-white light:text-slate-900 mt-1">${r.title}</h3>
                <p class="text-xs text-slate-400">⏱️ ${r.prep_time} min de preparación</p>
              </div>
              <div class="flex items-center gap-1">
                ${r.is_favorite ? '<i data-lucide="heart" class="w-5 h-5 text-rose-500 fill-rose-500"></i>' : ''}
                <button onclick="appUi.openEditRecipeModal('${r.id}')" title="Editar comida/receta"
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-accent-500/20 text-slate-400 hover:text-accent-400 transition">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="appUi.deleteRecipe('${r.id}')" title="Eliminar comida/receta"
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <div class="border-t border-slate-800/80 pt-2">
              <span class="text-xs font-semibold text-slate-400">Ingredientes:</span>
              <ul class="text-xs text-slate-300 space-y-1 mt-1">
                ${(r.ingredients || []).length > 0
                  ? r.ingredients.map(ing => `
                      <li class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                        <span>${ing.name} (${ing.quantity} ${ing.unit})</span>
                      </li>
                    `).join('')
                  : '<li class="text-slate-500 italic text-[11px]">Sin ingredientes especificados</li>'
                }
              </ul>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    this.renderConsumptionAnalytics();
  }

  renderConsumptionAnalytics() {
    const insights = appDb.getProductInsightsAndAlerts();
    const mostList = document.getElementById('most-consumed-list');
    const leastList = document.getElementById('least-consumed-list');

    if (mostList) {
      const most = insights.most_consumed || [];
      if (most.length === 0) {
        mostList.innerHTML = `<p class="text-slate-400 italic text-[11px]">Aún no hay suficientes datos de consumo.</p>`;
      } else {
        mostList.innerHTML = most.map(p => `
          <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span class="font-bold text-white">${p.name} (${p.category})</span>
            <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">${p.usage_count} usos</span>
          </div>
        `).join('');
      }
    }

    if (leastList) {
      const least = insights.least_consumed || [];
      if (least.length === 0) {
        leastList.innerHTML = `<p class="text-slate-400 italic text-[11px]">Todos los productos del catálogo han sido utilizados al menos una vez.</p>`;
      } else {
        leastList.innerHTML = least.map(p => `
          <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span class="font-bold text-slate-300">${p.name} (${p.category})</span>
            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-medium">Sin usar</span>
          </div>
        `).join('');
      }
    }
  }

  openAddRecipeModal() {
    const modal = document.getElementById('modal-add-recipe');
    const form = document.getElementById('form-create-recipe');
    const titleHeader = document.getElementById('recipe-modal-header-title');
    const editIdInput = document.getElementById('edit-recipe-id');
    const mealTargetSelect = document.getElementById('new-recipe-mealtarget');
    const ingRowsContainer = document.getElementById('recipe-ingredients-rows');

    if (editIdInput) editIdInput.value = '';
    if (titleHeader) titleHeader.innerHTML = `<i data-lucide="chef-hat" class="w-5 h-5 text-accent-400"></i> Nueva Comida / Receta`;
    if (form) form.reset();
    if (mealTargetSelect) mealTargetSelect.value = 'both';

    if (ingRowsContainer) {
      ingRowsContainer.innerHTML = '';
      // Añadir 2 filas por defecto
      this.addIngredientRowToForm();
      this.addIngredientRowToForm();
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) lucide.createIcons();
  }

  openEditRecipeModal(id) {
    const recipes = appDb.getRecipes();
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    const modal = document.getElementById('modal-add-recipe');
    const titleHeader = document.getElementById('recipe-modal-header-title');
    const editIdInput = document.getElementById('edit-recipe-id');
    const titleInput = document.getElementById('new-recipe-title');
    const catSelect = document.getElementById('new-recipe-category');
    const mealTargetSelect = document.getElementById('new-recipe-mealtarget');
    const prepTimeInput = document.getElementById('new-recipe-preptime');
    const favChk = document.getElementById('new-recipe-favorite');
    const ingRowsContainer = document.getElementById('recipe-ingredients-rows');

    if (editIdInput) editIdInput.value = recipe.id;
    if (titleHeader) titleHeader.innerHTML = `<i data-lucide="chef-hat" class="w-5 h-5 text-accent-400"></i> Editar Receta / Comida`;
    if (titleInput) titleInput.value = recipe.title;
    if (catSelect) catSelect.value = recipe.category || 'Saludable';
    if (mealTargetSelect) mealTargetSelect.value = recipe.meal_target || 'both';
    if (prepTimeInput) prepTimeInput.value = recipe.prep_time || 20;
    if (favChk) favChk.checked = !!recipe.is_favorite;

    if (ingRowsContainer) {
      ingRowsContainer.innerHTML = '';
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        recipe.ingredients.forEach(ing => {
          this.addIngredientRowToForm(ing.name, ing.quantity, ing.unit, ing.category || 'Frescos');
        });
      } else {
        this.addIngredientRowToForm();
      }
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) lucide.createIcons();
  }

  closeAddRecipeModal() {
    const modal = document.getElementById('modal-add-recipe');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  addIngredientRowToForm(name = '', qty = 1, unit = 'uds', category = 'Frescos') {
    const container = document.getElementById('recipe-ingredients-rows');
    if (!container) return;

    const sortMode = this.catalogSortMode || 'alpha';
    const products = appDb.getProducts(sortMode);
    const cleanName = name ? name.trim() : '';

    // Buscar si el nombre coincide con un producto existente en el catálogo
    let matchedProduct = null;
    if (cleanName) {
      matchedProduct = products.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
    }

    const isCustom = cleanName !== '' && !matchedProduct;
    const activeCategory = matchedProduct ? (matchedProduct.category || 'Frescos') : (category || 'Frescos');

    const row = document.createElement('div');
    row.className = 'ingredient-row space-y-1.5 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800';

    // Opciones del selector de productos del catálogo
    const productOptions = products.map(p => {
      const selected = matchedProduct && matchedProduct.id === p.id ? 'selected' : '';
      const usageTag = p.usage_count > 0 ? ` 🔥(${p.usage_count})` : '';
      return `<option value="${p.id}" data-name="${p.name}" data-unit="${p.unit || p.default_unit || 'uds'}" data-cat="${p.category}" ${selected}>${p.name} (${p.category})${usageTag}</option>`;
    }).join('');

    const newOptionSelected = isCustom ? 'selected' : '';

    row.innerHTML = `
      <div class="flex items-center gap-2">
        <select class="ing-select flex-1 px-3 py-1.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs text-white light:text-slate-900 focus:border-brand-500">
          <option value="">-- Seleccionar alimento de mi catálogo --</option>
          ${productOptions}
          <option value="__NEW__" ${newOptionSelected}>➕ Escribir alimento nuevo...</option>
        </select>
        <input type="text" value="${qty}" placeholder="Cant."
          class="ing-qty w-16 px-2 py-1.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs text-center font-bold text-white light:text-slate-900" />
        <select class="ing-unit px-2 py-1.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-[11px] text-white light:text-slate-900">
          <option value="uds" ${unit === 'uds' ? 'selected' : ''}>uds</option>
          <option value="kg" ${unit === 'kg' ? 'selected' : ''}>kg</option>
          <option value="g" ${unit === 'g' ? 'selected' : ''}>g</option>
          <option value="l" ${unit === 'l' ? 'selected' : ''}>l</option>
          <option value="ml" ${unit === 'ml' ? 'selected' : ''}>ml</option>
          <option value="docena" ${unit === 'docena' ? 'selected' : ''}>docena</option>
          <option value="bolsa" ${unit === 'bolsa' ? 'selected' : ''}>bolsa</option>
          <option value="paquete" ${unit === 'paquete' ? 'selected' : ''}>paquete</option>
          <option value="dientes" ${unit === 'dientes' ? 'selected' : ''}>dientes</option>
          <option value="pizca" ${unit === 'pizca' ? 'selected' : ''}>pizca</option>
          <option value="lata" ${unit === 'lata' ? 'selected' : ''}>lata</option>
          <option value="latas" ${unit === 'latas' ? 'selected' : ''}>latas</option>
        </select>
        <button type="button" onclick="this.closest('.ingredient-row').remove()" class="p-1 text-slate-400 hover:text-rose-400">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="ing-custom-container flex flex-col sm:flex-row items-center gap-2 ${isCustom ? '' : 'hidden'}">
        <input type="text" placeholder="Escribe el nombre del alimento nuevo..." value="${isCustom ? cleanName : ''}"
          class="ing-custom-name flex-1 w-full px-3 py-1.5 rounded-xl bg-slate-900 light:bg-white border border-amber-500/50 text-xs text-white light:text-slate-900 placeholder-amber-400/60" />
        <select class="ing-category px-3 py-1.5 rounded-xl bg-slate-900 light:bg-white border border-amber-500/50 text-xs text-amber-300 light:text-slate-900 font-medium">
          <option value="Frescos" ${activeCategory === 'Frescos' ? 'selected' : ''}>🥬 Frescos</option>
          <option value="Despensa" ${activeCategory === 'Despensa' ? 'selected' : ''}>🥫 Despensa</option>
          <option value="Congelados" ${activeCategory === 'Congelados' ? 'selected' : ''}>❄️ Congelados</option>
          <option value="Especias" ${activeCategory === 'Especias' ? 'selected' : ''}>🌿 Especias</option>
          <option value="Salsas" ${activeCategory === 'Salsas' ? 'selected' : ''}>🥫 Salsas</option>
        </select>
      </div>
    `;

    container.appendChild(row);

    const selectEl = row.querySelector('.ing-select');
    const customContainerEl = row.querySelector('.ing-custom-container');
    const customNameEl = row.querySelector('.ing-custom-name');
    const unitEl = row.querySelector('.ing-unit');

    selectEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === '__NEW__') {
        customContainerEl.classList.remove('hidden');
        customNameEl.focus();
      } else {
        customContainerEl.classList.add('hidden');
        customNameEl.value = '';
        if (val) {
          const opt = e.target.options[e.target.selectedIndex];
          const autoUnit = opt ? (opt.dataset.unit || 'uds') : 'uds';
          if (unitEl) unitEl.value = autoUnit;
        }
      }
    });

    if (window.lucide) lucide.createIcons();
  }

  deleteRecipe(id) {
    if (confirm('¿Seguro que deseas eliminar esta comida/receta del recetario?')) {
      appDb.deleteRecipe(id);
      this.renderRecipes();
      this.renderWeeklyCalendar();
      this.showToast('Receta eliminada del catálogo');
    }
  }

  // --- CONFIGURACIÓN & FORMULARIOS ---
  loadSettingsForm() {
    const settings = appDb.getSettings();
    const customRulesInput = document.getElementById('setting-custom-rules');
    const n8nUrlInput = document.getElementById('setting-n8n-url');
    const geminiKeyInput = document.getElementById('setting-gemini-key');
    const supabaseUrlInput = document.getElementById('setting-supabase-url');
    const supabaseKeyInput = document.getElementById('setting-supabase-key');

    if (customRulesInput) customRulesInput.value = settings.custom_rules || '';
    if (n8nUrlInput) n8nUrlInput.value = settings.n8n_url || '';
    if (geminiKeyInput) geminiKeyInput.value = settings.gemini_key || '';
    if (supabaseUrlInput) supabaseUrlInput.value = settings.supabase_url || '';
    if (supabaseKeyInput) supabaseKeyInput.value = settings.supabase_key || '';
  }

  saveSettingsForm() {
    const customRulesInput = document.getElementById('setting-custom-rules');
    const n8nUrlInput = document.getElementById('setting-n8n-url');
    const geminiKeyInput = document.getElementById('setting-gemini-key');
    const supabaseUrlInput = document.getElementById('setting-supabase-url');
    const supabaseKeyInput = document.getElementById('setting-supabase-key');

    appDb.saveSettings({
      custom_rules: customRulesInput ? customRulesInput.value.trim() : '',
      n8n_url: n8nUrlInput ? n8nUrlInput.value.trim() : '',
      gemini_key: geminiKeyInput ? geminiKeyInput.value.trim() : '',
      supabase_url: supabaseUrlInput ? supabaseUrlInput.value.trim() : '',
      supabase_key: supabaseKeyInput ? supabaseKeyInput.value.trim() : ''
    });

    this.showToast('Reglas y configuración guardadas con éxito ⚙️');
  }

  resetToDefaults() {
    if (confirm('¿Deseas restablecer todos los datos a la configuración inicial de ejemplo?')) {
      localStorage.clear();
      appDb.init();
      appNav.navigate('landing');
      this.showToast('Datos de ejemplo restablecidos');
    }
  }
}

window.appUi = new AppUI();

// Inicialización de vista al cargar
document.addEventListener('DOMContentLoaded', () => {
  appNav.navigate('landing');
});
