const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const {isValid, users} = require('./auth_users.js');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const {username, password} = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({message:'Username and password are required'});
  }
  if (isValid(username)) return res.status(409).json({message:'Username already exists'});
  users.push({username, password});
  return res.status(201).json({message:'User successfully registered. Now you can login'});
});

// Public routes used by tasks 2-6.
public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({message:'Book not found'});
});
public_users.get('/author/:author', (req, res) => {
  const target = req.params.author.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([,book]) =>
    book.author.toLocaleLowerCase() === target));
  return res.json(matches);
});
public_users.get('/title/:title', (req, res) => {
  const target = req.params.title.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([,book]) =>
    book.title.toLocaleLowerCase() === target));
  return res.json(matches);
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({message:'Book not found'});
});

// Task 11: Promise-based Axios / async-await implementations of the FOUR GET tasks.
// These call the running API; use the routes above for normal HTTP clients.
const API_BASE = process.env.BOOK_API_URL || 'http://localhost:5000';
async function getAllBooksAxios() {
  const response = await axios.get(`${API_BASE}/`);
  return response.data;
}
async function getBookByISBNAxios(isbn) {
  const response = await axios.get(`${API_BASE}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}
async function getBooksByAuthorAxios(author) {
  const response = await axios.get(`${API_BASE}/author/${encodeURIComponent(author)}`);
  return response.data;
}
async function getBooksByTitleAxios(title) {
  const response = await axios.get(`${API_BASE}/title/${encodeURIComponent(title)}`);
  return response.data;
}
module.exports = {general:public_users, getAllBooksAxios, getBookByISBNAxios,
  getBooksByAuthorAxios, getBooksByTitleAxios};
