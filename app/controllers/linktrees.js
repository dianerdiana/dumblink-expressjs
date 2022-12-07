const { linktrees, links } = require('../../models');
const { nanoid } = require('nanoid');
const Joi = require('joi');
const fs = require('fs-extra');
const path = require('path');

// Constants Helpers
const CONSTANTS = require('../helpers/Constants');

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

    const newLinktree = await linktrees.create({
      created_by: id_user,
      title,
      description,
      unique_link,
      template,
      image,
      view_count: 0,
    });

    for (let i = 0; i < linkParsed.length; i++) {
      const newLink = await links.create({
        title: linkParsed[i].title,
        url: linkParsed[i].url,
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
      // return console.log(mappedAllData);
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
  const { id } = req.params;

  try {
    const data = await linktrees.findOne({
      where: {
        id_linktree: id,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    });

    if (data) {
      return res.status(200).send({
        status: true,
        message: CONSTANTS.delete_success,
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
