const Card = require('../models/card');
const http2 = require('node:http2');

const getCards = (req, res) => {
  return Card.find({})
    .populate('owner')
    .populate('likes')
    .then((cards) => res.status(http2.constants.HTTP_STATUS_OK).send({ data: cards }))
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const createCard = (req, res) => {
  const { name, link, ownerId } = req.body;
  return Card.create({ name, link, owner: ownerId})
    .then(card => res.status(http2.constants.HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки'});
      }
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const deleteCard = (req, res) => {
  return Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if(!card._id) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена'});
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const likeCard = (req, res) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if(!card._id) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки'});
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}

const dislikeCard = (req, res) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if(!card._id) {
        return res.status(http2.constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки'});
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      console.log(err);
      return res.status(http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Ошибка сервера'});
    });
}


module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };