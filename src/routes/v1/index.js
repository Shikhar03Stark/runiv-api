const router = require('express').Router();
const auth = require('./auth');
const link = require('./link');
//Combine all routes
router.use('/auth', auth);
router.use('/link', link);
//export route
module.exports = router;