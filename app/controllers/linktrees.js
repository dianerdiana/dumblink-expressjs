const { linktrees, links } = require('../../models');
const { nanoid } = require('nanoid');
const Joi = require('joi');
const fs = require('fs-extra');
const path = require('path');

// Constants Helpers
const CONSTANTS = require('../helpers/Constants');

exports.addLinktree = async (req, res) => {
  const { id_user } = req.user;
  const { title, description, template_id, link_group } = req.body;
  const image = req.file.filename;
  const unique_link = nanoid(10);

  const schema = Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    link_group: Joi.array().items(
      Joi.object().keys({
        title: Joi.string().required().messages({
          'string.empty': "title link doesn't be empty",
        }),
        url: Joi.string().required().messages({
          'string.empty': "url link doesn't be empty",
        }),
      })
    ),
  });

  const { error } = schema.validate({ title, description, link_group });

  if (error) {
    return res.status(400).send({
      status: false,
      message: error.details.map((res) => res.message),
    });
  }

  try {
    const link_id = [];

    const newLinktree = await linktrees.create({
      created_by: id_user,
      title,
      description,
      unique_link,
      template_id,
      image,
      view_count: 0,
    });

    for (let i = 0; i < link_group.length; i++) {
      const newLink = await links.create({
        title: link_group[i].title,
        url: link_group[i].url,
        linktree_id: newLinktree.id_linktree,
      });

      link_id.push(newLink.id_link);
    }

    await newLinktree.set({
      link_id: JSON.stringify(link_id),
    });

    await newLinktree.save();

    const data = await linktrees.findOne({
      where: {
        id_linktree: newLinktree.id_linktree,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    });

    res.status(200).send({
      status: true,
      message: CONSTANTS.add_success,
      data: {
        ...data.dataValues,
        image: process.env.API_BASE_URL + '/uploads/' + data.image,
      },
    });
  } catch (error) {
    await fs.unlink(path.join('uploads/' + image));
    res.status(500).send({
      status: false,
      message: error ? error : 'Server error',
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
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
      include: {
        model: links,
        as: 'links',
      },
    });

    if (allData) {
      const mappedAllData = allData.map((data) => {
        return {
          ...data.dataValues,
          image: process.env.API_BASE_URL + '/uploads/' + data.image,
        };
      });
      res.status(200).send({
        status: true,
        message: CONSTANTS.success,
        data: mappedAllData,
      });
    } else {
      res.status(500).send({
        status: false,
        message: 'Server error',
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error,
    });
  }
};

exports.getLinktree = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await linktrees.findOne({
      where: {
        id_linktree: id,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
      include: {
        model: links,
        as: 'links',
      },
    });

    if (data) {
      return res.status(200).send({
        status: true,
        message: CONSTANTS.success,
        data: {
          ...data.dataValues,
          image: process.env.API_BASE_URL + '/uploads/' + data.image,
        },
      });
    } else {
      res.status(200).send({
        status: true,
        message: 'Data not found',
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error ? error : 'Server error..',
    });
  }
};

exports.updateLinktree = async (req, res) => {
  const { id_user } = req.user;
  const { id_linktree, title, description, template_id, link_group } = req.body;
  const image = req.file.filename;
  const unique_link = nanoid(10);

  const schema = Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    link_group: Joi.array().items(
      Joi.object().keys({
        title: Joi.string().required().messages({
          'string.empty': "title link doesn't be empty",
        }),
        url: Joi.string().required().messages({
          'string.empty': "url link doesn't be empty",
        }),
      })
    ),
  });

  const { error } = schema.validate({ title, description, link_group });

  if (error) {
    await fs.unlink(path.join('uploads/' + image));
    return res.status(400).send({
      status: false,
      message: error.details.map((res) => res.message),
    });
  }

  try {
    const link_id = [];
    const item = await linktrees.findOne({
      where: {
        id_linktree,
      },
    });

    const updateLinktree = await item.update({
      updated_by: id_user,
      title,
      description,
      unique_link,
      template_id,
      image,
    });

    await links.destroy({
      where: {
        linktree_id: id_linktree,
      },
    });

    for (let i = 0; i < link_group.length; i++) {
      const newLink = await links.create({
        title: link_group[i].title,
        url: link_group[i].url,
        linktree_id: updateLinktree.id_linktree,
      });

      link_id.push(newLink.id_link);
    }

    await updateLinktree.set({
      link_id: JSON.stringify(link_id),
    });

    await updateLinktree.save();

    const data = await linktrees.findOne({
      where: {
        id_linktree: updateLinktree.id_linktree,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    });

    res.status(200).send({
      status: true,
      message: CONSTANTS.update_success,
      data: {
        ...data.dataValues,
        image: process.env.API_BASE_URL + '/uploads/' + data.image,
      },
    });
  } catch (error) {
    await fs.unlink(path.join('uploads/' + image));
    res.status(500).send({
      status: false,
      message: error ? error : 'Server error',
    });
  }
};

exports.deleteLinktree = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await linktrees.findOne({
      where: {
        id_linktree: id,
      },
    });

    if (data) {
      await fs.unlink(path.join('uploads/' + data.image));
      await data.destroy();
      await data.save();

      return res.status(200).send({
        status: true,
        message: CONSTANTS.delete_success,
      });
    } else {
      res.status(200).send({
        status: true,
        message: 'Data not found',
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error ? error : 'Server error..',
    });
  }
};

exports.viewLinktree = async (req, res) => {
  const { unique_link } = req.params;

  try {
    const linktree = await linktrees.findOne({
      where: {
        unique_link,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
      include: {
        model: links,
        as: 'links',
      },
    });

    res.status(200).send({
      status: linktree ? true : false,
      message: CONSTANTS.success,
      data: {
        ...linktree.dataValues,
        image: process.env.API_BASE_URL + '/uploads/' + linktree.image,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: CONSTANTS.not_found,
    });
  }
};

exports.updateCount = async (req, res) => {
  const { unique_link } = req.params;
  try {
    const linktree = await linktrees.findOne({
      where: {
        unique_link,
      },
    });

    const result = await linktree.increment('view_count', { by: 1 });

    res.status(200).send({
      status: result ? true : false,
      message: CONSTANTS.success,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: CONSTANTS.not_found,
    });
  }
};
