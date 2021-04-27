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
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }

  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    return renderErrorPage(req, res, 403, 'Please Log In First :)');
  }

  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    serverCookies: req.session,
    displayName: users[req.session["user_id"]].email
  };
  return res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }

  const templateVars = {
    serverCookies: req.session,
    displayName: users[req.session["user_id"]].email
  };
  
  return res.render("urls_new", templateVars);
});

// Shows specific URL information
app.get("/urls/:shortURL", (req, res) => {
  const urlArray = Object.keys(urlsForUser(req.session["user_id"], urlDatabase));
  if (!req.session["user_id"]) {
    return renderErrorPage(req, res, 403, 'Please Log In First :)');
  }

  if (!urlArray.includes(req.params.shortURL)) {
    return renderErrorPage(req, res, 403, 'Not Yours');
  }

  const templateVars = {
    urlArray: urlArray,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    serverCookies: req.session,
    displayName: users[req.session["user_id"]].email
  };

  return res.render("urls_show", templateVars);
});

//Redirect to actual url link when clicked
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return renderErrorPage(req, res, 403, 'Short URL Does Not Exist');
  }

  return res.redirect(urlDatabase[req.params.shortURL].longURL);
});



// Adding more urls
app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    renderErrorPage(req, res, 403, 'Please Log In First :)');
  }

  if (!req.body.newURL.includes('http://') || !req.body.newURL.includes('https://')) {
    return renderErrorPage(req, res, 403, "Did you include 'http(s)://?'");
  }

  return updateURL(req, res);
});


//Update long URL of short URL
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    return renderErrorPage(req, res, 403, 'Please Log In');
  }
  
  if (!req.body.newURL.includes('http://') || !req.body.newURL.includes('https://')) {
    return renderErrorPage(req, res, 403, "Did you include 'http(s)://?'");
  }

  return updateURL(req, res);
});

// Delete URLs from list
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session["user_id"]) {
    return renderErrorPage(req, res, 403, "You can't delete what's not yours");
  }

  delete urlDatabase[req.params.shortURL];
  return res.redirect(`/urls`);
});

// Redirects to short URL info page
app.post("/urls/:shortURL/edit", (req, res) => {
  //Check if logged in
  if (!req.session["user_id"]) {
    return renderErrorPage(req, res, 403, "You can't edit what's not yours");
  }

  let shortURL = req.params.shortURL;
  return res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  if (!req.session["user_id"]) {
    const templateVars = {
      urls: urlDatabase,
      serverCookies: req.session
    };
    return res.render("login", templateVars);
  }
    
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (!req.session["user_id"]) {
    const templateVars = {
      serverCookies: req.session
    };
    return res.render("register", templateVars);
  }
    
  return res.redirect("/urls");
});

//Login Post Method
app.post("/login", (req, res) => {
  if (!emailExists(req.body.email, users)) {
    return renderErrorPage(req, res, 403, "Please register first!");
  }
  if (!passwordMatch(req.body, users)) {
    return renderErrorPage(req, res, 403, "Wrong password");
  }

  req.session["user_id"] = getID(req.body.email, users);
  return res.redirect("/urls");
});

//Register Post Method
app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  if (!req.body.email.length || !req.body.psw.length) {
    return renderErrorPage(req, res, 403, "Please Fill Out BOTH Fields");
  }
  
  if (emailExists(req.body.email, users)) {
    return renderErrorPage(req, res, 403, "You Already Have An Account!");
  }

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.psw, 10)
  };
  req.session["user_id"] = randomID;
  return res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

