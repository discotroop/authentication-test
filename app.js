
// mongodb+srv://admin:<password>@cluster0-c2h9p.mongodb.net/<dbname>?retryWrites=true&w=majority
// mongodb+srv://admin:admin@cluster0-c2h9p.mongodb.net/authentication1?retryWrites=true&w=majority

// requirements
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// set up db
const mongoDB = "mongodb+srv://admin:admin@cluster0-c2h9p.mongodb.net/authentication1?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useUnifiedTopology: true, useNewUrlParser: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Create user schema
const User = mongoose.model(
    "User",
    new Schema({
        username: { type: String, required: true },
        passowrd: { type: String, required: true }
    })
);

// Set up app.
const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index"));

app.listen(3000, () => console.log("app listening on port 3000!"));


