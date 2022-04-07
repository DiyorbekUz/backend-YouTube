const { InternalServerError } = require('../utils/error.js')
const GET = (req, res, next) => {
    try {
        res.json({
            status: 201,
            message: 'true',
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    GET
}