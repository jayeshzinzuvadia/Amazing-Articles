// Importing packages
const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Importing controllers
const { mongoose } = require('./controllers/dbController');
var userController = require('./controllers/userController');
var articleController = require('./controllers/articleController');
var subjectController = require('./controllers/subjectController');
var dictionaryController = require('./controllers/dictionaryController');
var searchController = require('./controllers/searchController');

// Define constants
const PORT = 3000;

const app = express();  // Work with express package
// const httpServer = http.createServer(app);

app.use(cors());
// Making uploads folder publicly available
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use('/user', userController);
app.use('/article', articleController);
app.use('/subject', subjectController);
app.use('/dictionary', dictionaryController);
app.use('/search', searchController);

// app.get('/', function(req, res) {
//     res.send('Hello from server');
// });

// For image upload but i don't think that w/o this below line it is not causing any problem
// app.get('/', express.static(path.join(__dirname, "../amazing-articles/src/app/register/")));

// To start the express server
app.listen(PORT, () => console.log('Server running on localhost:' + PORT));

// httpServer.listen(PORT, () => {
//     console.log('Server is listening on port ${PORT}');
// });