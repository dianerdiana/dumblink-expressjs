const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const constants = require('../helpers/Constants');

const { users } = require('../models');

exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;

  const schema = Joi.object({
    fullname: Joi.string().min(3).required(),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ fullname, email, password });

  if (error) {
    return res.status(400).send({
      status: false,
      message: 'Failed',
      error: error.details[0].message,
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

    const token = jwt.sign({ id: newUser.id_user }, process.env.TOKEN_KEY);
    console.log(newUser);
    res.status(200).send({
      status: true,
      message: constants.success,
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
