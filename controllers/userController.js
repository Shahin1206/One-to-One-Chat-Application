const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Chat = require("../models/chatModel");
const { ObjectId } = require("mongodb");
// const { use } = require("../routes/userRoutes");


const handleUserRegistrationForm = async (req, res) => {
    try {
        res.render("register")
    } catch (error) {
        console.log(error.message);
    }
}

const handleUserRegistration = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            image: 'images/' + req.file.filename
        })
        await user.save();

        res.render('register', { message: 'Registration Successful!' });

    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error.message)
    }
}

const login = async(req,res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email: email});

        if(userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if(passwordMatch) {
                req.session.user = userData;
                res.redirect('/dashboard');
            }
            else {
                res.render('login', {message: "Incorrect email or password"})
            }
        }
        else{
            res.render('login', {message: "Incorrect email or password"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req,res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req,res) => {
    try {
        const users = await User.find({_id: { $nin:[req.session.user._id] } } );
        res.render("dashboard", {user: req.session.user, users:users});
    } catch (error) {
        console.log(error.message)
    }
}

const saveChat = async(req,res) => {
    console.log("Request body",req.body);
    try {
        const sender_id = new ObjectId(req.body.sender_id);
        const receiver_id = new ObjectId(req.body.receiver_id);
        // const chat = new Chat({
        //     sender_id: req.body.sender_id,
        //     receiver_id: req.body.receiver_id,
        //     message: req.body.message,
        // })
        const chat = new Chat({ sender_id, receiver_id, message: req.body.message });
        console.log("CHAT OBJ TO BE SAVED: ", chat);
        let newChat = await chat.save();
        console.log("NEWCHAT: ", newChat);
        res.status(200).send({success: true, message:'Chat inserted!', data: newChat});
    } catch (error) {
        res.status(400).send({sucess: false, msg: error.message});
    }
}

module.exports = {
    handleUserRegistrationForm,
    handleUserRegistration,
    loadDashboard,
    loadLogin,
    login,
    logout,
    saveChat,
};