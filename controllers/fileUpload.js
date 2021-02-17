const path = require('path');
const multer = require("multer");

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname.replace('/controllers', '')+'/static/uploads'));
    },
    filename: (req, file, cb) => {
        const fileName = (+ Date.now() + '-' + file.originalname)
        cb(null, fileName.split(' ').join('_') );
    }
});

module.exports = multer({storage, fileFilter})