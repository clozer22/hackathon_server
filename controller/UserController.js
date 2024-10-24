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


exports.candidateRegister = async (req, res) => {
    const{firstName, lastName, email, password, contact, status} = await req.body;

    try {
        const hashPass = await bcrypt.hash(password, 10);

        const insertCandidate = await pool.execute("INSERT INTO tbl_candidate(first_name, last_name, email, password, contact, status) VALUES(?,?,?,?,?)",[firstName, lastName, email, hashPass, contact, status]);

        if (insertCandidate) 
        {
            console.log("Registered Successfully");
            req.status(201).json({message: "Registered Successfully"});
        }

        else {
            console.log("failed to insert");
            req.status(201).json({message: "failed to insert"});
        }
    }catch (error) {
        console.log("server error");
        req.status(500).json({message: "Server Error"});
    }
}

exports.candidateLogin = async(req, res) => {
    const{email, password} = req.body;

    try {
        const [getEmail] = await pool.execute("SELECT * FROM tbl_candidate WHERE email = '?'",[email]);

        if (getEmail.length > 0)
        {
            const pass = getEmail[0].password;

            bcrypt.compare(pass, password, async function(err, result){
                if (err)
                {
                    console.error("Error comparing password");
                    return;
                }

                if (result)
                {
                    const getLogin = await pool.execute("SELECT * FROM tbl_candidate WHERE email = '?' and password = '?'",[email, password]);

                    if (getLogin)
                    {
                        console.log("Login Successful");
                        req.status(201).json({message: "Login Successful"});
                    }

                    else {
                        console.log("Invalid Password");
                        req.status(201).json({message: "Invalid Password"});
                    }
                }

                else {
                    console.log("Password not match");
                }
            })
        }

        else {
            console.log("Invalid Email");
            req.status(201).json({message: "Invalid Email"});
        }

    }catch(error) {
        console.log("Server Error");
        req.status(500).json({message: "Server Error"});
    }
}