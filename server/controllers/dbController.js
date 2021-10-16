const mongoose = require('mongoose');
const db = "mongodb://localhost:27017/AmazingArticlesDB";

mongoose.connect(db, 
    { useFindAndModify: false },
    err => {
        if(err) {
            console.error('Error : ' + JSON.stringify(err, undefined, 4));
        } else {
            console.log('MongoDB connected successfully!');
        }
    }
);

module.exports = mongoose;