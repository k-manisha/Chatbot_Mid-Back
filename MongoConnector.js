const mongoClient = require('mongodb').MongoClient;
const DBOperation = require('./DBOperation');

class MongoConnector {
    onMongoConnect(url, parentCallback, DBOpCallback){
        mongoClient.connect(url, (err, db) => {
            if (err) {
                if (parentCallback)
                parentCallback(DBOperation.ACTION_DB_OPEN, {"result": DBOperation.RESULT_ERROR, "response": err.toString()});
            }
            else {
                DBOpCallback(db);
            }
        })
    }
}

module.exports.MongoConnector = MongoConnector;