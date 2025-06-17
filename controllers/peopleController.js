const Expense = require('../models/Expense');

exports.getPeople = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const peopleSet = new Set();

    expenses.forEach(exp => {
      peopleSet.add(exp.paid_by);
      exp.split_between.forEach(p => peopleSet.add(p));
    });

    res.json({ people: Array.from(peopleSet) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get people', details: err });
  }
};