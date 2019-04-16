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
// @desc    Delete post
// @access  Private
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then(post => {
                if (post.user.toString() !== req.user.id) {
                    // User is not authorized if user is not post author
                    return res.status(401).json({
                        notauthorized: 'User not authorized'
                    });
                }

                // Post is successfully deleted
                post.remove().then(() => res.json({ success: 'Post deleted' }));
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
    '/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then(post => {
                if (
                    post.likes.filter(
                        like => like.user.toString() === req.user.id
                    ).length > 0
                ) {
                    return res
                        .status(400)
                        .json({ alreadyliked: 'User already liked this post' });
                }

                // Add user id to likes array
                post.likes.unshift({ user: req.user.id });

                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
    '/unlike/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then(post => {
                if (
                    post.likes.filter(
                        like => like.user.toString() === req.user.id
                    ).length === 0
                ) {
                    return res
                        .status(400)
                        .json({ notliked: 'You have not yet liked this post' });
                }

                // Find user in the likes and remove
                for (let i = 0; i < post.likes.length; i++) {
                    if (post.likes[i].user.toString() === req.user.id) {
                        post.likes.splice(i, 1);
                    }
                }

                // Save
                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
    '/comment/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        // Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
            .then(post => {
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                };

                // Add to comments array
                post.comments.unshift(newComment);

                // Save
                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
    '/comment/:post_id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.post_id)
            .then(post => {
                // Check to see if comment exists
                if (
                    post.comments.filter(
                        comment =>
                            comment._id.toString() === req.params.comment_id
                    ).length === 0
                ) {
                    return res
                        .status(404)
                        .json({ commentnotexists: 'Comment does not exist' });
                }

                // Remove comment from post that matches the comment id
                for (let i = 0; i < post.comments.length; i++) {
                    if (
                        post.comments[i]._id.toString() ===
                        req.params.comment_id
                    ) {
                        post.comments.splice(i, 1);
                    }
                }

                // Save
                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postnotfound: 'No post found' })
            );
    }
);

module.exports = router;
