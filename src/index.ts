import express from 'express';
import { router } from './api/routes/router';
import { postgresProxy } from './api/database/proxy/postgres.proxy';
import { port } from './api/config/var'
import bodyParser from 'body-parser';

const app = express();

app.use('/', router);
app.use(bodyParser.json());
app.use(express.json());

const initializeDB = async () => {
    await postgresProxy.sync();
};

initializeDB();

app.listen(port, () => {
    console.log(`Application is running on port: ${port}`);
});