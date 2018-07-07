const express = require('express');
const app = express();
const router = require('./DEREQ_router');

const appPort = 2000;

app.use('/', router);

app.listen(appPort, () => {
    console.log("Listening...");
});