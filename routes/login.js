const express = require('express');

const router = express.Router();

const loginController = require('../controllers/login');

const User = require('../models/user');

const { check, body } = require('express-validator');

router.get('/login', loginController.getLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  loginController.postLogin
);

router.post('/logout', loginController.postLogOut);

router.get('/signup', loginController.getSignup);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        //   if (value === 'test@test.com') {
        //     throw new Error('This email address is forbidden');
        //   }
        //   return true;
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              'E-mail exists already ,please pick a different one'
            );
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Please enter a valid password with atleast 5 characters')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('passwords have to match!');
        }
        return true;
      }),
  ],
  loginController.postSignup
);

router.get('/reset', loginController.getReset);

router.post('/reset', loginController.postReset);

router.get('/reset/:token', loginController.getNewPassword);

router.post('/new-password', loginController.postNewPassword);

module.exports = router;
