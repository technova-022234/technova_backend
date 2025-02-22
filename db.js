import mongoose from "mongoose";

const connet=()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb connected")
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}

export default connet