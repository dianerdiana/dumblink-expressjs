const express = require('express');
const router = express.Router();

// Controllers
const { register, login } = require('../app/controllers/auth');
const { getUser } = require('../app/controllers/users');
const { addLinktree, getLinktrees } = require('../app/controllers/linktrees');

// Middlewares
const { auth } = require('../app/middlewares/auth');
const { image } = require('../app/middlewares/upload');

// Authentication
router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', auth, getUser);

// Linktree routes
router.post('/linktree/store', auth, image('image'), addLinktree);
router.get('/linktree/list', auth, getLinktrees);

module.exports = router;
