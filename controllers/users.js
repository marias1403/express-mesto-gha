const User = require('../models/user');

//400 — Переданы некорректные данные при создании пользователя
//500 — Ошибка по умолчанию
const getUsers = (req, res) => {
  return User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
};

//400 — Пользователь по указанному _id не найден
//500 — Ошибка по умолчанию
const getUserById = (req, res) => {
  console.log(req.params);

  if (!req.params.userId) {
    return res.status(400).send({message: 'Пользователь по указанному _id не найден'})
  }
  return User.findOne({ id: req.params._id })
    .then(user => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

//400 — Переданы некорректные данные при создании пользователя
//500 — Ошибка по умолчанию
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  return User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
};

//400 — Переданы некорректные данные при обновлении профиля
//404 — Пользователь с указанным _id не найден
//500 — Ошибка по умолчанию
const updateUserProfile = (req, res) => {
  //как передать только те поля, значения которых нужно изменить
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name: name, about: about },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

//400 — Переданы некорректные данные при обновлении аватара
//404 — Пользователь с указанным _id не найден
//500 — Ошибка по умолчанию
const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    })
    .then(avatar => res.send({ data: avatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

module.exports = { getUsers, getUserById, createUser, updateUserProfile, updateUserAvatar };