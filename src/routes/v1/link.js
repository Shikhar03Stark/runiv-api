const router = require('express').Router();
const middleware = require('../../middlewares');
const ctrl = require('../../controllers/link');

router.use(middleware.verify_jwt);
router.post('/new', ctrl.new_link);
router.get('/all', ctrl.all_links);
router.get('/detail/:slug_id', ctrl.details);
router.get('/metric/:slug_id', ctrl.get_metrics);
router.put('/update/:slug_id', ctrl.update);
router.delete('/remove', ctrl.remove_link);

module.exports = router;