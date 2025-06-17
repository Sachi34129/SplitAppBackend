const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  paid_by: { type: String, required: true },
  split_between: [{ type: String }], // auto populated from people mentioned
  split_type: { type: String, enum: ['equal', 'percentage', 'exact'], default: 'equal' },
  split_values: [{ name: String, value: Number }], // only used for percentage/exact
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);