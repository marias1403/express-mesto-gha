const express = require('express');
const router = require('express').Router();
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { validateUserBody, validateAuthentication } = require('./middlewares/validations');
const { createUser, login } = require('./controllers/users');
const BadRequestError = require('./errors/bad-request-error');
const NotFoundError = require('./errors/not-found-error');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signin', validateAuthentication, login);
app.post('/signup', validateUserBody, createUser);

app.use(auth);

app.use('/users', userRouter);
app.use('/cards', cardRouter);

router.use((req, res) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.all('*', (req, res) => {
  throw new BadRequestError('Такого адреса не существует');
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