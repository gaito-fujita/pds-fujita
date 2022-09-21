const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();


/* GET users */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/mypage');
  } else {
    res.redirect('/users/login');
  }
});

/* GET users/register */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'アカウント登録' });
});

/* POST users/register */
router.post('/register', (req, res) => {
  /* 新規登録 */
  const { name, email, password } = req.body;
  let errors = [];

  if ( !name || !email || !password ) {
    errors.push({ msg: '入力されていない項目があります' });
  }
  if ( password.length < 6 ) {
    errors.push({ msg: 'パスワードは6文字以上にしてください' });
  }
  if ( errors.length > 0 ) {
    res.render('register', {
      errors, 
      name,
      email,
      password
    });
  } else {

    User
      .findOne({ email: email })
      .then(user => {
        if (user) {
          /* メアドが既存 */
          errors.push({ msg: 'そのメールアドレスはすでに登録されています' });
          res.render('register', {
            errors,
            name,
            email,
            password
          });
        } else {
          /* 登録 */
          const newUser = new User({
            name,
            email,
            password
          });
          /* パスワードのハッシュ化 */
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                throw err;
              }
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  res.render('registered', { title: 'アカウント登録' });
                })
                .catch(err => console.log(err));
            })
          })

        }
    })
  }
})

/* GET users/login */
router.get('/login', (req, res, next) => {
  res.render('login', { title: 'ログイン' });
  // next();
  /* ↑ これがあるとlogoutしたときに
   * Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
   * というエラー分が表示される
   */
})

/* POST users/login */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/mypage',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

/* POST users/logout */
router.post('/logout', (req, res) => {
  req.session.passport.user = undefined;
  res.redirect('/users/login');
});

module.exports = router;
