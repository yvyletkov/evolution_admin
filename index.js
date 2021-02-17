const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const {router} = require("./routes/index");

const { PORT = 3333 } = process.env;

app.listen(PORT,() => {
    console.log(`Сервер запущен, port ${PORT}`)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use(cors())
app.use(router);

mongoose.connect('mongodb://localhost:27017/newsdb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});