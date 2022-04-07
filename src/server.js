const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

require('./config.js')
//middlewares

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload());


app.set('views', path.join(__dirname, 'public'))
app.use(express.static(path.join(__dirname, 'uploads', 'videos')))
app.use(express.static(path.join(__dirname, 'uploads')))

// routes
const authRouter = require('./routes/auth.js')
const adminRouter = require('./routes/admin.js')
const uploadRouter = require('./routes/uploadVideo.js')
const videosRouter = require('./routes/videos.js')
const usersRouter = require('./routes/users.js')
const userRouter = require('./routes/user.js')
app.use(userRouter)
app.use(usersRouter)
app.use(videosRouter)
app.use(uploadRouter)
app.use(authRouter)
app.use(adminRouter)

app.get('/download/:videoPath', function(req, res){
    try {
        const { videoPath } = req.params
        res.download( path.join(__dirname, 'uploads', 'videos', videoPath) )
    } catch(error) {
        return next(error)
    }

});
 

app.use((error, req, res, next) => {
    
    if (error.name == 'ValidationError') {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            errorName: error.name,
            error: true,
        })
    }

    
    if (error.status != 500) {
        console.log('error', error.message);
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            errorName: error.name,
            error: true,
        })
    }
    
    fs.appendFileSync('./log.txt', `${req.url}__${req.method}__${Date.now()}__${error.name}__${error.message}\n`)
    
    return res.status(error.status).json({
        status: error.status,
        message: 'Internal Server Error',
        errorName: error.name,
        error: true,
    })
})


app.listen(PORT, () => console.log('server is ready at http://localhost:' + PORT))