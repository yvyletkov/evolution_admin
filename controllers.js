const newsModel = require('./models');

module.exports.createNewsItem = (req, res, next) => {
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
        .then((newsList) => {
            res.status(200).send(newsList);
        })
        .catch(() => res.status(400));
};

module.exports.getNewsItem = (req, res, next) => {
    console.log(req.body)

    newsModel.findById(req.body.id)
        .then((newsItem) => {
            res.status(200).send(newsItem);
        })
        .catch(() => res.status(400));
};

module.exports.updateNewsItem = (req, res, next) => {
    newsModel.findByIdAndUpdate(req.body.id, req.body.update)
        .then((newsItem) => {
            res.status(200).send(newsItem);
        })
        .catch(() => res.status(400));
};

