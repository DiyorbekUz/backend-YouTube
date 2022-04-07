const { AuthorizationError } = require('../utils/error.js')
const { verify } = require('../utils/jwt.js')
const fs = require('fs')
const path = require('path')

module.exports = (req, res, next) => {
	try {
		const { token } = req.headers

		if(!token) {
			return next(
                new AuthorizationError(400, 'User is un authorized')
            )
		}

		const { userId, agent } = verify(token)

		if(!(req.headers['user-agent'] == agent)) {
			return next(
                new AuthorizationError(400, 'Token is invalid')
            )
		}

		let users = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'users.json'), 'utf-8')) || []
		let user = users.find(user => user.userId == userId)

		if(!user) {
			return next(
                new AuthorizationError(400, 'The token invalid')
            )
		}

		req.userId = userId

		return next()
	} catch(error) {
		return next(
            new AuthorizationError(400, error.message)
        )
	}
}