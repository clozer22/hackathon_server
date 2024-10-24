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


app.post('/adminRegister', userController.adminRegister);
app.post('/adminLogin', userController.adminLogin);

app.post('/candidateRegister', userController.candidateRegister);

app.post('/candidateLogin', userController.candidateLogin);
app.get('/api/generate-questions/:jobRole/:candidateId', userController.generateQuestions);
app.get('/api/getGeneratedQuestions/:candidateId', userController.fetchGeneratedQuestions);
app.post('/api/submitAnswer/', userController.submitAnswer);
app.post('/api/addRole', userController.candidateAddJob)
app.get('/api/getListOfRoles/:candidateId', userController.candidateListOfRoles);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
