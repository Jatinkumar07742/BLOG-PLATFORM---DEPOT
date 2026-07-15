const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { isLoggedIn, isPostOwner } = require('../middleware/auth');

// GET / - list all posts (home page)
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.render('posts/index', { posts, search, user: req.currentUser });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not load posts.', user: req.currentUser });
  }
});

// GET /posts/new - form to create a new post (must be before /:id route)
router.get('/posts/new', isLoggedIn, (req, res) => {
  res.render('posts/new', { user: req.currentUser, error: req.query.error });
});

// POST /posts - create a new post
router.post('/posts', isLoggedIn, async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;
    if (!title || !content) {
      return res.redirect('/posts/new?error=' + encodeURIComponent('Title and content are required.'));
    }
    const post = await Post.create({
      title,
      content,
      coverImage: coverImage || '',
      author: req.session.userId,
    });
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/posts/new?error=' + encodeURIComponent('Could not create post.'));
  }
});

// GET /dashboard - logged-in user's own posts
router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.session.userId }).sort({ createdAt: -1 });
    res.render('posts/dashboard', { posts, user: req.currentUser });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not load dashboard.', user: req.currentUser });
  }
});

// GET /posts/:id - view single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
        options: { sort: { createdAt: -1 } },
      });

    if (!post) {
      return res.status(404).render('error', { message: 'Post not found.', user: req.currentUser });
    }

    res.render('posts/show', { post, user: req.currentUser });
  } catch (err) {
    console.error(err);
    res.status(404).render('error', { message: 'Post not found.', user: req.currentUser });
  }
});

// GET /posts/:id/edit - edit form (owner only)
router.get('/posts/:id/edit', isLoggedIn, isPostOwner, (req, res) => {
  res.render('posts/edit', { post: req.post, user: req.currentUser, error: req.query.error });
});

// PUT /posts/:id - update post (owner only)
router.put('/posts/:id', isLoggedIn, isPostOwner, async (req, res) => {
  try {
    const { title, content, coverImage } = req.body;
    if (!title || !content) {
      return res.redirect(`/posts/${req.params.id}/edit?error=` + encodeURIComponent('Title and content are required.'));
    }
    req.post.title = title;
    req.post.content = content;
    req.post.coverImage = coverImage || '';
    await req.post.save();
    res.redirect(`/posts/${req.post._id}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/posts/${req.params.id}/edit?error=` + encodeURIComponent('Could not update post.'));
  }
});

// DELETE /posts/:id - delete post (owner only)
router.delete('/posts/:id', isLoggedIn, isPostOwner, async (req, res) => {
  try {
    await Comment.deleteMany({ post: req.post._id });
    await req.post.deleteOne();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not delete post.', user: req.currentUser });
  }
});

// POST /posts/:id/like - like or unlike a post (toggle)
router.post('/posts/:id/like', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found.', user: req.currentUser });
    }

    const userId = req.session.userId;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not update like.', user: req.currentUser });
  }
});

// POST /posts/:id/comments - add a comment to a post
router.post('/posts/:id/comments', isLoggedIn, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).render('error', { message: 'Post not found.', user: req.currentUser });
    }

    if (!text || !text.trim()) {
      return res.redirect(`/posts/${post._id}`);
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: req.session.userId,
      post: post._id,
    });

    post.comments.push(comment._id);
    await post.save();

    res.redirect(`/posts/${post._id}#comments`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not add comment.', user: req.currentUser });
  }
});

// DELETE /posts/:postId/comments/:commentId - delete a comment (comment owner only)
router.delete('/posts/:postId/comments/:commentId', isLoggedIn, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).render('error', { message: 'Comment not found.', user: req.currentUser });
    }
    if (comment.author.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'You are not authorized to delete this comment.',
        user: req.currentUser,
      });
    }

    await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: comment._id } });
    await comment.deleteOne();

    res.redirect(`/posts/${req.params.postId}#comments`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Could not delete comment.', user: req.currentUser });
  }
});

module.exports = router;
