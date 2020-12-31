require("dotenv").config();
const express = require("express");
const http = require("http");
const next = require("next");
const session = require("express-session");
const passport = require("passport");
const uid = require("uid-safe");
const authRoutes = require("./routes/auth-routes");
const YahooFantasy = require('yahoo-fantasy');
const request = require("request");
const dev = process.env.NODE_ENV !== "production";
const YahooStrategy = require("passport-yahoo-oauth2").Strategy;
const cryptoRandomString = require('crypto-random-string');

const app = next({
  dev,
  dir: "./src"
});

const handle = app.getRequestHandler();


app.prepare().then(() => {
  const server = express();

  const yahooStrategy = new YahooStrategy({
      clientID: process.env.YAHOO_CLIENT_ID,
      clientSecret: process.env.YAHOO_CLIENT_SECRET,
      callbackURL: process.env.YAHOO_CALLBACK_URL,
      scope: "openid,fspt-r",
      noonce: cryptoRandomString({length: 10, type: 'url-safe'}),
      passReqtoCallback: true
    },
    function(token, tokenSecret, profile, done) {
      User.findOrCreate({
        yahooId: profile.id
      }, function(err, user) {
        return done(err, user);
      });
    }
  );

  passport.use(yahooStrategy);
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  server.use(passport.initialize());
  server.use(passport.session());
  server.use(authRoutes);

  const restrictAccess = (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    next();
  };

  server.yf = new YahooFantasy(process.env.YAHOO_CLIENT_ID, process.env.YAHOO_CLIENT_SECRET);

  server.use("/profile", restrictAccess);

  server.get('/api/games', function(req, res) {
    server.yf.user.games()
      .then(function(response) {
        const games = res.json(response.games);
        return (games);
      })
      .catch(function(error) {
        console.log('server error getting user games', error)
      })
  })

  server.get('/api/teams/:game_key', function(req, res) {
    server.yf.teams.games(req.params.game_key)
      .then(function(response) {
        const teams = res.json(response);
        return (teams);
      })
      .catch(function(error) {
        console.log('server error getting user teams', error)
      })
  })

  server.get("*", handle);

  http.createServer(server).listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
  });

});