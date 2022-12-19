const express = require('express');
const router = express.Router();

// Controllers
const { register, login, logout } = require('../app/controllers/auth');
const { getUser } = require('../app/controllers/users');
const { getTemplates, getTemplate } = require('../app/controllers/templates');
const {
  addLinktree,
  getLinktrees,
  deleteLinktree,
  getLinktree,
  updateLinktree,
  viewLinktree,
} = require('../app/controllers/linktrees');

// Middlewares
const { auth } = require('../app/middlewares/auth');
const { upload } = require('../app/middlewares/upload');

// Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user/:id', auth, getUser);

// Templates
router.get('/template/list', getTemplates);
router.get('/template/:id/view', getTemplate);

// Linktree routes
router.post('/linktree/store', auth, upload('image'), addLinktree);
router.get('/linktree/list', auth, getLinktrees);
router.get('/linktree/:id/edit', auth, getLinktree);
router.put('/linktree/update', auth, upload('image'), updateLinktree);
router.delete('/linktree/:id/delete', auth, deleteLinktree);

router.get('/linktree/:unique_link/view', viewLinktree);

module.exports = router;
