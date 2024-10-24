const express = require("express");
const cors = require("cors");
const pool = require('../config/DbConnection');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const { fullName, sex, email, password, postalCode, jobTitle, city, dob, mobile, address, educationLevel } = req.body;

  try {
      const hashPass = await bcrypt.hash(password, 10);

      // Make sure the columns in the query match the ones in your database
      const insertCandidate = await pool.execute(
          `INSERT INTO tbl_candidate 
          (user_fullname, user_sex, user_email, user_number, user_address, user_city, 
          user_educ_lvl, user_job_title, user_postal_code, user_dob, user_password) 
          VALUES(?,?,?,?,?,?,?,?,?,?,?)`, 
          [fullName, sex, email, mobile, address, city, educationLevel, jobTitle, postalCode, dob, hashPass]
      );

      if (insertCandidate) {
          console.log("Registered Successfully");
          res.status(201).json({ message: "Registered Successfully" });
      } else {
          console.log("Failed to insert");
          res.status(400).json({ message: "Failed to insert" });
      }
  } catch (error) {
      console.log("Server error", error);
      res.status(500).json({ message: "Server Error" });
  }
};



exports.candidateLogin = async (req, res) => {
    const { email, password } = req.body;

    // Log the password and email to check if they are correctly sent
    console.log("Received email:", email);
    console.log("Received password:", password);

    try {
        const [checking] = await pool.execute("SELECT * FROM tbl_candidate WHERE user_email = ?", [email]);

        if (checking.length === 0) {
            return res.status(201).json({ message: "Email doesn't exist" });
        }

        const hashedPassword = checking[0].user_password;

        // Log the hashedPassword to ensure it's correctly fetched
        console.log("Fetched hashedPassword:", hashedPassword);

        // Check if the hashedPassword or password is undefined
        if (!hashedPassword || !password) {
            return res.status(400).json({ message: "Password or hashed password is missing" });
        }

        // Compare the passwords
        const isPasswordMatched = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordMatched) {
            console.log("Incorrect password");
            return res.status(201).json({ message: "Password does not match" });
        }

        res.status(201).json({ message: "Login Successfully" });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "server error" });
    }
};


exports.adminLogin = async(req,res) => {
    const {email, password} = req.body;

    try{
        const [check] = await pool.execute("SELECT * FROM tbl_hr_admin WHERE email = ?",[email]);

        if(check.length === 0){
            return res.status(200).json({message: "Email Doesn't exist"});
        }

        const hashedPassword = check[0].password;

        const isPasswordMatched = await bcrypt.compare(password, hashedPassword);

        if(!isPasswordMatched){
            return res.status(201).json({message: "Invalid email or password"});
        }

        res.status(200).json({message: "Login Successfully"});
    }catch(e){
        console.log(e);
        return res.status(500).json({message:"Server Error"});
    }
}


