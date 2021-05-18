const express = require('express');
//var ObjectId = require('mongoose').Types.ObjectId;
const Message = require('../models/message');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { sender, content, time } = req.body;   
        await addMessage(sender, content, time);
        res.status = 200;
        res.send();
    }
    catch (e) {
        console.log(e);
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await getMessages();

        res.send(posts);
    }
    catch (e) {
        console.log(e);
    } 
});

// router.get('/dialogue/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const comments = await getDialogue(id);

//         //res.status = 200;
//         res.send(comments);
//     }
//     catch (e) {
//         console.log(e);
//     } 
// });

// router.get('/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const post = await getPost(id);

//         res.status = 200;
//         res.send(post);
//     }
//     catch (e) {
//         console.log(e);
//     } 
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const result = await deletePost(id);

//         res.status = 200;
//         res.end(result);
//     }
//     catch (e) {
//         console.log(e);
//     } 
// });


async function addMessage(sender, content, time) {
    await new Message({
        author,
        content,
        time
    }).save();
}

// async function addComment(id, author, content, time) {

//     var update = { $push: { 
//         'comments.list': {
//             author,
//             content,
//             time
//         } 
//     }};

//     const result = await ForumPost.updateOne({ _id: id }, update);
//     //console.log('Modified: ' + result.nModified);

//     return result.nModified;
// }

async function getMessages(){
    const result = await Message.find();
    result.status = 200;

    return JSON.stringify(result);
}

// async function getPost(id){
//     const result = await ForumPost.findOne({ _id: id });
//     result.status = 200;

//     return JSON.stringify(result);
// }

// async function deletePost(id){
//     const result = await ForumPost.deleteOne({ _id: id });
//     result.status = 200;

//     return JSON.stringify(result);
// }

// async function editPost(id, newTitle, newContent, lastEdit){
//     var update = { 
//         title: newTitle,
//         content: newContent,
//         lastEditTime: lastEdit
//     };

//     const result = await ForumPost.updateOne({ _id: id }, update);
//     //console.log('Modified: ' + result.nModified);

//     return result.nModified;
// }

// async function getDialogue(id){
//     // const msg = await Message.findOne({ _id: id });
//     // console.log(msg == null);
//     // if(post.comments == null){
//     //     console.log('null');
//     //     post.comments.list = [];
//     // }
//     // post.status = 200;
//     // //console.log(JSON.stringify(post.comments.list));

//     // return JSON.stringify(post.comments.list);
// }

module.exports = router;