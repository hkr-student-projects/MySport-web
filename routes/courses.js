const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/course');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')
            .select('price title image');
        res.render('courses', {
            title: 'Courses list',
            isCourses: true,
            userId: req.user ? req.user._id : null,
            courses
        }); 
    }
    catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
    
    res.render('course', {
        layout: 'empty',
        title: `Course ${course.title}`,
        course
    }); 
    }
    catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    if(!req.query.allow){
        return res.redirect('/');
    }
    
    try {
        const course = await Course.findById(req.params.id);

        if(!isOwner(course.userId, req.user._id)) {
            return res.redirect('/courses');
        }

        res.render('course-edit', {
            course
        });
    }
    catch (e) {
        console.log(e);
    }
});

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    const id = req.body.id;

    if(!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
    }
    try {
        const id = req.body.id;
        delete req.body.id;
        const course = await Course.findById(id);
        if(!isOwner(course.userId, req.user._id)) {
            return res.redirect('/courses');
        }
        Object.assign(course, req.body);
        await course.save();
        //await Course.findByIdAndUpdate(id, req.body);
        res.redirect('/courses');
    }
    catch (e) {
        console.log(e);
    }
});

router.post('/remove', auth, async (req, res) => {

    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses');
    }
    catch (e) {
        console.log(e);
    }
    
});

function isOwner(courseId, reqId) {
    return courseId.toString() == reqId;
}

module.exports = router;