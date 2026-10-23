import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, formatDate } from './formatters.js';

export function exportRecipeToPdf(recipe) {
  if (!recipe) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 16;

  // Header banner
  doc.setFillColor(205, 117, 72); // bakery amber #CD7548
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BAKERY PRODUCT COSTING SHEET', 20, currentY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Recipe Batch & Unit Cost Analysis', 20, currentY + 16);

  const dateText = `Generated: ${formatDate(new Date())}`;
  doc.text(dateText, pageWidth - 20 - doc.getTextWidth(dateText), currentY + 13);

  currentY += 28;

  // Recipe Details Card
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(recipe.name || 'Unnamed Recipe', 14, currentY);

  currentY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Category: ${recipe.category || 'Bakery'} | Batch Yield: ${recipe.yieldCount} ${recipe.yieldUnit || 'units'}`, 14, currentY);

  if (recipe.description) {
    currentY += 5;
    doc.text(recipe.description, 14, currentY, { maxWidth: pageWidth - 28 });
  }

  currentY += 8;

  // 1. Ingredients Table
  const ingredientRows = (recipe.computedItems || []).map((item, idx) => {
    const cost = item.calculatedCost || 0;
    const pct = recipe.totalIngredientCost > 0
      ? ((cost / recipe.totalIngredientCost) * 100).toFixed(1) + '%'
      : '0%';

    return [
      idx + 1,
      item.name,
      `${item.quantity} ${item.unit}`,
      `₹${item.purchasePrice} / ${item.purchaseQuantity} ${item.purchaseUnit}`,
      `₹${cost.toFixed(2)}`,
      pct
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Ingredient', 'Recipe Qty', 'Purchase Price Basis', 'Cost (INR)', 'Share %']],
    body: ingredientRows,
    foot: [['', 'Total Ingredient Cost', '', '', `₹${(recipe.totalIngredientCost || 0).toFixed(2)}`, '100%']],
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 46, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 2. Production Overheads & Wastage
  const prod = recipe.productionCost || {};
  const overheadRows = [
    ['Ingredient Subtotal', `₹${(recipe.totalIngredientCost || 0).toFixed(2)}`],
    ['Packaging Cost', `₹${(prod.packagingCost || 0).toFixed(2)}`],
    ['Labour & Preparation', `₹${(prod.labourCost || 0).toFixed(2)}`],
    ['Electricity & Fuel / Gas', `₹${(prod.utilitiesCost || 0).toFixed(2)}`],
    ['Transportation & Delivery', `₹${(prod.transportCost || 0).toFixed(2)}`],
    ['Miscellaneous Expenses', `₹${(prod.otherExpenses || 0).toFixed(2)}`],
    [`Wastage (${prod.wastagePercentage || 0}% on ${prod.wastageBasis || 'ingredients'})`, `₹${(prod.wastageCost || 0).toFixed(2)}`],
    ['Total Production Cost (Batch)', `₹${(prod.totalProductionCost || 0).toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14 },
    tableWidth: 88,
    head: [['Cost Component', 'Amount']],
    body: overheadRows,
    theme: 'striped',
    headStyles: { fillColor: [184, 92, 51], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });

  // 3. Selling Price & Margin Summary (Placed side by side)
  const profit = recipe.profitAnalysis || {};
  const pricingRows = [
    ['Batch Yield', `${recipe.yieldCount} ${recipe.yieldUnit || 'units'}`],
    ['Production Cost / Unit', `₹${(prod.costPerProduct || 0).toFixed(2)}`],
    ['Pricing Strategy', (profit.pricingStrategy || 'margin').toUpperCase()],
    ['Target Margin / Markup', `${profit.targetPercentage || 0}%`],
    ['Suggested Selling Price', `₹${(profit.suggestedSellingPrice || 0).toFixed(2)}`],
    ['Profit per Unit', `₹${(profit.profitPerProduct || 0).toFixed(2)}`],
    ['Total Batch Profit', `₹${(profit.totalProfitPerBatch || 0).toFixed(2)}`],
    ['Estimated Batch Revenue', `₹${(profit.totalBatchRevenue || 0).toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 108 },
    tableWidth: 88,
    head: [['Pricing & Profit Analysis', 'Metric']],
    body: pricingRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 38, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = Math.max(doc.lastAutoTable.finalY, currentY + 60);

  // Footer note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140, 140, 140);
  doc.text(
    'Formula Note: Selling Price with Profit Margin = Cost ÷ (1 - Margin%). Wastage applied directly on base to avoid compounding.',
    14,
    finalY + 10
  );

  const cleanName = (recipe.name || 'recipe').replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`${cleanName}_costing_sheet.pdf`);
}
