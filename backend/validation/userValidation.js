const Joi = require('joi');

// Custom phone number validation - supports international formats
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Validation schemas
const signupSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  phone: Joi.string()
    .pattern(phoneRegex)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid international phone number with country code (e.g., +1234567890)',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

const signinSchema = Joi.object({
  emailOrPhone: Joi.string()
    .required()
    .messages({
      'string.empty': 'Email or phone number is required',
      'any.required': 'Email or phone number is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

// Forgot password schema (email or phone)
const forgotPasswordSchema = Joi.object({
  emailOrPhone: Joi.string()
    .required()
    .messages({
      'string.empty': 'Email or phone number is required',
      'any.required': 'Email or phone number is required'
    }),
  
  method: Joi.string()
    .valid('email', 'sms')
    .default('email')
    .messages({
      'any.only': 'Recovery method must be either "email" or "sms"'
    })
});

// Reset password schema
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Reset token is required',
      'any.required': 'Reset token is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Phone verification schema
const verifyPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(phoneRegex)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid international phone number with country code',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
  
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'Verification code must be 6 digits',
      'string.pattern.base': 'Verification code must contain only numbers',
      'string.empty': 'Verification code is required',
      'any.required': 'Verification code is required'
    })
});

// Middleware functions
const validateSignup = (req, res, next) => {
  const { error, value } = signupSchema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  req.validatedData = value;
  req.body = value; // Keep for backward compatibility
  next();
};

const validateSignin = (req, res, next) => {
  const { error, value } = signinSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  req.validatedData = value;
  req.body = value; // Keep for backward compatibility
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  req.validatedData = value;
  req.body = value;
  next();
};

const validateResetPassword = (req, res, next) => {
  const { error, value } = resetPasswordSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  req.validatedData = value;
  req.body = value;
  next();
};

const validateVerifyPhone = (req, res, next) => {
  const { error, value } = verifyPhoneSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  req.validatedData = value;
  req.body = value;
  next();
};

// Helper function to determine if input is email or phone
const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

const isPhone = (input) => {
  return phoneRegex.test(input);
};

module.exports = {
  validateSignup,
  validateSignin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyPhone,
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyPhoneSchema,
  isEmail,
  isPhone,
  phoneRegex
};
