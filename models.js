const {Schema, model} = require('mongoose');

const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    har: [{type: String, ref: 'Bill'}]
});
const Bill = new Schema({
    value: {type: String, unique: true, default: 'USER'},
});

module.exports.User = model('User', User);
module.exports.Bill = model('Bill', Bill);