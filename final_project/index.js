const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const general_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'course-demo-change-this-secret',
  resave:false,
  saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:'lax'}
}));
app.use('/customer/auth', (req, res, next) => {
  if (!req.session?.user?.username) {
    return res.status(401).json({message:'Please login to manage reviews'});
  }
  next();
});
app.use('/customer',customer_routes);
app.use('/', general_routes);
const port = Number(process.env.PORT || 5000);
if (require.main === module) app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
module.exports = app;
