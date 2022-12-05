const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/auth');
const { getUser } = require('../controllers/users');

const { auth } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', auth, getUser);

module.exports = router;
