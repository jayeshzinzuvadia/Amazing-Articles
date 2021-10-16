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
        callbackFunc(null, './uploads/subjects/');
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
var Subject = require('../models/subject');
var User = require('../models/user');
var Article = require('../models/article');

// Routes starts from here...

// get all subject list
router.get('/all', async(req, res) => {
    try{
        const allSubjectList = await Subject.find({}, {
            coverImagePath: 1,
            subjectName: 1,
            themeColour: 1,
            followers: 1,
        });
        res.json(allSubjectList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get my subject list i.e. subjects created by the logged in user
router.get('/mySubjectList', verifyToken, async(req, res) => {
    try {
        const mySubjectList = await Subject.find({authorId: req.userId, userDefined: true}, {
            coverImagePath: 1,
            subjectName: 1,
            themeColour: 1,
            followers: 1,
        });
        res.json(mySubjectList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get subject following list i.e. subjects followed by the logged in user 
router.get('/mySubjectFollowingList', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.userId);
        console.log(user.followingList);
        let mySubjectFollowingList = [];
        for(let i = 0; i < user.followingList.length; i++)
        {
            const subject = await Subject.findById(user.followingList[i]);
            console.log("Subject title : " + subject.subjectName);
            mySubjectFollowingList.push(subject);
        }
        res.json(mySubjectFollowingList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get subject list containing subject name and id to add in article
router.get('/subjectListForArticle', verifyToken, async(req, res) => {
    try{
        // User's own subjects or built-in subjects should be displayed
        let subjectList = await Subject.find(
            {
                $or: [  
                    {userDefined: false},
                    {userDefined: true, authorId: req.userId}
                ],
            },
            {
                subjectName : 1,
            }
        );
        res.send(subjectList);
    } catch(err) {
        res.send('Error : ' + err);
    }
});

// get subject info
router.get('/readSubject/:subjectId', async(req, res) => {
    if(!ObjectId.isValid(req.params.subjectId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.subjectId }`
        });
    }
    
    // Get subject document
    const subjectObj = await Subject.findById(req.params.subjectId);
    // Obtain list of articles belonging to the subject
    const articleListObj = await Article.find(
        {subjectId: req.params.subjectId},
        {
            coverImagePath: 1,
            title: 1,
            likes: 1,
            readingTime: 1,
        },
    );
    // Combine two objects and return
    res.json({
        subjectInfo: subjectObj,
        articleObjList: articleListObj,
    });
});

router.get('/readSubjectOnly/:subjectId', async(req, res) => {
    if(!ObjectId.isValid(req.params.subjectId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.subjectId }`
        });
    }    
    // Get subject document
    const subjectObj = await Subject.findById(req.params.subjectId);
    // Combine two objects and return
    res.json({
        subjectInfo: subjectObj,
    });
});

// create a subject
router.post('/create', verifyToken, upload.single('coverImage'), async(req, res) => {
    // create Subject object
    const subjectObj = new Subject({
        subjectName: req.body.subjectName,
        description: req.body.description,
        coverImagePath: req.body.coverImagePath,
        themeColour: req.body.themeColour,
        userDefined: req.body.userDefined == "true" ? true : false,
        author: {},
    });

    // rename Subject cover image path
    const originalName = req.file.originalname;
    if(originalName != "")
    {
        subjectObj.coverImagePath = 
            "uploads/subjects/" + subjectObj._id + path.extname(originalName).toLowerCase();
        // rename the file name stored in fs
        fs.rename(req.file.path, subjectObj.coverImagePath, err => {
            if (err) return res.json({
                success: false,
                message: "Problem while renaming subject cover image"
            });
        });
    }
    console.log('Subject input data : ', subjectObj);

    try {
        if(subjectObj.userDefined)
        {
            const userObj = await User.findById(req.userId);
            subjectObj.authorId = req.userId;
            subjectObj.author = {
                name: userObj.name,
                bio: userObj.bio,
                profilePicturePath: userObj.profilePicturePath,
                email: userObj.email,
            };
            userObj.mySubjectList.push(subjectObj._id);
            // Saving subjectId to User's mySubjectList
            await User.findByIdAndUpdate(req.userId, 
                { $set: userObj },
                (error, updatedUser) => {
                    if(error) {
                        console.error(error);
                        res.json({
                            success: false,
                            message: "Problem while adding subject ID to user document"
                        });
                    } else {
                        console.log("SubjectId added to user's subject list");
                    }
                }
            );
        }
        await subjectObj.save((error, newSubject) => {
            if(error) {
                console.error(error);
                res.json({
                    success: false,
                    message: "Problem while saving Subject data to db"
                });
            } else {
                console.log("Subject '" + newSubject.subjectName + "' is created successfully");
                res.json({
                    success: true,
                    message: "Subject created successfully"
                });
            }
        });
    } catch(err) {
        res.send("Error : " + err);
    }
});

// update subject
async function updateSubjectNameInArticleCollection(subjectId, newSubjectName) {
    await Article.updateMany(
        { subjectId: subjectId },
        {
            $set: {
                subject: newSubjectName,
            }
        },
        {multi: true},
    );
}

router.put('/update/:subjectId', verifyToken, upload.single('coverImage'), async (req, res) => {
    // Check if passed subjectId is valid or not
    if(!ObjectId.isValid(req.params.subjectId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.subjectId }`,
        });
    }

    // empty cover image path denotes that the cover image is updated by the user
    // else whatever is the previous picture, keep it as it is
    let coverImagePath = req.body.coverImagePath;
    if(coverImagePath === "")
    {
        console.log("Image uploaded");
        const fileName = req.params.subjectId + path.extname(req.file.originalname).toLowerCase();
        coverImagePath = "uploads/subjects/" + fileName;
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

    // Subject Schema is not used as it will modify other field values to default
    let updatedSubjectInfo = {
        coverImagePath: coverImagePath,
        subjectName: req.body.subjectName,
        description: req.body.description,
        themeColour: req.body.themeColour,
    };

    // update subject document
    await Subject.findByIdAndUpdate(req.params.subjectId,
        { $set: updatedSubjectInfo },
        async (err, updatedSubject) => {
            if(!err)
            {
                // this updatedSubject object is the old value of the document and doesn't contains the new updated value
                // if subject name updated, then update it in all the article documents belonging to this subject
                if(updatedSubject.subjectName != req.body.subjectName)
                {
                    await updateSubjectNameInArticleCollection(req.params.subjectId, req.body.subjectName);
                }
                console.log("Update subject data : " + updatedSubject);
                res.json({
                    success: true, 
                    message: "Subject updated successfully."
                });
            }
            else 
            {
                console.log("Error updating subject: " + JSON.stringify(err, undefined, 4));
                res.json({
                    success: false, 
                    message: "Error occurred while updating subject information"
                });
            }
        }
    );
});

// delete subject
async function removeSubjectIdFromUsersCollection(subjectId) {
    subjectId = new ObjectId(subjectId);
    await User.updateMany(
        {},
        {
            $pull: {
                followingList: { $in: [subjectId] },
                mySubjectList: { $in: [subjectId] },
            }
        },
        {multi: true},
    );
}

async function removeSubjectIdAndNameFromArticleCollection(subjectId) {
    await Article.updateMany(
        { subjectId: subjectId },
        {
            $set: {
                subject: "No Subject",
                subjectId: "616aad5098ba2d2ea4fd0ed0",
            }
        },
        {multi: true},
    );
}

router.delete('/delete/:subjectId', verifyToken, async (req, res) => {
    // Check if passed subjectId is valid or not
    if(!ObjectId.isValid(req.params.subjectId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.subjectId }`
        });
    }

    // remove the subject id from users' [mySubjectList or followingList]
    await removeSubjectIdFromUsersCollection(req.params.subjectId);

    // remove subjectName and subjectId from all the articles belonging to this subject
    await removeSubjectIdAndNameFromArticleCollection(req.params.subjectId);

    // now delete the subject document
    await Subject.findByIdAndRemove(req.params.subjectId, async (err, subjectObj) => {
        try{
            console.log("Subject obj : " + subjectObj);
            if(!err)
            {
                // Removing cover image of article
                await fs.unlink(subjectObj.coverImagePath, function (err) {
                    if (err) {
                        console.log("Unlink failed to delete : ", err);
                    } else {
                        console.log("Cover image deleted");
                    }
                });
                console.log("Subject deleted successfully : " + subjectObj);

                res.json({
                    success: true, 
                    message: "Subject deleted successfully."
                });
            }
            else
            {
                console.log("Error deleting subject: " + JSON.stringify(err, undefined, 4));
                
                res.json({
                    success: false, 
                    message: "Failed to delete subject"
                });
            }
        }
        catch(err)
        {
            console.log(err);

            res.json({
                success: false, 
                message: "Subject Id is invalid"
            });
        }
    });
});

// follow/unfollow subject
router.put('/followOrUnfollow/:subjectId', verifyToken, async (req, res) => {
    // Check if passed subjectId is valid or not
    if(!ObjectId.isValid(req.params.subjectId))
    {
        return res.json({
            success: false,
            message: `No record with given id: ${ req.params.subjectId }`
        });
    }
    var userObj = await User.findById(req.userId);

    let index = userObj.followingList.indexOf(req.params.subjectId);
    if(index != -1)
    {
        // Unfollow subject if subject id is present in following list
        console.log("Unfollow subject");
        userObj.followingList.splice(index, 1);
    }
    else
    {
        console.log("Follow subject");
        // Follow subject if subject id is NOT present in following list
        userObj.followingList.push(new ObjectId(req.params.subjectId));
    }

    await User.findByIdAndUpdate(
        { _id : req.userId },
        { $set: { followingList: userObj.followingList, } },
        (err, newUserObj) => {
            if(err) {
                console.log("Error : " + JSON.stringify(err, undefined, 4));
                return res.json({
                    success: false, 
                    message: "Error occurred when subject id is added/removed to/from user's following list"
                });
            }
            else 
            {
                console.log("User's updated following list : " + newUserObj.followingList);
            }
        }
    );
    await Subject.findByIdAndUpdate(
        { _id : req.params.subjectId },
        { $set: {followers: req.body.followers}},
        { new: true },
        (err, newSubjectObj) => {
            if(err) 
            {
                console.log("Error : " + JSON.stringify(err, undefined, 4));
                return res.json({
                    success: false,
                    message: "Error occurred when subject is followed/unfollowed by the user"
                });
            }
            else
            {
                console.log("Subject followers count : " + newSubjectObj.followers);
                return res.json({
                    success: true, 
                    message: "Subject followers count increased/decreased by 1",
                });
            }
        }
    );
});

// For discover subject page
// 1. category wise subject list
// 2. search functionality

module.exports = router;