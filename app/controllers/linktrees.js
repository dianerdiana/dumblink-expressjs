const { linktrees, links } = require('../../models');
const { nanoid } = require('nanoid');
const CONSTANTS = require('../helpers/Constants');
const Joi = require('joi');

exports.addLinktree = async (req, res) => {
  const { id_user } = req.user;
  const { title, description, template, link_group } = req.body;
  const image = req.file.filename;
  const unique_link = nanoid(10);
  const linkParsed = JSON.parse(link_group);

  const schema = Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
  });

  const { error } = schema.validate({ title, description });

  if (error) {
    return res.status(400).send({
      status: false,
      message: CONSTANTS.failed,
      error: error.message,
    });
  }


  try {
    const link_id = [];

    for (let i = 0; i < linkParsed.length; i++) {
      const newLink = await links.create({
        title: linkParsed[i].title,
        url: linkParsed[i].url,
      });
  
      link_id.push(newLink.id_link);
    }

    const newLinktree = await linktrees.create({
      created_by: id_user,
      title,
      description,
      unique_link,
      template,
      link_id: JSON.stringify(link_id),
      image,
      view_count: 0,
    });

    const data = await linktrees.findOne({
      where: {
        id_linktree: newLinktree.id_linktree,
      },
    });

    res.status(200).send({
      status: true,
      message: CONSTANTS.add_success,
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error,
    });
  }
};

exports.getLinktrees = async (req, res) => {
  const { id_user } = req.user;

  try {
    const allData = await linktrees.findAll({
      where: {
        created_by: id_user,
      },
    });

    if (allData) {
      res.status(200).send({
        status: true,
        message: CONSTANTS.success,
        data: allData,
      });
    } else {
      res.status();
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error,
    });
  }
};
