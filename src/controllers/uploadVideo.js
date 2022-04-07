const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const { sign } = require('../utils/jwt.js')
const path = require('path')
const fs = require('fs')

const POST = (req, res, next) => {
    try {
        const allVideos = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'videos.json'), 'utf-8')) || []
        let { username, videoTitle, userPhoto } = req.body
        console.log(req.files);
		const { file } = req.files

		username = username?.trim()
        
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

		if(!['video/mp4', 'video/mov'].includes(file.mimetype)) {
			return next(
                new AuthorizationError(400, 'Invalid mime type')
            )
		}

		if(file.size > 50 * 1024 * 1024) {
			return next(
                new AuthorizationError(400, 'File is too large')
            )
		}

		if(allVideos.find(user => user.username == username)) {
			return next(
                new AuthorizationError(400, 'The user already exists')
            )
		}

		const fileName = Date.now() + file.name.replace(/\s/g, "")
		const filePath = path.join(__dirname, '../', 'uploads', 'videos', fileName)

		file.mv(filePath)

        let newVideo = {
            "videoId": allVideos?.length ? allVideos.at(-1).videoId + 1 : 1,
            "username": username,
            "userPhoto": userPhoto,
            "videoTitle": videoTitle,
            "videoUrl": fileName,
            "videoSize": file.size,
            "videoCreatedAt": currentDate
        }
        
        allVideos.push(newVideo)
        fs.writeFileSync(path.join(__dirname, '../', 'database', 'videos.json'), JSON.stringify(allVideos))

        return res
            .status(201)
            .json({
                status: 201,
                message: 'Succsessfully uploaded',
        })
        
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    POST
}