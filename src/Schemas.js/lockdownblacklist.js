const {model, Schema} = require('mongoose');

let lockdownchannels = new Schema({
    Guild: String,
    Channel: Array
});

module.exports = model('lockdownchannels', lockdownchannels);