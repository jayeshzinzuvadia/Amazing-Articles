const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String},
    bio: {type: String},
    dateOfBirth: {type: Date},
    profilePicturePath: {type: String},
    email: {type: String},
    password: {type: String},
    followingList: {type: Array},
    readingList: {type: Array},
    myArticleList: {type: Array},
    mySubjectList: {type: Array},
});

module.exports = mongoose.model('Users', userSchema);