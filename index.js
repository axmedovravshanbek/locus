const authRouter = require('./authRouter');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRouter);
const PORT = process.env.PORT || 80;
const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://user:annibanni@cluster0.87pgv.mongodb.net/house?retryWrites=true&w=majority');
        console.log('database connected');
    } catch (e) {
        console.log(e)
    }
};
start();

app.listen(PORT, () => {
    console.log('started on ' + PORT)
});