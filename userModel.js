const mongoose = require('mongoose')
const { type } = require('node:os')

userSchema = new mongoose.Schema({
    username:{type:String, required:true , unique:true},
    password:{type:String , require : true},
    tokenVersion:{type:Number , required : true, default:0}
})

const user = mongoose.model('user',userSchema)
module.exports = user