/**
 * title : manufacturer website server :
 * descritpion : build server for  manufacturer website
 * author:Sajibur Rahman ( web developer);
 * date : 21 / 05 / 2022
 */

// depandancy :

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// configaration :

const port = process.env.PORT || 5000;

// app scaffolding :

const app = express();

// middleware :

app.use(cors());
app.use(express.json());

function veryfiJWT(req,res,next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'unauthorize access'});
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,(err,decoded)=>{
    if(err){
      return res.status(403).send({message:'forbidden'})
    };
    req.decoded = decoded;
    next()
  })
}


// connect to mongodb database :

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.vx0t0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// main functionality :

const run = async () => {
  try {
    await client.connect();

    const productCollection = client.db("manufacturer").collection("products");
    const orderCollection = client.db("manufacturer").collection("orders");
    const userCollection = client.db("manufacturer").collection("users");
    const userReviews = client.db("manufacturer").collection("reviews");




    // verify admin 

    async function verifyAdmin(req,res,next){
      const uid = req.decoded.uid;
      const query = {uid:uid};
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if(isAdmin){
        next()
      }else {
        res.send(401).send({message:'unauthorize access'})
      }
    }



    // products : api

    app.get("/products", async (req, res) => {
      const products = await productCollection.find().toArray();
      res.send(products);
    });

    app.post('/products',veryfiJWT,verifyAdmin,async(req,res)=>{
      const body = req.body;
      console.log(body);
      const result = await productCollection.insertOne(body);
      res.send(result);
    });


    app.delete('/products/:id',veryfiJWT,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result)
    })

    // get indevidual product :

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // #####    #####
    // ##### user api  #####
    // #####    ######

    app.put("/users/:uid", async (req, res) => {
      const uid = req.params.uid;
      const user = req.body;
      const filter = { uid: uid };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign({ uid: uid }, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.send({result,token});
    });


    app.get('/users',veryfiJWT,async(req,res)=>{
      const users = await userCollection.find().toArray();
      res.send(users);
    })


    // #####    #####
    // ##### admin api  #####
    // #####    ######

    app.get('/admin/:uid',async(req,res)=>{
      const uid = req.params.uid;
      const query = {uid:uid};
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin' || false;
      res.send({admin:isAdmin})
    })


    app.put('/users/admin/:uid',veryfiJWT,verifyAdmin,async(req,res)=>{
      const uid = req.params.uid;
      const filter = {uid:uid};
      const updatedDoc = {
        $set:{
          role:'admin'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc);
      res.send(result);
    })

    // #####    #####
    // ##### order detail #####
    // #####    ######

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result);
    });

    app.get("/orders",veryfiJWT,verifyAdmin,async(req,res)=>{
      const orders = await orderCollection.find().toArray();
      res.send(orders);
    })

    app.get("/orders/:uid",veryfiJWT,async(req,res)=>{
      const uid = req.params.uid;
      const decodeUid = req.decoded.uid;
      if(decodeUid === uid){

        const query = {customerUid:uid}
        const products = await orderCollection.find(query).toArray();
        res.send(products);
      }
    });


    app.delete('/orders/:id',veryfiJWT,async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })



    // #####    #####
    // ##### customer reviews #####
    // #####    ######

    app.get('/reviews',async(req,res) => {
      const reviews = await userReviews.find().toArray();
      res.send(reviews)
    });

    app.post('/reviews',async(req,res) => {
      const review = req.body;
      const result = await userReviews.insertOne(review);
      res.send(result);
    })




  } catch (err) {
    console.log(err);
  };

  



};

run();

// main api :

app.get("/", (req, res) => {
  res.send({ message: "app is running" });
});

// server running :

app.listen(port, () => {
  console.log(`server is running on port  ${port}`);
});
