const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p3m2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db("watchShop").collection("services");
    const ordersCollection = client.db("watchShop").collection("orders");
    const reviewsCollection = client.db("watchShop").collection("reviews");
    const usersCollection = client.db("watchShop").collection("users");
    const blogsCollection = client.db("watchShop").collection("blogs");

    // servicesCollection /product database
    // // get api read data show on the ui
    // // get api read all product from database  load korsi
    app.get("/products", async (req, res) => {
      const result = await servicesCollection.find({}).toArray();
      res.send(result);
    });
    // // create get api find a single product useing id show on the ui conneted to placeorder page 
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.json(result);
    });

    // // delete from manage products page admin dashboard useing delete api conected to admin dashboard manage product page
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // orers collection database
    // // add single product buy now button create api set on the database connected to place order page
    app.post("/placeorder", async (req, res) => {
      const newProduct = req.body;
      const result = await ordersCollection.insertOne(newProduct);
      res.json(result);
    });
     // // update order api connected to place order page
     app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });


    // load the all orers to show the admin dashboard useing get api connected ot manage all order page
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    // delete the every order from manage all order admin can delete create useing delete api connected manage all order page
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // // load buy now order on the ui api my order component connected ot my order page
    app.get("/order/:email", async (req, res) => {
      const id = req.params.email;
      const result = await ordersCollection.find({ email: id }).toArray();
      res.send(result);
    });
      // // delete from my orders create delete api
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        console.log('hitted from my order page', id);
        const query = { _id: ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
      });
  
  
    // reviews collection database
    // create new database add reviews one by one useing post api
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewsCollection.insertOne(reviews);
      res.json(result);
    });

    // load the all reviews data from database ueing get api
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    // get user detail set on the database using post api
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.json(result);
    });
    // update user useing put api upsert method use kore er kaj hocce user na thakle database e add korbe ar user thakle add korbe na add new user on database google sign in method
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // update users to set the role the user is admin on the database useing put api
    app.put("/users/admin", async (req, res) => {
      const user = req.body.email;
      const filter = { email: user };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get the specific user verified with email useing get api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add service create post api for admin dashboard add service page
    app.post("/products", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // // get api read all blogs from database  load korsi
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello backend how are you");
});

app.listen(port, () => {
  console.log("listening to port ", port);
});
