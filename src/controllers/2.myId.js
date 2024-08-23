const {
  InternalServerError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} = require("../utils/errors.js");
let axios = require("axios");
let path = require("path");
let fs = require("fs");
let Fapi=require("../utils/fapi.js")
let db = require("../config/db");
const { log } = require("logrocket");
const jwt = require("../utils/jwt.js");
class Myid {
 

  async getMe(req, res, next) {
    try {
      let { code, base64, passport,birth_date } = req.body;
      let url1 = process.env.FACE_URL + "oauth2/access-token";
        let url2 = process.env.FACE_URL + "users/me";

        const response1 = await axios
          .post(
            url1,
            {
              grant_type: "authorization_code",
              code: code,
              client_id: process.env.FACE_CLIENT_ID,
              client_secret: process.env.FACE_CLIENT_SECRET,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });

        let access_token = response1.data["access_token"];

        let response2 = await axios
          .get(url2, {
            headers: {
              Authorization: "Bearer " + access_token,
            },
          })
          .then((r) => r)
          .catch((err) => {
            throw err;
          });
        // console.log(req.body);
        console.log(response2.data);
        if (response2.data.profile && response2.data.result_code != 3) {
          let userMyIdData = await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO MyId (response_id,pass_seriya,comparison_value,profile) VALUES ('${
                response2.data.response_id
              }', '${passport}','${
                response2.data.comparison_value
              }','${JSON.stringify({
                ...response2.data.profile,
                contacts: "",
              })
                .replaceAll(`\^`, "")
                .replaceAll(`\\`, "")}')`,
              function (err, results, fields) {
                if (err) {
                  console.log("err >> ", err);
                  resolve(null);
                  // return null;
                }
                console.log("results >> ", results);
                if (results) {
                  resolve("success");
                } else {
                  resolve(null);
                  // return null;
                }
              }
            );
          });
          

          // await new Promise(function (resolve, reject) {
          //   db.query(
          //     `update client set * FROM client WHERE id=${req.user.id};`,
          //     function (err, results, fields) {
               
          //       if (err) {
          //         console.log(err);
          //         resolve(null);
          //         return null;
          //       }
          //       return resolve(results[0]);
          //     }
          //   );
          // });

           
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
          if(!client){
            return next(
              new NotFoundError(404, "Client not found")
            );
          }
          if (!client.verified) {
            let clientData = {
              fullname: (
                userMyIdData.profile.common_data.first_name
                  .toString()
                  .capitalizeFirstLetter() +
                " " +
                userMyIdData.profile.common_data.last_name
                  .toString()
                  .capitalizeFirstLetter() +
                " " +
                userMyIdData.profile.common_data.middle_name
                  .toString()
                  .capitalizeFirstLetter()
              ).replaceAll("ʻ", "'"),
              passport: req.body.passport,
              birth_date: req.body.birth_date,
            };
      
            await new Promise(function (resolve, reject) {
              db.query(
                `update client set fullname="${clientData.fullname}",passport="${clientData.passport}",birth_date="${clientData.birth_date}"   WHERE id=${req.user.id};`,
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
            userId: user.id,
            phoneNumber: user.phoneNumber,
            role: user.role,
          });
      
          return res.status(200).json({
            "message" : "success",
            "data" : response2.data,
            "client" : client,
            "token" :  token,
          });
        } else {
          return next(
            new InternalServerError(500, response2.data.result_note ?? "error")
          );
        }
       
      

      
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
  async base64(req, res, next) {
    try {
      console.log(">>>>>>>>>>>>>>>>>");
      let { passport } = req.params;

      let response3 = await axios
        .get("http://localhost:7070/api/v1/base64/" + passport)
        .then((res) => res)
        .catch((err) => {
          console.log(">>>> Test server ERROR", err.response.data);
          return err.response;
        });

      return res.status(response3.status).json(response3.data);
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
}

Date.daysBetween = function (date1, date2) {
  //Get 1 day in milliseconds
  var one_day = 1000 * 60 * 60 * 24;

  // Calculate the difference in milliseconds
  var difference = date2 - date1;

  // Convert back to days and return
  return Math.round(difference / one_day);
};

async function base64_decode(base64str, filePath) {
  let base64Image = base64str.split(";base64,")[1];
  var bitmap = Buffer.from(base64Image.toString(), "base64");

  const image = await resizeImg(bitmap, {
    width: 480,
    height: 640,
  });

  fs.writeFileSync(filePath, image);

  const newBase64 = fs.readFileSync(filePath, { encoding: "base64" });

  // console.log("******** File created from base64 encoded string ********");
  // console.log(newBase64.slice(50));
  return "data:image/jpeg;base64," + newBase64;
}

module.exports = new Myid();
