const { templates } = require('../../models');
const CONSTANTS = require('../helpers/Constants');

exports.getTemplates = async (req, res) => {
  try {
    const data = await templates.findAll();

    res.status(200).send({
      status: true,
      message: CONSTANTS.success,
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: CONSTANTS.not_found,
      error,
    });
  }
};

exports.getTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await templates.findOne({
      where: {
        id_template: id,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    });

    if (item) {
      res.status(200).send({
        status: item ? true : false,
        message: CONSTANTS.success,
        data: item,
      });
    } else {
      res.status(404).send({
        status: false,
        message: CONSTANTS.not_found,
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: CONSTANTS.server_error,
      error,
    });
  }
};
