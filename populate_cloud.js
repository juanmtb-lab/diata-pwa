const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Aceite de Oliva VV', category: 'Despensa', unit: 'ml', is_essential: true },
  { id: 'p2', name: 'Aguacate', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p3', name: 'Ajo', category: 'Frescos', unit: 'cabeza', is_essential: true },
  { id: 'p4', name: 'Atún', category: 'Despensa', unit: 'uds', is_essential: false },
  { id: 'p5', name: 'Carne picada de ternera', category: 'Frescos', unit: 'g', is_essential: false },
  { id: 'p6', name: 'Cebolla', category: 'Frescos', unit: 'uds', is_essential: true },
  { id: 'p7', name: 'Espinacas frescas', category: 'Frescos', unit: 'bolsa', is_essential: false },
  { id: 'p8', name: 'Frutos secos', category: 'Despensa', unit: 'bolsa', is_essential: false },
  { id: 'p9', name: 'Guisantes congelados', category: 'Congelados', unit: 'bolsa', is_essential: false },
  { id: 'p10', name: 'Huevos camperos', category: 'Frescos', unit: 'docena', is_essential: true },
  { id: 'p11', name: 'Leche entera', category: 'Despensa', unit: 'l', is_essential: true },
  { id: 'p12', name: 'Lechuga', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p13', name: 'Mayonesa', category: 'Despensa', unit: 'bote', is_essential: false },
  { id: 'p14', name: 'Nueces', category: 'Despensa', unit: 'g', is_essential: false },
  { id: 'p15', name: 'Orégano seco', category: 'Especias', unit: 'bote', is_essential: false },
  { id: 'p16', name: 'Pasta Penne', category: 'Despensa', unit: 'paquete', is_essential: true },
  { id: 'p17', name: 'Patatas Fritas', category: 'Despensa', unit: 'bolsa', is_essential: false },
  { id: 'p18', name: 'Pechuga de pollo', category: 'Frescos', unit: 'kg', is_essential: true },
  { id: 'p19', name: 'Pepino', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p20', name: 'Pimentón de la Vera', category: 'Especias', unit: 'bote', is_essential: false },
  { id: 'p21', name: 'Pimiento Rojo', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p22', name: 'Pimiento Verde', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p23', name: 'Queso Havarti', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p24', name: 'Queso Parmegiano', category: 'Frescos', unit: 'g', is_essential: false },
  { id: 'p25', name: 'Salmón congelado', category: 'Congelados', unit: 'uds', is_essential: false },
  { id: 'p26', name: 'Salsa de Soja', category: 'Despensa', unit: 'bote', is_essential: false },
  { id: 'p27', name: 'Tacos de Maíz', category: 'Despensa', unit: 'paquete', is_essential: false },
  { id: 'p28', name: 'Tomate frito', category: 'Despensa', unit: 'bote', is_essential: true },
  { id: 'p29', name: 'Tomates ensalada', category: 'Frescos', unit: 'kg', is_essential: false },
  { id: 'p30', name: 'Vasitos Arroz', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p31', name: 'Vasitos quinoa', category: 'Frescos', unit: 'uds', is_essential: false },
  { id: 'p32', name: 'Papel higiénico', category: 'Aseo Personal', unit: 'paquete', is_essential: true },
  { id: 'p33', name: 'Gel de baño / Champú', category: 'Aseo Personal', unit: 'bote', is_essential: true },
  { id: 'p34', name: 'Detergente ropa', category: 'Limpieza', unit: 'bote', is_essential: true },
  { id: 'p35', name: 'Lavavajillas', category: 'Limpieza', unit: 'bote', is_essential: true },
  { id: 'p36', name: 'Limpiasuelos / Lejía', category: 'Limpieza', unit: 'bote', is_essential: false }
];

const DEFAULT_RECIPES = [
  {
    id: 'r1',
    title: 'Arroz con Salteado de Verduras',
    category: 'Vegetariano',
    prep_time: 30,
    is_favorite: false,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Guisantes congelados', category: 'Congelados', quantity: 0.2, unit: 'kg' },
      { name: 'Vasitos Arroz', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pimiento Verde', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pimiento Rojo', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'kg' }
    ]
  },
  {
    id: 'r2',
    title: 'Macarrones con Atún',
    category: 'Pasta',
    prep_time: 20,
    is_favorite: false,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Pasta Penne', category: 'Despensa', quantity: 1, unit: 'paquete' },
      { name: 'Tomate frito', category: 'Despensa', quantity: 1, unit: 'bote' },
      { name: 'Orégano seco', category: 'Especias', quantity: 1, unit: 'pizca' },
      { name: 'Atún', category: 'Despensa', quantity: 1, unit: 'lata' }
    ]
  },
  {
    id: 'r3',
    title: 'Pollo a la Plancha con Ensalada',
    category: 'Saludable',
    prep_time: 20,
    is_favorite: true,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Pechuga de pollo', category: 'Frescos', quantity: 0.5, unit: 'kg' },
      { name: 'Lechuga', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pepino', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Nueces', category: 'Despensa', quantity: 1, unit: 'g' },
      { name: 'Queso Parmegiano', category: 'Frescos', quantity: 1, unit: 'g' }
    ]
  },
  {
    id: 'r4',
    title: 'Salmón al Horno con Quinoa y Verduras',
    category: 'Pescado',
    prep_time: 35,
    is_favorite: true,
    meal_target: 'lunch',
    ingredients: [
      { name: 'Salmón congelado', category: 'Congelados', quantity: 1, unit: 'paquete' },
      { name: 'Vasitos quinoa', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pimiento Rojo', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pimiento Verde', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Salsa de Soja', category: 'Despensa', quantity: 1, unit: 'pizca' }
    ]
  },
  {
    id: 'r5',
    title: 'Tacos al Horno',
    category: 'Saludable',
    prep_time: 25,
    is_favorite: false,
    meal_target: 'both',
    ingredients: [
      { name: 'Aguacate', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Cebolla', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pechuga de pollo', category: 'Frescos', quantity: 1, unit: 'paquete' },
      { name: 'Pimiento Rojo', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Pimiento Verde', category: 'Frescos', quantity: 1, unit: 'uds' },
      { name: 'Tacos de Maíz', category: 'Despensa', quantity: 1, unit: 'paquete' }
    ]
  },
  {
    id: 'r6',
    title: 'Tortilla con Atún y Queso',
    category: 'Rápida',
    prep_time: 10,
    is_favorite: true,
    meal_target: 'dinner',
    ingredients: [
      { name: 'Huevos camperos', category: 'Frescos', quantity: 4, unit: 'uds' },
      { name: 'Atún', category: 'Despensa', quantity: 1, unit: 'lata' },
      { name: 'Aceite de Oliva VV', category: 'Despensa', quantity: 0.2, unit: 'l' },
      { name: 'Queso Havarti', category: 'Frescos', quantity: 1, unit: 'uds' }
    ]
  }
];

const INITIAL_SHOPPING_LIST = [
  { id: 's_m1', name: 'Agua', category: 'Despensa', quantity: 1, unit: 'uds', status: 'pending', added_from_menu: false },
  { id: 's_m2', name: 'Jamón Cocido', category: 'Despensa', quantity: 1, unit: 'uds', status: 'pending', added_from_menu: false },
  { id: 's_m3', name: 'Papel higiénico', category: 'Aseo Personal', quantity: 1, unit: 'paquete', status: 'pending', added_from_menu: false },
  { id: 's_m4', name: 'Queso Havarti', category: 'Frescos', quantity: 1, unit: 'uds', status: 'pending', added_from_menu: false }
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

const INITIAL_WEEKLY_MENU = DAYS_OF_WEEK.map(d => ({
  day_index: d.index,
  day_name: d.name,
  lunch: d.index === 1 ? { recipe_id: 'r3', title: 'Pollo a la Plancha con Ensalada', completed: false, locked: true } :
         d.index === 2 ? { recipe_id: 'r2', title: 'Macarrones con Atún', completed: false, locked: false } :
         d.index === 3 ? { recipe_id: 'r1', title: 'Arroz con Salteado de Verduras', completed: false, locked: false } :
         d.index === 4 ? { recipe_id: 'r4', title: 'Salmón al Horno con Quinoa y Verduras', completed: false, locked: false } :
         { recipe_id: null, title: 'Sin planificar', completed: false, locked: false },
  dinner: d.index === 1 ? { recipe_id: 'r6', title: 'Tortilla con Atún y Queso', completed: false, locked: false } :
          d.index === 2 ? { recipe_id: 'r5', title: 'Tacos al Horno', completed: false, locked: true } :
          { recipe_id: null, title: 'Sin planificar', completed: false, locked: false }
}));

const payload = {
  name: "Diata Realtime Sync Container",
  data: {
    updated_at: Date.now(),
    deleted_ids: [],
    products: DEFAULT_PRODUCTS,
    recipes: DEFAULT_RECIPES,
    shopping: INITIAL_SHOPPING_LIST,
    weekly: INITIAL_WEEKLY_MENU
  }
};

fetch('https://api.restful-api.dev/objects/ff8081819ff5b11001a042c938ef33f8', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log("SUCCESS POPULATING RESTFUL-API CONTAINER:", data.id))
.catch(err => console.error("ERROR POPULATING RESTFUL-API:", err));
