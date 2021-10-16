const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const articleSchema = new Schema({
    title: {type: String},
    shortIntro: {type: String},
    coverImagePath: {type: String},
    tags: {type: Array},
    subjectId: {type: String},
    subject: {type: String},
    content: {type: String},
    readingTime: {type: Number},
    publishedDate: {type: Date},
    likes: {type: Number, default: 0},
    themeColour: {type: String},
    references: {type: Array},
    authorId: {type: String},
    author: {type: Object},
    comments: {type: Array},
});

module.exports = mongoose.model('Articles', articleSchema);