const Router = require('express');
const router = new Router();
const {User, Role} = require('./models');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const generateToken = (id, roles) => {
    const payload = {id, roles};
    return jwt.sign(payload, secret, {expiresIn: "24h"})
};
// router.post('/register', [
//     check('username', 'cant be empty').notEmpty(),
//     check('password', 'parol 4 dan kop bosin').isLength({min: 4})
// ], async function (req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({message: 'oshibka registratsii', errors: errors.errors})
//         }
//
//         const {username, password} = req.body;
//         // const candidate = await User.findOne({username});
//         if (candidate) {
//             return res.status(400).json({message: 'uje est'})
//         }
//         // const userRoles = await Role.findOne({value: 'USER'});
//         // const user = new User({username, password, roles: [userRoles.value]});
//         // await user.save();
//         res.json('boladi')
//     } catch (e) {
//         console.log(e)
//
//     }
// });
router.post('/login', async function (req, res) {
    try {
        console.log(req.body);
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (!user) {
            return res.json({message: 'Bunday foydalanuvchi mavjud emas', accsess: 0})
        }
        if (password !== user.password) {
            return res.json({message: "Parol noto'g'ri", accsess: 0})
        }
        return res.json({message: 'success', accsess: 1})
    } catch (e) {
        res.status(200).json({message: 'catch error', accsess: 0});
        console.log(e)
    }
});
router.get('/get', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users)
    } catch (e) {
        console.log(e)

    }
});
module.exports = router;