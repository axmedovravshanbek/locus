const Router = require('express');
const router = new Router();
const {User, Bill} = require('./models');

router.get('/edit', async function (req, res) {
    try {
        await User.updateMany({}, {token: ''}, {upsert: true});
        res.json('user')
    } catch (e) {
        console.log(e)
    }
});
router.get('/clear', async function (req, res) {
    try {
        await User.updateMany({}, {bill: 0});
        res.json('000')
    } catch (e) {
        console.log(e)
    }
});
router.get('/get/users', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users)
    } catch (e) {
        console.log(e)

    }
});
router.get('/get/bills', async function (req, res) {
    try {
        const bills = await Bill.find();
        res.json(bills)
    } catch (e) {
        console.log(e)

    }
});
router.get('/chart/pie', async function (req, res) {
    try {
        const d = await Bill.aggregate([
            {
                $group: {
                    _id: "$user",
                    summ: {$sum: "$money"},
                    count: {$sum: 1}
                }
            },
            {
                $sort: {summ: 1}
            }
        ]);
        res.json(d)
    } catch (e) {
        console.log(e)
    }
});
router.post('/chart/line', async function (req, res) {
    try {
        const {fromDate, toDate} = req.body;
        const d = await Bill.aggregate([
            {
                $match: {"date": {$gte: new Date(fromDate), $lt: new Date(toDate)}}
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
                    summ: {$sum: "$money"},
                    count: {$sum: 1}
                }
            },
            {
                $sort: {_id: 1}
            }
        ]);
        res.json(d)
    } catch (e) {
        console.log(e)
    }
});
router.post('/add/bill', async function (req, res) {
    try {
        // const {sum, reason, date, user, members} = req.body;
        console.log(req.body);
        // for (const member of members) {
        //     await User.updateOne({username: member}, {$inc: {bill: sum / members.length}})
        // }
        // await User.updateOne({username: user}, {$inc: {bill: -sum}});
        // const bill = Bill({
        //     user,
        //     money: sum,
        //     date: new Date(date),
        //     members,
        //     reason
        // });
        // await bill.save();
        // const bills = await Bill.find();
        res.json("bills")
    } catch (e) {
        res.status(200).json({message: 'catch error', accsess: 0});
        console.log(e)
    }
});
router.post('/set/token', async function (req, res) {
    const {name, token} = req.body;
    const user = await User.findOne({username: name});
    if (!user) {
        return res.json({message: 'Bunday foydalanuvchi mavjud emas'})
    } else {
        await User.updateOne({username: name}, {token})
    }
    return res.json({message: 'success', accsess: 1, username})
});
router.post('/login', async function (req, res) {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(200).json({message: "bunday odam yo'q", accsess: false, user: {}})
        }
        if (password !== user.password) {
            return res.status(201).json({message: 'parol xata', accsess: false, user: {}})
        }
        return res.status(202).json({message: '', user: user, accsess: true})
    } catch (e) {
        console.log(e)
    }
    res.status(500).json({message: 'login'})
});
module.exports = router;