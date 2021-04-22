// import data
const { urlDatabase, users } = require('../scripts/data');
const { generateRandomString, emailExists, passwordMatch, getID, urlsForUser, renderErrorPage, updateURL } = require('../scripts/helperFunctions');

// express server setup
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("styles"));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Initial Page Redirection
app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, 'Please Log In First :)');
  } else {
    const templateVars = {
      urls: urlsForUser(req.session["user_id"], urlDatabase),
      serverCookies: req.session,
      displayName: users[req.session["user_id"]].email
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new");
  }
});

// Shows specific URL information
app.get("/urls/:shortURL", (req, res) => {
  const urlArray = Object.keys(urlsForUser(req.session["user_id"], urlDatabase));
  // Check if logged in
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, 'Please Log In First :)');
  } else if (!urlArray.includes(req.params.shortURL)) {
    renderErrorPage(req, res, 403, 'Not Yours');
  } else {
    const templateVars = {
      urlArray: urlArray,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      serverCookies: req.session,
      displayName: users[req.session["user_id"]].email
    };
    res.render("urls_show", templateVars);
  }
});

//Redirect to actual url link when clicked
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    renderErrorPage(req, res, 403, 'Short URL Does Not Exist');
  } else {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});



// Adding more urls
app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, 'Please Log In First :)');
  } else if (!req.body.newURL.includes('http://') || !req.body.newURL.includes('https://')) {
    renderErrorPage(req, res, 403, "Did you include 'http(s)://?'");
  } else {
    updateURL(req, res);
  }
});


//Update long URL of short URL
app.post("/urls/:shortURL", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, 'Please Log In');
  } else if (!req.body.newURL.includes('http://') || !req.body.newURL.includes('https://')) {
    renderErrorPage(req, res, 403, "Did you include 'http(s)://?'");
  } else {
    updateURL(req, res);
  }
});

// Delete URLs from list
app.post("/urls/:shortURL/delete", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, "You can't delete what's not yours");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

// Redirects to short URL info page
app.post("/urls/:shortURL/edit", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, "You can't edit what's not yours");
  } else {
    let shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/login", (req, res) => {
  if (!req.session["user_id"]) {
    const templateVars = {
      urls: urlDatabase,
      serverCookies: req.session
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    const templateVars = {
      serverCookies: req.session
    };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//Login Post Method
app.post("/login", (req, res) => {
  //Check if user exists
  if (!emailExists(req.body.email, users)) {
    renderErrorPage(req, res, 403, "Please register first!");
  } else if (!passwordMatch(req.body, users)) {
    renderErrorPage(req, res, 403, "Wrong password");
  } else {
    req.session["user_id"] = getID(req.body.email, users);
    res.redirect("/urls");
  }
});

//Register Post Method
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (!req.body.email.length || !req.body.psw.length) {
    renderErrorPage(req, res, 403, "Please Fill Out BOTH Fields");
    // Check if user exists
  } else if (emailExists(req.body.email, users)) {
    renderErrorPage(req, res, 403, "You Already Have An Account!");
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.psw, 10)
    };
    req.session["user_id"] = randomID;
    res.redirect("/urls");
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});