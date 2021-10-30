const {Schema, model} = require('mongoose');
const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    image: {type: String, required: true},
    bill: {type: Number, default: 0}
});
const Bill = new Schema({
    members: {},
});
module.exports.User = model('User', User);
module.exports.Bill = model('Bill', Bill);