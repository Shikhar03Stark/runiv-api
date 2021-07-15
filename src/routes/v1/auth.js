const router = require('express').Router();
const middleware = require('../../middlewares');
const ctrl = require('../../controllers/auth');

router.post('/signup', middleware.validate_university, ctrl.signup);
router.post('/login', ctrl.login);

router.use(middleware.verify_jwt);
router.put('/update', ctrl.update);
router.delete('/terminate', ctrl.terminate);
router.get('/view', ctrl.view);
module.exports = router;