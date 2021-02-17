const router = require('express').Router();
const newsRoutes = require('./news-routes')
const eventsRoutes = require('./events-routes')

router.use(newsRoutes);
router.use(eventsRoutes);

module.exports.router = router;



