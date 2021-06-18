const { authJwt } = require("../middleware");
const controller = require("../controllers/dialogFlow.controller");
const { verifyToken } = require("../middleware/authJwt");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/send-msg", verifyToken, controller.callDialogFlow);
};
