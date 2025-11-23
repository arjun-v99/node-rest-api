const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = {
  hello() {
    return {
      text: "Hello World",
      views: 1234,
    };
  },
  // for createUser mutation first argument would be `args` variable.
  // which contains the userInput `input` type we defined in the schema.js
  // we are using object destructuring to pull out `userInput` from `args`
  createUser: async function ({ userInput }, req) {
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User already exists");
      throw error;
    }

    const hashedPwd = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      name: userInput.name,
      email: userInput.email,
      password: hashedPwd,
    });
    const saveUser = await user.save();
    // _doc will only return the created object without any mongoose metadata
    // _id will be replaced with String instead of ObjectId
    // If it is ObjectId type it will throw an error
    return { ...saveUser._doc, _id: saveUser._id.toString() };
  },
};
