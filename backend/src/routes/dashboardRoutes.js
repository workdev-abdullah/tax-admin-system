import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';

const router = Router();
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const invoiceFilter = { status: 'ISSUED' };
    const [clients, products, invoices, lowStock, totals] = await Promise.all([
      Client.countDocuments({ status: 'ACTIVE' }),
      Product.countDocuments({ isActive: true }),
      Invoice.countDocuments(invoiceFilter),
      Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }),
      Invoice.aggregate([
        { $match: invoiceFilter },
        { $group: { _id: null, sales: { $sum: { $toDouble: '$grandTotal' } }, taxable: { $sum: { $toDouble: '$taxableTotal' } }, cgst: { $sum: { $toDouble: '$cgstTotal' } }, sgst: { $sum: { $toDouble: '$sgstTotal' } }, igst: { $sum: { $toDouble: '$igstTotal' } } } }
      ])
    ]);
    const t = totals[0] || {};
    res.json({ stats: { clients, products, invoices, lowStock, sales: Number(t.sales || 0), taxable: Number(t.taxable || 0), cgst: Number(t.cgst || 0), sgst: Number(t.sgst || 0), igst: Number(t.igst || 0) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});
export default router;
