//hashing existing passwords with bcrypt
// so i can compare in my matching password helper function
const bcrypt = require('bcrypt');

const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "aJ48lW" },
  "bunbu1": { longURL: "https://www.crunchyroll.com", userID: "bunbun" },
  "bunbu2": { longURL: "https://www.lighthouselabs.ca/", userID: "bunbun" },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "bunbun": {
    id: "bunbun",
    email: "bun@bun.com",
    password: bcrypt.hashSync("bunbun", 10)
  }
};

module.exports = { urlDatabase, users };
