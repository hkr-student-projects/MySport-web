const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/order');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id
        }).populate('user.userId');

        res.render('orders', {
            title: 'Orders',
            isOrder: true,
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.courses.reduce((total, course) => {
                        return total += course.count * course.course.price;
                    }, 0)
                };
            })
        }); 
    }
    catch (e) {
        console.log(e);
    }
    
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(i => ({
            count: i.count,
            course: {
                ...i.courseId._doc
            }
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses    
        });
        
        order.save();
        req.user.clearCart();

        res.redirect('/orders');
    }
    catch (e) {
        console.log(e);
    }
});

module.exports = router;