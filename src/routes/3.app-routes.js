const { Router } = require("express");
const appController = require("../controllers/3.app.main.js");
let checkToken = require("../middlewares/check-token.js");
const router = Router();

router.post("/add/", checkToken, appController.newZayavka);
router.get("/all/", checkToken, appController.getAll);
router.post("/create/", checkToken, appController.createAriza);
router.post("/scoring/", checkToken,appController.PostScoring);
router.get("/ariza-all/",checkToken, appController.arizaAll);


module.exports = router;
