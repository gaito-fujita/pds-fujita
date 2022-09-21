const passport = require('passport');
const Localstrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function (passport) {

    passport.use(
        new Localstrategy({ usernameField: 'email' }, (email, password, done) => {
            User.findOne({ email: email }, (err, user) => {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'メールアドレスが正しくありません' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'パスワードが正しくありません' })
                    }
                })
            })
        })
    )
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}