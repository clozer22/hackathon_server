const express = require("express");
const cors = require("cors");
const pool = require('./config/DbConnection');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const bcrypt = require('bcryptjs');
const userController = require('./controller/UserController');

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  })
);

app.use(express.json());


// (async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log("Connected to MySQL database");
//     connection.release();  
//   } catch (err) {
//     console.error("Database connection error:", err);
//   }
// })();


app.post('/register', userController.adminRegister);

app.post('/candidateRegister', userController.candidateRegister);

app.get('/candidateLogin', userController.candidateLogin);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
