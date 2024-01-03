const Joi = require("joi");
const joiPwd = require("joi-password-complexity");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  PermanentAddress: Joi.string().min(10),
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  mobile: Joi.string().min(11).max(13),
});

const complexityOptions = {
  min: 6,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  //   requirementCount: 3,
};

module.exports.userVal = userSchema;
module.exports.pwdVal = joiPwd(complexityOptions);
