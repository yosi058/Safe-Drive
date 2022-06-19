const express = require('express')
const router = express.Router()
const DbServer = require('../models/modelDbServer')

DbServer.init();


router.post('/getjson', async function (req, res, next) {
  console.log(res.userData.email)
  // console.log( await DbServer.getAllDataOnCamera("camera_4"))
  // res.send(await DbServer.getAllDataOnCamera("camera_4"));
  DbServer.getAllDataOnCamera("camera_4").then(response => res.send(response));
  // var js = { 0: "a", 1: "b", 2: "c", 3: "d", 4: "e", }
  // res.send(js);
});

router.post('/getCamerasOfUser', async function (req, res, next) {
  userId = res.userData.email;
  console.log("getCamerasOfUser", userId)
  // userId = "ori123@gmail"
  console.log(userId);
  DbServer.getCamerasOfUser(userId).then(response => res.send(response));
});

router.post('/getTittleTravels', async function (req, res, next) {
  cameraId = req.body.cameraId;
  console.log(cameraId);
  DbServer.getTittleTravels(cameraId).then(response => res.send(response));
});

router.post('/getTravels', async function (req, res, next) {
  cameraId = req.body.cameraId;
  travelId = req.body.travelId;
  console.log("getTravels", cameraId);
  console.log("getTravels", travelId);
  DbServer.getTravels(cameraId, travelId).then(response => res.send(response));
});


router.post('/updateCamera', async function (req, res) {
  userId = res.userData.email;
  cameraId = req.body.cameraId;
  pass = req.body.pass;
  console.log("in updateCamera");
  console.log(userId);
  console.log(cameraId);
  console.log(pass);
  console.log(typeof pass);
  DbServer.updateCamera(userId, cameraId, pass).then(response => res.send(response));
});

router.post('/deleteCamera', async function (req, res) {
  userId = res.userData.email;
  cameraId = req.body.cameraId;
  console.log(cameraId);
  DbServer.deleteCamera(userId, [cameraId])
    .then(response => res.send(response));
});


router.post('/signUp', async function (req, res) {
  userId = res.userData.email;

  DbServer.signUp(userId)
    .then(response => res.send(response));
});


router.post('/setConfOfArrCamera', async function (req, res) {
  userId = res.userData.email;
  camerasArr = req.body.camerasArr;
  eyes = req.body.eyes;
  phone = req.body.phone;
  yawning = req.body.yawning;
  yawningAlert = req.body.yawningAlert;

  console.log(camerasArr);
  console.log(eyes);
  console.log(phone);
  console.log(yawning);
  console.log(yawningAlert);


  DbServer.setConfOfArrCamera(camerasArr, eyes, phone, yawning, yawningAlert)
    .then(response => res.send(response));
});



module.exports = router


