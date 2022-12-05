const express = require('express');
const router = express.Router();

// Controllers
const { register, login } = require('../controllers/auth');
const { getUser } = require('../controllers/users');

// Middlewares
const { auth } = require('../middlewares/auth');
const { image } = require('../middlewares/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', auth, getUser);

module.exports = router;
