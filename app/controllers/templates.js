const { templates } = require('../../models');
const CONSTANTS = require('../helpers/Constants');

exports.getTemplates = async (req, res) => {
  const data = await templates.findAll();

  console.log(data);
  if (data) {
    res.status(200).send({
      status: true,
      message: CONSTANTS.success,
      data,
    });
  } else {
    res.status(404).send({
      status: false,
      message: CONSTANTS.not_found,
    });
  }
};
