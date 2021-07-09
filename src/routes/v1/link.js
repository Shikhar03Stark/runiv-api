const router = require('express').Router();
const middleware = require('../../middlewares');
const ctrl = require('../../controllers/link');

router.use(middleware.verify_jwt);
router.post('/new', ctrl.new_link);
router.get('/all', ctrl.all_links);
router.get('/detail/:slug', ctrl.details);
router.get('/metric/:slug', ctrl.get_metrics);
router.put('/update/:slug', ctrl.update);
router.delete('/remove', ctrl.remove_link);

module.exports = router;