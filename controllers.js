const newsModel = require('./models');

module.exports.createNews = (req, res, next) => {
    console.log('REQUEST', req.body)
    const { title, previewImg, mainImg, content } = req.body;
    newsModel.create({title, previewImg, mainImg, content})
        .then((newsItem) => {
            res.status(201).send(newsItem);
        })
        .catch(() => res.status(400));
};

module.exports.listNews = (req, res, next) => {
    newsModel.find({})
        .then((news) => {
            res.status(200).send(news);
        })
        .catch(() => res.status(400));
};

