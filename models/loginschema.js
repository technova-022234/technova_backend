import mongoose from "mongoose";

const Level1Schema = new mongoose.Schema({
    score: { type: Number, required: true },
    submissionTime: { type: Date, required: true }
}, { _id: false }); 

const Level2Schema = new mongoose.Schema({
    moves: { type: Number, required: true },
    submissionTime: { type: Date, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    teamName: {
        type: String,
        required: true
    },
    level1: { 
        type: Level1Schema, 
        default: null 
    },
    level2: {
        type: Level2Schema,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
