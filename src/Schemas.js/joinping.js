const { model, Schema } = require ('mongoose');

let joinpingschema = new Schema({
    Guild: String,
    Channel: Array
})

module.exports = model('joinpingschema', joinpingschema);
