const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Validation failed",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      )
    );
  }

  req.validated = result.data;
  next();
};

module.exports = validate;
