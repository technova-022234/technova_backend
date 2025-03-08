import mongoose from "mongoose";

const StorageSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    currentQuestionIndex: {
        type: Number,
        default: 0,
    },
    hintsState: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    levelComplete: {
        type: Boolean,
        default: false,
    },
    puzzleBoard: {
        type: [Number],
        default: [],
    },
    puzzleMoveCount: {
        type: Number,
        default: 0,
    },
    puzzleSolved: {
        type: Boolean,
        default: false,
    },
    score: {
        type: Number,
        default: 100,
    },
    submissionData: {
        questionIndex: {
            type: Number,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        submissionTimes: {
            type: [Date],
            default: [],
        },
        remainingRings: {
            type: Number,
            default: 3,
        },
    },
    submittedQuestions: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    userAnswers: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
});

export default mongoose.model("Storage", StorageSchema);
