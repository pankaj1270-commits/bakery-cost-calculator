// Unit converter utility supporting weight, volume, and count

export const UNIT_TYPES = {
  WEIGHT: 'weight',
  VOLUME: 'volume',
  COUNT: 'count'
};

export const UNITS = {
  // Weight (base unit: gram)
  kg: { name: 'Kilogram', symbol: 'kg', type: UNIT_TYPES.WEIGHT, toBase: 1000, baseUnit: 'g' },
  g: { name: 'Gram', symbol: 'g', type: UNIT_TYPES.WEIGHT, toBase: 1, baseUnit: 'g' },
  gram: { name: 'Gram', symbol: 'g', type: UNIT_TYPES.WEIGHT, toBase: 1, baseUnit: 'g' },
  grams: { name: 'Gram', symbol: 'g', type: UNIT_TYPES.WEIGHT, toBase: 1, baseUnit: 'g' },
  mg: { name: 'Milligram', symbol: 'mg', type: UNIT_TYPES.WEIGHT, toBase: 0.001, baseUnit: 'g' },

  // Volume (base unit: ml)
  l: { name: 'Litre', symbol: 'L', type: UNIT_TYPES.VOLUME, toBase: 1000, baseUnit: 'ml' },
  litre: { name: 'Litre', symbol: 'L', type: UNIT_TYPES.VOLUME, toBase: 1000, baseUnit: 'ml' },
  liter: { name: 'Litre', symbol: 'L', type: UNIT_TYPES.VOLUME, toBase: 1000, baseUnit: 'ml' },
  ml: { name: 'Millilitre', symbol: 'ml', type: UNIT_TYPES.VOLUME, toBase: 1, baseUnit: 'ml' },
  cup: { name: 'Cup (250ml)', symbol: 'cup', type: UNIT_TYPES.VOLUME, toBase: 250, baseUnit: 'ml' },
  tbsp: { name: 'Tablespoon (15ml)', symbol: 'tbsp', type: UNIT_TYPES.VOLUME, toBase: 15, baseUnit: 'ml' },
  tsp: { name: 'Teaspoon (5ml)', symbol: 'tsp', type: UNIT_TYPES.VOLUME, toBase: 5, baseUnit: 'ml' },

  // Count (base unit: piece)
  piece: { name: 'Piece', symbol: 'pc', type: UNIT_TYPES.COUNT, toBase: 1, baseUnit: 'piece' },
  pc: { name: 'Piece', symbol: 'pc', type: UNIT_TYPES.COUNT, toBase: 1, baseUnit: 'piece' },
  pieces: { name: 'Piece', symbol: 'pc', type: UNIT_TYPES.COUNT, toBase: 1, baseUnit: 'piece' },
  unit: { name: 'Unit', symbol: 'unit', type: UNIT_TYPES.COUNT, toBase: 1, baseUnit: 'piece' },
  dozen: { name: 'Dozen (12 pcs)', symbol: 'dozen', type: UNIT_TYPES.COUNT, toBase: 12, baseUnit: 'piece' },
  pack: { name: 'Pack', symbol: 'pack', type: UNIT_TYPES.COUNT, toBase: 1, baseUnit: 'piece' }
};

export function normalizeUnit(unitStr) {
  if (!unitStr) return 'g';
  const clean = unitStr.toString().trim().toLowerCase();
  if (UNITS[clean]) return clean;
  if (clean === 'kgs' || clean === 'kilograms') return 'kg';
  if (clean === 'litres' || clean === 'liters') return 'l';
  if (clean === 'pcs') return 'piece';
  return clean;
}

export function getUnitInfo(unitStr) {
  const norm = normalizeUnit(unitStr);
  return UNITS[norm] || { name: norm, symbol: norm, type: 'custom', toBase: 1, baseUnit: norm };
}

export function areUnitsCompatible(unitA, unitB) {
  const uA = getUnitInfo(unitA);
  const uB = getUnitInfo(unitB);
  return uA.type === uB.type;
}

export function convertQuantity(quantity, fromUnit, toUnit) {
  const qty = Number(quantity) || 0;
  const uFrom = getUnitInfo(fromUnit);
  const uTo = getUnitInfo(toUnit);

  if (uFrom.type !== uTo.type) {
    throw new Error(`Incompatible units: cannot convert from ${fromUnit} (${uFrom.type}) to ${toUnit} (${uTo.type})`);
  }

  // Convert to base unit, then convert to target unit
  const baseQty = qty * uFrom.toBase;
  const targetQty = baseQty / uTo.toBase;
  return targetQty;
}

export function calculateBaseCost(purchaseQty, purchaseUnit, purchasePrice) {
  const qty = Number(purchaseQty);
  const price = Number(purchasePrice);

  if (!qty || qty <= 0 || isNaN(price) || price < 0) {
    return { costPerBaseUnit: 0, baseUnit: 'unit' };
  }

  const uInfo = getUnitInfo(purchaseUnit);
  const totalBaseQty = qty * uInfo.toBase;
  const costPerBaseUnit = totalBaseQty > 0 ? price / totalBaseQty : 0;

  return {
    costPerBaseUnit,
    baseUnit: uInfo.baseUnit,
    unitType: uInfo.type
  };
}

export function calculateIngredientCostInRecipe({
  recipeQuantity,
  recipeUnit,
  purchaseQuantity,
  purchaseUnit,
  purchasePrice
}) {
  const rQty = Number(recipeQuantity) || 0;
  if (rQty <= 0) return 0;

  const { costPerBaseUnit, baseUnit } = calculateBaseCost(purchaseQuantity, purchaseUnit, purchasePrice);
  
  // Convert recipe quantity to base unit
  const rUnitInfo = getUnitInfo(recipeUnit);
  const rBaseQty = rQty * rUnitInfo.toBase;

  const cost = rBaseQty * costPerBaseUnit;
  // Round to 4 decimal places for precision during intermediate calc
  return Math.round((cost + Number.EPSILON) * 10000) / 10000;
}
