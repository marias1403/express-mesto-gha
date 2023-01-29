const http2 = require('node:http2');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
  }),
}), createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('*', (req, res) => {
  res.status(http2.constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Такого адреса не существует' });
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message
    });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});