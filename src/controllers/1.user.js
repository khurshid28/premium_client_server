const { log } = require("logrocket");
let db = require("../config/db");
const { BadRequestError, InternalServerError } = require("../utils/errors");
const jwt = require("../utils/jwt");

class Users {
  async send(req, res, next) {
    const { phoneNumber } = req.body;

    if (phoneNumber) {
      let existUser;
      try {
        existUser = await new Promise(function (resolve, reject) {
          db.query(
            `SELECT * FROM Client WHERE phoneNumber=${phoneNumber};`,
            function (err, results, fields) {
              //  console.log(err);
              if (err) {
                resolve(null);
                return null;
              }
              return resolve(results[0]);
            }
          );
        });
      } catch (error) {
        console.log("error:", error);
      }
      if (existUser) {
        try {
          //  console.log(existUser);
          // let otpCode = generateOTP();
          let otpCode = "123123";

          db.query(
            `insert into Otp (otp,client_id)   values ('${otpCode}',${existUser.id});`
          );
          return res.status(200).json({
            id: existUser.id,
            otpCode: otpCode,
          });
        } catch (error) {}
      } else {
        try {
          db.query(
            `insert into Client (phoneNumber,role)   values ('${phoneNumber}','client');`
          );
          const user = await new Promise(function (resolve, reject) {
            db.query(
              `SELECT * FROM Client WHERE phoneNumber='${phoneNumber}';`,
              function (err, results, fields) {
                console.log("err", err);
                if (err) {
                  resolve(null);
                  return null;
                }
                return resolve(results[0]);
              }
            );
          });

          // let otpCode = generateOTP();
          let otpCode = "123123";
          let otpItem = await new Promise(function (resolve, reject) {
            db.query(
              `insert into Otp (otp,client_id,id)   values ('${otpCode}',${user.id}, REPLACE(MD5(UUID()),'-','') )  ;`,
              function (err, results, fields) {
                console.log("err", err);
                if (err) {
                  resolve(null);
                  return null;
                }
                return resolve(results);
              }
            );
          });

          return res.status(200).json({
            id: otpItem.id,
            message: "sent code successfully",
            
          });
        } catch (error) {}
      }
    } else {
      return next(new BadRequestError(400, "you must enter phone number !"));
    }
  }

  async verify(req, res, next) {
    const { id, otpCode } = req.body;

    console.log(id);
    let userVerify;
    try {
      userVerify = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT code,created_time FROM Otp WHERE client_id=${req.user.id} and id=${id} and used="false";`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            return resolve(results[results.length - 1]);
          }
        );
      });
    } catch (error) {
      console.log("error:", error);
    }
    if (!userVerify) {
      return res.status(400).json({ message: "no user found !" });
    }

    const calculateTimeDifference = (eventTime) => {
      return (
        Math.floor(Date.now() / 1000) -
        Math.floor(new Date(eventTime).getTime() / 1000)
      );
    };
    //  calculateTimeDifference(userVerify.created_time);
    if (
      userVerify.otp === otpCode &&
      calculateTimeDifference(userVerify.created_time) < 120
    ) {

      await new Promise(function (resolve, reject) {
        db.query(
          `update Otp set used="TRUE"  WHERE id='${id}';`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              
            }
             resolve(results);
          }
        );
      });
      const user = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * FROM Client WHERE id='${id}';`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            return resolve(results[0]);
          }
        );
      });

      return res.status(200).json({
        message: "success",
        client: user,
      });
    }
    return res.status(400).json({
      message: "otp code is invalid or time is up !",
    });
    // return next(new BadRequestError(400,"otp code is invalid or time is up !"))
  }
  async adminLogin(req, res, next) {
    const { id, loginName, loginPassword } = req.body;
    if (!loginName || !loginPassword || !id) {
      return res
        .status(400)
        .json({ message: "you must enter login credentials !" });
    }
    console.log("loginPassword", "loginName", loginPassword, loginName);
    if (loginName.length > 6 && loginPassword.length > 6) {
      let admin;
      try {
        admin = await new Promise(function (resolve, reject) {
          db.query(
            `SELECT * FROM clientadmin WHERE id=${id} and loginName='${loginName}' and loginPassword='${loginPassword}' ;`,
            function (err, results, fields) {
              //  console.log(err);
              if (err) {
                resolve(null);
                return null;
              }
              return resolve(results[0]);
            }
          );
        });
      } catch (error) {
        console.log("error:", error);
      }

      if (admin) {
        const token = jwt.sign({
          id: admin.id,
          phoneNumber: admin.phoneNumber,
          role: admin.role,
        });
        return res.status(200).json({
          message: "ok",
          data: {
            id: admin.id,
            phoneNumber: admin.phoneNumber,
            role: admin.role,
          },
          token: token,
        });
      } else {
        return res.status(400).json({ message: "user not found !" });
      }
    } else {
      return next(new BadRequestError(400, "Invalid login or Password !"));
    }
  }

  async profile(req, res, next) {
    try {
      const { id, role, phoneNumber } = req.user;
      console.log('user:::',req.user);
      
      if (role != "client") {
        return res.status(400).json({ message: "you have no permission !" });
      }

      let client = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * FROM client WHERE id=${id};`,
          function (err, results, fields) {
            if (err) {
              console.log(err);
              resolve(null);
              return null;
            }
            return resolve(results[0]);
          }
        );
      });

      return res.status(200).json({
        message: "success",
        data: client,
      });
    } catch (error) {
      return next(new InternalServerError(500, error));
    }
  }
}
function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}
module.exports = new Users();
