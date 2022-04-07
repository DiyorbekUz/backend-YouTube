const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const { sign } = require('../utils/jwt.js')
const sha256 = require('sha256')
const path = require('path')
const fs = require('fs')

const REGISTER = (req, res, next) => {
    try {
        const allUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'users.json'), 'utf-8')) || []
        console.log(allUsers);
        console.log(req.body);
        req.body.userId = allUsers.length ? allUsers.at(-1).userId + 1 : 1
        req.body.password = sha256(req.body.password)
        let { username, password } = req.body
        console.log(req.files);
		const { file } = req.files

		username = username?.trim()
		password = password?.trim()
        var dt = new Date();

        let currentDate = `${
            (dt.getMonth()+1).toString().padStart(2, '0')}/${
            dt.getDate().toString().padStart(2, '0')}/${
            dt.getFullYear().toString().padStart(4, '0')} ${
            dt.getHours().toString().padStart(2, '0')}:${
            dt.getMinutes().toString().padStart(2, '0')}`

		if(
			!username ||
			username.length > 50
		) {
			return next(
                new AuthorizationError(400, 'Invalid username')
            )
		}

		if(!file) {
			return next(
                new AuthorizationError(400, 'File is required')
            )
		}

		if(!['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
			return next(
                new AuthorizationError(400, 'Invalid mime type')
            )
		}

		if(file.size > 50 * 1024 * 1024) {
			return next(
                new AuthorizationError(400, 'File is too large')
            )
		}

		if(allUsers.find(user => user.username == username)) {
			return next(
                new AuthorizationError(400, 'The user already exists')
            )
		}

		const fileName = Date.now() + file.name.replace(/\s/g, "")
		const filePath = path.join(__dirname, '../', 'uploads', fileName)

		file.mv(filePath)

        let newUser = {
            userId : req.body.userId,
            username: username,
            photo_url: fileName,
            password: req.body.password,
            date: currentDate
        }
        
        allUsers.push(newUser)
        fs.writeFileSync(path.join(__dirname, '../', 'database', 'users.json'), JSON.stringify(allUsers))

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const agent = req.headers['user-agent']
    
        return res
            .status(201)
            .json({
                status: 201,
                message: 'The user successfully registered!',
                token: sign({ agent, ip, userId: req.body.userId }),
                user: newUser
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const LOGIN = (req, res, next) => {
    try {
        const allUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'users.json'), 'utf-8')) || []


        req.body.password = sha256(req.body.password)
        const user = allUsers.find(user => user.username == req.body.username && user.password == req.body.password)

        if (!user) {
            return next(
                new AuthorizationError(400, 'Wrong username or password!')
            )
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const agent = req.headers['user-agent']

        return res.status(200).json({
            status: 200,
            message: 'The user successfully logged in!',
            token: sign({ agent, ip, userId: user.userId }),
            user
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    LOGIN, REGISTER
}