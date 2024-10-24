const express = require("express");
const cors = require("cors");
const pool = require('../config/DbConnection');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sjmallonlineshop1@gmail.com', 
      pass: 'jkcz wydo xgqn mehx', 
    },
  });


exports.adminRegister = async (req, res) => {
    const {firstName, lastName, email, password, contactNum} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password,10);

        const insertData = await pool.execute("INSERT INTO tbl_hr_admin (first_name, last_name,email,password, contact_num) VALUES (?,?,?,?,?)", [firstName, lastName, email, hashedPassword, contactNum]);

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
}
