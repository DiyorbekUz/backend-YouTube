const controller = require('../controllers/admin.js')
const checkToken = require('../middlewares/checkToken.js')
const router = require('express').Router()

router.get('/admin', checkToken, controller.GET)

module.exports = router