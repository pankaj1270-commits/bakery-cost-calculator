export const INITIAL_INGREDIENTS = [
  {
    id: 'ing-1',
    name: 'Butter',
    category: 'Dairy',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 700,
    costPerBaseUnit: 0.70, // ₹0.70 per gram
    baseUnit: 'g',
    supplierName: 'Amul Dairy Dist.',
    lastPurchaseDate: '2026-10-15',
    notes: 'Premium unsalted butter for baking',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-2',
    name: 'Baking Soda',
    category: 'Leavening Agents',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30, // ₹0.30 per gram
    baseUnit: 'g',
    supplierName: 'Weikfield Suppliers',
    lastPurchaseDate: '2026-10-10',
    notes: 'Standard sodium bicarbonate',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-3',
    name: 'Maida (Flour)',
    category: 'Grains & Flour',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30, // ₹0.30 per gram (₹300/kg)
    baseUnit: 'g',
    supplierName: 'Aashirvaad Wholesale',
    lastPurchaseDate: '2026-10-18',
    notes: 'Refined wheat flour, double sifted',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-4',
    name: 'Castor Sugar',
    category: 'Sweeteners',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 55,
    costPerBaseUnit: 0.055,
    baseUnit: 'g',
    supplierName: 'Madhur Sugar Ltd',
    lastPurchaseDate: '2026-10-12',
    notes: 'Fine baking sugar',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-5',
    name: 'Dark Chocolate Chips',
    category: 'Chocolates & Cocoa',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 280,
    costPerBaseUnit: 0.56,
    baseUnit: 'g',
    supplierName: 'Van Houten Choco',
    lastPurchaseDate: '2026-10-14',
    notes: '55% cocoa compound drops',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-6',
    name: 'Eggs',
    category: 'Dairy & Eggs',
    purchaseQuantity: 12,
    purchaseUnit: 'piece',
    purchasePrice: 84,
    costPerBaseUnit: 7.00,
    baseUnit: 'piece',
    supplierName: 'Farm Fresh Poultry',
    lastPurchaseDate: '2026-10-20',
    notes: 'Grade A fresh farm eggs',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-7',
    name: 'Vanilla Extract',
    category: 'Flavourings & Colours',
    purchaseQuantity: 100,
    purchaseUnit: 'ml',
    purchasePrice: 220,
    costPerBaseUnit: 2.20,
    baseUnit: 'ml',
    supplierName: 'Ossoro Flavours',
    lastPurchaseDate: '2026-09-28',
    notes: 'Pure bourbon vanilla extract',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-8',
    name: 'Full Cream Milk',
    category: 'Dairy',
    purchaseQuantity: 1,
    purchaseUnit: 'l',
    purchasePrice: 68,
    costPerBaseUnit: 0.068,
    baseUnit: 'ml',
    supplierName: 'Mother Dairy',
    lastPurchaseDate: '2026-10-22',
    notes: 'Pasteurized homogenized milk',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-9',
    name: 'Cocoa Powder',
    category: 'Chocolates & Cocoa',
    purchaseQuantity: 250,
    purchaseUnit: 'g',
    purchasePrice: 190,
    costPerBaseUnit: 0.76,
    baseUnit: 'g',
    supplierName: 'Cadbury Foodservice',
    lastPurchaseDate: '2026-10-05',
    notes: 'Dutch processed cocoa',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-10',
    name: 'Instant Dry Yeast',
    category: 'Leavening Agents',
    purchaseQuantity: 50,
    purchaseUnit: 'g',
    purchasePrice: 48,
    costPerBaseUnit: 0.96,
    baseUnit: 'g',
    supplierName: 'Puratos India',
    lastPurchaseDate: '2026-10-01',
    notes: 'Fast acting dry yeast for breads',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PRICE_HISTORY = [
  {
    id: 'ph-1',
    ingredientId: 'ing-1',
    ingredientName: 'Butter',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 650,
    costPerBaseUnit: 0.65,
    effectiveDate: '2026-08-10',
    reason: 'Initial vendor quote'
  },
  {
    id: 'ph-2',
    ingredientId: 'ing-1',
    ingredientName: 'Butter',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 700,
    costPerBaseUnit: 0.70,
    effectiveDate: '2026-10-15',
    reason: 'Dairy seasonal market increase'
  },
  {
    id: 'ph-3',
    ingredientId: 'ing-2',
    ingredientName: 'Baking Soda',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30,
    effectiveDate: '2026-10-10',
    reason: 'Standard procurement'
  },
  {
    id: 'ph-4',
    ingredientId: 'ing-3',
    ingredientName: 'Maida (Flour)',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30,
    effectiveDate: '2026-10-18',
    reason: 'Regular bulk purchase'
  }
];

export const INITIAL_RECIPES = [
  {
    id: 'rec-1',
    name: 'Butter Biscuits (Sample Spec)',
    category: 'Biscuits & Cookies',
    description: 'Crisp, rich bakery style butter biscuits matching the exact sample recipe.',
    yieldCount: 50,
    yieldUnit: 'biscuits',
    packagingCost: 40.00,
    labourCost: 100.00,
    utilitiesCost: 50.00,
    transportCost: 30.00,
    otherExpenses: 20.00,
    wastagePercentage: 5.0,
    wastageBasis: 'ingredients', // 'ingredients' or 'total'
    pricingStrategy: 'margin', // 'margin' or 'markup'
    targetPercentage: 30.0, // 30% margin
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 600,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-2',
        name: 'Baking Soda',
        quantity: 1.7,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 800,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      }
    ],
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    name: 'Chocolate Chip Cookies',
    category: 'Biscuits & Cookies',
    description: 'Chewy golden cookies loaded with dark chocolate chunks.',
    yieldCount: 24,
    yieldUnit: 'cookies',
    packagingCost: 25.00,
    labourCost: 60.00,
    utilitiesCost: 35.00,
    transportCost: 15.00,
    otherExpenses: 10.00,
    wastagePercentage: 3.0,
    wastageBasis: 'ingredients',
    pricingStrategy: 'margin',
    targetPercentage: 35.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 200,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 180,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 280,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-2',
        name: 'Baking Soda',
        quantity: 2,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-5',
        name: 'Dark Chocolate Chips',
        quantity: 150,
        unit: 'g',
        snapshotPurchaseQty: 500,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 280,
        snapshotCostPerBaseUnit: 0.56
      },
      {
        ingredientId: 'ing-6',
        name: 'Eggs',
        quantity: 1,
        unit: 'piece',
        snapshotPurchaseQty: 12,
        snapshotPurchaseUnit: 'piece',
        snapshotPurchasePrice: 84,
        snapshotCostPerBaseUnit: 7.00
      },
      {
        ingredientId: 'ing-7',
        name: 'Vanilla Extract',
        quantity: 5,
        unit: 'ml',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'ml',
        snapshotPurchasePrice: 220,
        snapshotCostPerBaseUnit: 2.20
      }
    ],
    createdAt: '2026-10-21T11:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-3',
    name: 'Vanilla Celebration Cake',
    category: 'Cakes & Pastries',
    description: 'Fluffy, moist two-layer vanilla sponge cake for celebrations.',
    yieldCount: 1,
    yieldUnit: 'cake (1 kg)',
    packagingCost: 50.00,
    labourCost: 120.00,
    utilitiesCost: 60.00,
    transportCost: 40.00,
    otherExpenses: 25.00,
    wastagePercentage: 4.0,
    wastageBasis: 'ingredients',
    pricingStrategy: 'margin',
    targetPercentage: 40.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 250,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 200,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 120,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-6',
        name: 'Eggs',
        quantity: 4,
        unit: 'piece',
        snapshotPurchaseQty: 12,
        snapshotPurchaseUnit: 'piece',
        snapshotPurchasePrice: 84,
        snapshotCostPerBaseUnit: 7.00
      },
      {
        ingredientId: 'ing-8',
        name: 'Full Cream Milk',
        quantity: 120,
        unit: 'ml',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'l',
        snapshotPurchasePrice: 68,
        snapshotCostPerBaseUnit: 0.068
      },
      {
        ingredientId: 'ing-7',
        name: 'Vanilla Extract',
        quantity: 10,
        unit: 'ml',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'ml',
        snapshotPurchasePrice: 220,
        snapshotCostPerBaseUnit: 2.20
      }
    ],
    createdAt: '2026-10-22T14:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-4',
    name: 'Artisan Milk Bread Loaf',
    category: 'Breads',
    description: 'Soft sandwich bread loaf prepared with whole milk and natural yeast.',
    yieldCount: 2,
    yieldUnit: 'loaves',
    packagingCost: 15.00,
    labourCost: 45.00,
    utilitiesCost: 30.00,
    transportCost: 10.00,
    otherExpenses: 5.00,
    wastagePercentage: 2.5,
    wastageBasis: 'ingredients',
    pricingStrategy: 'markup',
    targetPercentage: 45.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 500,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-8',
        name: 'Full Cream Milk',
        quantity: 320,
        unit: 'ml',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'l',
        snapshotPurchasePrice: 68,
        snapshotCostPerBaseUnit: 0.068
      },
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 40,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 30,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-10',
        name: 'Instant Dry Yeast',
        quantity: 7,
        unit: 'g',
        snapshotPurchaseQty: 50,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 48,
        snapshotCostPerBaseUnit: 0.96
      }
    ],
    createdAt: '2026-10-23T09:15:00.000Z',
    updatedAt: new Date().toISOString()
  }
];
