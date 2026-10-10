const express = require('express');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = []; // In-memory user database; demo/course use only.

const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) =>
  users.some(user => user.username === username && user.password === password);

regd_users.post('/login', (req, res) => {
  const {username, password} = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !authenticatedUser(username, password)) {
    return res.status(401).json({message:'Invalid username or password'});
  }
  req.session.user = {username};
  return res.status(200).json({message:'User successfully logged in'});
});

regd_users.put('/auth/review/:isbn', (req, res) => {
  const {isbn} = req.params;
  const username = req.session.user.username;
  const review = req.query.review ?? req.body?.review;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({message:'Book not found'});
  }
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({message:'Review must be a non-empty string'});
  }
  books[isbn].reviews[username] = review.trim();
  return res.status(200).json({message:'Review added/updated successfully', reviews:books[isbn].reviews});
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const {isbn} = req.params;
  const username = req.session.user.username;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({message:'Book not found'});
  }
  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({message:'Review not found for current user'});
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({message:'Review deleted successfully',reviews:books[isbn].reviews});
});

module.exports = {authenticated:regd_users,isValid,authenticatedUser,users};
