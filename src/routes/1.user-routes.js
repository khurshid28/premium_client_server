const { Router } = require("express");
const User = require("../controllers/1.user.js");
const Myid = require("../controllers/2.myId.js");
const userouter = Router();

userouter.post("/phone/send", User.send);
userouter.post("/phone/verify", User.verify);

userouter.post("/profile", User.profile);

userouter.post("/adminLogin", User.adminLogin);

// userouter.post("/getme/", Myid.getMe);
module.exports = userouter;



