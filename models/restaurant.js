// --------restaurantSchema--------
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");



const restaurantSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    phone: String,
    password: String,
    partner: {type: Boolean, default: true},
    rating: Number
});

restaurantSchema.plugin(passportLocalMongoose);


module.exports = new mongoose.model("Restaurant", restaurantSchema);