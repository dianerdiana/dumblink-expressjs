const express = require('express');
const router = express.Router();

// Controllers
const { register, login } = require('../app/controllers/auth');
const { getUser } = require('../app/controllers/users');

// Middlewares
const { auth } = require('../app/middlewares/auth');
const { image } = require('../app/middlewares/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', auth, getUser);

module.exports = router;
