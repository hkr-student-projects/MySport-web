const express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
const Activity = require('../models/activity');
const ForumPost = require('../models/forum_post');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { author, title, content, time } = req.body;   
        await addPost(author, title, content, time)
        .then(() => {
            res.send('{ "status": 200 }');
        });
    }
    catch (e) {
        console.log(e);
    }
});

router.post('/comment/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { author, content, time } = req.body;   
        await addComment(id, author, content, time)
        .then(() => {
            res.send('{ "status": 200 }');
        });
    }
    catch (e) {
        console.log(e);
    }
});
//aka edit
router.post('/:id', async (req, res) => {
    try {
        const id = req.params.id;  
        const { newTitle, newContent, lastEdit } = req.body;
        await editPost(id, newTitle, newContent, lastEdit)
        res.status = 200;
        res.send();
    }
    catch (e) {
        console.log(e);
    }
});

router.get('/comments/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const comments = await getPostComments(id);

        //res.status = 200;
        res.send(comments);
    }
    catch (e) {
        console.log(e);
    } 
});

router.get('/', async (req, res) => {
    try {
        const posts = await getPosts();
    
        //res.status = 200;
        res.send(posts);
    }
    catch (e) {
        console.log(e);
    } 
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const post = await getPost(id);

        res.status = 200;
        res.send(post);
    }
    catch (e) {
        console.log(e);
    } 
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deletePost(id);

        res.status = 200;
        res.end(result);
    }
    catch (e) {
        console.log(e);
    } 
});


async function addPost(author, title, content, time) {
    await new ForumPost({
        author,
        title,
        content,
        time
    }).save();
}

async function addComment(id, author, content, time) {

    var update = { $push: { 
        'comments.list': {
            author,
            content,
            time
        } 
    }};

    const result = await ForumPost.updateOne({ _id: id }, update);
    //console.log('Modified: ' + result.nModified);

    return result.nModified;
}

async function getPosts(){
    const result = await ForumPost.find();
    result.status = 200;

    return JSON.stringify(result);
}

async function getPost(id){
    const result = await ForumPost.findOne({ _id: id });
    result.status = 200;

    return JSON.stringify(result);
}

async function deletePost(id){
    const result = await ForumPost.deleteOne({ _id: id });
    result.status = 200;

    return JSON.stringify(result);
}

async function editPost(id, newTitle, newContent, lastEdit){
    var update = { 
        title: newTitle,
        content: newContent,
        lastEditTime: lastEdit
    };

    const result = await ForumPost.updateOne({ _id: id }, update);
    //console.log('Modified: ' + result.nModified);

    return result.nModified;
}

async function getPostComments(id){
    const post = await ForumPost.findOne({ _id: id });
    console.log(post == null);
    if(post.comments == null){
        console.log('null');
        post.comments.list = [];
    }
    post.status = 200;
    //console.log(JSON.stringify(post.comments.list));

    return JSON.stringify(post.comments.list);
}

module.exports = router;