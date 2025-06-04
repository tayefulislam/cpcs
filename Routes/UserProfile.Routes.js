const express = require("express");

const router = express.Router();

const userHandleController = require("../Controllers/UserProfileController");

router
  .route("/user")
  .post(userHandleController.createNewUserController)
  .get(userHandleController.getUserByIdController)
  .put(userHandleController.updateUserController);

module.exports = router;
