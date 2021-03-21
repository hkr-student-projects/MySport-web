const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('contact', {
        title: "My contacts",
        email: "gavgav@zoo.se",
        phone: "+1234567890",
        isContact: true
    }); 
});

module.exports = router;