/**
 * title : manufacturer website server : 
 * descritpion : build server for  manufacturer website 
 * author:Sajibur Rahman ( web developer);
 * date : 21 / 05 / 2022
*/

// depandancy : 

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// configaration : 

const port = process.env.PORT || 5000;

// app scaffolding : 

const app = express();

// middleware : 

app.use(cors());
app.use(express.json());

// connect to mongodb database : 




// main functionality : 






// main api : 

app.get('/',(req,res)=>{
    res.send('app is running');
})


// server running : 

app.listen(port,()=>{
    console.log(`server is running on port  ${port}`);
})

