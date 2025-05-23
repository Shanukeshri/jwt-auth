const mongoose = require("mongoose")
const noteSchema = new mongoose.Schema({
    note:{type :String },
    username:{type : String , unique:true}
})

module.exports = mongoose.model('note',noteSchema)