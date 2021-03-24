const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');
const dateSweden = moment.tz(Date.now(), "Europe/Stockholm");

const activity = new Schema({
    title: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        default: dateSweden,
        require: true
    },
    end_date: {
        type: Date,
        require: true
    },
    start_millis: {
        type: Number,
        require: true
    },
    end_millis: {
        type: Number,
        require: true
    },
    // location: {
    //     type: {
    //       type: String,
    //       default: 'Point',
    //     },
    //     coordinates: [Number],
    //     required: false // [22.2475, 14.2547]  [longitude, latitude]
    // },
    location: String,
    participants: {
        list: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ]
    }
}, { timestamps: true });

activity.methods.addParticipant = function(title, date, userId) {
    console.log("hello gay");
    // const clonedItems = [...this.participants.list];
    // const i = clonedItems.findIndex(it => {
    //     return it.userId.toString() === userId.toString();
    // });

    // if(i == -1){
    //     clonedItems.push({
    //         userId
    //     });
    // }
    // else {
    //     //send responce user already there
    // }

    // this.cart = { items: clonedItems };

    return this.save();
};

activity.methods.removeFromCart = function(id) {
    let clonedItems = [...this.cart.items];
    const i = clonedItems.findIndex(c => {
        return c.courseId.toString() === id.toString();
    });

    if(clonedItems[i].count === 1){
        clonedItems = clonedItems.filter(c => c.courseId.toString() !== id.toString());
    }
    else {
        clonedItems[i].count--;
    }

    this.cart = { items: clonedItems };

    return this.save();
};

activity.index({location: '2dsphere'});

activity.methods.clearCart = function() {
    this.cart = {
        items: []
    };

    return this.save();
};

activity.method('toClient', function() {
    const activity = this.toObject();
    
    activity.id = activity._id;
    delete activity._id;

    return activity;
});

module.exports = model('Activity', activity);

//const uuid = require('uuid/v4');
// const { v4: uuid } = require('uuid');
// const fs = require('fs');
// const path = require('path');

// class Course {
//     constructor(title, price, image) {
//         this.title = title;
//         this.price = price;
//         this.image = image;
//         this.id = uuid();
//     }

//     toJSON(){
//         return {
//             title: this.title,
//             price: this.price,
//             image: this.image,
//             id: this.id
//         };
//     }

//     async save() {
//         const courses = await Course.getAll();
//         courses.push(this.toJSON());

//         return new Promise((resolve, reject) => {
//             fs.writeFile(path.join(
//                 __dirname, '..', 'data', 'courses.json'),
//                 JSON.stringify(courses),
//                 (err) => {
//                     if(err) { reject(err); }
//                     else {
//                         resolve();
//                     }
//                 }   
//             );
//         });
//     }

//     static getAll() {
//         return new Promise((resolve, reject) => {
//             fs.readFile(
//                 path.join(__dirname, '..', 'data', 'courses.json'),
//                 'utf-8',
//                 (err, content) => {
//                     if(err){ reject(err); }
//                     else{
//                         resolve(JSON.parse(content));
//                     }
//                 }
//             );
//         });
//     }

//     static async getById(id) {
//         const courses = await Course.getAll();

//         return courses.find(c => c.id === id);
//     }

//     static async update(course) {
//         const courses = await Course.getAll();
        
//         const i = courses.findIndex(c => c.id === course.id);
//         courses[i] = course;

//         return new Promise((resolve, reject) => {
//             fs.writeFile(path.join(
//                 __dirname, '..', 'data', 'courses.json'),
//                 JSON.stringify(courses),
//                 (err) => {
//                     if(err) { reject(err); }
//                     else {
//                         resolve();
//                     }
//                 }   
//             );
//         });
//     }
// }

// module.exports = Course;