import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import connet from "./db.js" // Import database connection
import Level1Score from "./models/level1schema.js" // Import the model
import User from "./models/loginschema.js"

const app = express();

dotenv.config()
const corsoptions={
    origin:"*",
    methods:"GET,POST"
}

// Middleware
app.use(express.json());
app.use(cors(corsoptions));

// Connect to database
connet();

// Route to handle storing Level 1 scores
app.post("/api/level1/submit", async (req, res) => {
    try {
        const { email, score, submissionTime, questionScores } = req.body;

        if (!email || !score || !submissionTime || !questionScores) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newScore = new Level1Score({
            email,
            score,
            submissionTime,
            questionScores,
        });

        await newScore.save();
        res.status(201).json({ message: "Score submitted successfully!" });
    } catch (error) {
        console.error("Error submitting score:", error);
        res.status(500).json({ message: "Server error" });
    }
});

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
