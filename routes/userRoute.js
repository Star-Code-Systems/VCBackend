const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
    registerUser,
    activeToken,
    authUser,
    getMe,
    updateMe,
    logout
} = require('../controllers/userController');

router.route('/').post(registerUser);
router.route('/active/:activeToken').get(activeToken);
router.route('/login').post(authUser);
router.route('/profile').get(protect, getMe).put(protect, updateMe);
router.route('/logout').get(protect, logout)

module.exports = router;