import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import User from "./models/loginschema.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
    })
);

app.post("/api/level1/submit", async (req, res) => {
    try {
        const { email, score, submissionTime } = req.body;
        if (!email || score === undefined || !submissionTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { level1: { score, submissionTime } } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Score submitted successfully!",
            data: updatedUser.level1,
        });
    } catch (error) {
        console.error("Error submitting score:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/level2/submit", async (req, res) => {
    try {
        const { email, moves, submissionTime } = req.body;
        if (!email || moves === undefined || !submissionTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { level2: { moves, submissionTime } } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "moves submitted successfully!",
            data: updatedUser.level2,
        });
    } catch (error) {
        console.error("Error submitting moves:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Missing email or password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Sign-in successful",
            user: { email: user.email },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
