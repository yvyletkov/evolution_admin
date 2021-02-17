const router = require('express').Router();
const path = require('path');
const upload = require('../controllers/fileUpload');
const {createEvent, listEvents, getEvent, updateEvent, deleteEvent} = require('../controllers/events-controller');

router.post("/evo/events/upload-photos", upload.any(), function (req, res, next) {

    console.log('Изображения ивентов:', req.files)
    let imgData = req.files[0];

    if(!imgData) {
        console.log('Images upload error')
        res.send(400);
    }
    else {
        console.log('Event image uploaded!')
        res.send([
            {path: '/uploads/' + imgData.filename },
        ]);
    }

});

router.get('/evo/events/add',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/events/add.html'));
});
router.get('/evo/events',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/events/list.html'));
});
router.get('/evo/events/edit',function(req, res){
    res.sendFile(path.join(__dirname.replace('/routes', '')+'/static/evo/events/edit.html'));
});

router.post('/evo/events/add', createEvent)
router.get('/evo/events/list', listEvents)
router.post("/evo/events/get", getEvent)
router.post("/evo/events/update", updateEvent)
router.delete("/evo/events/delete", deleteEvent)

module.exports = router;