const { AuthorizationError, InternalServerError } = require('../utils/error.js')
const {verify} = require("../utils/jwt.js")
const path = require("path")
const fs = require("fs")

const POST = (req, res, next) => {
    try {
        let videos = req.readFile("videos") || []

        if(!req.body.caption || req.body.caption.trim().length < 5){
            return next(new AuthorizationError(401, "Caption required and minimum symbols 5!"))
        }

        if(!req?.files?.video){
            return next(new AuthorizationError(401, "Video required!"))
        }
        
        if(req.files.video.size >= 50485760){
            return next(new AuthorizationError(401, "Video size must be 50mb"))
        }
        

        if(!(["video/mp4"].includes(req.files.video.mimetype))){
            return next(new AuthorizationError(401, `Please upload file types video/mp4`))
        }


        const videoName = Date.now() + "_" + req.files.video.name

        const d = new Date
        const dformat = [d.getMonth()+1, d.getDate(), d.getFullYear()].join('/')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
        
        const newVideo = {
            videoId: videos.length ? videos.at(-1).videoId + 1 : 1,
            userId: verify(req.headers.token).userId,
            caption: req.body.caption,
            video: videoName,
            videoDate: dformat,
            videoSize: Math.ceil(req.files.video.size / 1024 / 1024)
        }

        videos.push(newVideo)

        req.writeVideo(videoName, req.files.video.data)
        req.writeFile("videos", videos)

        return res.status(200).json(newVideo)

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const GET = (req, res, next) => {
    try {
        let videos = req.readFile("videos") || []

        videos = videos.map(video => {
            video.video = path.resolve(__dirname , "..", "uploads", "videos", video.video)  
            return video
        })

        return res.status(200).json(videos)

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}


const PUT = (req, res, next) => {
    try {
        let videos = req.readFile("videos") || []
        let { videoId, caption } = req.body
        let userId = verify(req.headers.token).userId
        if(!videoId){
            return next(new AuthorizationError(401, "VideoId not found!"))
        }
        
        let video = videos.find(video => video.videoId == videoId && video.userId == userId)
        
        if(!video) {
            return next(new AuthorizationError(401, "Video not found!"))
        }

        if(!req.body.caption || req.body.caption.trim().length < 5){
            return next(new AuthorizationError(401, "Caption required and minimum symbols 5!"))
        }

        video.caption = caption
        req.writeFile("videos", videos)
        return res.status(200).json(video)

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

const DELETE = (req, res, next) => {
    try {
        let videos = req.readFile("videos") || []
        let userId = verify(req.headers.token).userId
        let { videoId } = req.body
        
        if(!videoId){
            return next(new AuthorizationError(401, "VideoId not found!"))
        }
        
        let video = videos.find(video => video.videoId == videoId && video.userId == userId)
        if(!video) {
            return next(new AuthorizationError(401, "Video not found!"))
        }

        let videoPath = path.resolve(__dirname, "..", "uploads", "videos", video.video) 
        
        fs.unlinkSync(videoPath)

        videos = videos.filter(el => el.videoId != videoId)
        
        req.writeFile("videos", videos)
        
        return res.status(200).json(video)

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}



module.exports = {
    POST,
    GET,
    PUT,
    DELETE
}
