const reqValidator = (schema, source = 'body') => async (req, res, next) => {
    try {
      const data = req[source] || {};
      const { error } = schema.validate(data);
      if (!error) {
        return next();
      } else {
        const { details } = error;
        const message = details.map((i) => i.message).join(',');
        return res.status(400).json({
            success: false,
            message: message
        });
      }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error' 
        });
    }
  };
  
  module.exports = {
    reqValidator
  };