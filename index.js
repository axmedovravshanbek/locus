require('dotenv').config();
const authRouter = require('./authRouter');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use('/', authRouter);
const PORT = process.env.PORT || 80;
const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('database connected');
    } catch (e) {
        console.log(e)
    }
};
start();
app.listen(PORT, () => {
    console.log('started on ' + PORT)
});
