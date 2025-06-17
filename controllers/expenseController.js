const Expense = require('../models/Expense');

// Auto-extract unique people from expense
const extractPeople = (split_type, paid_by, split_values = []) => {
  const names = new Set();
  names.add(paid_by);
  if (split_type === 'equal') return Array.from(names); // only payer involved
  if (Array.isArray(split_values)) {
    split_values.forEach(p => names.add(p.name));
  }
  return Array.from(names);
};

// POST /expenses
exports.addExpense = async (req, res) => {
  try {
    const { amount, description, paid_by, split_type = 'equal', split_values = [] } = req.body;

    if (!amount || amount <= 0 || !description || !paid_by) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const people = extractPeople(split_type, paid_by, split_values);

    const newExpense = new Expense({
      amount,
      description,
      paid_by,
      split_type,
      split_values,
      split_between: people,
    });

    await newExpense.save();
    res.status(201).json({ success: true, data: newExpense, message: 'Expense added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// GET /expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT /expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { amount, description, paid_by, split_type, split_values } = req.body;

    const update = {};

    if (amount !== undefined) update.amount = amount;
    if (description !== undefined) update.description = description;
    if (paid_by !== undefined) update.paid_by = paid_by;
    if (split_type !== undefined) update.split_type = split_type;
    if (split_values !== undefined) update.split_values = split_values;

    // Only update split_between if relevant data is provided
    if (split_type && paid_by) {
      update.split_between = extractPeople(split_type, paid_by, split_values);
    }

    const updated = await Expense.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: updated, message: 'Expense updated successfully' });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found' });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};