const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      bio,
      profilePicture
    } = req.body;

    logger.debug("Register attempt", { username });

    const existingUser = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      logger.warn("Register rejected: username or email already exists", { username });

      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      bio,
      profilePicture
    });

    logger.info("User registered", { userId: user._id, username: user.username });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error("Register failed", { error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;

    logger.debug("Login attempt", { username });

    const user = await User.findOne({
      username
    });

    if (!user) {
      logger.warn("Login failed: unknown username", { username });

      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      logger.warn("Login failed: wrong password", { userId: user._id, username });

      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    logger.info("User logged in", { userId: user._id, username: user.username });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    logger.error("Login failed", { error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
