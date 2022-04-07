const { InternalServerError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')
const GET = (req, res, next) => {
    try {
        res.send(fs.readFileSync(path.join(__dirname, '../', 'database', 'users.json')))
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    GET
}