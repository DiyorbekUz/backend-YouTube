const controller = require('../controllers/user.js')
const checkToken = require('../middlewares/checkToken.js')
const router = require('express').Router()

router.get('/user/:username', controller.GET)

module.exports = router