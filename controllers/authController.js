const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createSendToken = (user, statusCode, req, res) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };

//   if (process.env.NODE_ENV === "production") {
//     cookieOptions.secure = true;
//   }

//   res.cookie("jwt", token, cookieOptions);
//   user.password = undefined;
//   res.status(statusCode).json({
//     status: "success",
//     token,
//     data: {
//       user,
//     },
//   });
// };

// exports.signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     fullName: req.body.fullName,
//     email: req.body.email,
//     phone: req.body.phone,
//     password: req.body.password,
//     confirmPassword: req.body.confirmPassword,
//     role: req.body.role,
//   });

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_FROM,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const email = transporter.sendMail({
//     from: `SkillHub <${process.env.EMAIL_FROM}>`,
//     to: newUser.email,
//     subject: "Welcome Message",
//     text: "Welcome to SkillHub, enjoy your stay",
//     html: "<b>Welcome to SkillHub, enjoy your stay</b>",
//   });
//   console.log("Email Sent");

//   createSendToken(newUser, 201, req, res);

// });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; // remove password from output

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  try {
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: req.body.role,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const email = transporter.sendMail({
      from: `SkillHub <${process.env.EMAIL_FROM}>`,
      to: newUser.email,
      subject: "Welcome Message",
      text: "Welcome to SkillHub, enjoy your stay",
      html: "<b>Welcome to SkillHub, enjoy your stay</b>",
    });

    console.log("Email Sent");
    createSendToken(newUser, 201, req, res);
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]; // get the duplicate field (e.g., email or phone)
      const value = err.keyValue[field]; // get the value of the duplicate key

      return res.status(400).json({
        status: "fail",
        message: `${field} '${value}' already exists. Please use another ${field}.`,
      });
    }

    // For other errors, send a generic response
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { emailPhone, password } = req.body;
  if (!emailPhone || !password) {
    return res.status(400).json({
      status: "fail",
      message: "please provide your email / phone and password",
    });
  }

  const isEmail = emailPhone.includes("@");
  const user = isEmail
    ? await User.findOne({ email: emailPhone }).select("+password")
    : await User.findOne({ phone: emailPhone }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "fail",
      message: "invalid email/phone or password",
    });
  }

  createSendToken(user, 200, req, res);
  next();
});

exports.logout = async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "logged out successfully",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "you are not logged in, please login",
    });
  }

  //Verufy Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);

  //Check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: "fail",
      message: "the user belonging to this token no longer exist",
    });
  }

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return res.status(401).json({
      status: "fail",
      message: "user recently changed password, please login again",
    });
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "you do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }

  let resetToken;
  resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(process.env.FRONTEND_URL);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(resetUrl);

    const email = await transporter.sendMail({
      from: `SkillHub <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Password Reset Toke",
      text: `Your password reset token, click on this👉 ${resetUrl} link to reset  your password,(valid for 10mins)`,
      html: `
    <p>Your password reset token is ready. Please click on the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <br /><br />
    <p>Or, click the button below to reset your password:</p>
    <a href="${resetUrl}" target="_blank" 
       style="
         background-color: #007bff;
         color: white;
         padding: 10px 20px;
         text-decoration: none;
         border-radius: 5px;
         display: inline-block;
       "
    >
      Reset Password
    </a>
    <br /><br />
    <p>This link will be valid for 10 minutes.</p>
  `,
    });
    console.log("Password reset token Sent");

    res.status(200).json({
      status: "success",
      message: "Password reset token sent to your email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: "There was an error sending the reset token to your email",
      // message: err,
    });
  }
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return res.status(400).json({
      status: "fail",
      message: "token is invalid or has expired",
    });

  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, req, res);
});
