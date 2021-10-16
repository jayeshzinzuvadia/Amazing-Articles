export class Subject {
    _id: string;
    subjectName: string;
    description: string;
    coverImagePath: string;
    followers: number;
    themeColour: string;
    userDefined: boolean;
    authorId: string;
    author: {
        name: string,
        bio: string,
        profilePicturePath: string,
        email: string,
    };
    articleObjList: Array<{
        coverImagePath: string,
        title: string,
        likes: string,
        readingTime: string,
    }>;

    constructor(jsonObj?: any){
        if(jsonObj != null)
        {
            // For subject
            this._id = jsonObj.subjectInfo._id;
            this.coverImagePath = jsonObj.subjectInfo.coverImagePath;
            this.subjectName = jsonObj.subjectInfo.subjectName;
            this.description = jsonObj.subjectInfo.description;
            this.followers = jsonObj.subjectInfo.followers;
            this.themeColour = jsonObj.subjectInfo.themeColour;
            this.userDefined = jsonObj.subjectInfo.userDefined;
            this.authorId = jsonObj.subjectInfo.authorId;
            this.author = jsonObj.subjectInfo.author;
            // Article object list
            this.articleObjList = jsonObj.articleObjList;
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
            // Initialize comments array
            this.articleObjList = [{
                coverImagePath: "",
                title: "",
                likes: "",
                readingTime: "",
            }];
        }
    }
}