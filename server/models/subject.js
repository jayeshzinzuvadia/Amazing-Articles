const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const subjectSchema = new Schema({
    subjectName: {type: String},
    description: {type: String},
    coverImagePath: {type: String},
    themeColour: {type: String},
    userDefined: {type: Boolean},
    authorId: {type: String},
    author: {type: Object},
    articleList: {type: Array},
    followers: {type: Number, default: 0},
});

module.exports = mongoose.model('Subjects', subjectSchema);