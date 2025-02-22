import express from "express"
import dotenv from "dotenv"
import connet from "./db.js"
import cors from "cors"


dotenv.config()
const corsoptions={
    origin:"*",
    methods:"GET,POST"
}
const app = express()
connet()
app.use(express.json())
app.use(cors(corsoptions))

app.get("/info",(req,res) =>{
    const a= 4+9
    res.json({addition : a})
})
app.post("/addition",(req,res)=>{
    const {a,b}=req.body;
    const c= a+b
    res.json({addition:c})
})
app.listen(5000,()=> {
    console.log("server is running on port 5000")
})