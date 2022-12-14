const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONSTANTS = require('../helpers/Constants');

const { users } = require('../../models');

exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;

  const schema = Joi.object({
    fullname: Joi.string().min(3).required().messages({
      'string.empty': "fullname doesn't be empty",
      'string.min': 'fullname length must be at least 3 characters',
    }),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required().messages({
      'string.empty': "password doesn't be empty",
      'string.min': 'password length must be at least 6 characters',
    }),
  });

  const { error } = schema.validate({ fullname, email, password });

  if (error) {
    return res.status(400).send({
      status: false,
      message: error.message,
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await users.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id_user: newUser.id_user }, process.env.TOKEN_KEY);

    res.status(200).send({
      status: true,
      message: CONSTANTS.success,
      data: {
        fullname: newUser.fullname,
        email: newUser.email,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().min(6).required().messages({
      'string.min': 'email length must be at least 6 characters',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': "password doesn't be empty",
      'string.min': 'password length must be at least 6 characters',
    }),
  });

  const { error } = schema.validate({ email, password });

  if (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }

  try {
    const user = await users.findOne({
      where: { email },
    });
    const is_valid = await bcrypt.compare(password, user.password);

    if (!is_valid) {
      return res.status(404).send({
        status: is_valid,
        message: "Email & Password don't match!",
      });
    }

    const token = jwt.sign({ id_user: user.id_user }, process.env.TOKEN_KEY);

    res.status(200).send({
      status: is_valid,
      message: CONSTANTS.success,
      data: {
        fullname: user.fullname,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Email & Password don't match!",
    });
  }
};

exports.logout = async (req, res) => {
  req.user = null;
};
