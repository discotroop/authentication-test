// node app.js to run

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
        password: { type: String, required: true }
    })
);

// Set up app.
const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

// local strategy for authentication:
passport.use(
    new LocalStrategy((username, password, done) => {
        // look for user in db
      User.findOne({ username: username }, (err, user) => {
          // if err then err
        if (err) { 
          return done(err);
        };
          // if no match return incorrect name
        if (!user) {
          return done(null, false, { msg: "Incorrect username" });
        }
          // if pword doesn't match return incorrect password
        if (user.password !== password) {
          return done(null, false, { msg: "Incorrect password" });
        }
          // ?
        return done(null, user);
      });
    })
  );

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

// Handle POST on sign up
app.post("/sign-up", (req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    }).save(err => {
        if(err) { return next(err)};
    res.redirect("/");
    });
});

app.listen(3000, () => console.log("app listening on port 3000!"));


