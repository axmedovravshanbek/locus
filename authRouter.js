const Router = require('express');
const router = new Router();
const {User, Bill} = require('./models');
const axios = require('axios');

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
router.get('/axios', async function (req, res) {
    try {
        console.log('keld');
        const hamma = await User.find({});
        for (userr of hamma) {
            axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: userr.token,
                    priority: "high",
                    notification: {
                        title: `Harajatlaringi kiritib qo'y ${userr.username}`,
                        // body: `Tezroq`
                    }
                },
                {
                    headers: {
                        'Authorization': 'Bearer AAAAviYoMXU:APA91bGWbMT_nc0Tfc3U_3WEiS_UQFmu1iRj4RBh0nB2e83KucIikbx4tLRLOknJORmECqGS_FpZbOdSOay0Q6RT8i4zLm3BCTyNHauWV7tI39KREbFkRP_3Kws4cwoysXpoNp4p-qvY',
                    }
                }
            );
        }
        res.json("yubardim hammaga")
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
        res.json(bills.reverse())
    } catch (e) {
        console.log(e)

    }
});
router.post('/chart/pie', async function (req, res) {
    try {
        var d = {};
        const today = Date.now();
        const {type} = req.body;
        if (type !== 0)
            d = await Bill.aggregate([
                {
                    $match: {"date": {$gte: new Date(today - (type * 86400000))}}
                },
                {
                    $group: {
                        _id: "$user",
                        summ: {$sum: "$money"},
                    }
                },
                {
                    $sort: {summ: 1}
                }
            ]);
        else
            d = await Bill.aggregate([
                {
                    $group: {
                        _id: "$user",
                        summ: {$sum: "$money"},
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
        const {sum, reason, date, user, members} = req.body;
        for (const member of members) {
            await User.updateOne({username: member}, {$inc: {bill: Math.floor(sum / members.length)}})
        }
        const users = await User.find({username: {$in: members}});
        for (userr of users) {
            axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: userr.token,
                    priority: "high",
                    notification: {
                        title: `${user} ${reason}ga ${sum} ishlatdi. ${members.length} odamga`,
                        body: `Sanga (${userr.username}) ${Math.floor(sum / members.length)} so'm yozildi`
                    }
                },
                {
                    headers: {
                        'Authorization': 'Bearer AAAAviYoMXU:APA91bGWbMT_nc0Tfc3U_3WEiS_UQFmu1iRj4RBh0nB2e83KucIikbx4tLRLOknJORmECqGS_FpZbOdSOay0Q6RT8i4zLm3BCTyNHauWV7tI39KREbFkRP_3Kws4cwoysXpoNp4p-qvY',
                    }
                }
            );
        }
        await User.updateOne({username: user}, {$inc: {bill: -sum}});
        const bill = Bill({
            user,
            money: sum,
            date: new Date(date),
            members,
            reason
        });
        await bill.save();
        res.json({accsess: true});


    } catch (e) {
        res.status(200).json({message: 'catch error', accsess: 0});
        console.log(e)
    }
});
router.post('/set/token', async function (req, res) {
    const {_id, token} = req.body;
    const user = await User.findOne({_id});
    if (!user) {
        return res.json({accsess: false})
    } else {
        await User.updateOne({_id}, {token});
        return res.json({accsess: true})
    }
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