import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname,"public"))); 
app.get('/',(req,res)=>{
    res.send("WELCOME");
})

app.use('/api/auth',authRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running on Port ${PORT}`);
})