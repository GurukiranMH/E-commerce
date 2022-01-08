const path = require('path');
const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const MONGODB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}cluster0-shard-00-00.w0oew.mongodb.net:27017,cluster0-shard-00-01.w0oew.mongodb.net:27017,cluster0-shard-00-02.w0oew.mongodb.net:27017/${process.env.MONGO_DEFAULT_DATABASE}?ssl=true&replicaSet=atlas-d3jkr1-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getMilliseconds().toString() + '-' + file.originalname);
  },
});

// null in the cb() is error
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  )
    cb(null, true);
  else cb(null, false);
};

const errorController = require('./controllers/error');
const User = require('./models/user');
// const mongoConnect = require('./util/database').mongoConnect;

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const loginRoutes = require('./routes/login');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.urlencoded({ extended: true }));
//we can use bodyParser package or express package for parsing the data

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(express.static(path.join(__dirname, 'public'))); //to connect the css
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(loginRoutes);

app.get('/500', errorController.get500);

app.use(errorController.getErrorPage);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '500',
    Error: error,
    isAuthenticated: req.session.isLoggedIn,
  });
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        connectSrc: ["'self'", 'https://js.stripe.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
  })
);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
