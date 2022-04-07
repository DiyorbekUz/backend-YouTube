const controller = require('../controllers/auth.js')
const router = require('express').Router()

router.post('/login', controller.LOGIN)
router.post('/register', controller.REGISTER)

module.exports = router