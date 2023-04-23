const { model, Schema } = require('mongoose');

let botvoiceschema = new Schema ({
    Guild: String,
    BotChannel: String
})

module.exports = model('botvoicechannels', botvoiceschema);