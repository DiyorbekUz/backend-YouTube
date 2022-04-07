const fileUpload = require("express-fileupload")
const express = require('express')
const cors = require("cors")
const path = require('path')
const fs = require('fs')
const app = express()

const PORT = process.env.PORT || 5000

app.use(express.static(path.resolve(__dirname, "uploads")))
app.use(cors())
require('./config.js')
require('./utils/validation.js')

// middlewares
const modelMiddleware = require('./middlewares/model.js')

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));


app.use(modelMiddleware({ databasePath: path.join(__dirname, 'database')}))
app.use(express.json())


// routes
const authRouter = require('./routes/auth.js')
const userRouter = require('./routes/user.js')
const videoRouter = require('./routes/video.js')

app.use(authRouter)
app.use(userRouter)
app.use(videoRouter)



app.use((error, req, res, next) => {

    console.log(error)

    if (error.name == 'ValidationError') {
        return res.status(error.status).json({
            status: error.status,
            message: error.message.details[0].message,
            errorName: error.name,
            error: true,
        })
    }

    if (error.name == 'AuthorizationError') {
        return res.status(error.status).json({
            status: error.status,
            message: error.message,
            errorName: error.name,
            error: true,
        })
    }

    
    if (error.status != 500) {
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