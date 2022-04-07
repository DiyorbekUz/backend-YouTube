const { InternalServerError, ValidationError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')
const GET = (req, res, next) => {
    try {
        res.send(fs.readFileSync(path.join(__dirname, '../', 'database', 'videos.json')))
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const DELETE = (req, res, next) => {
	try {
        console.log('delete');
        let { videoId } = req.body
        
		if(!videoId) {
			return next(new ValidationError(400, "videoId is required!"))
		}

		const videos = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'videos.json')))
		const found = videos.findIndex(video => video.videoId == videoId)

		if(found == -1) {
			return next(new ValidationError(404, "There is no such video!"))
		}

		const [ deletedVideo ] = videos.splice(found, 1)
        console.log(deletedVideo);
		fs.unlinkSync(path.join(__dirname, '../', 'uploads', 'videos', deletedVideo.videoUrl))


		return res.status(201).json({
			video: deletedVideo,
			message:"The video is deleted!"
		})

	} catch(error) {
		return next(error)
	}
}


const PUT = (req, res, next) => {
	try {
		let { videoId, videoTitle } = req.body
		videoTitle = videoTitle.trim()

		if(!videoId) {
			return next(new ValidationError(400, "videoId is required!"))
		}

		if(videoTitle.length < 1) {
			return next(new ValidationError(400, "VideoTitle is required!"))
		}

		if(videoTitle.length > 30) {
			return next(new ValidationError(400, "Video title too large"))
		}

        const videos = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'videos.json')))
		const found = videos.find(video => video.videoId == videoId)
        console.log(found);

		if(!found) {
            return next(new ValidationError(400, "there is no such videp!"))
		}

		found.videoTitle = videoTitle

        fs.writeFileSync(path.join(__dirname, '../', 'database', 'videos.json'), JSON.stringify(videos))

        return res.status(201).json({
			video: found,
			message:"The video updated!"
		})

	} catch(error) {
		return next(error)
	}
}

module.exports = {
    GET,
    DELETE,
    PUT
}