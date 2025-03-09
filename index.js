import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import User from "./models/loginschema.js";
import mongoose from "mongoose";
import Storage from "./models/Storage.js";

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

// -------------------------
// Registration Endpoint
// -------------------------
app.post("/api/technova/register", async (req, res) => {
    try {
        console.log(req.body);
        const { teamDetails } = req.body;
        const { teammates, teamName } = teamDetails;

        if (!Array.isArray(teammates) || teammates.length === 0) {
            return res
                .status(400)
                .json({ message: "Missing or invalid teammates array" });
        }

        // Generate a unique teamId for this registration
        const teamId = new mongoose.Types.ObjectId().toString();
        const formattedTeamName = teamName.toLowerCase().replace(/\s+/g, "");

        const createdUsers = await Promise.all(
            teammates.map(async (teammate) => {
                const { email, name } = teammate;
                if (!email || !name) {
                    throw new Error(
                        "Each teammate must have a name and email."
                    );
                }
                const password = `${formattedTeamName}@technova`;

                const user = await User.create({
                    teamId,
                    email,
                    password,
                    userName: name,
                    teamName,
                    teammates,
                });

                return {
                    email: user.email,
                    userName: user.userName,
                    teamName: user.teamName,
                    teamId: user.teamId,
                };
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

// -------------------------
// Login Endpoint
// -------------------------
app.post("/api/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Missing email or password" });
        }

        const user = await User.findOne({ email, password });
        console.log(user);
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }
        const defaultTime = new Date("9999-03-08T03:12:23.377+00:00");

        // Initialize level1 if not set
        if (!user.level1) {
            user.level1 = {
                score: 0,
                submissionTime: defaultTime,
            };
        }

        // Initialize level2 if not set
        if (!user.level2) {
            user.level2 = {
                moves: 0,
                submissionTime: defaultTime,
            };
        }

        // Initialize level3 if not set
        if (!user.level3) {
            user.level3 = {
                correctAnswers: 0,
                submissionTimes: [defaultTime],
            };
        }

        // Save any updates made to the user document
        await user.save();

        res.status(200).json({
            message: "Sign-in successful",
            user: {
                email: user.email,
                teamName: user.teamName,
                player1: user.teammates[0].name,
                player2: user.teammates[1].name,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            message: "Error occurred",
            error: error.message,
        });
    }
});

// -------------------------
// Storage Update Endpoint
// -------------------------
app.post("/api/update-storage", async (req, res) => {
    try {
        const { email, ...storageData } = req.body;
        console.log(storageData);
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const updatedStorage = await Storage.findOneAndUpdate(
            { email },
            { $set: storageData },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: "Storage updated successfully",
            data: updatedStorage,
        });
    } catch (error) {
        console.error("Error updating storage:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------------
// Level1 Submission Endpoint
// -------------------------
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

// -------------------------
// Level2 Submission Endpoint
// -------------------------
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
            message: "Moves submitted successfully!",
            data: updatedUser.level2,
        });
    } catch (error) {
        console.error("Error submitting moves:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------------
// Level3 Submission Endpoint
// -------------------------
app.post("/api/level3/submit", async (req, res) => {
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
});

// -------------------------
// Level1 Leaderboard Endpoint
// -------------------------
app.get("/api/leaderboard/level1", async (req, res) => {
    try {
        // Retrieve all users who have level1 data.
        const users = await User.find({ level1: { $ne: null } });
        if (!users || users.length === 0) {
            return res.status(200).json({ leaderboard: [] });
        }

        const defaultTimeISO = new Date(
            "9999-03-08T03:12:23.377+00:00"
        ).toISOString();
        // Sort users by descending score and ascending submission time.
        const sortedUsers = users.sort((a, b) => {
            if (b.level1.score !== a.level1.score) {
                return b.level1.score - a.level1.score;
            }
            return (
                new Date(a.level1.submissionTime) -
                new Date(b.level1.submissionTime)
            );
        });

        // Filter out duplicate teams by unique teamId.
        const uniqueTeams = new Set();
        const leaderboard = [];
        for (const user of sortedUsers) {
            if (!uniqueTeams.has(user.teamId)) {
                uniqueTeams.add(user.teamId);

                const submissionTimeISO = new Date(
                    user.level1.submissionTime
                ).toISOString();
                const formattedSubmissionTime =
                    submissionTimeISO === defaultTimeISO
                        ? "Not Submitted"
                        : user.level1.submissionTime;

                leaderboard.push({
                    email: user.email,
                    teamName: user.teamName,
                    teamId: user.teamId,
                    level1: {
                        score: user.level1.score,
                        submissionTime: formattedSubmissionTime,
                    },
                });
            }
        }

        res.status(200).json({ leaderboard: leaderboard });
    } catch (error) {
        console.error("Error fetching level1 leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------------
// Updated Level2 Leaderboard Endpoint
// -------------------------
app.get("/api/leaderboard/level2", async (req, res) => {
    try {
        // Fetch all users – we'll determine submission validity by comparing submissionTime to the default.
        const users = await User.find();
        if (!users || users.length === 0) {
            return res.status(200).json({ leaderboard: [] });
        }

        // Define the default submission timestamp.
        const defaultTimeISO = new Date(
            "9999-03-08T03:12:23.377+00:00"
        ).toISOString();

        // Compute global statistics only for valid submissions.
        let minMoves = Infinity,
            maxMoves = -Infinity;
        let minTime2 = Infinity,
            maxTime2 = -Infinity;
        let minScore = Infinity,
            maxScore = -Infinity;
        let minTime1 = Infinity,
            maxTime1 = -Infinity;

        users.forEach((user) => {
            // For level2, check if submissionTime is not default.
            if (
                user.level2 &&
                new Date(user.level2.submissionTime).toISOString() !==
                    defaultTimeISO
            ) {
                const moves = user.level2.moves;
                const time2 = new Date(user.level2.submissionTime).getTime();
                if (moves < minMoves) minMoves = moves;
                if (moves > maxMoves) maxMoves = moves;
                if (time2 < minTime2) minTime2 = time2;
                if (time2 > maxTime2) maxTime2 = time2;
            }
            // For level1, check if submissionTime is not default.
            if (
                user.level1 &&
                new Date(user.level1.submissionTime).toISOString() !==
                    defaultTimeISO
            ) {
                const score = user.level1.score;
                const time1 = new Date(user.level1.submissionTime).getTime();
                if (score < minScore) minScore = score;
                if (score > maxScore) maxScore = score;
                if (time1 < minTime1) minTime1 = time1;
                if (time1 > maxTime1) maxTime1 = time1;
            }
        });

        // Fallback defaults if no valid submissions exist.
        if (minScore === Infinity) {
            minScore = 0;
            maxScore = 0;
        }
        if (minTime1 === Infinity) {
            minTime1 = Date.now();
            maxTime1 = Date.now();
        }
        if (minMoves === Infinity) {
            minMoves = 0;
            maxMoves = 0;
        }
        if (minTime2 === Infinity) {
            minTime2 = Date.now();
            maxTime2 = Date.now();
        }

        // Map each user to compute their final score.
        const leaderboardUsers = users.map((user) => {
            const level1Submitted =
                user.level1 &&
                new Date(user.level1.submissionTime).toISOString() !==
                    defaultTimeISO;
            const level2Submitted =
                user.level2 &&
                new Date(user.level2.submissionTime).toISOString() !==
                    defaultTimeISO;

            let level1Score = 0;
            if (level1Submitted) {
                let normalizedScore =
                    maxScore === minScore
                        ? 1
                        : (user.level1.score - minScore) /
                          (maxScore - minScore);
                let normalizedTime1 =
                    maxTime1 === minTime1
                        ? 1
                        : 1 -
                          (new Date(user.level1.submissionTime).getTime() -
                              minTime1) /
                              (maxTime1 - minTime1);
                level1Score = normalizedScore * 0.7 + normalizedTime1 * 0.3;
            }

            let level2Score = 0;
            if (level2Submitted) {
                let normalizedMoves =
                    maxMoves === minMoves
                        ? 1
                        : 1 -
                          (user.level2.moves - minMoves) /
                              (maxMoves - minMoves);
                let normalizedTime2 =
                    maxTime2 === minTime2
                        ? 1
                        : 1 -
                          (new Date(user.level2.submissionTime).getTime() -
                              minTime2) /
                              (maxTime2 - minTime2);
                level2Score = normalizedMoves * 0.7 + normalizedTime2 * 0.3;
            }

            // Compute final score:
            // If both levels are valid, average them.
            // Otherwise, use the one that is valid (or 0 if neither is valid).
            let finalScore = 0;
            if (level1Submitted && level2Submitted) {
                finalScore = (level1Score + level2Score) / 2;
            } else if (level1Submitted) {
                finalScore = level1Score;
            } else if (level2Submitted) {
                finalScore = level2Score;
            }

            const formattedLevel1Time = level1Submitted
                ? user.level1.submissionTime
                : "Not Submitted";
            const formattedLevel2Time = level2Submitted
                ? user.level2.submissionTime
                : "Not Submitted";

            return {
                email: user.email,
                teamName: user.teamName,
                teamId: user.teamId,
                level1: {
                    score: level1Submitted ? user.level1.score : 0,
                    submissionTime: formattedLevel1Time,
                },
                level2: {
                    moves: level2Submitted ? user.level2.moves : 0,
                    submissionTime: formattedLevel2Time,
                },
                finalScore,
            };
        });

        // Group users by teamId.
        const teamsMap = {};
        leaderboardUsers.forEach((user) => {
            if (!teamsMap[user.teamId]) {
                teamsMap[user.teamId] = [];
            }
            teamsMap[user.teamId].push(user);
        });

        // For each team, select the best submission:
        // If any team member has a valid submission (either level1 or level2), choose the one with the highest finalScore.
        const finalLeaderboard = [];
        Object.values(teamsMap).forEach((teamUsers) => {
            const validUsers = teamUsers.filter(
                (u) => u.level1.score !== null || u.level2.moves !== null
            );
            if (validUsers.length > 0) {
                const selectedUser = validUsers.sort(
                    (a, b) => b.finalScore - a.finalScore
                )[0];
                finalLeaderboard.push(selectedUser);
            }
        });

        // Sort the final leaderboard by final score in descending order.
        finalLeaderboard.sort((a, b) => b.finalScore - a.finalScore);

        res.status(200).json({ leaderboard: finalLeaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/leaderboard/level3", async (req, res) => {
    try {
        // Retrieve all users who have level3 data.
        const users = await User.find({ level3: { $ne: null } });
        if (!users || users.length === 0) {
            return res.status(200).json({ leaderboard: [] });
        }

        // Default timestamp string for "Not Submitted" state.
        const defaultTimeISO = new Date(
            "9999-03-08T03:12:23.377+00:00"
        ).toISOString();

        // Helper: Check if a user has progress in level3
        const hasProgress = (user) => {
            if (
                user.level3 &&
                Array.isArray(user.level3.submissionTimes) &&
                user.level3.submissionTimes.length > 0
            ) {
                const lastTime = new Date(
                    user.level3.submissionTimes[
                        user.level3.submissionTimes.length - 1
                    ]
                ).toISOString();
                return lastTime !== defaultTimeISO;
            }
            return false;
        };

        // Sort users by descending correctAnswers and then ascending last submission time.
        const sortedUsers = users.sort((a, b) => {
            // Primary: Compare correctAnswers
            if (b.level3.correctAnswers !== a.level3.correctAnswers) {
                return b.level3.correctAnswers - a.level3.correctAnswers;
            }
            // Secondary: Compare last submission time (earlier is better)
            const aLastTime = new Date(
                a.level3.submissionTimes[a.level3.submissionTimes.length - 1]
            );
            const bLastTime = new Date(
                b.level3.submissionTimes[b.level3.submissionTimes.length - 1]
            );
            return aLastTime - bLastTime;
        });

        // Group by teamId and pick the best user per team
        const teamsMap = {};
        sortedUsers.forEach((user) => {
            if (!teamsMap[user.teamId]) {
                teamsMap[user.teamId] = [];
            }
            teamsMap[user.teamId].push(user);
        });

        const finalLeaderboard = [];
        Object.values(teamsMap).forEach((teamUsers) => {
            // First, filter for team members with valid level3 progress.
            const teamWithProgress = teamUsers.filter((u) => hasProgress(u));
            let selectedUser;
            if (teamWithProgress.length > 0) {
                // Sort among those with progress (already sorted overall)
                selectedUser = teamWithProgress[0];
            } else {
                // Fall back to the best overall (even if no progress)
                selectedUser = teamUsers[0];
            }
            finalLeaderboard.push(selectedUser);
        });

        // Optionally, sort the final leaderboard by final ranking criteria.
        // Here we sort by correctAnswers descending and then by last submission time ascending.
        finalLeaderboard.sort((a, b) => {
            if (b.level3.correctAnswers !== a.level3.correctAnswers) {
                return b.level3.correctAnswers - a.level3.correctAnswers;
            }
            const aLastTime = new Date(
                a.level3.submissionTimes[a.level3.submissionTimes.length - 1]
            );
            const bLastTime = new Date(
                b.level3.submissionTimes[b.level3.submissionTimes.length - 1]
            );
            return aLastTime - bLastTime;
        });

        // Format the leaderboard for display.
        const leaderboard = finalLeaderboard.map((user) => {
            const lastSubmission =
                user.level3.submissionTimes[
                    user.level3.submissionTimes.length - 1
                ];
            const submissionTimeISO = new Date(lastSubmission).toISOString();
            const formattedSubmissionTime =
                submissionTimeISO === defaultTimeISO
                    ? "Not Submitted"
                    : lastSubmission;
            return {
                email: user.email,
                teamName: user.teamName,
                teamId: user.teamId,
                level3: {
                    correctAnswers: user.level3.correctAnswers,
                    submissionTime: formattedSubmissionTime,
                },
            };
        });

        // Optionally limit to top 10 teams.
        const top10 = leaderboard.slice(0, 10);
        res.status(200).json({ leaderboard: top10 });
    } catch (error) {
        console.error("Error fetching level3 leaderboard:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
