const controller = require('../controllers/users.js')
const checkToken = require('../middlewares/checkToken.js')
const router = require('express').Router()

router.get('/users', controller.GET)

module.exports = router