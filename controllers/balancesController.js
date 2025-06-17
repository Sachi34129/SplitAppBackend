const Expense = require('../models/Expense');

exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = {};

    expenses.forEach(expense => {
      const { paid_by, split_between, amount, split_type, split_values } = expense;

      // Ensure paid_by exists in balances
      balances[paid_by] = balances[paid_by] || 0;

      if (split_type === 'equal') {
        const share = amount / split_between.length;
        split_between.forEach(person => {
          if (person !== paid_by) {
            balances[person] = (balances[person] || 0) - share;
            balances[paid_by] += share;
          }
        });
      } else if (split_type === 'percentage' || split_type === 'exact') {
        split_values.forEach(({ name, value }) => {
          const share = split_type === 'percentage' ? (amount * value / 100) : value;

          if (name !== paid_by) {
            balances[name] = (balances[name] || 0) - share;
            balances[paid_by] += share;
          }
        });
      }
    });

    res.json({ balances });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate balances', details: err });
  }
};