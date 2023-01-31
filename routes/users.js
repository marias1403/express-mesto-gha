const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const { getUsers, getUserById, createUser, updateUserProfile, updateUserAvatar, getCurrentUserInfo } = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getCurrentUserInfo);

router.get('/:userId', getUserById);

router.post('/', createUser);

router.patch('/me', updateUserProfile);

router.patch('/me/avatar', updateUserAvatar);

module.exports = router;