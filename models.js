const mongoose = require('mongoose');

const evolutionNewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    previewImg: {
        type: String,
        required: true
    },
    mainImg: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
});


module.exports = mongoose.model('news', evolutionNewsSchema);
