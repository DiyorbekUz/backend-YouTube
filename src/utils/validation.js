const Joi = require('joi')

const userSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/),
    birthYear: Joi.number().integer().min(1900).max(2020),
})
    .with('username', 'password')

process.JOI = {
    userSchema
}
