const mongoose = require("mongoose")
const noteSchema = new mongoose.Schema({
    note:{type :String , unique:false},
    username:{type : String , unique:false}
})

module.exports = mongoose.model('note',noteSchema)