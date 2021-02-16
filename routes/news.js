const router = require('express').Router();
const path = require('path');
const multer = require("multer");
const {createNewsItem, listNews, getNewsItem, updateNewsItem, deleteNewsItem} = require('../controllers/news');

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"||
        file.mimetype === "image/gif"||
        file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname.replace('/routes', '')+'/static/uploads'));
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
        res.send(400);
    }
    else {
        console.log('GFEWGFEFGER')
        res.send([
            {path: '/uploads/' + imgData.filename },
        ]);
    }

});

router.post('/evo/news/add', createNewsItem)
router.get('/evo/news/list', listNews)
router.post("/evo/news/get", getNewsItem)
router.post("/evo/news/update", updateNewsItem)
router.delete("/evo/news/delete", deleteNewsItem)

router.get('/evo/news/add',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/news/add.html'));
});
router.get('/evo/news',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/news/list.html'));
});
router.get('/evo/news/edit',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/news/edit.html'));
});

module.exports = router;