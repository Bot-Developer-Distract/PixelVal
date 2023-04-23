const { model, Schema } = require("mongoose");

let staffrole = new Schema({
    Role: String,
    Guild: String
})

module.exports = model("staffrole", staffrole);