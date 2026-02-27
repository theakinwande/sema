const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Sema server running on port ${PORT}`);
});
