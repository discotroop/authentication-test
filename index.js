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
let User = require("./modules/user");

const mongoDb = "mongodb+srv://admin:admin@cluster0-c2h9p.mongodb.net/authentication1?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// const User = mongoose.model(
//   "User",
//   new Schema({
//     username: { type: String, required: true },
//     password: { type: String, required: true }
//   })
// );

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");


// http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        console.log(err)
        return done(err);
      };
      user.comparePassword("1" , function(err, isMatch) {
        if (err) { console.log(err)}
        console.log("compare", password, isMatch, user.password)
        return;
      });
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

// // create a user a new user
// var testUser = new User({
//   username: 'f',
//   password: 'a'
// });

// let newpassword = "a";
// // save user to database
// testUser.save(function(err) {
//   if (err) throw err;

//   // fetch user and test password verification
//   User.findOne({ username: testUser.username }, function(err, user) {
//       if (err) throw err;

//       // test a matching password
//       user.comparePassword(newpassword , function(err, isMatch) {
//           if (err) throw err;
//           console.log('Password123:', isMatch); // -> Password123: true
//       });

//       // test a failing password
//       user.comparePassword('123Password', function(err, isMatch) {
//           if (err) throw err;
//           console.log('123Password:', isMatch); // -> 123Password: false
//       });
//   });
// });



app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index", {user: req.user }));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", (req, res, next) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    }).save(err => {
      if (err) { 
        return next(err);
      };
      console.log(req.body.password)
      res.redirect("/");
    });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/smelly",
    failureRedirect: "/fail"
  })
);

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));