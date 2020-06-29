// node app.js to run

// mongodb+srv://admin:<password>@cluster0-c2h9p.mongodb.net/<dbname>?retryWrites=true&w=majority
// mongodb+srv://admin:admin@cluster0-c2h9p.mongodb.net/authentication1?retryWrites=true&w=majority

/////// app.js

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const mongoDb = "mongodb+srv://admin:admin@cluster0-c2h9p.mongodb.net/authentication1?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        console.log(err)
        return done(err);
      };
      if (!user) {
        console.log("no user")
        return done(null, false, { msg: "Incorrect username" });
      }
      if (password) {
        console.log(password, user.password)
      bcrypt.compare(password, user.password, function(err, results) {
        console.log(results)
        // This is WRONG!! why ?
        if (!results) {
          // passwords match! log user in
          console.log(results)
          return done(null, user)
        } else {
          console.log("fuck you bcrypt")
          // passwords do not match!
          //return done(null, false, {msg: "Incorrect password"})
        }
      })
    }
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index", {user: req.user }));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", (req, res, next) => {
  bcrypt.hash("somePassword", 3, function (err, hashedPassword) {
    if(err) {console.log(err)}
    // if err, do something
    // otherwise, store hashedPassword in DB
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    }).save(err => {
      if (err) { 
        return next(err);
      };
      console.log(hashedPassword)
      res.redirect("/");
    });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));