const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Enter valid email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if(user) {
                    return Promise.reject('Such email already exists');
                }
            }
            catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password', 'Password must be at least 8 symbols long')
        .isLength({ min: 8, max: 50 })
        .isAlphanumeric()
        .trim(),
    body('repeat')
        .custom((value, { req }) => {
            if (value === req.body.password) {
                return true;
            }
            throw new Error('Passwords do not match');
        })
        .trim(),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Name must contain at least 3 symbols')
];

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Minimum length of 3 symbols required').trim(),
    body('price').isNumeric().withMessage('Enter valid price'),
    body('image', 'Enter valid url').isURL()
];