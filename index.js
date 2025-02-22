import express from "express"
import dotenv from "dotenv"
import connet from "./db.js"
import cors from "cors"
import User from "./models/loginschema.js"


dotenv.config()
const corsoptions={
    origin:"*",
    methods:"GET,POST"
}
const app = express()
connet()
app.use(express.json())
app.use(cors(corsoptions))


const verifyUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and password matches
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // If user exists and password matches, send success response
        res.status(200).json({
            message: "Sign-in successful",
            user: { email: user.email},
        });
    } catch (error) {
        res.status(500).json({ message: "Error occurred", error: error.message });
    }
};

// API Route for Login
app.post("/api/users/login", verifyUser);


app.listen(5000,()=> {
    console.log("server is running on port 5000")
})