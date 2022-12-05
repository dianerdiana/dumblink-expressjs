const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONSTANTS = require('../helpers/Constants');

const { users } = require('../models');

exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;

  const schema = Joi.object({
    fullname: Joi.string().min(3).required(),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required().messages({
      'string.empty': "password doesn't be empty",
      'string.min': 'password length must be at least 6 characters long',
    }),
  });

  const { error } = schema.validate({ fullname, email, password });

  if (error) {
    return res.status(400).send({
      status: false,
      message: 'Failed',
      error: error.message,
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
    email: Joi.string().email().min(6).required().messages(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ email, password });

  if (error) {
    res.status(400).send({
      status: false,
      message: CONSTANTS.failed,
      error: error.message,
    });
  }

  const user = await users.findOne({
    where: { email },
  });

  if (user) {
    try {
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
          email: user.fullname,
          token,
        },
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error,
      });
    }
  } else {
    res.status(404).send({
      status: false,
      message: "Email & Password don't match!",
    });
  }
};
