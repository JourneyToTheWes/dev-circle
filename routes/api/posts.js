// Currently at route -> /api/posts/
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Post Model
const Post = require('../../models/Post');

// Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts/
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 }) // Sort 'date' descending
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostfound: 'No posts found' }));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err =>
            res.status(404).json({ nopostfound: 'No post found with that ID' })
        );
});

// @route   POST api/posts/
// @desc    Create post
// @access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });

        newPost.save().then(post => res.json(post));
    }
);

// @route   DELETE api/posts/:id
// @desc    Get post
// @access  Private
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findOneAndRemove({ _id: req.params.id, user: req.user.id })
            .then(post => {
                // If no post then user is not authorized to delete
                // otherwise, the post is deleted
                return !post
                    ? res
                          .status(404)
                          .json({ notauthorized: 'User not authorized' })
                    : res.status(200).json({ success: 'Post deleted' });
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

module.exports = router;
