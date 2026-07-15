require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (persisted in MongoDB so login survives server restarts)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog-platform',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Load current user for every request and expose to templates
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      req.currentUser = await User.findById(req.session.userId).select('-password');
    } catch (err) {
      req.currentUser = null;
    }
  } else {
    req.currentUser = null;
  }
  res.locals.currentUser = req.currentUser;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', postRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.', user: req.currentUser });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong on our end.', user: req.currentUser });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
