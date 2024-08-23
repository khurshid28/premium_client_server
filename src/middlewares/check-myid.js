const {
  AuthorizationError,
  ForbiddenError,
  InternalServerError,
  InvalidTokenError,
  UnAvailableError,
} = require("../utils/errors.js");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");

let db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    let myIdData = await new Promise(function (resolve, reject) {
      db.query(
        `Select * from MyId WHERE pass_seriya='${req.body.passport}' and Date(now()) < Date(created_time + INTERVAL 1 YEAR)`,
        function (err, results, fields) {
          if (err) {
            resolve(null);
            return null;
          }
          // console.log("++++", results);
          if (results.length != 0) {
            resolve(results[results.length - 1]);
          } else {
            resolve(null);
          }
        }
      );
    });

    if (!myIdData) {
      return next();
    }

    console.log("my id ---", myIdData);
    let client = await new Promise(function (resolve, reject) {
      db.query(
        `SELECT * FROM client WHERE id=${req.user.id};`,
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
    if (!client) {
      return next(new NotFoundError(404, "Client not found"));
    }

    if (!client.verified) {
      let clientData = {
        fullname: (
          myIdData.profile.common_data.first_name
            .toString()
            .capitalizeFirstLetter() +
          " " +
          myIdData.profile.common_data.last_name
            .toString()
            .capitalizeFirstLetter() +
          " " +
          myIdData.profile.common_data.middle_name
            .toString()
            .capitalizeFirstLetter()
        ).replaceAll("ʻ", "'"),
        passport: req.body.passport,
        birth_date: req.body.birth_date,
      };

      await new Promise(function (resolve, reject) {
        db.query(
          `update client set fullname="${clientData.fullname}",passport="${clientData.passport}",birth_date="${clientData.birth_date}",verified="True"   WHERE id=${req.user.id};`,
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
    }

    const token = jwt.sign({
      userId: req.user.id,
      phoneNumber: req.user.phoneNumber,
      role: req.user.role,
    });

    return res.status(200).json({
      message: "success",
      data: myIdData,
      client: client,
      token: token,
    });
    // return res.status(200).json({
    //   response_id: myIdData.response_id,
    //   comparison_value: myIdData.comparison_value,
    //   result_code: 1,
    //   result_note: "Все проверки успешно прошли",
    //   profile: myIdData.profile,
    // });
  } catch (error) {
    console.log("????????????");
    console.log(error);

    return next(new InternalServerError(500, error));
  }
};
