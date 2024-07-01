const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["patient", "doctor", "admin"],
        default: "patient"
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model("User", userSchema);