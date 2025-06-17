const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const expenseRoutes = require('./routes/expenseRoutes');
const balancesRoutes = require('./routes/balancesRoutes');
const peopleRoutes = require('./routes/peopleRoutes');
const settlementRoutes = require('./routes/settlementRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Mount routes
app.use('/expenses', expenseRoutes);       // GET, POST, PUT, DELETE
app.use('/balances', balancesRoutes);     // GET /balances
app.use('/people', peopleRoutes);          // GET /people
app.use('/settlements', settlementRoutes); // GET /settlements

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});