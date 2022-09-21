const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const mongoose = require('mongoose');
const db = require('./config/db');

mongoose
  .connect(db.url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    user: db.user,
    pass: db.pass, 
    dbName: db.dbName,
  })
  .then(()=> console.log('successfully connected to the database!'))
  .catch(err=> console.log(err));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const mypageRouter = require('./routes/mypage');
const activityRouter = require('./routes/activity')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  // cookie: {secure: true} // 本番環境では必須らしい
}))

// passport
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mypage', mypageRouter);
app.use('/activity', activityRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;