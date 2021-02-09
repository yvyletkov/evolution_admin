const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = require('express').Router();
const {createNews, listNews} = require('./controllers');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require("multer");

const { PORT = 3000 } = process.env;

app.listen(PORT,() => {
    console.log(`Сервер запущен, port ${PORT}`)
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"||
        file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const fileName = (+ Date.now() + '-' + file.originalname)
        cb(null, fileName.split(' ').join('_') );
    }
});
const upload = multer({storage: storageConfig, fileFilter: fileFilter});

mongoose.connect('mongodb://localhost:27017/newsdb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

router.post('/', createNews)
router.get('/', listNews)

router.get('/home',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

router.post("/upload", upload.any(), function (req, res, next) {

    let filedata = req.files[0];

    console.log('filedata', filedata);

    if(!filedata) {
        console.log('ошибка')
        res.send("Ошибка при загрузке файла");
    }
    else
        res.send({path: filedata.path});
});

app.use(router);
