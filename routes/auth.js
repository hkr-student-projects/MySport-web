const express = require('express');
const User = require('../models/user');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs');
const config = require('../keys/config');
const regMessage = require('../mailing/registration');
const resetEmail = require('../mailing/reset');
const { addListener } = require('../models/user');
const router = express.Router();
// const transporter = nodemailer.createTransport(sendgrid({
//     auth: {
//         api_key: config.SENDGRID_API
//     }
// }));
sgMail.setApiKey(config.SENDGRID_API);

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
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            tokenExpiration: { $gt: Date.now() }
        });
        if(!user) {
            req.flash();
            return res.redirect('/auth/login');
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
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if(user) {
            if(await bcrypt.compare(password, user.password)){
                req.session.user = user;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if(err) {
                        throw err;
                    }
                    res.redirect('/');
                });
            }
            else {
                req.flash('loginError', 'Incorrect password');
                res.redirect('/auth/login#login');
            }
            
        }
        else {
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
        res.status(200).json(addUser(email, password, firstname, lastname, personal_number));
        //removeUser(email);
        // const user = await User.findOne({ email });
        // const errors = validationResult(req);
        // if(!errors.isEmpty()) {
        //     req.flash('registerError', errors.array()[0].msg);
        //     return res.status(422).redirect('/auth/login#register');
        // }

        // if(user) {
        //     //send user exists response
        //     // req.flash('error', 'User with this email already exists');
        //     // res.redirect('/auth/login#login');//user exists and we redirect for log in
        // }
        // else {
            //show ok

        // res.redirect('/auth/login#login');
        // await sgMail
        //     .send(regMessage(email, firstname))
        //     .then(() => {
        //         console.log('Email sent');
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
        //}
    }
    catch (e) {
        console.log(e);
    } 
});

router.post('/reset', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user) {
            req.flash('error', 'There is no user registered with this email');
            return res.redirect('/auth/reset');
        }
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) {
                req.flash('error', 'Something went wrong, try again one more time');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');
            user.resetToken = token;
            user.tokenExpiration = Date.now() + 86400 * 1000;
            await user.save();
            await sgMail.send(resetEmail(user.email, user.name, token, req.headers['user-agent']));
            return res.redirect('/auth/login');
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

    const result = await User.findOne({ email: 'asd' });
    var error;
    if(result != null){
        return {
            error: 'Such email already exists in database, proceed to login or reset.'
        };
    }

    const hashed = await bcrypt.hash(password, Math.floor(Math.random() * 3) + 10);
    await new User({
        email, 
        password: hashed, 
        firstname,
        lastname,
        personal_number
    }).save();

    return result.nModified;
}

async function removeUser(email){

    const result = await User.findOne({ email });
    var error;
    if(result == null){
        return {
            error: 'No user exists with this email.'
        };
    }

    await User.deleteOne({ email });

    return result.nModified;
}


module.exports = router;

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const msg = {
//   to: 'test@example.com', // Change to your recipient
//   from: 'test@example.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })