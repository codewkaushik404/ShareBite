
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import {generateToken} from "../middleware/tokenHandler.js";


const userLogin = asyncHandler (async(req,res,next)=>{
    const {email, password} = req.body;
    //console.log(email,password);
    if(!email || !password){
        res.statusCode = 400;
        return next(new Error("All fields are necessary"));
    }
   
    const user = await User.findOne({email});
    if(!user){
        res.statusCode = 404;
        return next(new Error("User not found"));
    }
    const result = await bcrypt.compare(password,user.password);
    if(!result){
        res.statusCode = 401;
        return next(new Error("Invalid credentials"));
    }
    const token = generateToken(email);
    return res.json({message: "User logged in.",Token: token});
});

const serveSignUp = asyncHandler( async(req,res)=>{
    res.render()
});

const userSignUp = asyncHandler(async(req,res,next)=>{
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.statusCode = 400;
        return next(new Error("All fields are necessary"));
    }

    const existingUser = await User.findOne({username});
    const existingEmail = await User.findOne({email});
    if(existingUser || existingEmail){
        return res.send("Username or Email already exists");
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        email,
        password:hashedPassword
    })
    return res.json({message:"User successfully registered",User: user});
})

export {
    userLogin,
    userSignUp
}