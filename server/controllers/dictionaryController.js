// importing packages
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Making API call to free dictionary API
router.get('/:word', async (req, res) => {
    const api_url = "https://api.dictionaryapi.dev/api/v2/entries/en_US/" + req.params.word;
    if(req.params.word == " ")
    {
        res.json({
            success: false,
            message: "Empty word found",
            data: {},
        });
    }

    var wordObj;
    await fetch(api_url).then(res => res.text())
        .then(data => {
            // console.log("Complete data : " + data);
            wordObj = data;
            return data;
        });
    
    // Parsing string object from the API to the JSON object
    var jsonObj = JSON.parse(wordObj)[0];
    console.log(jsonObj);
    // console.log(jsonObj.meanings[0].definitions);

    if(jsonObj)
    {
        res.json({
            success: true,
            data: {
                word: jsonObj.word,
                phonetics: jsonObj.phonetics[0],
                meanings: jsonObj.meanings,
            },
        });
    }
    else 
    {
        res.json({
            success: false,
            message: "Unable to find the meaning of the word - " + req.params.word,
            data: {},
        });
    }
});

module.exports = router;