const express = require('express');
const passport = require('passport');
const YahooStrategy = require("passport-yahoo-oauth2").Strategy;
const router = express.Router();
const cryptoRandomString = require('crypto-random-string');

router.get('/login',
  function(req,res,next) {
    req._noonce = cryptoRandomString({length: 10, type: 'url-safe'});
  passport.authenticate('yahoo')    
  (req,res,next);
  });

router.get('/callback',

  function(req,res,next) {
    req._noonce = cryptoRandomString({length: 10, type: 'url-safe'});
  passport.authenticate('yahoo', {failureRedirect: '/login' })    
  (req,res,next);
  },

  //passport.authenticate('yahoo'),




  function(req, res) {
    // Successful authnetication, redirect home.
    res.redirect('/');
  });

// router.get('/login', passport.authenticate('passport-yahoo-oauth2', {
//   failureRedirect: '/login'
// }), (req, res) => res.redirect('/'));

// router.get('/callback', (req, res, next) => {
//   passport.authenticate('passport-yahoo-oauth2', (err, user) => {
//     if (err) return next(err);
//     if (!user) return res.redirect('/login');
//     req.logIn(user, (err) => {
//       if (err) return next(err);
//       res.redirect('/profile');
//     });
//   })(req, res, next);
// });

router.get('/logout', (req, res) => {
  req.logout();

  res.redirect(req.session.redirect || '/');

  // const {YAHOO_AUTH_URL, YAHOO_CLIENT_ID, BASE_URL} = process.env;
  // res.redirect(`https://${YAHOO_AUTH_URL}/logout?client_id=${YAHOO_CLIENT_ID}&returnTo=${BASE_URL}`);
});

module.exports = router;
