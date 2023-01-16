const User = require('../models/user');
const http2 = require('node:http2');

const getUsers = (req, res) => {
  return User.find({})
    .then((users) => res.status(http2.constants.HTTP_STATUS_OK).send({ data: users }))
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
};

const getUserById = (req, res) => {
  return User.findOne({ id: req.params._id })
    .then(user => res.status(http2.constants.HTTP_STATUS_OK).send({ data: user }))
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({message: 'Переданы некорректные данные при создании пользователя'});
      }
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
};

const updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name: name, about: about },
    {
      new: true,
      runValidators: true,
    })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({message: 'Переданы некорректные данные при обновлении профиля'});
      }
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar },
    {
      new: true,
      runValidators: true,
    })
    .then(avatar => res.send({ data: avatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({message: 'Переданы некорректные данные при обновлении аватара'});
      }
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

module.exports = { getUsers, getUserById, createUser, updateUserProfile, updateUserAvatar };