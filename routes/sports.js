const express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
const Activity = require('../models/activity');
// const { validationResult } = require('express-validator');
// const { courseValidators } = require('../utils/validators');

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const { title, start_date, start_millis, end_date, end_millis, location } = req.body;
        res.status(200).json(addSportActivity(title, new Date(start_date), start_millis, new Date(end_date), end_millis, location));
        
        //addParticipant();
        //return;
        //const event = await Activity.findOne({ start_date });

        // if(event) {
        //     //send event exists response
        //     // req.flash('error', 'User with this email already exists');
        //     // res.redirect('/auth/login#login');//user exists and we redirect for log in
        // }
        
        //res.redirect('/auth/login#login');
    }
    catch (e) {
        console.log(e);
    } 
});

router.post('/add-participant', async (req, res) => {
    try {
        const { date, title, userId } = req.body;

        const msg = addParticipant(new Date(date), title, userId) == 1 ? 
            `Participant with id: ${userId} has been registered on ${title} on ${date}.` :
            `Participant was already registered on ${title} on ${date}.`;
        res.status(200).json({ message: msg });
    }
    catch (e) {
        console.log(e);
    } 
});

async function addSportActivity(title, start_date, start_millis, end_date, end_millis, location){

    // var filter = { 
    //     "$and": [
    //         { "$eq": [{ "$year": "$start_date" }, start_date.getFullYear() + 1] },
    //         { "$eq": [{ "$month": "$start_date" }, start_date.getMonth() + 1] },
    //         { "$eq": [{ "$day": "$start_date" }, start_date.getDay()] },
    //         { 'title': title }
    //     ]
    // };

    // const result = await Activity.findOne({ filter });
    // var error;
    // if(result != null){
    //     return {
    //         error: `${title} is already taking place on ${start_date.toString()}.`,
    //         modified: 0
    //     };
    // }

    await new Activity({
        title, 
        start_date, 
        end_date,
        start_millis,
        end_millis,
        location
    }).save();

    return {
        error: '',
        modified: 1
    };
}

async function removeSportActivity(title, start_date, end_date, location){

    var filter = { 
        $and: [
            { "$expr": { "$eq": [{ "$year": "$start_date" }, start_date.getFullYear() + 1] } },
            { "$expr": { "$eq": [{ "$month": "$start_date" }, start_date.getMonth() + 1] } },
            { "$expr": { "$eq": [{ "$day": "$start_date" }, start_date.getDay()] } },
            { 'title': title }
          ]
    };

    // const result = await Activity.findOne({ filter });
    // var error;
    // if(result == null){
    //     return {
    //         message: `${title} was not found taking place on ${start_date.toString()}.`,
    //         modified: 0
    //     };
    // }

    const res = await Activity.deleteOne({ filter });

    return {
        message: `${title} was scheduled on ${start_date}`,
        modified: 1
    };
}

async function addParticipant(date, sport, userId){
    // updateOne(
    //     BasicDBObject.parse("{ _id: "+date.getDayOfMonth()+", " +
    //             "\"activities._id\": \"" + sport + "\" }"),
    //     BasicDBObject.parse("{ $push: {\"activities.$." + table + "\": " + id + "}}")
    var filter = { 
        $and: [
            { "$expr": { "$eq": [{ "$year": "$start_date" }, date.getFullYear() + 1] } },
            { "$expr": { "$eq": [{ "$month": "$start_date" }, date.getMonth() + 1] } },
            { 'title': sport },
            { 'participants.list': { $nin: ObjectId(userId)} },
          ]
    };
    var update = { $push: { 'participants.list': ObjectId(userId) } };
    // var callback = function(err, res) {
    //     if (err) { throw err; }
    //     console.log("1 document updated");
    // };

    const result = await Activity.updateOne(filter, update);
    //res.status(status).json(obj)
    //console.log('Modified: ' + result.nModified);

    return {
        error: '',
        modified: result.nModified
    };
    //res.n; // Number of documents matched
    //res.nModified; // Number of documents modified  

    //console.log(Activity.find(filter).exec().then(r => console.log(r)));
}

async function removeParticipant(date, title, userId){
    var filter = { 
        $and: [
            { "$expr": { "$eq": [{ "$year": "$start_date" }, date.getFullYear() + 1] } },
            { "$expr": { "$eq": [{ "$month": "$start_date" }, date.getMonth() + 1] } },
            { 'title': title },
            { 'participants.list': { $in: ObjectId(userId)} },
        ]
    };
    var update = { $pull: { 'participants.list': ObjectId(userId) } };

    const result = await Activity.updateOne(filter, update);
    console.log('Modified: ' + result.nModified);

    return {
        error: '',
        modified: result.nModified
    };
}

module.exports = router;