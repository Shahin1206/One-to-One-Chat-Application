require('dotenv').config();
const cors = require('cors');

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/dynamic-chat-app").then(() => console.log("mongodb connected"));

const express = require('express');
const app = express();

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const userRoute = require("./routes/userRoutes");
app.use("/", userRoute);
app.use(cors());

const http = require('http').Server(app);
const io = require("socket.io")(http);
const usp = io.of('/user-namespace');

usp.on("connection", async function (socket) {
    console.log("User connected");

    const userID = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userID }, { $set: { is_online: '1' } });

    // user broadcast online status
    socket.broadcast.emit('getOnlineUser', {user_id: userID});

    socket.on("disconnect", async function () {
        console.log("User disconnected");
    
        const userID = socket.handshake.auth.token;
        await User.findByIdAndUpdate({ _id: userID }, { $set: { is_online: '0' } });

        // user broadcast online status
        socket.broadcast.emit('getOfflineUser', {user_id: userID});
    })

    // chatting implementation
    socket.on('newChat', function(data) {
        socket.broadcast.emit('loadNewChat', data);
    })

    // load old chats
    socket.on('existsChat', async function(data) {
        var chats = await Chat.find({$or:[
            {sender_id: data.sender_id, receiver_id: data.receiver_id},
            {sender_id: data.receiver_id, receiver_id: data.sender_id},
        ]})

        socket.emit('loadChats', {chats:chats});
    })
})

const port = 3000;
http.listen(port, function () {
    console.log(`server started on port ${port}`);
})