const {Schema, model} = require('mongoose');
const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    image: {type: String, default: 'https://schoolsw3.com/howto/img_avatar.png'},
    bill: {type: Number, default: 0},
    token: {type: String, default: ''},
    tgId: {type: String, default: ''}
});
const Bill = new Schema({
    user: {type: String},
    reason: {type: String},
    money: {type: Number},
    date: {type: Date},
    members: [{}],
});
module.exports.User = model('User', User);
module.exports.Bill = model('Bill', Bill);