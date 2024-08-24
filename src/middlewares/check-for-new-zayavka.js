const jwt = require("../utils/jwt.js");

const {
  AuthorizationError,
  ForbiddenError,
  InternalServerError,
  InvalidTokenError,
  NotFoundError,
} = require("../utils/errors.js");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");

let db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const queryTOKEN = req.query.authorization;
    let token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      token = queryTOKEN;
    }

    if (!token) {
      return next(new AuthorizationError(401, "No token provided"));
    }

    let { userId, phoneNumber, role } = jwt.verify(token);

    console.log("role", role);

    let user=req.user
    if (user.role !== "client") {
      return next(new ForbiddenError(400,'you do not have permission to this resource !'))
    }
     const latestZayavka = (user = await new Promise(function (
       resolve,
       reject
     ) {
       db.query(
         `SELECT * from Ariza WHERE client_id='${user.id}' and status='canceled_by_scoring' and created_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
         function (err, results, fields) {
           if (err) {
             resolve(null);
             return null;
           }
           if (results.length != 0) {
             resolve(results[results.length - 1]);
           } else {
             resolve(null);
           }
         }
       );
     }));

     if(!latestZayavka){
      return  next()
     }
     
    return next(new ForbiddenError(403,`you do not permission to this resource !`))
  } catch (error) {
    console.log("check for new zayavka");
    console.log(error);
    return next(new InternalServerError(500, error));
  }
};
