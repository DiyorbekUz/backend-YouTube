const controller = require('../controllers/videos.js')
const checkToken = require('../middlewares/checkToken.js')
const router = require('express').Router()

router.get('/videos', controller.GET)
router.delete('/videos', checkToken, controller.DELETE)
router.put('/videos', checkToken, controller.PUT)

module.exports = router