// import jwt token
const jwt = require('jsonwebtoken');

// verify token method for a logged in user
function verifyToken(req, res, next) {
    // console.log(req.headers);
    if(!req.headers.authorization) {
        return res.json({
            success: false,
            message: "Unauthorized request from headers"
        });
    }
    let token = req.headers.authorization.split(' ')[1];
    if(token === 'null') {
        return res.json({
            success: false,
            message: "Unauthorized request from null token"
        });
    }
    let payload = jwt.verify(token, 'mySecretKey');
    if(!payload) {
        return res.json({
            success: false,
            message: "Unauthorized request from jwt.verify"
        });
    }
    req.userId = payload.subject;
    next();
}

module.exports = verifyToken;