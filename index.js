import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import connet from "./db.js" // Import database connection
import Level1Score from "./models/level1schema.js" // Import the model

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
