const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 4000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("course_management_db");
    const coursesCollection = db.collection("courses");
    const usersCollection = db.collection("users");

    //Users related APIs
    app.post("/users", async (req, res) => {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      });

      // manage Users
      app.get("/courses", async (req, res) => {
        const { email } = req.query;
  
        const query = {};
  
        if (email) {
          query.authorEmail = email;
        }
  
        const cursor = coursesCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });
      
      
    //=================== Get Latest Courses =============================
    app.get("/latest-courses", async (req, res) => {
      const cursor = coursesCollection.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    //=================== Post Course =============================
    app.post("/courses", async (req, res) => {
      const newBlog = req.body;
      const result = await coursesCollection.insertOne(newBlog);
      res.send(result);
    });

    //=================== Get Course Details=============================
    //    app.get("/courses/:id", async (req, res) => {
    //     const { id } = req.params;
    //     const query = { _id: new ObjectId(id) };
    //     const result = await coursesCollection.findOne(query);
    //     res.send(result);
    //   });

    app.get("/courses/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await coursesCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Course not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(400).send({ message: "Invalid Course ID format" });
      }
    });

    app.get("/courses", async (req, res) => {
      const { category, status } = req.query;
      const query = {};

      if (category && category !== "all") {
        query.category = category;
      }
      if (status && status !== "all") {
        query.status = status;
      }

      const cursor = coursesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    app.delete("/courses/:id", async (req, res) => {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await coursesCollection.deleteOne(query);
        res.send(result);
      });


    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
