const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    googleSignIn
} = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.get('/me', protectCustomer, getMe);

module.exports = router;

