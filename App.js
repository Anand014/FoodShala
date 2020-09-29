const express = require("express");
const bodyParser = require("body-parser");


const app = express();
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("home")
});

app.get("/about", (req, res) => {
    res.render("about")
});


app.listen(3000, function(req, res){
    console.log("server started at port 3000")
});