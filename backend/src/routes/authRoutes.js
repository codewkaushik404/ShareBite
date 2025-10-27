const express = require('express');
const { body } = require('express-validator');
const { register, login, googleAuthCallback, logout } = require('../controllers/authController');
const passport = require('../config/passport');
const {protect} = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

//GOOGLE - AUTH
router.get('/google',passport.authenticate('google',{scope: ['profile','email']}));

//GOOGLE -AUTH CALLBACK
router.get('/google/callback',passport.authenticate('google', {session: false, failureRedirect: '/api/auth/login'}) ,googleAuthCallback);

//LOGOUT
router.get('/logout', protect, logout);
module.exports = router;
