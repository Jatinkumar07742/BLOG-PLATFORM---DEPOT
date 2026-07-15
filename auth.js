const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isLoggedOut } = require('../middleware/auth');

// GET /auth/register
router.get('/register', isLoggedOut, (req, res) => {
  res.render('auth/register', { error: req.query.error, user: null });
});

// POST /auth/register
router.post('/register', isLoggedOut, async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.redirect('/auth/register?error=' + encodeURIComponent('All fields are required.'));
    }

    if (password !== confirmPassword) {
      return res.redirect('/auth/register?error=' + encodeURIComponent('Passwords do not match.'));
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.redirect(
        '/auth/register?error=' + encodeURIComponent('Username or email already in use.')
      );
    }

    const user = await User.create({ username, email, password });
    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/register?error=' + encodeURIComponent('Something went wrong. Please try again.'));
  }
});

// GET /auth/login
router.get('/login', isLoggedOut, (req, res) => {
  res.render('auth/login', { error: req.query.error, user: null });
});

// POST /auth/login
router.post('/login', isLoggedOut, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Invalid email or password.'));
    }

    req.session.userId = user._id;
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login?error=' + encodeURIComponent('Something went wrong. Please try again.'));
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;
