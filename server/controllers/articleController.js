const express = require('express');
const router = express.Router();

// For checking whether the Id is correct or not
var ObjectId = require('mongoose').Types.ObjectId;  //import to check if id is available in table

// importing verifyToken from authController
const verifyToken = require('../controllers/authController');

// for image upload
const multer = require('multer');
const path = require('path');
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req, file, callbackFunc) {
        callbackFunc(null, './uploads/articles/');
    },
    filename: function(req, file, callbackFunc) {
        console.log("fileName : " + file.originalname);
        callbackFunc(null, file.originalname);
    }
});

const fileFilter = (req, file, callbackFunc) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callbackFunc(null, true);
    } else {
        // reject a file
        callbackFunc(null, false);
    }
};

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter,
});

// importing user schema
var Article = require('../models/article');
var User = require('../models/user');
var Subject = require('../models/subject');

// Routes starts from here...

// get all articles list
router.get('/all', async(req, res) => {
    try{
        const articleList = await Article.find({}, {
            coverImagePath: 1,
            title: 1,
            shortIntro: 1,
            likes: 1,
            readingTime: 1,
            author: 1,
            themeColour: 1,
        });
        res.json(articleList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get any random N articles
router.get('/', async(req, res) => {
    const N = 6;
    try{
        const randomArticleList = await Article.aggregate([{ $sample: { size: N } }]);
        res.json(randomArticleList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get my articles list i.e. articles written by the logged in user
router.get('/myArticleList', verifyToken, async(req, res) => {
    try{
        // const myArticleList = await Article.find({'authorId': req.userId});
        // res.json(myArticleList);
        const user = await User.findById(req.userId);
        let myArticleObjList = [];
        console.log(user.myArticleList);
        for(let i = 0; i < user.myArticleList.length; i++)
        {
            let article = await Article.findById(user.myArticleList[i]);
            console.log("Article title : " + article.title);
            myArticleObjList.push(article);
        }
        res.json(myArticleObjList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get saved articles list i.e. articles liked by the logged in user
router.get('/saved', verifyToken, async(req, res) => {
    try{
        const user = await User.findById(req.userId);
        let savedArticleObjList = [];
        console.log(user.readingList);
        for(let i = 0; i < user.readingList.length; i++)
        {
            const article = await Article.findById(user.readingList[i]);
            console.log("Article title : " + article.title);
            savedArticleObjList.push(article);
        }
        res.json(savedArticleObjList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// create article
async function updateSubjectDocument(subjectObj) {
    let flag = await Subject.findByIdAndUpdate(
        { _id: subjectObj._id}, 
        { $set: subjectObj },
        { new: true },
        (error, updatedSubject) => {
            if(error) {
                console.error(error);
                return false;
            } else {
                console.log("Subject belonging to article updated successfully");
                return true;
            }
        }
    );
    return flag;
}

router.post('/create', verifyToken, upload.single('coverImage'), async(req, res) => {
    // making tags and references empty
    let tagsArray = req.body.tags.split(",");
    let referencesArray = req.body.references.split(",");
    if(tagsArray == "") {
        tagsArray = [];
    }
    if(referencesArray == "") {
        referencesArray = [];
    }

    // create article object
    let articleObj = new Article({
        title: req.body.title,
        shortIntro: req.body.shortIntro,
        coverImagePath: req.body.coverImagePath,
        tags: tagsArray,
        subjectId: req.body.subjectId,
        subject: req.body.subject,
        content: req.body.content,
        readingTime: req.body.readingTime,
        publishedDate: new Date(),
        likes: 0,
        themeColour: req.body.themeColour,
        references: referencesArray,
        authorId: req.userId,
        author: {},
        comments: [],
    });

    // rename article cover image path
    const originalName = req.file.originalname;
    if(originalName != "")
    {
        articleObj.coverImagePath = 
            "uploads/articles/" + articleObj._id + path.extname(originalName).toLowerCase();
        // rename the file name stored in fs
        fs.rename(req.file.path, articleObj.coverImagePath, err => {
            if (err) return res.json({
                success: false,
                message: "Problem while renaming article cover image"
            });
        });
    }
    console.log('Article Input Data : ', articleObj);

    try {
        // Fetching user from it's userId for embedding into articles document
        let userObj = await User.findById(req.userId);
        userObj.myArticleList.push(articleObj._id);
        // For saving author information in article document
        articleObj.author = {
            name: userObj.name,
            bio: userObj.bio,
            profilePicturePath: userObj.profilePicturePath,
            email: userObj.email,
        };
        
        // Saving articleId to User's myArticleList
        await User.findByIdAndUpdate(req.userId, 
            { $set: userObj },
            (error, updatedUser) => {
                if(error) {
                    console.error(error);
                    res.json({
                        success: false,
                        message: "Problem while adding article ID to user document"
                    });
                } else {
                    console.log("ArticleID added to user's article list");
                }
            }
        );
        
        // Saving articleId to it's corresponding Subject document
        let subjectObj = await Subject.findById(articleObj.subjectId);
        // new article id added to the subject document
        subjectObj.articleList.push(articleObj._id);
        await updateSubjectDocument(subjectObj);

        // Saving article to Articles collection
        await articleObj.save((error, newArticle) => {
            if(error) {
                console.error(error);
                res.json({
                    success: false,
                    message: "Problem while saving article data to db"
                });
            } else {
                console.log("Article '" + newArticle.title + "' is created successfully");
                res.json({
                    success: true,
                    message: "Article created successfully"
                });
            }
        });
    } catch(err) {
        res.send("Error : " + err);
    }
});

// read article
router.get('/readArticle/:articleId', async(req, res) => {
    if(!ObjectId.isValid(req.params.articleId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.articleId }`
        });
    }

    await Article.findById(req.params.articleId, (err, articleInfo) => {
        if(!err)
        {
            // console.log("articleInfo : " + articleInfo);
            res.send(articleInfo);
        } else {
            console.log("Error retrieving article : " + JSON.stringify(err, undefined, 4));
            res.json({
                success: false,
                message: "Article not found in the database"
            });
        }
    });
});

// update article
async function updateSubjectCollectionIfSubjectIDChanges(articleId, newSubjectId) {
    // get article object from database
    let articleObj = await Article.findById(articleId);
    let oldSubjectObj = await Subject.findById(articleObj.subjectId);
    let newSubjectObj = await Subject.findById(newSubjectId);
    // Check if id's are same then no subject change happened so return true
    if(oldSubjectObj._id === newSubjectId)
    {
        return true;
    }
    // Add article id to new subject
    newSubjectObj.articleList.push(new ObjectId(articleId));
    // Remove article id from old subject
    deleteElementFromArray(articleId, oldSubjectObj.articleList);
    let f1 = await updateSubjectDocument(newSubjectObj);
    let f2 = await updateSubjectDocument(oldSubjectObj);
    // console.log("f1 : " + f1 + ", f2 : " + f2);
    return f1 && f2;
}

router.put('/update/:articleId', verifyToken, upload.single('coverImage'), async (req, res) => {
    // Check if passed articleId is valid or not
    if(!ObjectId.isValid(req.params.articleId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.articleId }`
        });
    }

    // making tags and references empty
    let tagsArray = req.body.tags.split(",");
    let referencesArray = req.body.references.split(",");
    if(tagsArray == "") {
        tagsArray = [];
    }
    if(referencesArray == "") {
        referencesArray = [];
    }

    let coverImagePath = req.body.coverImagePath;
    // empty cover image path denotes that the cover image is updated by the user
    // else whatever is the previous picture, keep it as it is
    if(coverImagePath === "")
    {
        console.log("Image uploaded");
        const fileName = req.params.articleId + path.extname(req.file.originalname).toLowerCase();
        coverImagePath = "uploads/articles/" + fileName;
        // rename the file name stored in fs
        fs.rename(req.file.path, coverImagePath, err => {
            if (err) {
                console.error(err);
                return err;
            };
        });
    } else {
        console.log("Image not uploaded");
    }

    // Article Schema is not used as it will modify other field values to default
    let updatedArticleInfo = {
        title: req.body.title,
        shortIntro: req.body.shortIntro,
        coverImagePath: coverImagePath,
        tags: tagsArray,
        subjectId: req.body.subjectId,
        subject: req.body.subject,
        content: req.body.content,
        readingTime: req.body.readingTime,
        themeColour: req.body.themeColour,
        references: referencesArray,
    };

    // Check if subject is changed then remove the article Id from previous subject and add it to the new subject
    if(updatedArticleInfo.subjectId != "")
    {
        await updateSubjectCollectionIfSubjectIDChanges(req.params.articleId, req.body.subjectId).then((result) => {
            if(!result) {
                return res.json({
                    success: false, 
                    message: "Failed to update subject changes"
                });
            }
        });
    }

    // update article document
    await Article.findByIdAndUpdate(req.params.articleId, 
        { $set: updatedArticleInfo }, 
        (err, updatedArticle) => {
            if(!err)
            {
                console.log("Update article data : " + updatedArticle);
                res.json({
                    success: true, 
                    message: "Article updated successfully."
                });
            }
            else 
            {
                console.log("Error updating article: " + JSON.stringify(err, undefined, 4));
                res.json({
                    success: false, 
                    message: "Error occurred while updating article information"
                });
            }
        }
    );
});

// delete article
function deleteElementFromArray(element, array) {
    let index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

async function removeArticleIdFromSubjectCollection(articleId)
{
    let articleObj = await Article.findById(articleId);
    let subjectObj = await Subject.findById(articleObj.subjectId);
    // Remove article id from subject document's article list array
    deleteElementFromArray(articleId, subjectObj.articleList);
    // update subject document
    await Subject.findByIdAndUpdate(articleObj.subjectId, 
        { $set: subjectObj },
        (error, updatedSubject) => {
            if(error) {
                console.error(error);
                return false;
            } else {
                console.log("ArticleId removed from subject article list");
                return true;
            }
        }
    );
}

async function removeArticleIdFromLoggedInUserCollection(userId, articleId) {
    let userObj = await User.findById(userId);
    // Remove article id from myArticleList
    deleteElementFromArray(articleId, userObj.myArticleList);
    // Remove article id from readingList
    deleteElementFromArray(articleId, userObj.readingList);
    // Update userObj collection
    await User.findByIdAndUpdate(userId, 
        { $set: userObj },
        (error, updatedUser) => {
            if(error) {
                console.error(error);
                return false;
            } else {
                console.log("ArticleId removed from user's article list");
                return true;
            }
        }
    );
}

async function removeArticleIdFromUsersCollection(articleId) {
    articleId = new ObjectId(articleId);
    await User.updateMany(
        {},
        {
            $pull: {
                readingList: { $in: [articleId] },
                myArticleList: { $in: [articleId] },
            }
        },
        {multi: true},
    );
}

router.delete('/delete/:articleId', verifyToken, async (req, res) => {
    // Check if passed articleId is valid or not
    if(!ObjectId.isValid(req.params.articleId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.articleId }`
        });
    }
    // Delete article Id from Logged In User collection
    // let flag1 = await removeArticleIdFromLoggedInUserCollection(req.userId, req.params.articleId);
    // Delete article Id from other users who may have liked the article
    let flag2 = await removeArticleIdFromUsersCollection(req.params.articleId);
    // Delete article Id from Subjects collection
    let flag3 = await removeArticleIdFromSubjectCollection(req.params.articleId);
    if(flag2 == false || flag3 == false)
    {
        res.json({
            success: false, 
            message: "Error while deleting article id from users or subjects list"
        });
    }

    // Delete article from Articles collection
    await Article.findByIdAndRemove(req.params.articleId, async (err, articleObj) => {
        try{
            if(!err)
            {
                // Removing cover image of article
                await fs.unlink(articleObj.coverImagePath, function (err) {
                    if (err) {
                        console.log("Unlink failed to delete : ", err);
                    } else {
                        console.log("Cover image deleted");
                    }
                });
                console.log("Article deleted successfully : " + articleObj);
                res.json({
                    success: true, 
                    message: "Article deleted successfully."
                });
            }
            else
            {
                console.log("Error deleting article: " + JSON.stringify(err, undefined, 4));
                res.json({
                    success: false, 
                    message: "Failed to delete article"
                });
            }
        }
        catch(err)
        {
            console.log(err);
            res.json({
                success: false, 
                message: "Article Id is invalid"
            });
        }
    });
});

// like/unlike article
router.put('/likeOrUnlike/:articleId', verifyToken, async (req, res) => {
    // Check if passed articleId is valid or not
    if(!ObjectId.isValid(req.params.articleId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.articleId }`
        });
    }
    var userObj = await User.findById(req.userId);
    console.log("User's reading list initially : " + userObj.readingList);
    let index = userObj.readingList.indexOf(req.params.articleId);    
    if(index != -1)
    {
        // Unlike article if article id is present in reading list
        console.log("Inside Unlike article block");
        userObj.readingList.splice(index, 1);
    }
    else
    {
        console.log("Inside Like article block");
        // Like article if article id is not present in reading list
        userObj.readingList.push(new ObjectId(req.params.articleId));
    }
    await User.findByIdAndUpdate(
        { _id : req.userId },
        { $set: { readingList: userObj.readingList, } },
        (err, newUserObj) => {
            if(err) {
                console.log("Error : " + JSON.stringify(err, undefined, 4));
                return res.json({
                    success: false, 
                    message: "Error occurred when article id is added/removed to/from user's reading list"
                });
            }
            else 
            {
                console.log("User's updated reading list : " + newUserObj.readingList);
            }
        }
    );
    await Article.findByIdAndUpdate(
        { _id : req.params.articleId },
        { $set: {likes: req.body.likes}},
        { new: true },
        (err, newArticleObj) => {
            if(err) {
                console.log("Error : " + JSON.stringify(err, undefined, 4));
                return res.json({
                    success: false,
                    message: "Error occurred when article is liked/unliked by the user"
                });
            }
            else 
            {
                console.log("Article like count : " + newArticleObj.likes);
                return res.json({
                    success: true, 
                    message: "Article like count increased/decreased by 1",
                });
            }
        }
    );
});

// comment article
router.put('/addComment/:articleId', verifyToken, async (req, res) => {
    try{
        // Check if passed articleId is valid or not
        if(!ObjectId.isValid(req.params.articleId))
        {
            return res.json({
                success: false,
                message: `No record with given id : ${req.params.articleId} exists`
            });
        }
        var userObj = await User.findById(req.userId);
        // Try to find the better approach
        var articleObj = await Article.findById(req.params.articleId);
        let commentList = articleObj.comments;
        let comment = {
            userId: req.userId,
            userName: userObj.name,
            userProfilePicturePath: userObj.profilePicturePath,
            message: req.body.message,
            timestamp: new Date(),
        }
        commentList.push(comment);
        console.log(commentList);
        await Article.findByIdAndUpdate(
            { _id: req.params.articleId}, 
            { $set: {comments: commentList}}, 
            { new: true },
            (err, newArticleObj) => {
                if(err) {
                    return res.json({
                        success: false,
                        message: "Error while adding comment to article",
                    });
                } else {
                    console.log('Comment added successfully to the article ' + newArticleObj);
                    // return res.send(newArticleObj);
                    return res.json({
                        success: true,
                        message: "Comment added successfully to article",
                        newCommentObj: comment,
                    });
                }
            });
    } catch(err) {
        console.log("Error : " + err);
    }
});

module.exports = router;