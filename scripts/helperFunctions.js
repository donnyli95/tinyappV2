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

const emailExists = (string, object) => {
  let emailArray = [];
  for (let randomID in object) {
    emailArray.push(object[randomID].email);
  }

  if (emailArray.includes(string)) {
    return true;
  }
  
  return false;

};

const passwordMatch = (email, password, database) => {
  let emailArray = [];
  let passwordArray = [];
  for (let randomID in database) {
    emailArray.push(database[randomID].email);
    passwordArray.push(database[randomID].password);
  }

  let indicator;
  if (emailArray.includes(email)) {
    for (let index in email) {
      if (emailArray[index] === email) {
        indicator = index;
        break;
      }
    }
  }

  if (bcrypt.compareSync(password, passwordArray[indicator])) {
    return true;
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



module.exports = { generateRandomString, emailExists, passwordMatch, getID, urlsForUser};

