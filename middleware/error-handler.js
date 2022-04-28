const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const c_validErr = "ValidationError";
const c_castErr = "CastError";
const c_customErrorMessage = "Something went wrong, try again later";

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    status: err.status || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || c_customErrorMessage,
  };
  /** if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message });
  // } 
  */
  if (err.name === c_validErr) {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.status = StatusCodes.BAD_REQUEST;
  }

  if (err.name === c_castErr) {
    customError.msg = `No Item found with ID: ${err.value}`;
    customError.status = StatusCodes.NOT_FOUND;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value ${Object.keys(
      err.keyValue
    )}, Please choose another value.`;
    customError.status = StatusCodes.BAD_REQUEST;
  }
  return res.status(customError.status).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
