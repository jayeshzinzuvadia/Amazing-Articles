export class Dictionary {
    word: string;
    phonetics: {
        text: string,
        audio: string,
    };
    meanings: Array<{
        partOfSpeech: string,
        definitions: Array<{
            definition: string,
        }>,
    }>;
    message: string;

    constructor(dictObj?: any){
        if(dictObj != null)
        {
            this.word = dictObj.word;
            this.phonetics = dictObj.phonetics;
            this.meanings = dictObj.meanings;
        }
        else 
        {
            // Initialize author object
            this.word = "";
            this.phonetics = {
                text: "",
                audio: "",
            };
            this.meanings = [];
            this.message = "";
        }
    }
}