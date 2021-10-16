// importing packages
const express = require('express');
const router = express.Router();

// importing user schema
var User = require('../models/user');
var Article = require('../models/article');
var Subject = require('../models/subject');

// Get list of subjects and articles combined
router.get('/', async(req, res) => {
    try {
        const allSubjectsList = await Subject.aggregate([
            {
                $project : {
                    name: "$subjectName",
                    type: "Subject",
                    author: "$author.name",
                }
            }
        ]);
        const allArticlesList = await Article.aggregate([
            {
                $project : {
                    name: "$title",
                    type: "Article",
                    author: "$author.name",
                }
            }
        ]);
        // Concatenate two lists and return
        res.json({
            searchList: allSubjectsList.concat(allArticlesList),
        });
    } catch(err) {
        res.json({
            success: false,
            message: 'Error : ' + err,
        });
    }
});

module.exports = router;