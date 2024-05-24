const Router = require("express");
const router = new Router();
const userController = require('../controllers/userController');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/getId',userController.getUserId);
router.get('/getName',userController.getName);
router.get('/getNameById:id', userController.getNameById);
router.post('/findUserByName', userController.findByName);


module.exports = router;