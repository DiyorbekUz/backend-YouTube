const controller = require('../controllers/uploadVideo.js')
const router = require('express').Router()

router.post('/videoupload', controller.POST)

module.exports = router