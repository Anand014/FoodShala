const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const {middleware , middlewareRestaurant} = require("./middleware");
const { use } = require("passport");


const app = express();
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/foodshalaDB",{ useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connect("mongodb+srv://Anand:12345@yourblogdb.lhdpi.mongodb.net/foodshalaDB",{ useUnifiedTopology: true, useNewUrlParser: true });

mongoose.set("useCreateIndex", true);

app.use(
    session({
      secret: "passport",
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(passport.initialize());
app.use(passport.session());

  
app.use(function (req, res, next) {
    // console.log(req.user)
     res.locals.currentUser = req.user;
     next();
});

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//   -------FoodDB------------

const foodSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    category: String,
    restaurant_id: String
});

const Food =  mongoose.model("Food", foodSchema);

// ---------------Orders--------------

const orderSchema = new mongoose.Schema({
    foodID: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    restaurantID: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rating: Number,
    quantity:Number,
    status : String,
    orderAt: { type: Date, default: Date.now }
});

const Order =  mongoose.model("Order", orderSchema);
 
// ---Routes----

app.get("/", (req, res) => {
    res.render("home")
});

app.get("/about", (req, res) => {
    res.render("about")
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.post("/login", (req, res) => {
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });
    req.login(user, (err) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            passport.authenticate("local") (req, res, () => {
                console.log("successfully logged in")
                res.redirect("/");
            });
        }
    });
});

app.get("/logout" , (req, res)=> {
    req.logOut()
    res.redirect("/")
});

app.get("/signup", (req, res) => {
    res.render("signup")
});

app.post("/signup" , (req, res) =>{
    User.register({
        name: req.body.name,
        username: req.body.username,
        address: req.body.address,
        preference : req.body.category,
        phone: req.body.phone
    }, req.body.password, (err, user) => {
        if(err) {
            console.log(err)
            res.redirect("/signup");
        } else {
            passport.authenticate("user-local")(req, res, () =>{
                console.log("user is in database")
                res.redirect("/");
            });
        }
    });
});


app.get("/partnerlogin", middleware.isLoggedOut , (req, res) =>{
    res.render("partnerlogin")
});

// -----------restrologin--------------


app.get("/partnersignup",middleware.isLoggedOut, (req, res) => {
    res.render("partnersignup")
});

app.post("/partnersignup" , (req, res) =>{
   User.register({
        name: req.body.name,
        username: req.body.username,
        address: req.body.address,
        phone: req.body.phone,
        partner : true
    }, req.body.password, (err, restaurant) => {
        if(err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, () =>{
                console.log("Restaurant is in database")
                res.redirect("/")
            });
        }
    });
});

app.get("/additems",middlewareRestaurant.isLoggedIn, (req, res) => {
    res.render("additems")
});

app.post("/additems", (req ,res) => {
    const name = req.body.name;
    const image = req.body.image;
    const price = req.body.price;
    const description = req.body.description;
    const category = req.body.category;
    restaurant_id = req.user.id;

    const newFood = {
        name: name,
        image: image,
        price: price,
        description: description,
        category: category,
        restaurant_id: restaurant_id
    };

    Food.create(newFood, (err, newlycreated) => {
        if(err){
            console.log(err);
        } else {
            console.log("Food Created");
            res.redirect("/restaurantitems");
        }
    });
});

app.get("/cuisine", (req, res) => {
    let perPage = 9;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    let checkQuery = false;
    Food
    .find({})
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec(function(err, allFood){
        Food.countDocuments().exec((err, count) =>{
            if(err){
                console.log(err);
            } else {
                res.render("cuisine", {
                foods : allFood,
                current: pageNumber,
                num: count,
                pages: Math.ceil(count / perPage),
                checkQuery: checkQuery
                });
            }
        });
    });
});


app.get("/restaurantitems",middlewareRestaurant.isLoggedIn, (req, res) => {
    let perPage = 9;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    let checkQuery = false;
    const restaurantID = req.user.id;
    Food.find({restaurant_id : restaurantID})
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec(function(err, allFood){
        Food.countDocuments().exec((err, count) =>{
            if(err){
                console.log(err);
            } else {
                res.render("restaurantitems", {
                foods : allFood,
                current: pageNumber,
                num: count,
                pages: Math.ceil(count / perPage),
                checkQuery: checkQuery
                });
            }
        });
    });
});
app.get("/restaurantitems/:foodID",(req, res)=>{
    const FoodId = req.params.foodID;
    Food.deleteOne({_id: FoodId }, function (err) {
        if (err) return handleError(err);
        else res.redirect("/restaurantitems")
      });
})

