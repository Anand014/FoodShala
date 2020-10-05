// ----userSchema-------
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const restaurant = require("./restaurant");



const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    phone: String,
    preference: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", userSchema);
