const { InternalServerError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')
const GET = (req, res, next) => {
    try {
        allVideos = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'database', 'videos.json')))
        let newArr = []
        const { username } = req.params
        for(let video of allVideos){
            if(username == video.username){
                newArr.push(video)
            }
        }
        res.send(newArr)
    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

module.exports = {
    GET
}