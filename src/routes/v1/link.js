const router = require('express').Router();
const middleware = require('../../middlewares');
const ctrl = require('../../controllers/link');

router.use(middleware.verify_jwt);

router.post('/new', ctrl.new_link);

module.exports = router;