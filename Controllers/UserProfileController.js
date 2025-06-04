const {
  createNewUserService,
  getUserByIdService,
  updateUserService,
} = require("../Services/UserProfileService");

exports.createNewUserController = async (req, res, next) => {
  //   console.log("req", req.body);
  const user = req.body;
  const email = req.query.email;
  // console.log(email, user);

  try {
    const result = await createNewUserService(user);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Create New User Failed",
      error: error.message,
    });
  }
};
exports.getUserByIdController = async (req, res, next) => {
  const email = req.query.email;
  //   console.log("line 25", email);

  try {
    const result = await getUserByIdService(email);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get USer info by email Failed",
      error: error.message,
    });
  }
};

exports.updateUserController = async (req, res, next) => {
  const email = req.query.email;
  //   console.log(email);

  try {
    const result = await updateUserService(email, req.body);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "update USer info by email Failed",
      error: error.message,
    });
  }
};
