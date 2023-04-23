const { model, Schema } = require('mongoose');

let phoneownerbansschema = new Schema({
    User: Array,
    Pass: String
});

module.exports = model('phoneownerbans', phoneownerbansschema);