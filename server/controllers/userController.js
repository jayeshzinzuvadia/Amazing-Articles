// importing packages
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// importing verifyToken from authController
const verifyToken = require('../controllers/authController');

// for image upload, when image controller was there
// const path = require('path');
// const upload = require('../controllers/imageController');
// const fs = require("fs");

// for image upload
const multer = require('multer');
const path = require('path');
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req, file, callbackFunc) {
        callbackFunc(null, './uploads/profiles/');
    },
    filename: function(req, file, callbackFunc) {
        let fileName = file.originalname;
        if(req.userId) {
            // console.log("Inside userId block");
            fileName = req.userId + path.extname(file.originalname).toLowerCase();
        }
        // console.log("profile pic path : " + req.body.profilePicturePath);
        // console.log("Original filename : " + file.originalname);
        // console.log("fileName : " + fileName);
        callbackFunc(null, fileName);
        // callbackFunc(null, file.originalname);
        // callbackFunc(null, Date.now() + file.originalname);
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
    // limits of file size can be set here
    // limits: {
    //     fileSize: 1024 * 1024 * 5
    // },
});

// importing user schema
var User = require('../models/user');
var Article = require('../models/article');
var Subject = require('../models/subject');

// Routes starts from here...

// testing get request
router.get('/', (req, res) => {
    res.send('From User Controller route');
});

// register user
router.post('/register', upload.single('profilePicture'), async (req, res) => {
    let userData = req.body;
    // Check for existing user with same email
    const userExists = await User.findOne({'email' : userData.email});
    if(userExists){
        res.json({
            success: false,
            message: "Email is already in use"
        });
        return;
    }

    const user = new User(userData);
    console.log("User input data - " + user); 

    // file handling
    let profilePicturePath = req.body.profilePicturePath;
    if(profilePicturePath != "default.png")
    {
        // User has uploaded his profile picture
        // console.log(req.file.originalname);
        const originalName = req.file.originalname;
        const userIdFileNameWithExt = user._id + path.extname(originalName).toLowerCase();
        profilePicturePath = "uploads/profiles/" + userIdFileNameWithExt;
        // rename the file name stored in fs
        fs.rename(req.file.path, profilePicturePath, err => {
            if (err) {
                console.error(err);
                return err;
            };
        });
    } else {
        // User has not uploaded any profile picture
        profilePicturePath = "uploads/profiles/default.png";
    }
    
    console.log(profilePicturePath);
    
    try {
        user.profilePicturePath = profilePicturePath;
        await user.save((error, registeredUser) => {
            if(error) {
                console.error(error);
                res.status(400).send("Problem while saving user data to db");
            } else {
                let payload = {subject: registeredUser._id};
                // Generates a new token
                let token = jwt.sign(payload, 'mySecretKey');
                console.log("User " + userData.email + " is registered");
                res.status(200).send({token});
            }
        });
    } catch(err) {
        console.error("Error occurred while registering user : " + err);
        res.status(400).send("Problem while saving user data to db");
    }
});

// login user
router.post('/login', async (req, res) => {
    let userData = req.body;
    try {
        await User.findOne({email: userData.email, password: userData.password}, (err, usr) => {
            if(err) {
                console.error("Error in login - " + err);
                res.json({
                    success: false,
                    message: "Incorrect email or password. Try Again."
                });
                return;
            } else {
                if(!usr){
                    console.error("Invalid Email or Password");
                    res.json({
                        success: false,
                        message: "Incorrect email or password. Try Again."
                    });
                    return;
                } else {
                    let payload = {subject: usr._id};
                    // Generates a new token
                    let token = jwt.sign(payload, 'mySecretKey');
                    console.log("User " + userData.email + " is logged in successfully");
                    res.status(200).send({token});
                }
            }
        });
    } catch(err) {
        console.error("Error in login : " + err);
    }
});

// view profile
router.get('/profile', verifyToken, async (req, res) => {
    await User.findById(req.userId, (err, userInfo) => {
        if(!err)
        {
            console.log("User info : " + userInfo);
            res.send(userInfo);
        } else {
            console.log("Error retrieving user : " + JSON.stringify(err, undefined, 4));
            res.json({
                success: false,
                message: "User not found in the database"
            });
        }
    });
});

// update profile
async function updateArticleCollection(updatedUserData)
{
    // Update userProfilePicturePath in article comments
    await Article.updateMany(
        { 
            // "comments.userId": {$eq: updatedUserData.userId},
        },
        {
            $set: {
                "comments.$[element].userProfilePicturePath": updatedUserData.profilePicturePath,
            }
        },
        {
            arrayFilters: [
                {"element.userId": {$eq: updatedUserData.userId}},
            ],
            multi: true, // update at all places
        },
    );

    // Update author object in article collection
    await Article.updateMany(
        { authorId: updatedUserData.userId},
        {
            $set: {
                // Update only profilePicturePath and bio
                "author.profilePicturePath" : updatedUserData.profilePicturePath,
                "author.bio": updatedUserData.bio,
            }
        },
        {multi: true},
    );
}

async function updateSubjectCollection(updatedUserData)
{
    // Update author object in subject collection
    await Subject.updateMany(
        { authorId: updatedUserData.userId},
        {
            $set: {
                // Update only profilePicturePath and bio
                "author.profilePicturePath" : updatedUserData.profilePicturePath,
                "author.bio": updatedUserData.bio,
            }
        },
        {multi: true},
    );
}

router.put('/update', verifyToken, upload.single('updateProfilePicture'), async (req, res) => {
    let profilePicturePath = req.body.profilePicturePath;
    // console.log("testing path : " + req.body.profilePicturePath);
    // empty profile picture path denotes that the profile picture is updated by the user
    // else whatever is the previous picture, keep it as it is
    if(req.body.profilePicturePath === "")
    {
        const fileName = req.userId + path.extname(req.file.originalname).toLowerCase();
        profilePicturePath = "uploads/profiles/" + fileName;
        // rename the file name stored in file system
        fs.rename(req.file.path, profilePicturePath, err => {
            if (err) return err;
        });
    }

    // Update user data
    var updatedUserInfo = {
        userId: req.userId,
        profilePicturePath: profilePicturePath,
        bio: req.body.bio,
    };
    
    // Update article collection
    await updateArticleCollection(updatedUserInfo);
    
    // Update subject collection
    await updateSubjectCollection(updatedUserInfo);

    // Update user collection
    await User.findByIdAndUpdate(req.userId, 
        { $set: updatedUserInfo }, 
        (err, updatedUser) => {
            if(!err)
            {
                console.log("Update user data : " + updatedUser);
                res.json({
                    success: true, 
                    message: "Profile updated successfully."
                });
            }
            else 
            {
                console.log("Error updating user: " + JSON.stringify(err, undefined, 4));
                res.json({
                    success: false, 
                    message: "Error occurred while updating user information"
                });
            }
        }
    );
});

// delete user account
async function deleteUserRefsFromArticleCollection(userId, userReadingList, authorArticleIdList)
{
    // Delete all the comments written by user having userId in article comments
    await Article.updateMany(
        {},
        {
            $pull: {
                comments: {userId: userId},
            }
        },
        {multi: true}, // update at all places
    );

    // Delete articleId element from other user's readingList
    await User.updateMany(
        {},
        {
            $pull: {
                readingList: { $in: authorArticleIdList },
                myArticleList: { $in: authorArticleIdList },
            }
        },
        {multi: true},
    );

    // Decrease the like count of all the articles liked by the user having userId 
    await Article.updateMany(
        {
            _id: {$in: userReadingList}, 
        },
        {
            $inc: {
                likes: -1,
            }
        },
        {multi: true},
    );
    
    // Delete all the cover images stored inside the uploads folder
    for(var i = 0; i < authorArticleIdList.length; i++)
    {
        var articleObj = await Article.findById(authorArticleIdList[i]);
        try {
            console.log("Article obj : " + articleObj);
            // Removing cover image of article
            await fs.unlink(articleObj.coverImagePath, function (err) {
                if (err) {
                    console.log("Unlink failed to delete : ", err);
                } else {
                    console.log("Cover image deleted");
                }
            });
            console.log("Article cover image deleted successfully : ");
        }
        catch(err)
        {
            console.error(err);
        }
    }

    // Delete all articles written by the user having userId in article collection
    await Article.deleteMany(
        {authorId: userId},
        {multi: true},
    );
}

async function deleteUserRefsFromSubjectCollection(userId, userFollowingList, authorSubjectIdList)
{
    // Delete articleId element from other user's readingList
    await User.updateMany(
        {},
        {
            $pull: {
                followingList: { $in: authorSubjectIdList },
                mySubjectList: { $in: authorSubjectIdList },
            }
        },
        {multi: true},
    );

    // Decrease the followers count of all the subjects followed by the user having userId 
    await Subject.updateMany(
        {
            _id: {$in: userFollowingList},
        },
        {
            $inc: {
                followers: -1,
            }
        },
        {multi: true},
    );

    // Delete all the cover images stored inside the uploads folder
    for(var i = 0; i < authorSubjectIdList.length; i++)
    {
        var subjectObj = await Subject.findById(authorSubjectIdList[i]);
        try {
            console.log("subjectObj : " + subjectObj);
            // Removing cover image of subject
            await fs.unlink(subjectObj.coverImagePath, function (err) {
                if (err) {
                    console.log("Unlink failed to delete : ", err);
                } else {
                    console.log("Cover image deleted");
                }
            });
            console.log("subject cover image deleted successfully");
        }
        catch(err)
        {
            console.error(err);
        }
    }

    // Delete all subjects written by the user having userId in subject collection
    await Subject.deleteMany(
        {authorId: userId},
        {multi: true},
    );
}

router.delete('/delete', verifyToken, async (req, res) => {
    // Fetch user data
    var userObj = await User.findById(req.userId);
    // Delete user data from Article collection
    await deleteUserRefsFromArticleCollection(req.userId, userObj.readingList, userObj.myArticleList);
    // Delete user data from Subject collection
    await deleteUserRefsFromSubjectCollection(req.userId, userObj.followingList, userObj.mySubjectList);
    // Delete user data from User collection
    await User.findByIdAndRemove(req.userId, async (err, user) => {
        if(!err)
        {
            // If user's profile picture is default, then don't delete it from file system
            if(user.profilePicturePath != "uploads/profiles/default.png")
            {
                await fs.unlink(user.profilePicturePath, function (err) {
                    if (err) {
                        console.log("Unlink failed to delete : ", err);
                    } else {
                        console.log("Profile image deleted");
                    }
                });
            }            
            console.log("User deleted successfully : " + user);            
            res.send(user);
        }
        else
        {
            console.log("Error deleting user: " + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;