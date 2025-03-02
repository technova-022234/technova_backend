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

app.post("/api/technova/register", async (req, res) => {
    try {
        const { emails, teamName } = req.body;
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res
                .status(400)
                .json({ message: "Missing or invalid emails array" });
        }

        const formattedTeamName = teamName.toLowerCase().replace(/\s+/g, "");
        const password = `${formattedTeamName}@technova`;

        const createdUsers = await Promise.all(
            emails.map(async (email) => {
                const user = await User.create({ email, password, teamName });
                return { email: user.email };
            })
        );

        res.status(201).json({
            message: "Users registered successfully",
            users: createdUsers,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error.message,
        });
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

app.post("/api/level3/submit",async(req,res) =>{
    try {
        const { email, correctAnswers, submissionTimes } = req.body;
        if (!email || correctAnswers === undefined || !submissionTimes) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { level3: { correctAnswers, submissionTimes } } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Answers submitted successfully!",
            data: updatedUser.level1,
        });
    } catch (error) {
        console.error("Error submitting answers:", error.message);
        res.status(500).json({ message: "Server error" });
    }
})

app.get("/api/leaderboard/level1", async (req, res) => {
    try {
        const topPlayers = await User.find({ level1: { $ne: null } })
            .sort({ "level1.score": -1, "level1.submissionTime": 1 }) 
            .limit(10) 
            .select("email teamName level1.score level1.submissionTime"); 

        res.status(200).json({ leaderboard: topPlayers });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
