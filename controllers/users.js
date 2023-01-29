const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const {errors} = require("celebrate");

const getUsers = (req, res, next) => {
  return User.find({})
    .then((users) => res.status(http2.constants.HTTP_STATUS_OK).send({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  return User.findOne({ _id: req.params.userId })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при получении пользователя');
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => User.create({
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя');
      }

      if (err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }

      throw err
    })
    .catch(next)
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name: name, about: about },
    {
      new: true,
      runValidators: true,
    },
    )
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
      }
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar },
    {
      new: true,
      runValidators: true,
    },
    )
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
    })
    .catch(next);
};

const getCurrentUserInfo = (req, res, next) => {
  return User.findOne({ _id: req.user._id })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: user });
    })
    .catch(next);
}

module.exports = { getUsers, getUserById, createUser, login, updateUserProfile, updateUserAvatar, getCurrentUserInfo };