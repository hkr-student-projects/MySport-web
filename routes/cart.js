const express = require('express');
const Course = require('../models/course');
// const Cart = require('../models/cart');
const auth = require('../middleware/auth');
const router = express.Router();

function mapCartItems(cart){
    return cart.items.map(c => ({
        ...c.courseId._doc,
        id: c.courseId.id, 
        count: c.count
    }));
}

function getPrice(courses){
    return courses.reduce((total, course) => {
        return total += course.price * course.count;
    }, 0);
}

router.get('/', auth, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartItems(user.cart);
       
    res.render('cart', {
        title: 'Cart',
        courses: courses,
        price: getPrice(courses),
        isCart: true
    }); 
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId').execPopulate();
    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: getPrice(courses)
    };

    res.status(200).json(cart); 
});

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/cart');
});

module.exports = router;