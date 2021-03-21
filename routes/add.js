const express = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    }); 
});

router.post('/', auth, courseValidators, async (req, res) => {
    //console.log(req.body);//data received from request is in request.body 
    //const course = new Course(req.body.title, req.body.price, req.body.image);
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Add course',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                image: req.body.image
            }
        });
    }

    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        image: req.body.image,
        userId: req.user
    });
    try {
        course.save();
        res.redirect('/courses');
    }
    catch (e) {
        console.log(e);
    }
});

module.exports = router;