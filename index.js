const express = require('express');
const mongoose = require('mongoose');
const app = express();
const router = require('express').Router();
const {createNewsItem, listNews, getNewsItem, updateNewsItem} = require('./controllers');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require("multer");

const { PORT = 3000 } = process.env;

app.listen(PORT,() => {
    console.log(`Сервер запущен, port ${PORT}`)
});

mongoose.connect('mongodb://localhost:27017/newsdb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));


router.post('/evo/news/add', createNewsItem)
router.get('/evo/news/list', listNews)
router.post("/evo/news/get", getNewsItem)
router.post("/evo/news/update", updateNewsItem)


router.get('/evo/news/add',function(req, res){
    res.sendFile(path.join(__dirname+'/static/evo/news/add.html'));
});
router.get('/evo/news',function(req, res){
    res.sendFile(path.join(__dirname+'/static/evo/news/list.html'));
});
router.get('/evo/news/edit',function(req, res){
    res.sendFile(path.join(__dirname+'/static/evo/news/edit.html'));
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
        cb(null, "static/uploads");
    },
    filename: (req, file, cb) => {
        const fileName = (+ Date.now() + '-' + file.originalname)
        cb(null, fileName.split(' ').join('_') );
    }
});
const upload = multer({storage: storageConfig, fileFilter: fileFilter});
router.post("/evo/news/upload-photos", upload.any(), function (req, res, next) {

    console.log('ФАЙЛЫ', req.files)
    let imgData = req.files[0];

    if(!imgData) {
        console.log('Images upload error')
        res.send('Images upload error');
    }
    else
        res.send([
            {path: imgData.path.replace('static/', '')},
        ]);
});


app.use(router);
