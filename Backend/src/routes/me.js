const express = require('express');
const requireAuth = require('../app/middlewares/requireAuth');
const authenController = require('../app/controllers/authenController');

const router = express.Router();

router.get('/', requireAuth, authenController.getMe);
router.put('/onboarding', requireAuth, authenController.submitOnboarding);

module.exports = router;