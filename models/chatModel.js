const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    message: {
        type: String,
        required: true
    },
}, {timestamps: true})

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;