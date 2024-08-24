const { Router } = require("express");
const appController = require("../controllers/3.app.main.js");
let checkToken = require("../middlewares/check-token.js");
const checkAriza=require('../middlewares/check-for-new-zayavka.js')
const router = Router();

router.post("/add/", checkToken, checkAriza,appController.newZayavka);
router.get("/all/", checkToken, appController.getAll);
router.post("/create/", checkToken, appController.createAriza);
router.post("/scoring/", checkToken,appController.PostScoring);
router.get("/ariza-all/",checkToken, appController.arizaAll);
router.get("/shartnoma-all/", checkToken, appController.contractsAll);


module.exports = router;
