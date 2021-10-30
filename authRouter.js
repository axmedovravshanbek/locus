const Router = require('express');
const router = new Router();
const {User, Bill} = require('./models');
router.post('/login', async function (req, res) {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (!user) {
            return res.json({message: 'Bunday foydalanuvchi mavjud emas', accsess: 0})
        }
        if (password !== user.password) {
            return res.json({message: "Parol noto'g'ri", accsess: 0})
        }
        return res.json({message: 'success', accsess: 1, username})
    } catch (e) {
        res.status(200).json({message: 'catch error', accsess: 0});
        console.log(e)
    }
});
router.post('/add', async function (req, res) {
    try {
        const {data, reason, date} = req.body;
        for (const item of data) {
            await User.updateOne({username: item.username}, {$inc: {bill: item.amount}})
        }
        // await Bill.updateOne({}, {$push: {members: 'dcsdcsdcsd'}});
        await Bill.updateOne({}, {
            $push: {
                members: {
                    reason: reason,
                    date: date,
                    members: data.map((item) => {
                        return {
                            user: item.username,
                            count: item.amount
                        }
                    })
                }
            }
        });
        const bills = await Bill.find();
        // var bill = new Bill({
        //     members: data.map((item) => {
        //         return [{
        //             user: item.username,
        //             count: item.amount
        //         }]
        //     },
        // });
        // console.log(bill);
        // await bill.save();
        res.json(bills)
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
router.get('/bills', async function (req, res) {
    try {
        const bills = await Bill.find();
        res.json(bills)
    } catch (e) {
        console.log(e)

    }
});
router.get('/qosh', async function (req, res) {
    try {
        const user = User({
            username: 's',
            password: 's',
            image: 'Comeback'
        });
        user.save();
        res.json(user)
    } catch (e) {
        console.log(e)
    }
});
router.get('/demo', async function (req, res) {
    try {
        await User.updateMany({}, {bill: 0});
        // const s = new Bill({
        //     members: {sca: 'dcsdcsdcsd'}
        // });
        // const us = await Bill.find()
        // s.save();
        res.json('us')
    } catch (e) {
        console.log(e)
    }
});
module.exports = router;