import mongoose from "mongoose";

const Level1ScoreSchema = new mongoose.Schema({
    email: { type: String, required: true }, // Assuming each user has a unique ID
    score: { type: Number, required: true },
    submissionTime: { type: Date, required: true },
    questionScores: [
        {
            questionIndex: Number,
            score: Number,
        },
    ],
});

export default mongoose.model("Level1Score", Level1ScoreSchema)
