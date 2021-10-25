//Importing packages
const app = require("express")();
const URI = require("./vars.js");
const express = require("express");
const user = require("./authSchema.js");
const message = require("./messageSchema.js");
const mongoose = require("mongoose");
const server = require("http").Server(app);
const io = require("socket.io")(server);

//Variables
const port = process.env.PORT || "8080";

//Web socket
io.on("connection", (socket) => {
  console.log("User connected.");
});
io.on("message", (payload) => {
  io.emit("message", payload);
  try {
    const newMessage = new message({
      id: payload.id,
      user: payload.user,
      content: payload.content,
    });
    newMessage.save().then(() => {
      res
        .status(201)
        .send("Message saved successfully, no errors or problems.");
    });
  } catch (err) {
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Db connection
mongoose.connect(URI);

//Json middleware
app.use(express.json());

//Get endpoint
app.get("/", (req, res) => {
  res.status(401).send("REQUEST ERROR: PLEASE ENTER API KEY.");
});

//Get all message endpoint
app.get("/api/messages/get", (req, res) => {
  try {
    message
      .find()
      .exec()
      .then((data) => res.status(200).send(data));
  } catch (err) {
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Create user endpoint
app.post("/api/users/post/create", (req, res) => {
  //create user
  try {
    const newUser = new user({
      id: req.body.id,
      username: req.body.username,
      password: req.body.password,
      blocked: req.body.blocked,
      onDeleteList: req.body.onDeleteList,
    });
    newUser.save().then(() => {
      res.status(201).send("Saved successfully, no errors and problems.");
    });
  } catch (err) {
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Find users endpoint
app.get("/api/users/get/all", (req, res) => {
  //Find all users
  try {
    user
      .find()
      .exec()
      .then((data) => res.status(200).send(data));
  } catch (err) {
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Login endpoint
app.get("/api/users/get/:user/:password", (req, res) => {
  try {
    user
      .findOne({ username: req.params.user, password: req.params.password })
      .exec()
      .then((data) => {
        res.status(200).send("User login successfully");
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Find user endpoint
app.get("/api/users/get/:user/", (req, res) => {
  try {
    user
      .findOne({ username: req.params.user })
      .exec()
      .then((data) => {
        res.status(200).send("User found");
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(`SERVER ERROR: ${err}`);
  }
});

//Block user endpoint
app.put("/api/users/block/", (req, res) => {
  user.findOne({ username: req.body.user }, (err, data) => {
    if (err) res.status(500).send(err);
    else data.blocked = req.body.blockStatus;
  });
});

//Not found error handling
const notFound = (req, res) => {
  res
    .status(404)
    .send(
      "REQUEST ERROR: The page you requested was not found, please type a valid URL."
    );
};
app.use(notFound);

//Listen server on port
app.listen(port, () => {
  console.log(`Server Ready and listening on port ${port}`);
});