exports.generateQuestions = async (req, res) => {
    const { jobRole, candidateId } = req.params;
    try {
      console.log(jobRole);
      const prompt = `Generate 5 interview questions for a candidate applying for a ${jobRole} position. PS: generate questions only.`;
  
      const result = await model.generateContent(prompt);
  
      if (!result) {
        return res.status(500).json({ error: 'No questions generated' });
      }
  
      const generatedQuestionsString = result.response.text();
  
      const generatedQuestionsArray = generatedQuestionsString
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);
  
  
      if (generatedQuestionsArray.length < 5) {
        return res.status(400).json({ error: 'Not enough questions generated. Expected 5.' });
      }
  
      const questionsData = [
        generatedQuestionsArray[0],
        generatedQuestionsArray[1],
        generatedQuestionsArray[2],
        generatedQuestionsArray[3],
        generatedQuestionsArray[4],
    ];
  
      const sql = pool.execute('INSERT INTO tbl_questions (question1, question2, question3, question4, question5, candidate_id) VALUES (?, ?, ?, ?, ?, ?)', [questionsData[0],
        questionsData[1],
        questionsData[2],
        questionsData[3],
        questionsData[4], candidateId]);

        if(!sql){
            console.error('Error inserting questions:');
            return res.status(500).json({ error: 'Failed to insert questions' });
        }

        console.log(questionsData)
        res.status(200).json({ questions: questionsData, message: "Questions generated and inserted successfully." });

    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).json({ error: 'Failed to generate questions' });
    }
  };


  exports.fetchGeneratedQuestions = async(req,res) => {
    const {candidateId} = req.params;
    try{
        const [fetch] = await pool.execute("SELECT * FROM tbl_questions WHERE candidate_id = ?", [candidateId]);

        if(fetch.length === 0){
            console.log("questions not found");
           return res.status(200).json({message: "Questions not found"});
        }

        res.status(200).json({message: "fetched", questions: fetch});
    }catch(e){
        console.log(e);
        res.status(500).json({message: "server error"});
    }
  }


  exports.submitAnswer = async (req, res) => {
    // Both data and answers should be arrays of objects.
    const { data, answers } = req.body;
  
    try {
      if (!Array.isArray(data) || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Data and answers must be arrays' });
      }
  
      // Combine questions and answers into one array of objects
      const combinedData = data.map((item, index) => {
        return {
          question: item[`question${index + 1}`], // Access question based on index
          answer: answers[index][`answer${index + 1}`] // Access answer based on index
        };
      });


      const prompt1 = `Rate each answer to the following questions based on critical thinking:
        ${combinedData.map(item => `Question: ${item.question}\nAnswer: ${item.answer}`).join('\n\n')}
        Generate an overall average of the ratings (e.g., 80%). 
        If the average is above 50%, then the result is "Passed"; 
        if it is below 50%, the result should be "Failed". The overall average result should be on top of the assesment.  Can you generate if the assesment is passed or failed only. Display only passed or failed status`;
  
      // Create the payload for Gemini
      const prompt2 = `
        Rate each answer to the following questions based on critical thinking:
        ${combinedData.map(item => `Question: ${item.question}\nAnswer: ${item.answer}`).join('\n\n')}
        Generate an overall average of the ratings (e.g., 80%). 
        If the average is above 50%, then the result is "Passed"; 
        if it is below 50%, the result should be "Failed". The overall average result should be on top of the assesment. 
      `;
  
      // Send the prompt to Gemini
      
      const result1 = await model.generateContent(prompt1);

      const result2 = await model.generateContent(prompt2);

      if (!result1) {
        return res.status(500).json({ error: 'Failed to evaluate answers' });
      }
      if (!result2) {
        return res.status(500).json({ error: 'Failed to evaluate answers' });
      }
  
      // Process the Gemini response
      const ratingsString1 = result1.response.text();
      const ratingsString2 = result2.response.text();
  
      // Directly return the response from Gemini
      res.status(200).json({
        message: 'Successfully rated answers',
         ratingsString1,
         ratingsString2
      });
  
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "server error" });
    }
  };
  


  exports.candidateAddJob = async(req,res) => {
    const {jobRole} = req.body;
    const candidateId = 1;
    try{
        const [check] = await pool.execute("SELECT * FROM tbl_add_job WHERE job_role = ?",[jobRole]);

        if(check.length === 0){
            return res.status(201).json({message: "role is already exist"});
        }

        const insert = await pool.execute("INSERT INTO tbl_add_job (job_role, candidate_id) VALUES (?,?)",[jobRole,candidateId]);

        if(!insert){
            return res.status(200).json({message: "failed to insert job role"});
        }

        res.status(200).json({message: "role inserted"});

    }catch(e){
        console.log(e)
        res.status(500).json({message: "server error"});
    }
  }


exports.candidateListOfRoles = async(req,res) => {
    const {candidateId} = req.params;

    try{

        const [fetch] = await pool.execute("SELECT * FROM tbl_add_job WHERE candidate_id = ?",[candidateId]);

        if(fetch.length === 0){
            return res.status(200).json({message: "No list"});
        }

        res.status(200).json({message: "fetched", jobs: fetch});

    }catch(e){
        console.log(e)
        res.status(200).json({message: "server error"});
    }
}
  
  