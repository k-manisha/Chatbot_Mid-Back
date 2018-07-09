const express = require('express');
const router = express.Router();
const DBOperation = require('./DBOperation');
const authenticator = require('./Authenticator');
const bcryptjs = require('bcryptjs');

const appUrl = "localhost";
const DBPort = 27017;
const DBName = "master_db";

const DBOpObj = new DBOperation.DBOperationClass(DBPort, appUrl, DBName);

router.use(express.json());

const genericDBoperatinHandler = (request, response, res) => {
    if (response.result === DBOperation.RESULT_ERROR)
        res.status(500); //Internal error
    else if (response.result === DBOperation.RESULT_NO_SUCH_DATA)
        res.status(404); //Not found
    else if (response.result === DBOperation.RESULT_BAD_DATA)
        res.status(400); //Bad request
    else if (response.result === DBOperation.RESULT_DUPLICATE_ID)
        res.status(409); //Conflict
    res.send({"request" : request, "result" : response.result, "message" : response.response})
};

router.post('/query/device/', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.queryDB(DBOperation.COLLECTION_NAME_DEVICE, req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, true, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    });
});

router.post('/add/device', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.addDevice(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/update/device', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.updateDevice(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/delete/device', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.deleteDevice(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/query/unit/', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.queryDB(DBOperation.COLLECTION_NAME_UNIT, req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, true, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    })
});

router.post('/add/unit', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.addUnit(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});


router.post('/update/unit', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.updateUnit(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/delete/unit', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.deleteUnit(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/query/employee/', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.queryDB(DBOperation.COLLECTION_NAME_EMPLOYEE, req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, true, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    }, true);
});

router.post('/add/employee', (req, res) => {
    DBOpObj.addEmployee(req.body, (request, response) => {
        genericDBoperatinHandler(request, response, res);
    });
});


router.post('/update/employee', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.updateEmployee(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    });
});

router.post('/delete/employee', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.deleteEmployee(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    });
});

router.post('/unit/issue', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.issueUnit(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    });
});

router.post('/unit/submit', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.submitUnit(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID]);
    });
});

router.post('/log/get', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.logger.getLog(req.body, (request, response) => {
            genericDBoperatinHandler(request, response, res);
        })
    }, true);
});

router.post('/log/clear', (req, res) => {
    authenticator.handleAuthorization(req, res, (tokenData) => {
        DBOpObj.logger.clearLog((request, response) => {
            genericDBoperatinHandler(request, response, res);
        }, tokenData[DBOperation.KEY_EMPLOYEE_ID])
    }, true);
});

router.post('/login', (req, res) => {

    let eid = req.body[DBOperation.KEY_EMPLOYEE_ID];
    let passwd = req.body[DBOperation.KEY_EMPLOYEE_PASSWD];
    if (!passwd) passwd = "";

    let query = {};
    query[DBOperation.KEY_EMPLOYEE_ID] = eid;

    DBOpObj.queryDB(DBOperation.COLLECTION_NAME_EMPLOYEE, query, (request, response) => {

        if (response.result === DBOperation.RESULT_OK){

            if (response.response[0][DBOperation.KEY_EMPLOYEE_ISACTIVE]) {
                bcryptjs.compare(passwd, response.response[0][DBOperation.KEY_EMPLOYEE_PASSWD], (err, isMatch) => {

                    if (isMatch) {

                        let isAdmin = response.response[0][DBOperation.KEY_EMPLOYEE_ISADMIN];

                        authenticator.generateToken(eid, isAdmin, (token) => {

                            let tokenInfo = {};
                            tokenInfo[DBOperation.KEY_EMPLOYEE_ID] = eid;
                            tokenInfo[DBOperation.KEY_EMPLOYEE_ISADMIN] = isAdmin;
                            tokenInfo[DBOperation.KEY_EMPLOYEE_NAME] = response.response[0][DBOperation.KEY_EMPLOYEE_NAME];
                            tokenInfo["token"] = token;

                            res.json(tokenInfo);
                        })

                    }
                    else {
                        res.status(401).send("Wrong password");
                    }
                });
            }
            else {
                res.status(401).send("Inactive account");
            }

        }
        else if (response.result === DBOperation.RESULT_ERROR) {
            res.status(500).send("Login token generation error");
        }
        else {
            res.status(404).send("Account not found");
        }
    });
});

module.exports = router;