app.get("/cuisine/:foodID/:restaurantID", (req, res) => {
    const userId = req.user.id;
    const FoodId = req.params.foodID;
    const restaurantID = req.params.restaurantID;
    const neworder = {
        foodID: FoodId,
        userID: userId,
        restaurantID: restaurantID,
        status: "INCART"
    }
    Order.create(neworder, (err,ordercreated)=>{
        if(err){
            console.log(err)
        } else{
            console.log("Order Created Successfully")
            res.redirect("/mycart")
        }
    });
});

app.get("/mycart",middleware.isLoggedIn, (req, res) =>{
    const userID = req.user.id;
    Order.find({userID: userID , status: "INCART"}).populate('foodID').populate('restaurantID')
    .exec((err, order) => {
        if(err){
            console.log(err)
        } else {
            res.render("cart", {orders:order})
        }
    });
});


app.get("/mycart/:orderID", (req, res) => {
    const orderID = req.params.orderID;
    Order.updateOne({_id:orderID},{status: "PENDING"}, (err)=>{
        if(err){
            console.log(err)
        } else {
            console.log("Order Placed")
            res.redirect("/myorders");
        }
    });
});

app.get("/mycart/:orderID/remove", (req, res) => {
    const orderID = req.params.orderID;
    Order.updateOne({_id:orderID},{status: null}, (err)=>{
        if(err){
            console.log(err)
        } else {
            res.redirect("/mycart");
        }
    });
})

app.get("/myorders" ,middleware.isLoggedIn, (req, res) => {
    let perPage = 9;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    let checkQuery = false;

    Order.find({ $and:[{userID: req.user.id, status : {$ne:"INCART"}},
    {userID: req.user.id, status : {$ne:null}},
    {userID: req.user.id, status : {$exists: true }}]})
    .sort({orderAt: -1}).populate('foodID').populate('restaurantID')
    .exec((err, order) => {
        Order.countDocuments().exec((err, count) =>{
        if(err){
            console.log(err)
        } else {
            res.render("myorders", {
                orders:order,
                current: pageNumber,
                num: count,
                pages: Math.ceil(count / perPage),
                checkQuery: checkQuery
            });
        }
    });
});
});

app.get("/vieworders",middlewareRestaurant.isLoggedIn, (req, res) =>{
    const restaurantID = req.user.id;
    Order.find({restaurantID: restaurantID , status: "PENDING"}).populate('foodID').populate('userID').exec((err, order) => {
        if(err){
            console.log(err)
        } else {
            res.render("vieworders", {orders:order})
        }
    });
});

app.get("/previousorders",middlewareRestaurant.isLoggedIn, (req, res) =>{
    let perPage = 9;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
    let checkQuery = false;
    
    const restaurantID = req.user.id
    Order.find({ $and:[{restaurantID: restaurantID, status : {$ne:"INCART"}},
    {restaurantID: restaurantID, status : {$ne:null}},
    {restaurantID: restaurantID, status : {$exists: true }}]})
    .sort({orderAt: -1}).populate('foodID')
    .populate('userID')
    .exec((err, order) => {
        Order.countDocuments().exec((err, count) =>{
        if(err){
            console.log(err)
        } else {
            res.render("previousorders", {
                orders:order,
                current: pageNumber,
                num: count,
                pages: Math.ceil(count / perPage),
                checkQuery: checkQuery
            });
        }
    });
});
});

app.get("/vieworders/:orderID", (req, res) => {
    const orderID = req.params.orderID;
    Order.updateOne({_id:orderID},{status: "APPROVED"}, (err)=>{
        if(err){
            console.log(err)
        } else {
            console.log("Food will be Delivered soon")
            res.redirect("/previousorders");
        }
    });
});

app.get("/vieworders/:orderID/decline", (req, res) => {
    const orderID = req.params.orderID;
    Order.updateOne({_id:orderID},{status: "DECLINE"}, (err)=>{
        if(err){
            console.log(err)
        } else {
            console.log("Food will be Delivered soon")
            res.redirect("/vieworders");
        }
    });
});

app.get("/profileupdate",middleware.isLoggedIn, (req, res)=> {
    res.render("profileupdate");
});

app.post("/profileupdate", (req, res) => {
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;
    const preference = req.body.category;
        User.updateOne({_id: req.user._id},{name: name, address: address, phone: phone,preference: preference}, function(err){
            if(err){
              console.log(err);
            } else {
              res.redirect("/");
            }
          });
});


app.get("/safety", (req, res)=> {
    res.render("safety");
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("The server has started at port 3000.");
  });
  
