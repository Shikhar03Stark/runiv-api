const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const routes = require('./src/routes');

//Instansiate App
const app = express();
const PORT = process.env.PORT || 3000;

//Apply Middleware
app.use(cors());
app.use(morgan('short'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//Root response
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'You are using Runiv rest APIs'
    });
})

//Apply routes
app.use('/', routes);
//Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({
        ok: false,
        message
    });
    process.env.NODE_ENV === 'development'?console.log(err):null;
});

//Route not found
app.use((req, res, next) => {
    res.status(404).json({
        ok: false,
        message: `Route doesn't exist`,
    });
});

(async () => {
    const db = require('./src/database/init');
    await db.connect();
    if(process.env.NODE_ENV === 'development'){
        await db.sequelize.sync({
            alter: true,
            force: true,
        })
    }
    else{
        await db.sequelize.sync();
    }
})()

app.listen(PORT, () => {
    console.log(`Server running @:${PORT}`);
});

//testing server
module.exports = app;