/**
 * DB.JS - Capa de gestión de datos y almacenamiento (LocalStorage + Supabase + n8n)
 */

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Leche entera', category: 'Despensa', unit: 'l', is_essential: true },
  { id: 'p2', name: 'Huevos camperos', category: 'Frescos', unit: 'docena', is_essential: true },
  { id: 'p3', name: 'Pechuga de pollo', category: 'Frescos', unit: 'kg', is_essential: true },
  { id: 'p4', name: 'Arroz integral', category: 'Despensa', unit: 'kg', is_essential: true },
  { id: 'p5', name: 'Aceite de Oliva VV', category: 'Despensa', unit: 'l', is_essential: true },
  { id: 'p6', name: 'Tomates ensalada', category: 'Frescos', unit: 'kg', is_essential: false },
  { id: 'p7', name: 'Espinacas frescas', category: 'Frescos', unit: 'bolsa', is_essential: false },
  { id: 'p8', name: 'Salmón congelado', category: 'Congelados', unit: 'paquete', is_essential: false },
  { id: 'p9', name: 'Guisantes congelados', category: 'Congelados', unit: 'kg', is_essential: false },
  { id: 'p10', name: 'Orégano seco', category: 'Especias', unit: 'bote', is_essential: false },
  { id: 'p11', name: 'Pimentón de la Vera', category: 'Especias', unit: 'bote', is_essential: false },
  { id: 'p12', name: 'Ajo', category: 'Frescos', unit: 'cabeza', is_essential: true },
  { id: 'p13', name: 'Cebolla', category: 'Frescos', unit: 'kg', is_essential: true },
  { id: 'p14', name: 'Pasta Penne', category: 'Despensa', unit: 'paquete', is_essential: true },
  { id: 'p15', name: 'Tomate frito', category: 'Salsas', unit: 'bote', is_essential: true },
  { id: 'p16', name: 'Salsa de Soja', category: 'Salsas', unit: 'bote', is_essential: false },
  { id: 'p17', name: 'Mayonesa', category: 'Salsas', unit: 'bote', is_essential: false },
  { id: 'p18', name: 'Papel higiénico', category: 'Baño', unit: 'paquete', is_essential: true },
  { id: 'p19', name: 'Gel de baño / Champú', category: 'Baño', unit: 'bote', is_essential: true },
  { id: 'p20', name: 'Detergente ropa', category: 'Limpieza', unit: 'bote', is_essential: true },
  { id: 'p21', name: 'Lavavajillas', category: 'Limpieza', unit: 'bote', is_essential: true },
  { id: 'p22', name: 'Limpiasuelos / Lejía', category: 'Limpieza', unit: 'bote', is_essential: false }
];

