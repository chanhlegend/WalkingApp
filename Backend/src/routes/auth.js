const express = require('express');
const passport = require('../config/passport/passport-config');
const authenController = require('../app/controllers/authenController');

const router = express.Router();

router.post('/email/request-otp', authenController.requestEmailOtp);
router.post('/email/verify-otp', authenController.verifyEmailOtp);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
  }),
  authenController.googleCallback
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

module.exports = router;
