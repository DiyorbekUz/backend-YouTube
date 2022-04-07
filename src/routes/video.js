const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/video.js')
const router = require('express').Router()

router.post('/video', checkToken, controller.POST)
router.get('/video', controller.GET)
router.put("/video", checkToken, controller.PUT)
router.delete("/video", checkToken, controller.DELETE)

module.exports = router