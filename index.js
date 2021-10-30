const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./authRouter');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
const PORT = process.env.PORT || 80;
const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://user:annibanni@cluster0.87pgv.mongodb.net/house?retryWrites=true&w=majority')
        console.log('database connected');
    } catch (e) {
        console.log(e)
    }
};
start();

app.get('/', async function (req, res) {
    var x = {ma:'dsc'};
    res.send(x)
});
/*app.get('/news', function (req, res) {
    res.send('news')
});
app.get('/news/:id', function (req, res) {
    res.send('news' + req.params.id)
});
app.post('/add', urlEncodedParser, function (req, res) {
   if(!req.body) return res.sendStatus(400);
   console.log(req.body)
});*/
app.listen(PORT, () => {
    console.log('started')
});