const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

app.use((req, res, next) => {
  req.user = {
    _id: '63c2b872c5f78fff98bf9093',
  };

  next();
});

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('*', (req, res) => {
  res.status(404).send({ message: 'Такого адреса не существует' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});