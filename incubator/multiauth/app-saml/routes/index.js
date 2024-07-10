var url = require('url');
const express = require('express');
const passport = require('passport');
const router = express.Router();

const config = require('../config');

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/login', passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
  res.redirect('/');
});

router.post('/callback', passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (req, res) {
  res.redirect('/user');
});

router.get('/logout', function (req, res) {
  req.logout();
  const returnToUrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.baseUrl
  });
  res.redirect(`https://${config.auth0Domain}/v2/logout?returnTo=${returnToUrl}`);
});

router.get('/failure', function (req, res) {
  var error = req.flash('error');
  var errorDescription = req.flash('error_description');
  req.logout();
  res.render('failure', {
    error: error[0],
    error_description: errorDescription[0]
  });
});

module.exports = router;
