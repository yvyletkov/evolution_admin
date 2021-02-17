const mongoose = require('mongoose');

const evolutionEventsSchema = new mongoose.Schema({
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false,
    },
    link: {
        type: String,
        required: false,
    },
    inactive: {
        type: Boolean,
        required: false,
        default: false
    },
});


module.exports = mongoose.model('events', evolutionEventsSchema);
