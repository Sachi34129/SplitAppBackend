const Expense = require('../models/Expense');

// Step 1: Calculate total spent and owed
exports.getSettlement = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = {};

    for (const exp of expenses) {
      const { paid_by, amount, split_type, split_values, split_between } = exp;

      // Add the amount paid
      balances[paid_by] = (balances[paid_by] || 0) + amount;

      // Subtract each person's share
      if (split_type === 'equal') {
        const share = amount / split_between.length;
        split_between.forEach(person => {
          balances[person] = (balances[person] || 0) - share;
        });
      } else if (split_type === 'percentage') {
        split_values.forEach(({ name, value }) => {
          const share = (value / 100) * amount;
          balances[name] = (balances[name] || 0) - share;
        });
      } else if (split_type === 'exact') {
        split_values.forEach(({ name, value }) => {
          balances[name] = (balances[name] || 0) - value;
        });
      }
    }

    // Step 2: Create a summary of who owes whom
    const people = Object.keys(balances).map(name => ({
      name,
      balance: Math.round(balances[name] * 100) / 100, // round to 2 decimals
    }));

    const debtors = people.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
    const creditors = people.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);

    const settlements = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settledAmount = Math.min(-debtor.balance, creditor.balance);
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(settledAmount * 100) / 100
      });

      debtor.balance += settledAmount;
      creditor.balance -= settledAmount;

      if (debtor.balance === 0) i++;
      if (creditor.balance === 0) j++;
    }

    res.json({ success: true, settlements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Settlement calculation failed', error: err.message });
  }
};