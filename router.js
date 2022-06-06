const Router = require('express');
const router = new Router();
const {User, Bill} = require('./models');
const axios = require('axios');

const sendNotification = (user, title = '', body = '') => {
    axios.post('https://fcm.googleapis.com/fcm/send',
        {
            to: user.token,
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
    )
        .then(() => console.log('ketti'))
        .catch(e => console.log('ketmadi', e));
    axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
            chat_id: user.tgId,
            text: `${title} ${body}`
        }
    )
        .then(() => console.log('botga ketti'))
        .catch(e => console.log('botga ketmadi', e));
};

router.get('/ali', async function (req, res) {
    try {
        const user = await User.findOne({username: 'Ali'});
        sendNotification(user, `Someone opened your website`, `With device width of px`);
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
        sendNotification(user, `Someone opened your ${website} website`, `With device width of ${deviceWidth}px`);
        res.header("Access-Control-Allow-Origin", "*");
        res.json("sent")
    } catch (e) {
        console.log('e');
        res.json(e)
    }
});
router.get('/get/users', async function (req, res) {
    try {
        const users = await User.find({}, {tgId:0});
        console.log(users[0])
        // res.json(users)
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
        const {sum, reason, date, user, members} = req.body;
        if (!/^0$|^-?[1-9]\d*(\.\d+)?$/.test(sum)) {
            return res.json({message: "To'g'ri son kitiring", access: false})
        }
        await User.bulkWrite([
            {
                updateMany: {
                    filter: {username: {$in: members}},
                    update: {$inc: {bill: Math.floor(parseInt(sum) / members.length)}}
                }
            },
            {
                updateOne: {
                    filter: {username: user},
                    update: {$inc: {bill: -sum}}
                }
            },
        ]);
        const everyone = await User.find({username: {$in: members}});
        for (one of everyone) {
            if (user !== one.username)
                sendNotification(one, `${user} ${reason}ga ${sum} so'm ishlatdi. ${members.length} odamga`, `Sanga (${one.username}) ${Math.floor(sum / members.length)} so'm yozildi`)
        }
        const bill = Bill({
            user,
            money: sum,
            date: new Date(date),
            members,
            reason
        });
        await bill.save();
        res.json({access: true})
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'error', access: false})
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
