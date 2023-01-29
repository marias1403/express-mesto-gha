const http2 = require('node:http2');
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');

const getCards = (req, res, next) => {
  return Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(http2.constants.HTTP_STATUS_OK).send({ data: cards }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  return Card.create({
    name: req.body.name,
    link: req.body.link,
    owner: req.user._id,
  })
    .then(card => res.status(http2.constants.HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при создании карточки');
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  return Card.findById(req.params.cardId)
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }

      if (card.owner._id.toString() === req.user._id) {
        return Card.findOneAndRemove(req.params.cardId);
      }

      throw new NotFoundError('Нет прав на удаления карточки');
    })
    .then((card) => {
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при удалении карточки');
      }

      throw err;
    })
    .catch(next)
};

const likeCard = (req, res, next) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      return res.status(http2.constants.HTTP_STATUS_OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };