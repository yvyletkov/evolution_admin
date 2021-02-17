const router = require('express').Router();
const newsRoutes = require('./news')



// connecting routes
router.use(newsRoutes);


module.exports.router = router;



