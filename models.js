const mongoose = require('mongoose');

const evolutionNewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
});


module.exports = mongoose.model('news', evolutionNewsSchema);
