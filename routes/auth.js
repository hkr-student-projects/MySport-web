const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Token = require('../models/token');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');
const mailing = require('@sendgrid/mail');
const bcrypt = require('bcryptjs');
const config = require('../keys/config');
const registerMailing = require('../mailing/registration');
const resetMailing = require('../mailing/reset');
const path = require('path');
const { addListener } = require('../models/user');

mailing.setApiKey(config.SENDGRID_API);

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Log in',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError')
    }); 
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        if(req.body.mobile){
            return res.status(200);
        }
        res.redirect('/auth/login#login');
    });
});

router.get('/reset', async (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    });
}); 

router.get('/verify/:token', async (req, res) => {
    if(!req.params.token) {
        return res.status(400).json('{"mesage": "Request does not contain token"}');
    }

    try {
        let token = await Token.findOne({
            value: req.params.token,
            expiration: { $gt: Date.now() }
        });
        if(token) {
            await Token.deleteOne({ value: req.params.token });
            return res.sendFile(path.resolve('views/auth/success.html')); 
        }

        token = await Token.findOne({
            value: req.params.token,
            expiration: { $lte: Date.now() }
        });
        if(token) {
            res.status(401).json(`{"message": "You token was expired. You will receive new token on your mail: ${token.email} shortly"}`); 
            
            crypto.randomBytes(16, async (err, buffer) => {
                if(err) {
                    console.log(err);
                    return;
                }
                const newtoken = buffer.toString('hex');
    
                await new Token({
                    email: token.email,
                    value: newtoken, 
                    expiration: Date.now() + 86400 * 1000
                }).save();

                const u = await User.findOne({
                    email: token.email
                });
    
                await mailing
                    .send(registerMailing(u.email.toString(), u.firstname.toString(), token))
                    .then(() => {
                        console.log('Email sent');
                    })
                .catch((error) => {
                    console.error(error);
                });
            });

            return await Token.deleteOne({ value: req.params.token });
        }
    }
    catch (e) {
        console.log(e);
    } 

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            tokenExpiration: { $gt: Date.now() }
        });
        if(!user) {
            return res.status(400).json('{"message": "Token was not found or expired"}');
        }
        res.render('auth/verify', {
            title: 'Password reset',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
        }); 
    }
    catch (e) {
        console.log(e);
    }   
});

router.get('/report/:token', async (req, res) => {
    if(!req.params.token) {
        return res.status(400).statusMessage('Request does not contain token');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            tokenExpiration: { $gt: Date.now() }
        });
        if(!user) {
            return res.status(400).statusMessage('Request does not contain token');
        }
        res.render('auth/verify', {
            title: 'Password reset',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
        }); 
    }
    catch (e) {
        console.log(e);
    }   
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, mobile } = req.body;
        const user = await User.findOne({ email });
        
        if(user) {

            const token = await Token.findOne({
                email//it means user is not verified
            });
            if(token) {
                return res.status(401).json('{"message": "Account is not verified"}');
            }

            if(await bcrypt.compare(password, user.password)){
                req.session.user = user;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if(err) {
                        throw err;
                    }
                    if(mobile){
                        return res.status(201);
                    }
                    res.redirect('/');
                });
            }
            else {
                if(mobile){
                    return res.status(401).json('{"message": "Incorrect password"}');
                }
                req.flash('loginError', 'Incorrect password');
                res.redirect('/auth/login#login');
            }
        }
        else {
            if(mobile){
                return res.status(401).json('{"message": "No account exists with this email"}');
            }
            req.flash('loginError', 'No account exists with this email');
            res.redirect('/auth/login#login');
        }
    }
    catch (e) {
        console.log(e);
    }
});
//router.post('/register', registerValidators, async (req, res) => {
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstname, lastname, personal_number } = req.body;
        const addResult = await addUser(email, password, firstname, lastname, personal_number);

        if(addResult.modified == 0){
            return res.status(201).json(JSON.stringify(addResult));
        }
        
        crypto.randomBytes(16, async (err, buffer) => {
            if(err) {
                console.log(err);
                return;
            }
            const token = buffer.toString('hex');

            await new Token({
                email,
                value: token, 
                expiration: Date.now() + 86400 * 1000
            }).save();

            await mailing
                .send(registerMailing(email.toString(), firstname.toString(), token))
                .then(() => {
                    console.log('Email sent');
                })
            .catch((error) => {
                console.error(error);
            });
            
            res.status(201).json('{"message": "Confirmation email has been sent"}');
        });
    }
    catch (e) {
        console.log(e);
    } 
});

router.post('/password-reset', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user) {
            req.flash('error', 'There is no user registered with this email');
            return res.redirect('/auth/reset');
        }
        crypto.randomBytes(16, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Something went wrong, try again one more time');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');
            user.resetToken = token;
            user.tokenExpiration = Date.now() + 86400 * 1000;
            await user.save();
            await mailing.send(resetMailing(user.email, user.name, token, req.headers['user-agent']));
            
            res.status(201).json('{"message": "Confirmation email has been sent"}');
        });
    }
    catch (e) {
        console.log(e);
    }
});

router.post('/password-update', async (req, res) => {
    try {
       const user = await User.findOne({
           _id: req.body.userId,
           resetToken: req.body.token,
           tokenExpiration: { $gt: Date.now() } 
       });   

       if(!user) {
           req.flash('loginError', 'Token expired');
           return res.redirect('/auth/login');
       }

       user.password = await bcrypt.hash(req.body.password, (Math.floor(Math.random() * 3) + 10));
       user.resetToken = undefined;
       user.tokenExpiration = undefined;
       await user.save();
       res.redirect('/auth/login');
    }
    catch (e) {
        console.log(e);
    }
});

async function addUser(email, pass, firstname, lastname, personal_number){

    const result = await User.findOne({ email });

    if(result != null){
        return {
            error: 'Such email already exists in database, proceed to login or reset.',
            modified: 0
        };
    }

    const hashed = await bcrypt.hash(pass, Math.floor(Math.random() * 3) + 10);
    await new User({
        email, 
        password: hashed, 
        firstname,
        lastname,
        personal_number
    }).save();

    return {
        error: '',
        modified: 1
    };
}

async function removeUser(email){

    const user = await User.findOne({ email });
    if(user == null){
        return {
            error: 'No user exists with this email.',
            modified: 0
        };
    }

    await User.deleteOne({ email });

    return {
        error: '',
        modified: 1
    };
}

async function changePassword(email, oldpass, newpass){
    if(oldpass === newpass){
        return {
            error: 'Passwords cannot be same.',
            modified: 0
        };
    }

    const user = await User.findOne({ email });
    if(user == null){
        return {
            error: 'No user exists with this email.',
            modified: 0
        };
    }
    else if(!await bcrypt.compare(password, user.password)){
        return {
            error: 'Passwords do not match.',
            modified: 0
        };
    }

    user.password = await bcrypt.hash(newpass, (Math.floor(Math.random() * 3) + 10));
    user.resetToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();

    return {
        error: '',
        modified: 1
    };
}


module.exports = router;

// const mailing = require('@sendgrid/mail')
// mailing.setApiKey(process.env.SENDGRID_API_KEY)
// const msg = {
//   to: 'test@example.com', // Change to your recipient
//   from: 'test@example.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// mailing
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })