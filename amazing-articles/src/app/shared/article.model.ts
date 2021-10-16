export class Article {
    _id: string;
    title: string;
    shortIntro: string;
    coverImagePath: string;
    tags: Array<string>;
    subjectId: string;
    subject: string;
    content: string;
    readingTime: number;
    publishedDate: Date;
    likes: number;
    themeColour: string;
    references: Array<string>;
    authorId: string;
    author: {
        name: string,
        bio: string,
        profilePicturePath: string,
        email: string,
    };
    comments: Array<{
        userId: string,
        userName: string,
        userProfilePicturePath: string,
        message: string,
        timestamp: Date,
    }>;

    constructor(articleJsonObj?: any){
        if(articleJsonObj != null)
        {
            this._id = articleJsonObj._id;
            this.title = articleJsonObj.title;
            this.shortIntro = articleJsonObj.shortIntro;
            this.coverImagePath = articleJsonObj.coverImagePath;
            this.tags = articleJsonObj.tags;
            this.subjectId = articleJsonObj.subjectId;
            this.subject = articleJsonObj.subject;
            this.content = articleJsonObj.content;
            this.readingTime = articleJsonObj.readingTime;
            this.publishedDate = articleJsonObj.publishedDate;
            this.likes = articleJsonObj.likes;
            this.themeColour = articleJsonObj.themeColour;
            this.references = articleJsonObj.references;
            this.authorId = articleJsonObj.authorId;
            this.author = articleJsonObj.author;
            this.comments = articleJsonObj.comments;
        }
        else 
        {
            // Initialize author object
            this.author = {
                name: "",
                bio: "",
                profilePicturePath: "",
                email: "",
            };
            this.references = [];
            // Initialize comments array
            this.comments = [{
                userId: "",
                userName: "",
                userProfilePicturePath: "",
                message: "",
                timestamp: new Date(),
            }];
        }
    }
}