const UserProfile = require("../models/UserProfile");

exports.createNewUserService = async (user) => {
  const result = await UserProfile.create(user);
  return result;
};

exports.getUserByIdService = async (email) => {
  //   console.log(email);
  const result = await UserProfile.findOne({ email: email });
  return result;
};

exports.updateUserService = async (email, user) => {
  // console.log("Updating user with email:", email, "and data:", user);
  const result = await UserProfile.findOneAndUpdate(
    { email: email },
    { $set: user },
    {
      new: true,
      upsert: true, // This option creates the document if it doesn't exist
      setDefaultsOnInsert: true, // This ensures any schema defaults are applied
    }
  );
  // console.log("Result user with email:", result);

  return result;
};
