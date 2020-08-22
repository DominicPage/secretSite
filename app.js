//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const Schema = mongoose.Schema;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(process.env.MONGO_DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new Schema({
  email: String,
  password: String,
});
// SCHEMAS SHOULD BE CREATED ABOVE THE SHEEP
// const conatining secret was cut from here and moved to the .env file
// LINE BELOW USED WITH MONGO ENCRYPTION
// userSchema.plugin(encrypt, {  secret: process.env.SECRET,  encryptedFields: ["password"]});
// MODELS SHOULD BE ADDED BELOW THE SHEEP
const UserModel = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    const newUser = new UserModel({
      email: req.body.username,
      password: hash,
    });
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", (req, res) => {
  // Store hash in your password DB.
  const username = req.body.username;
  const password = req.body.password;

  UserModel.findOne(
    {
      email: username,
    },
    (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          //if (foundUser.password === password) {
          bcrypt.compare(password, foundUser.password, (err, result) => {
            if (result === true) {
              res.render("secrets");
            }
          });
        }
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Security app listening on port 3000");
});
