// express server setup
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

// ejs import
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("styles"));

//replaced cookie-parser with cookie-session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//hashing password with bcrypt
const bcrypt = require('bcrypt');

// import data
const { urlDatabase, users } = require('../scripts/data');

// Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/errors", (req, res) => {
  res.render("errors");
});

app.get("/urls_index", (req, res) => {
  res.render("urls_index");
});

app.get("/urls_new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls_show", (req, res) => {
  res.render("urls_show");
});

app.get("/urls", (req, res) => {
    res.render("urls_index");
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});