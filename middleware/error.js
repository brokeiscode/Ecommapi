const {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} = require("@prisma/client");

const error = (err, req, res, next) => {
  if (err instanceof PrismaClientUnknownRequestError) {
    console.error("PRISMA UNKNOWN REQUEST ERROR");
    console.error(err.stack);
  } else if (err instanceof PrismaClientValidationError) {
    console.error("PRISMA VALIDATION ERROR");
    console.error(err.stack);
  } else {
    console.error("Simple Error", err.message);
    console.error("Stack Error", err.stack);
  }

  return res.status(500).json({
    error: "Internal Server Error. Pls check the logs for details",
  });
};

module.exports = error;
