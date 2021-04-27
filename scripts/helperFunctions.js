//hashing password with bcrypt
const bcrypt = require('bcrypt');

//Returns random string, 6 characters long
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let maxNum = characters.length;
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * maxNum);
    result += characters[index];
  }

  return result;
};

const emailExists = (email, database) => {
  for (let randomID in database) {
    if (database[randomID].email === email) {
      return true;
    }
  }
  return false;
};

const passwordMatch = (requestBody, database) => {
  const { email, psw } = requestBody;
  for (let randomID in database) {
    if (database[randomID].email === email) {
      if (bcrypt.compareSync(psw, database[randomID].password)) {
        return true;
      }
    }
  }
  return false;
};


const getID = (email, database) => {
  for (let objects in database) {
    if (database[objects].email === email) {
      return database[objects].id;
    }
  }
};

const urlsForUser = (id, userObj) => {
  let newURLs = {};
  for (let data in userObj) {
    if (userObj[data].userID === id) {
      newURLs[data] = {
        longURL:  userObj[data].longURL,
        userID: userObj[data].userID
      };
    }
  }
  return newURLs;
};

//Function: Render error page with relevant status code
const renderErrorPage = (req, res, errorNumber, errorMessage) => {
  const templateVars = {
    errorMessage: errorMessage
  }
  res.status(errorNumber).render("errors", templateVars);
}

//Function: update url database and redirect
const updateURL = (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
}

module.exports = { generateRandomString, emailExists, passwordMatch, getID, urlsForUser, renderErrorPage, updateURL };

