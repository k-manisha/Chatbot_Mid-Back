const DBOperation = require('./DBOperation');
const jwt = require('jsonwebtoken');

const AUTH_KEY = 'dereq_auth_key';

function generateToken(eid, isAdmin, callback){
    const jData = {};
    jData[DBOperation.KEY_EMPLOYEE_ID] = eid;
    jData[DBOperation.KEY_EMPLOYEE_ISADMIN] = isAdmin;
    jwt.sign(jData, AUTH_KEY, {expiresIn: '30m'}, (err, token) => {
        if (!err)
            callback(token);
        else callback(null);
    });
}

function verifyToken(token, callback){
    jwt.verify(token, AUTH_KEY, (err, res) => {
        if (err)
            callback(null);
        else callback(res);
    });
}

function handleAuthorization(req, res, callback, isAdmin){
    const auth_header = req.headers['authorization'];
    if (auth_header){
        const token = auth_header.split(' ')[1];
        verifyToken(token, (response) => {
            if (response) {
                if (!isAdmin) {
                    callback(response);
                }
                else if (isAdmin && response[DBOperation.KEY_EMPLOYEE_ISADMIN] === true) {
                    callback(response);
                }
                else {
                    res.status(403).send("Operation only for admins"); //Forbidden
                }
            }
            else res.status(401).send("Token timeout"); //Unauthorized
        })
    }
    else res.status(401).send("Invalid token"); //Unauthorized
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
module.exports.handleAuthorization = handleAuthorization;