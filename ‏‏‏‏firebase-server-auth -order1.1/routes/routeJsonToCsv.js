const express = require('express')
const router = express.Router()


const JsonToCsv = require('../models/modelJsonToCsv');

router.post('/saveOneTravelToCsv', async function (req, res) {
    cameraId = req.body.cameraId;
    travelId = req.body.travelId;
    console.log("in saveOneTravelToCsv")
    console.log(cameraId)
    console.log(travelId)

    JsonToCsv.saveOneTravelToCsv(cameraId, travelId)
        .then(response => res.send(response));
});


router.post('/saveALLTravelToCsv', async function (req, res) {
    console.log("in routeJsonTocSV")
    cameraId = req.body.cameraId;
    travelArrId = req.body.travelArrId;
    console.log("cameraId: ", cameraId);
    console.log("travelArrId: ", travelArrId);

    JsonToCsv.saveALLTravelToCsv(cameraId, travelArrId)
        .then(response => res.send(response));
});

module.exports = router
