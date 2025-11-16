const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, registerValidation, validate } = require('../middleware/validation');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

module.exports = router;

