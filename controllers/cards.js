const Card = require('../models/card');

//400 — Переданы некорректные данные при создании карточки
//500 — Ошибка по умолчанию
const getCards = (req, res) => {
  return Card.find({})
    .populate('owner')
    //Почему cards в объекте { data: cards}
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

//400 — Переданы некорректные данные при создании карточки
//500 — Ошибка по умолчанию
const createCard = (req, res) => {
  const { name, link, ownerId } = req.body;
  //Откуда берется owner
  return Card.create({ name, link, owner: ownerId})
    .then(card => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

//404 — Карточка с указанным _id не найдена
const deleteCard = (req, res) => {
  return Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if(!card._id) {
        return res.status(404).send({ message: 'Карточка с указанным _id не найдена'});
      }
      return res.status(200).send({ data: card });
    })
    .catch(err => res.status(500).send(err));
}

//400 — Переданы некорректные данные для постановки/снятии лайка
//404 — Передан несуществующий _id карточки
//500 — Ошибка по умолчанию
const likeCard = (req, res) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    //Это сто такое?
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if(!card._id) {
        return res.status(404).send({ message: 'Передан несуществующий _id карточки'});
      }
      return res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}

//400 — Переданы некорректные данные для постановки/снятии лайка
//404 — Передан несуществующий _id карточки
//500 — Ошибка по умолчанию
const dislikeCard = (req, res) => {
  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if(!card._id) {
        return res.status(404).send({ message: 'Передан несуществующий _id карточки'});
      }
      return res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }
      return res.status(500).send(err);
    });
}


module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };