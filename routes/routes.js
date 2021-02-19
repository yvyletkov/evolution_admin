const router = require('express').Router();
const newsRoutes = require('./news-routes')
const eventsRoutes = require('./events-routes')

router.use(newsRoutes);
router.use(eventsRoutes);

router.get('/', (req, res) => {
    res.redirect('/evo/news')
})

module.exports.router = router;



