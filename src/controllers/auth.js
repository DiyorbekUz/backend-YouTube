const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const { sign, verify } = require('../utils/jwt.js')
const sha256 = require('sha256')
const path = require("path")


const REGISTER = (req, res, next) => {

    try {

        const users = req.readFile('users') || []
        
        
        req.body.userId = users.length ? users.at(-1).userId + 1 : 1
        req.body.password = sha256(req.body.password)
        
        if (users.find(user => user.username == req.body.username)) {
            return next(
                new AuthorizationError(400, 'The user already exists')
            )
        }
        //Profile image
        if(!req?.files?.profileImage){
            return next(new AuthorizationError(401, "ProfileImage required!"))
        }
        
        if(req.files.profileImage.size >= 10485760){
            return next(new AuthorizationError(401, "ProfileImage size must be 10mb"))
        }

        if(!(["image/jpeg", "image/pipeg", "image/svg+xml", "image/x-icon", "image/x-png", "image/png"].includes(req.files.profileImage.mimetype))){
            return next(new AuthorizationError(401, `Please upload file types "image/jpeg", "image/pipeg", "image/svg+xml", "image/x-icon", "image/png"`))
        }
        
        const profileImageName = Date.now() + "_" + req.files.profileImage.name
        req.writeImage(profileImageName,req.files.profileImage.data)

        req.body.profileImage = profileImageName
    
        users.push(req.body)
        req.writeFile('users', users)

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const agent = req.headers['user-agent']
    
        return res.status(201).json({
            status: 201,
            message: 'The user successfully registered!',
            token: sign({ agent, ip, userId: req.body.userId })
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const LOGIN = (req, res, next) => {
    try {
        const users = req.readFile('users') || []
        
        let {password , username} = req.body 
        console.log(users)
        console.log(req.body);
        if(!(password && username)){
            new AuthorizationError(400, 'Username and password required!')
        }

        password = sha256(password)
        const user = users.find(user => user.username == username && user.password == password)

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
            token: sign({ agent, ip, userId: user.userId })
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}
const CHECK = (req, res, next) => {
    try{
        const {token} = req.body
        if(!token){
            throw new Error("Token invalid")
        }
        console.log(verify(token))

        res.status(200).json({
            status: 200, 
            message: "OK"
        })
        
    } catch (error) {
        res.status(400).json({
            status: 400, 
            message: error.message
        })
    }
}

module.exports = {
    LOGIN, REGISTER, CHECK
}