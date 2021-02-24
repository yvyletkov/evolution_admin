const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const {router} = require("./routes/routes");

const { PORT = 3333 } = process.env;

app.listen(PORT,() => {
    console.log(`Сервер запущен, port ${PORT}`)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use(cors())
app.use(router);

mongoose.connect('mongodb://root:example@188.225.84.39:27017/evo_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});