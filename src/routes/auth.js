const validator = require('../middlewares/validation.js')
const controller = require('../controllers/auth.js')
const router = require('express').Router()

router.post('/login', controller.LOGIN)
router.post('/register', validator, controller.REGISTER)
router.post('/check', controller.CHECK)

module.exports = router