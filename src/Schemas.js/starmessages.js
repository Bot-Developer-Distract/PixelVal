const { model, Schema } = require("mongoose");

let starmessages = new Schema({
    Message: String,
    Reaction: String,
    Channel: String
})

module.exports = model("starmessages", starmessages);