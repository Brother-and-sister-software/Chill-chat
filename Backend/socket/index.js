const mongoose = require("mongoose");
const message = require("./messageSchema.js");
const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const io = require("socket.io");

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

dotenv.config();
io.listen(server);
mongoose.connect(process.env.URI);

io.on("connection", (socket) => {
  socket.on("message", (payload) => {
    /**
     * This event will emit a message to all connected listeners on the network.
     *
     * @param {string} id The message id.
     * @param {string} user The message's sender id.
     * @param {string} content The message's content or what it says.
     * @param {string} room The room that the message belongs to.
     *
     * Please put all the following content in the payload like the following:
     * @example socket.emit("message", {id: "abcdefg123456789", user:"abcd138ef", content:"Hi there!"}, "0")
     */

    io.emit("message", payload);
    try {
      const newMessage = new message({
        id: payload.id,
        user: payload.user,
        content: payload.content,
        room: payload.room,
      });
      newMessage.save().then(() => {});
    } catch (err) {
      console.log(err);
    }
  });
});

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
