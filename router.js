const Router = require('express');
const router = new Router();
const {User, Bill} = require('./models');
const axios = require('axios');

const sendNotification = (to = '', title = '', body = '') => {
    console.log(title, to, body);
    axios.post('https://fcm.googleapis.com/fcm/send',
        {
            to,
            priority: 'high',
            notification: {
                title,
                body
            },
            data: {
                customId: "02",
                badge: 1,
                sound: "",
                alert: "Alert"
            }
        },
        {
            headers: {
                'Authorization': process.env.FCM_AUTHORIZATION,
            }
        }
    ).then(() => console.log('ketti'))
        .catch(e => console.log('ketmadi', e));
};

router.get('/ali', async function (req, res) {
    try {
        const user = await User.findOne({username: 'Ali'});
        sendNotification(user.token, `Someone opened your website`, `With device width of px`);
        res.header("Access-Control-Allow-Origin", "*");
        res.json("sent to ali")
    } catch (e) {
        console.log('e', e);
        res.json(e)
    }
});

router.get('/axios', async function (req, res) {
    try {
        const everyone = await User.find({});
        for (user of everyone) {
            sendNotification(user.token, `Harajatlaringi kiritib qo'y ${user.username}`, '');
        }
        res.json('sent to all users')
    } catch (e) {
        console.log(e);
        res.json(e)
    }
});
router.post('/me', async function (req, res) {
    try {
        const {deviceWidth, website, empty} = req.body;
        const user = await User.findOne({username: process.env.MY_NAME});
        console.log(req.body);
        sendNotification(user.token, `Someone opened your ${website} website`, `With device width of ${deviceWidth}px`);
        res.header("Access-Control-Allow-Origin", "*");
        res.json("sent")
    } catch (e) {
        console.log('e');
        res.json(e)
    }
});
router.get('/get/users', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users)
    } catch (e) {
        console.log(e);
        res.json(e)
    }
});
router.get('/get/bills', async function (req, res) {
    try {
        const bills = await Bill.find();
        res.json(bills.reverse())
    } catch (e) {
        console.log(e);
        res.json(e)
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
                        sum: {$sum: "$money"},
                    }
                },
                {
                    $sort: {sum: 1}
                }
            ]);
        else
            d = await Bill.aggregate([
                {
                    $group: {
                        _id: "$user",
                        sum: {$sum: "$money"},
                    }
                },
                {
                    $sort: {sum: 1}
                }
            ]);
        res.json(d)
    } catch (e) {
        console.log(e);
        res.json(e)
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
                    sum: {$sum: "$money"},
                    count: {$sum: 1}
                }
            },
            {
                $sort: {_id: 1}
            }
        ]);
        res.json(d)
    } catch (e) {
        console.log(e);
        res.json(e)
    }
});
router.post('/add/bill', async function (req, res) {
    try {
        return res.json({access: true});
/*        const {sum, reason, date, user, members} = req.body;
        for (const member of members) {
            await User.updateOne({username: member}, {$inc: {bill: Math.floor(sum / members.length)}})
        }
        const everyone = await User.find({username: {$in: members}});
        for (one of everyone) {
            if (user !== one.username)
                sendNotification(one.token, `${user} ${reason}ga ${sum} so'm ishlatdi. ${members.length} odamga`, `Sanga (${one.username}) ${Math.floor(sum / members.length)} so'm yozildi`)
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
        res.json({access: true});
    */} catch (e) {
        res.status(200).json({message: 'catch error', access: false});
        console.log(e)
    }
});
router.post('/set/token', async function (req, res) {
    const {_id, token} = req.body;
    const user = await User.findOne({_id});
    if (!user) {
        return res.json({access: false})
    } else {
        await User.updateOne({_id}, {token});
        return res.json({access: true})
    }
});
router.post('/login', async function (req, res) {
    try {
        const {username, password} = req.body;
        console.log(username, password);
        const user = await User.findOne({username});
        if (!user) {
            return res.status(200).json({message: 'Bunday foydalanuvchi mavjud emas', access: false, user: {}})
        }
        if (password !== user.password) {
            return res.status(201).json({message: 'Noto\'g\'ri parol', access: false, user: {}})
        }
        return res.status(202).json({message: '', user: user, access: true})
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'login error', access: false})
    }
});
module.exports = router;
