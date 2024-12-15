const responseHandler = (res, options = {}) => {
    const {
      success = true,
      statusCode = 200,
      msg = "Default Message",
      payload = null,
      error = null
    } = options;
  
    const response = {
      success,
      statusCode,
      msg,
      payload,
      error
    };
    return res.status(statusCode).json(response);
};
export default responseHandler;
  