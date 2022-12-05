const { users } = require('../models');
const CONSTANTS = require('../helpers/Constants');

exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = await users.findOne({
    where: { id_user: id },
    attributes: {
      exclude: ['password', 'created_at', 'updated_at'],
    },
  });

  if (user) {
    res.status(200).send({
      status: true,
      message: CONSTANTS.success,
      data: user,
    });
  } else {
    res.status(404).send({
      status: false,
      message: CONSTANTS.not_found,
    });
  }
};