const DEFAULT_RECIPES = [
  {
    id: 'r1',
    title: 'Pollo a la Plancha con Ensalada',
    category: 'Saludable',
    prep_time: 20,
    is_favorite: true,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Pechuga de pollo', category: 'Frescos', quantity: 0.5, unit: 'kg' },
      { name: 'Tomates ensalada', category: 'Frescos', quantity: 2, unit: 'uds' },
      { name: 'Espinacas frescas', category: 'Frescos', quantity: 1, unit: 'bolsa' }
    ]
  },
  {
    id: 'r2',
    title: 'Salmón al Horno con Guisantes',
    category: 'Pescado',
    prep_time: 25,
    is_favorite: true,
    meal_target: 'dinner',
    ingredients: [
      { name: 'Salmón congelado', category: 'Congelados', quantity: 2, unit: 'paquete' },
      { name: 'Guisantes congelados', category: 'Congelados', quantity: 0.3, unit: 'kg' },
      { name: 'Ajo', category: 'Frescos', quantity: 2, unit: 'dientes' }
    ]
  },
  {
    id: 'r3',
    title: 'Pasta Penne con Tomate y Orégano',
    category: 'Pasta',
    prep_time: 15,
    is_favorite: false,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Pasta Penne', category: 'Despensa', quantity: 1, unit: 'paquete' },
      { name: 'Tomates ensalada', category: 'Frescos', quantity: 3, unit: 'uds' },
      { name: 'Orégano seco', category: 'Especias', quantity: 1, unit: 'pizca' }
    ]
  },
  {
    id: 'r4',
    title: 'Tortilla de Patatas con Ensalada',
    category: 'Hogar',
    prep_time: 30,
    is_favorite: true,
    meal_target: 'dinner',
    ingredients: [
      { name: 'Huevos camperos', category: 'Frescos', quantity: 6, unit: 'uds' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'kg' },
      { name: 'Aceite de Oliva VV', category: 'Despensa', quantity: 0.2, unit: 'l' }
    ]
  },
  {
    id: 'r5',
    title: 'Arroz Integral con Salteado de Verduras',
    category: 'Vegetariano',
    prep_time: 30,
    is_favorite: false,
    meal_target: 'both',
    ingredients: [
      { name: 'Arroz integral', category: 'Despensa', quantity: 0.3, unit: 'kg' },
      { name: 'Espinacas frescas', category: 'Frescos', quantity: 1, unit: 'bolsa' },
      { name: 'Guisantes congelados', category: 'Congelados', quantity: 0.2, unit: 'kg' }
    ]
  },
  {
    id: 'r6',
    title: 'Salsa Boloñesa Casera',
    category: 'Salsas',
    prep_time: 35,
    is_favorite: true,
    meal_target: 'both',
    ingredients: [
      { name: 'Carne picada de ternera', category: 'Frescos', quantity: 0.4, unit: 'kg' },
      { name: 'Tomate frito', category: 'Salsas', quantity: 1, unit: 'bote' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Ajo', category: 'Frescos', quantity: 2, unit: 'dientes' },
      { name: 'Orégano seco', category: 'Especias', quantity: 1, unit: 'pizca' }
    ]
  },
  {
    id: 'r7',
    title: 'Salsa Pesto de Albahaca Casera',
    category: 'Salsas',
    prep_time: 10,
    is_favorite: true,
    meal_target: 'both',
    ingredients: [
      { name: 'Albahaca fresca', category: 'Frescos', quantity: 1, unit: 'bolsa' },
      { name: 'Aceite de Oliva VV', category: 'Despensa', quantity: 0.1, unit: 'l' },
      { name: 'Queso Parmesano', category: 'Frescos', quantity: 0.1, unit: 'kg' },
      { name: 'Ajo', category: 'Frescos', quantity: 1, unit: 'dientes' }
    ]
  }
];

const INITIAL_SHOPPING_LIST = [
  { id: 's1', name: 'Leche entera', category: 'Despensa', quantity: 2, unit: 'l', status: 'pending', added_from_menu: false },
  { id: 's2', name: 'Huevos camperos', category: 'Frescos', quantity: 1, unit: 'docena', status: 'low_stock', added_from_menu: false },
  { id: 's3', name: 'Espinacas frescas', category: 'Frescos', quantity: 1, unit: 'bolsa', status: 'bought', added_from_menu: true }
];

const DAYS_OF_WEEK = [
  { index: 1, name: 'Lunes' },
  { index: 2, name: 'Martes' },
  { index: 3, name: 'Miércoles' },
  { index: 4, name: 'Jueves' },
  { index: 5, name: 'Viernes' },
  { index: 6, name: 'Sábado' },
  { index: 7, name: 'Domingo' }
];

function generateInitialMenu() {
  return DAYS_OF_WEEK.map(d => ({
    day_index: d.index,
    day_name: d.name,
    lunch: d.index === 1 ? { recipe_id: 'r1', title: 'Pollo a la Plancha con Ensalada', completed: false, locked: true } :
           d.index === 2 ? { recipe_id: 'r3', title: 'Pasta Penne con Tomate y Orégano', completed: false, locked: false } :
           d.index === 3 ? { recipe_id: 'r5', title: 'Arroz Integral con Salteado de Verduras', completed: false, locked: false } :
           { recipe_id: null, title: 'Sin planificar', completed: false, locked: false },
    dinner: d.index === 1 ? { recipe_id: 'r2', title: 'Salmón al Horno con Guisantes', completed: false, locked: false } :
            d.index === 2 ? { recipe_id: 'r4', title: 'Tortilla de Patatas con Ensalada', completed: false, locked: true } :
            { recipe_id: null, title: 'Sin planificar', completed: false, locked: false }
  }));
}

class AppDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('qr_menu_products')) {
      localStorage.setItem('qr_menu_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('qr_menu_recipes')) {
      localStorage.setItem('qr_menu_recipes', JSON.stringify(DEFAULT_RECIPES));
    }
    if (!localStorage.getItem('qr_menu_shopping')) {
      localStorage.setItem('qr_menu_shopping', JSON.stringify(INITIAL_SHOPPING_LIST));
    }
    if (!localStorage.getItem('qr_menu_weekly')) {
      localStorage.setItem('qr_menu_weekly', JSON.stringify(generateInitialMenu()));
    }
    if (!localStorage.getItem('qr_menu_settings')) {
      localStorage.setItem('qr_menu_settings', JSON.stringify({
        n8n_url: '',
        supabase_url: '',
        supabase_key: '',
        theme: 'dark'
      }));
    }

    // Inicializar Sincronización Multidispositivo en la Nube
    this.initCloudSync();
  }

  // --- REAL-TIME MULTI-DEVICE CLOUD SYNC ---
  initCloudSync() {
    this.cloudSyncId = 'ff8081819f7e10ae019fc87fc1f06aa2';
    this.isSyncing = false;

    // Primer pull al arrancar
    this.pullCloudSync();

    // Polling ligero en segundo plano cada 6 segundos para sincronización instantánea entre móviles
    if (!this._cloudSyncInterval) {
      this._cloudSyncInterval = setInterval(() => {
        this.pullCloudSync(true);
      }, 6000);
    }

    // Sincronizar automáticamente cuando el usuario desbloquea o vuelve a la app
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.pullCloudSync();
      }
    });

    window.addEventListener('focus', () => {
      this.pullCloudSync();
    });
  }

  async pullCloudSync(isSilent = false) {
    if (this.isSyncing) return;
    try {
      this.isSyncing = true;
      const res = await fetch(`https://api.restful-api.dev/objects/${this.cloudSyncId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!json || !json.data) return;

      const cloudData = json.data;
      const localLastSync = parseInt(localStorage.getItem('qr_menu_last_cloud_sync') || '0');

      // Si la nube tiene datos más recientes que los locales, actualizar local
      if (cloudData.updated_at && cloudData.updated_at > localLastSync) {
        if (cloudData.products && Array.isArray(cloudData.products)) {
          localStorage.setItem('qr_menu_products', JSON.stringify(cloudData.products));
        }
        if (cloudData.recipes && Array.isArray(cloudData.recipes)) {
          localStorage.setItem('qr_menu_recipes', JSON.stringify(cloudData.recipes));
        }
        if (cloudData.shopping && Array.isArray(cloudData.shopping)) {
          localStorage.setItem('qr_menu_shopping', JSON.stringify(cloudData.shopping));
        }
        if (cloudData.weekly && Array.isArray(cloudData.weekly)) {
          localStorage.setItem('qr_menu_weekly', JSON.stringify(cloudData.weekly));
        }
        localStorage.setItem('qr_menu_last_cloud_sync', String(cloudData.updated_at));

        if (window.appUi && typeof window.appUi.refreshCurrentView === 'function') {
          window.appUi.refreshCurrentView();
        }
        this.updateSyncIndicator(true);
      } else if (!isSilent) {
        this.updateSyncIndicator(true);
      }
    } catch (err) {
      console.warn('Pull cloud sync error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushCloudSync() {
    const timestamp = Date.now();
    localStorage.setItem('qr_menu_last_cloud_sync', String(timestamp));

    const payload = {
      name: 'diata_family_juanm',
      data: {
        updated_at: timestamp,
        products: JSON.parse(localStorage.getItem('qr_menu_products') || '[]'),
        recipes: JSON.parse(localStorage.getItem('qr_menu_recipes') || '[]'),
        shopping: JSON.parse(localStorage.getItem('qr_menu_shopping') || '[]'),
        weekly: JSON.parse(localStorage.getItem('qr_menu_weekly') || '[]')
      }
    };

    try {
      this.updateSyncIndicator('syncing');
      const res = await fetch(`https://api.restful-api.dev/objects/${this.cloudSyncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.updateSyncIndicator(true);
      } else {
        this.updateSyncIndicator(false);
      }
    } catch (err) {
      console.warn('Push cloud sync error:', err);
      this.updateSyncIndicator(false);
    }
  }

  updateSyncIndicator(state) {
    const dot = document.getElementById('connection-status-dot');
    const text = document.getElementById('connection-status-text');
    if (!dot || !text) return;

    if (state === 'syncing') {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping';
      text.textContent = 'Sincronizando...';
    } else if (state === true) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse';
      text.textContent = 'En la Nube (Sincronizado)';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-slate-500 inline-block';
      text.textContent = 'Modo Local';
    }
  }

  // --- COMPRA ---
  getShoppingList() {
    const list = JSON.parse(localStorage.getItem('qr_menu_shopping') || '[]');
    return list.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  saveShoppingList(list) {
    localStorage.setItem('qr_menu_shopping', JSON.stringify(list));
    this.pushCloudSync();
  }

  addShoppingItem(item) {
    const list = this.getShoppingList();
    const existing = list.find(i => i.name.toLowerCase() === item.name.toLowerCase() && i.status !== 'bought');
    if (existing) {
      existing.quantity = (parseFloat(existing.quantity) || 1) + (parseFloat(item.quantity) || 1);
      if (item.status) existing.status = item.status;
    } else {
      list.unshift({
        id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: item.name,
        category: item.category || 'Despensa',
        quantity: item.quantity || 1,
        unit: item.unit || 'uds',
        status: item.status || 'pending',
        added_from_menu: item.added_from_menu || false
      });
    }
    this.saveShoppingList(list);
    return list;
  }

  updateShoppingStatus(id, newStatus) {
    const list = this.getShoppingList();
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      this.saveShoppingList(list);
    }
    return list;
  }

  deleteShoppingItem(id) {
    const list = this.getShoppingList().filter(i => i.id !== id);
    this.saveShoppingList(list);
    return list;
  }

  clearBoughtItems() {
    const list = this.getShoppingList().filter(i => i.status !== 'bought');
    this.saveShoppingList(list);
    return list;
  }

  // --- PRODUCTOS ---
  getProducts(sortBy = 'alpha') {
    const products = JSON.parse(localStorage.getItem('qr_menu_products') || '[]');
    const recipes = JSON.parse(localStorage.getItem('qr_menu_recipes') || '[]');
    const shopping = JSON.parse(localStorage.getItem('qr_menu_shopping') || '[]');

    // Calcular frecuencia real de uso por ingrediente y compra
    const usageMap = new Map();
    recipes.forEach(r => {
      (r.ingredients || []).forEach(ing => {
        if (!ing.name) return;
        const key = ing.name.trim().toLowerCase();
        usageMap.set(key, (usageMap.get(key) || 0) + 1);
      });
    });
    shopping.forEach(item => {
      if (!item.name) return;
      const key = item.name.trim().toLowerCase();
      usageMap.set(key, (usageMap.get(key) || 0) + 1);
    });

    products.forEach(p => {
      const key = p.name.trim().toLowerCase();
      p.usage_count = (p.manual_usage || 0) + (usageMap.get(key) || 0);
    });

    if (sortBy === 'usage') {
      return products.sort((a, b) => {
        if (b.usage_count !== a.usage_count) {
          return b.usage_count - a.usage_count;
        }
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      });
    }

    return products.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  // --- ASISTENTE DE DESPENSA Y ALERTAS INTELIGENTES ---
  getProductInsightsAndAlerts() {
    const products = this.getProducts('usage');
    const shoppingList = this.getShoppingList();
    const shoppingNames = new Set(shoppingList.map(s => s.name.toLowerCase().trim()));

    const alerts = [];
    const now = Date.now();

    products.forEach(p => {
      const isAlreadyInShopping = shoppingNames.has(p.name.toLowerCase().trim());
      if (isAlreadyInShopping) return;

      const daysSinceList = p.last_added_to_list_at 
        ? Math.floor((now - p.last_added_to_list_at) / (1000 * 60 * 60 * 24))
        : (p.is_essential ? 8 : (p.category === 'Especias' ? 45 : (p.usage_count > 3 ? 12 : 20)));

      if (p.is_essential && daysSinceList >= 7) {
        alerts.push({
          id: p.id,
          name: p.name,
          category: p.category,
          unit: p.unit || p.default_unit || 'uds',
          type: 'essential',
          icon: '🥛',
          days_ago: daysSinceList,
          message: `¿Queda ${p.name} por casualidad? Hace ${daysSinceList} días que no la apuntas en la lista de la compra.`,
          action_label: `+ Añadir ${p.name}`
        });
      } else if (p.category === 'Especias' && daysSinceList >= 30) {
        alerts.push({
          id: p.id,
          name: p.name,
          category: p.category,
          unit: p.unit || p.default_unit || 'uds',
          type: 'spice',
          icon: '🌿',
          days_ago: daysSinceList,
          message: `¡Echa un vistazo a ver si falta ${p.name}! Hace ${daysSinceList} días que no compras este ingrediente.`,
          action_label: `+ Añadir ${p.name}`
        });
      } else if (p.usage_count >= 2 && daysSinceList >= 10) {
        alerts.push({
          id: p.id,
          name: p.name,
          category: p.category,
          unit: p.unit || p.default_unit || 'uds',
          type: 'frequent',
          icon: '🔥',
          days_ago: daysSinceList,
          message: `${p.name} es uno de tus alimentos más consumidos (${p.usage_count} usos). Hace ${daysSinceList} días que no lo compras.`,
          action_label: `+ Añadir ${p.name}`
        });
      }
    });

    const mostConsumed = products.filter(p => p.usage_count > 0).slice(0, 5);
    const leastConsumed = products.filter(p => p.usage_count === 0).slice(0, 5);

    return {
      alerts: alerts.slice(0, 5),
      most_consumed: mostConsumed,
      least_consumed: leastConsumed
    };
  }

  addProduct(product) {
    const products = this.getProducts();
    const newProd = {
      id: 'p_' + Date.now(),
      name: product.name,
      category: product.category || 'Despensa',
      unit: product.unit || 'uds',
      is_essential: !!product.is_essential
    };
    products.push(newProd);
    localStorage.setItem('qr_menu_products', JSON.stringify(products));
    this.pushCloudSync();
    return newProd;
  }

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const oldProd = products[index];
      const oldNameLower = (oldProd.name || '').toLowerCase().trim();

      products[index] = {
        ...products[index],
        name: updatedData.name,
        category: updatedData.category || 'Despensa',
        unit: updatedData.unit || 'uds',
        is_essential: !!updatedData.is_essential
      };
      localStorage.setItem('qr_menu_products', JSON.stringify(products));

      // Sincronizar automáticamente con todas las recetas que contienen este ingrediente
      const recipes = JSON.parse(localStorage.getItem('qr_menu_recipes') || '[]');
      let recipesChanged = false;

      recipes.forEach(r => {
        if (r.ingredients) {
          r.ingredients.forEach(ing => {
            if ((ing.name || '').toLowerCase().trim() === oldNameLower) {
              ing.name = updatedData.name;
              ing.category = updatedData.category || 'Despensa';
              recipesChanged = true;
            }
          });
        }
      });

      if (recipesChanged) {
        localStorage.setItem('qr_menu_recipes', JSON.stringify(recipes));
      }

      this.pushCloudSync();
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem('qr_menu_products', JSON.stringify(products));
    this.pushCloudSync();
    return products;
  }

  // Auto-crear alimentos en catálogo si un ingrediente de receta no existe
  ensureProductsExist(ingredients = []) {
    if (!ingredients || ingredients.length === 0) return 0;
    const products = this.getProducts();
    let newAddedCount = 0;

    ingredients.forEach(ing => {
      if (!ing.name || !ing.name.trim()) return;
      const cleanName = ing.name.trim();
      const exists = products.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
      if (!exists) {
        products.push({
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: cleanName,
          category: ing.category || 'Frescos',
          unit: ing.unit || 'uds',
          is_essential: false
        });
        newAddedCount++;
      }
    });

    if (newAddedCount > 0) {
      localStorage.setItem('qr_menu_products', JSON.stringify(products));
    }
    return newAddedCount;
  }

  // --- RECETAS ---
  getRecipes() {
    const recipes = JSON.parse(localStorage.getItem('qr_menu_recipes') || '[]');
    const products = JSON.parse(localStorage.getItem('qr_menu_products') || '[]');
    const prodMap = new Map();
    products.forEach(p => {
      if (p.name) prodMap.set(p.name.toLowerCase().trim(), p);
    });

    recipes.forEach(r => {
      if (r.ingredients) {
        r.ingredients.forEach(ing => {
          if (ing.name) {
            const matched = prodMap.get(ing.name.toLowerCase().trim());
            if (matched) {
              ing.category = matched.category || ing.category || 'Frescos';
            }
          }
        });
      }
    });

    return recipes.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
  }

  addRecipe(recipe) {
    const recipes = this.getRecipes();
    const newR = {
      id: 'r_' + Date.now(),
      title: recipe.title,
      category: recipe.category || 'General',
      prep_time: parseInt(recipe.prep_time) || 20,
      is_favorite: !!recipe.is_favorite,
      meal_target: recipe.meal_target || 'both',
      ingredients: recipe.ingredients || []
    };
    recipes.push(newR);
    localStorage.setItem('qr_menu_recipes', JSON.stringify(recipes));
    const addedCount = this.ensureProductsExist(newR.ingredients);
    newR.auto_added_products_count = addedCount;
    this.pushCloudSync();
    return newR;
  }

  deleteRecipe(id) {
    const recipes = this.getRecipes().filter(r => r.id !== id);
    localStorage.setItem('qr_menu_recipes', JSON.stringify(recipes));
    this.pushCloudSync();
    return recipes;
  }

  updateRecipe(id, updatedData) {
    const recipes = this.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        title: updatedData.title,
        category: updatedData.category || 'General',
        prep_time: parseInt(updatedData.prep_time) || 20,
        is_favorite: !!updatedData.is_favorite,
        meal_target: updatedData.meal_target || 'both',
        ingredients: updatedData.ingredients || []
      };
      localStorage.setItem('qr_menu_recipes', JSON.stringify(recipes));
      const addedCount = this.ensureProductsExist(recipes[index].ingredients);
      recipes[index].auto_added_products_count = addedCount;
      this.pushCloudSync();
      return recipes[index];
    }
    return null;
  }

  // --- MENÚ SEMANAL ---
  getWeeklyMenu() {
    return JSON.parse(localStorage.getItem('qr_menu_weekly') || '[]');
  }

  saveWeeklyMenu(menu) {
    localStorage.setItem('qr_menu_weekly', JSON.stringify(menu));
    this.pushCloudSync();
  }

  updateMeal(dayIndex, mealType, recipeId, recipeTitle) {
    const menu = this.getWeeklyMenu();
    const day = menu.find(d => d.day_index === dayIndex);
    if (day && day[mealType]) {
      day[mealType].recipe_id = recipeId;
      day[mealType].title = recipeTitle || 'Sin planificar';
      this.saveWeeklyMenu(menu);
    }
    return menu;
  }

  toggleMealComplete(dayIndex, mealType) {
    const menu = this.getWeeklyMenu();
    const day = menu.find(d => d.day_index === dayIndex);
    if (day && day[mealType]) {
      day[mealType].completed = !day[mealType].completed;
      this.saveWeeklyMenu(menu);
    }
    return menu;
  }

  toggleMealLock(dayIndex, mealType) {
    const menu = this.getWeeklyMenu();
    const day = menu.find(d => d.day_index === dayIndex);
    if (day && day[mealType]) {
      day[mealType].locked = !day[mealType].locked;
      this.saveWeeklyMenu(menu);
    }
    return menu;
  }

  // Obtener resumen consolidado de ingredientes del menú semanal
  getWeeklyIngredientsSummary() {
    const menu = this.getWeeklyMenu();
    const recipes = this.getRecipes();
    const map = new Map();

    menu.forEach(day => {
      ['lunch', 'dinner'].forEach(mealType => {
        const meal = day[mealType];
        if (meal && meal.recipe_id) {
          const recipe = recipes.find(r => r.id === meal.recipe_id);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ing => {
              if (!ing.name) return;
              const key = ing.name.trim().toLowerCase() + '::' + (ing.unit || 'uds');
              if (map.has(key)) {
                const existing = map.get(key);
                existing.quantity += (parseFloat(ing.quantity) || 1);
                if (!existing.meals.includes(recipe.title)) {
                  existing.meals.push(recipe.title);
                }
              } else {
                map.set(key, {
                  name: ing.name.trim(),
                  category: ing.category || 'Frescos',
                  quantity: parseFloat(ing.quantity) || 1,
                  unit: ing.unit || 'uds',
                  meals: [recipe.title]
                });
              }
            });
          }
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  // Auto-sincronizar ingredientes del menú a la lista de la compra
  syncMenuIngredientsToShoppingList() {
    const menu = this.getWeeklyMenu();
    const recipes = this.getRecipes();
    const addedItems = [];

    menu.forEach(day => {
      ['lunch', 'dinner'].forEach(mealType => {
        const meal = day[mealType];
        if (meal && meal.recipe_id) {
          const recipe = recipes.find(r => r.id === meal.recipe_id);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ing => {
              this.addShoppingItem({
                name: ing.name,
                category: ing.category || 'Frescos',
                quantity: ing.quantity || 1,
                unit: ing.unit || 'uds',
                status: 'pending',
                added_from_menu: true
              });
              addedItems.push(ing.name);
            });
          }
        }
      });
    });

    return addedItems;
  }

  // --- CONFIGURACIÓN Y SETTINGS ---
  getSettings() {
    return JSON.parse(localStorage.getItem('qr_menu_settings') || '{}');
  }

  saveSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('qr_menu_settings', JSON.stringify(updated));
    return updated;
  }

  // --- INTEG N8N / AI MENU GENERATOR ---
  async generateAIMenuWithN8n(customPrompt = '') {
    const settings = this.getSettings();
    const currentMenu = this.getWeeklyMenu();
    const recipes = this.getRecipes();
    const products = this.getProducts();

    if (!recipes || recipes.length === 0) {
      throw new Error('Primero debes crear recetas en tu recetario para poder generar un menú semanal.');
    }

    const effectivePrompt = (customPrompt || settings.custom_rules || '').trim();

    const payload = {
      prompt: effectivePrompt,
      family_rules: settings.custom_rules || '',
      gemini_key: settings.gemini_key || '',
      rule: "REGLA OBLIGATORIA ABSOLUTA: DEBES seleccionar ÚNICAMENTE recetas existentes en la lista 'recipes'. CERO ALUCINACIONES. REGLA DE VARIETAL DIARIO: Queda TOTALMENTE PROHIBIDO repetir ingredientes principales (ej: gambas, marisco, salmón, pollo, arroz) entre la comida (☀️) y la cena (🌙) del MISMO día. Si el almuerzo lleva Gambas, la cena DEBE ser con carne, verduras o huevo pero NUNCA con Gambas.",
      locked_meals: currentMenu.map(d => ({
        day_index: d.day_index,
        day_name: d.day_name,
        lunch_locked: d.lunch.locked ? d.lunch.title : null,
        dinner_locked: d.dinner.locked ? d.dinner.title : null
      })),
      recipes: recipes.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        meal_target: r.meal_target || 'both',
        ingredients: (r.ingredients || []).map(i => i.name)
      })),
      pantry_catalog: products.map(p => p.name)
    };

    // Colección de recetas ya utilizadas (bloqueadas o asignadas previamente en la semana)
    const usedRecipeIds = new Set();

    // 1. Registrar recetas bloqueadas para no repetirlas
    currentMenu.forEach(d => {
      if (d.lunch.locked && d.lunch.recipe_id) usedRecipeIds.add(d.lunch.recipe_id);
      if (d.dinner.locked && d.dinner.recipe_id) usedRecipeIds.add(d.dinner.recipe_id);
    });

    const lunchPool = recipes.filter(r => !r.meal_target || r.meal_target === 'lunch' || r.meal_target === 'both');
    const dinnerPool = recipes.filter(r => !r.meal_target || r.meal_target === 'dinner' || r.meal_target === 'both');

    const getIngredientsSet = (recipe) => {
      if (!recipe || !recipe.ingredients) return new Set();
      return new Set(recipe.ingredients.map(i => i.name.toLowerCase().trim()));
    };

    const getUniqueRandomMeal = (pool, avoidIngredientsSet = new Set()) => {
      // 1. Filtrar recetas de la piscina que aún no han sido asignadas y NO solapan ingredientes con el almuerzo del día
      let available = pool.filter(r => {
        if (usedRecipeIds.has(r.id)) return false;
        if (avoidIngredientsSet.size > 0 && r.ingredients) {
          const hasOverlap = r.ingredients.some(ing => avoidIngredientsSet.has(ing.name.toLowerCase().trim()));
          if (hasOverlap) return false;
        }
        return true;
      });

      // 2. Si no hay sin solapamiento, probar recetas no usadas
      if (available.length === 0) {
        available = pool.filter(r => !usedRecipeIds.has(r.id));
      }

      if (available.length === 0) {
        available = recipes.filter(r => !usedRecipeIds.has(r.id));
      }

      if (available.length === 0) {
        available = pool.length > 0 ? pool : recipes;
      }

      const picked = available[Math.floor(Math.random() * available.length)];
      if (picked && picked.id) {
        usedRecipeIds.add(picked.id);
      }
      return picked;
    };

    const buildNonRepeatingMenu = () => {
      return currentMenu.map(d => {
        let lunchObj = d.lunch;
        let pickedLunch = null;

        if (!d.lunch.locked) {
          pickedLunch = getUniqueRandomMeal(lunchPool);
          lunchObj = {
            recipe_id: pickedLunch ? pickedLunch.id : null,
            title: pickedLunch ? pickedLunch.title : 'Sin planificar',
            completed: false,
            locked: false
          };
        } else if (d.lunch.recipe_id) {
          pickedLunch = recipes.find(r => r.id === d.lunch.recipe_id);
        }

        const lunchIngSet = getIngredientsSet(pickedLunch);

        let dinnerObj = d.dinner;
        if (!d.dinner.locked) {
          const pickedDinner = getUniqueRandomMeal(dinnerPool, lunchIngSet);
          dinnerObj = {
            recipe_id: pickedDinner ? pickedDinner.id : null,
            title: pickedDinner ? pickedDinner.title : 'Sin planificar',
            completed: false,
            locked: false
          };
        }

        return {
          ...d,
          lunch: lunchObj,
          dinner: dinnerObj
        };
      });
    };

    // Filtro higienizador anti-alucinaciones: valida que TODAS las recetas de la respuesta existan en el recetario del usuario
    const sanitizeMenuWithUserRecipes = (menuFromWebhook) => {
      const userRecipeMapById = new Map(recipes.map(r => [r.id, r]));
      const userRecipeMapByTitle = new Map(recipes.map(r => [r.title.toLowerCase().trim(), r]));

      return menuFromWebhook.map(day => {
        const sanitizeMeal = (meal, pool) => {
          if (!meal || meal.locked) return meal;

          // Coincidencia por ID
          if (meal.recipe_id && userRecipeMapById.has(meal.recipe_id)) {
            const matched = userRecipeMapById.get(meal.recipe_id);
            return { ...meal, recipe_id: matched.id, title: matched.title };
          }

          // Coincidencia por Título
          if (meal.title) {
            const cleanTitle = meal.title.toLowerCase().trim();
            if (userRecipeMapByTitle.has(cleanTitle)) {
              const matched = userRecipeMapByTitle.get(cleanTitle);
              return { ...meal, recipe_id: matched.id, title: matched.title };
            }
          }

          // Si el plato devuelto fue inventado/alucinado, reemplazar por una receta REAL existente del usuario
          const fallback = getUniqueRandomMeal(pool);
          return {
            recipe_id: fallback ? fallback.id : null,
            title: fallback ? fallback.title : 'Sin planificar',
            completed: false,
            locked: false
          };
        };

        return {
          ...day,
          lunch: sanitizeMeal(day.lunch, lunchPool),
          dinner: sanitizeMeal(day.dinner, dinnerPool)
        };
      });
    };

    if (!settings.n8n_url) {
      // Generador interno basado 100% en recetas reales del usuario sin repetición ni alucinaciones
      await new Promise(res => setTimeout(res, 1000));
      const simulatedMenu = buildNonRepeatingMenu();
      this.saveWeeklyMenu(simulatedMenu);
      return { success: true, menu: simulatedMenu, is_simulation: true };
    }

    try {
      const response = await fetch(settings.n8n_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data && data.generated_menu) {
        const sanitizedMenu = sanitizeMenuWithUserRecipes(data.generated_menu);
        this.saveWeeklyMenu(sanitizedMenu);
        return { success: true, menu: sanitizedMenu, is_simulation: false };
      } else {
        throw new Error('Respuesta inválida del webhook');
      }
    } catch (err) {
      console.warn('Error en webhook n8n, aplicando generador estricto de recetas del usuario:', err);
      const simulatedMenu = buildNonRepeatingMenu();
      this.saveWeeklyMenu(simulatedMenu);
      return { success: true, menu: simulatedMenu, is_simulation: true, error: err.message };
    }
  }
}

window.appDb = new AppDatabase();
