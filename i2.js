const mongoose = require('mongoose');

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://airfun:airfun@cluster0.hwwjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
        console.log('database connected');
    } catch (e) {
        console.log(e)
    }
};
start();
