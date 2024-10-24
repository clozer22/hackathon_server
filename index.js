const express = require("express");
const cors = require("cors");
const pool = require('./config/DbConnection');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const bcrypt = require('bcryptjs');


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


app.post('/register', async (req, res) => {
    const {firstName, lastName, email, password, contactNum} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password,10);

        const insertData = await pool.execute("INSERT INTO tbl_users (first_name, last_name,email,password, contact_num) VALUES (?,?,?,?,?)", [firstName, lastName, email, hashedPassword, contactNum]);

        if(!insertData){
            console.log("Failed to insert")
            return res.status(201).json({message: "Failed to insert"});
        }
        
        console.log("success");
        res.status(201).json({message: "Success"});

    }catch(error){
        console.log("server error");
        res.status(500).json({message: "Server Error"});
    }
})





// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
