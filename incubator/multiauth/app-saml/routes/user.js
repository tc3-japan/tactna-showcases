const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const router = express.Router();

router.get('/', ensureLoggedIn('/'), function (req, res, next) {
  res.render('user', { user: req.user, req: req });
});

module.exports = router;
