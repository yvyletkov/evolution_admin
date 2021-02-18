const eventsModel = require('../models/events-model');
const serializeEventsList = require('../serializers/serializeEventsList');

module.exports.createEvent = (req, res, next) => {
    console.log('REQUEST', req.body)
    const { startDate, endDate, value, desc, img, link, inactive } = req.body;
    eventsModel.create({startDate, endDate, value, desc, img, link, inactive})
        .then((event) => {
            res.status(201).send(event);
        })
        .catch(() => res.status(400));
};

module.exports.listEvents = (req, res, next) => {
    eventsModel.find({})
        .then((eventsList) => {
            res.status(200).send(eventsList);
        })
        .catch(() => res.status(400));
};

module.exports.getEvent = (req, res, next) => {
    console.log(req.body)

    eventsModel.findById(req.body.id)
        .then((event) => {
            res.status(200).send(event);
        })
        .catch(() => res.status(400));
};

module.exports.updateEvent = (req, res, next) => {
    console.log(req.body)

    eventsModel.findByIdAndUpdate(req.body.id, req.body.update)
        .then((event) => {
            res.status(200).send(event);
        })
        .catch(() => res.status(400));
};

module.exports.deleteEvent = (req, res, next) => {
    eventsModel.findByIdAndDelete(req.body.id, req.body.update)
        .then(() => {
            res.status(200).send({status: 'Event deleted successfully'});
        })
        .catch(() => res.status(400));
};

module.exports.sendModifiedEventsList = (req, res, next) => {
    eventsModel.find({})
        .then((eventsList) => {
            res.status(200).send(serializeEventsList(eventsList));
        })
        .catch(() => res.status(400));
};

