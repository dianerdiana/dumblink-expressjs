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
  }).options({ abortEarly: false });

  const { error } = schema.validate({ title, description, link_group });

  if (error) {
    await fs.unlink(path.join('uploads/' + image));
    console.log(error.details);
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
  const { id_user } = req.user;
  const {
    title,
    id_linktree,
    description,
    template_id,
    link_group,
    old_link_id,
  } = req.body;
  const image = req.file.filename;
  const unique_link = nanoid(10);
  const linkGroupParsed = JSON.parse(link_group);
  const oldLinkParsed = JSON.parse(old_link_id);

  const getLinkTypes = new Promise((resolve, reject) => {
    const mustUpdate = new Array();
    const mustCreate = new Array();
    const mustDelete = new Array();

    for (let i = 0; i < linkGroupParsed.length; i++) {
      if (linkGroupParsed[i].hasOwnProperty('id_link')) {
        for (let x = 0; x < oldLinkParsed.length; x++) {
          if (oldLinkParsed[x] === linkGroupParsed[i].id_link) {
            mustUpdate.push(linkGroupParsed[i]);
          } else {
            mustDelete.push(oldLinkParsed[x]);
          }
        }
      } else {
        mustCreate.push(linkGroupParsed[i]);
      }
    }

    if (mustUpdate.length > 0 || mustCreate.length > 0) {
      resolve({ mustUpdate, mustCreate, mustDelete });
    } else {
      reject({ status: false, message: 'Error' });
    }
  });

  try {
    const data = await linktrees.findOne({
      where: {
        id_linktree,
      },
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
      inlcude: {
        model: links,
        as: 'links',
      },
    });

    if (data) {
      // Delete old image
      await fs.unlink(path.join('uploads/' + data.image));

      const { mustUpdate, mustCreate, mustDelete } = await getLinkTypes.then(
        res
      );

      const updatedLinks = new Promise(async (resolve, rejects) => {
        const results = new Array();

        // Update when form data same with old
        if (mustUpdate.length > 0) {
          for (let i = 0; i < mustUpdate.length; i++) {
            await links.update(
              { title: mustUpdate[i].title, url: mustUpdate[i].url },
              {
                where: { id_link: mustUpdate[i].id_link },
              }
            );

            results.push(mustUpdate[i].id_link);
          }
        }

        // Create data when id is not found from old
        if (mustCreate.length > 0) {
          for (let i = 0; i < mustCreate.length; i++) {
            const link = await links.create({
              title: mustCreate[i].title,
              url: mustCreate[i].url,
              linktree_id: id_linktree,
            });

            results.push(link.id_link);
          }
        }

        // Delete data when old is not send again
        if (mustDelete.length > 0) {
          for (let i = 0; i < mustDelete.length; i++) {
            await links.destroy({ where: { id_link: mustDelete[i] } });
          }
        }

        if (results.length > 0) {
          resolve(JSON.stringify(results));
        } else {
          rejects({ status: false, message: 'Error', results });
        }
      });

      const link_id = await updatedLinks
        .then((res) => res)
        .catch((err) => err)
        .finally('Final');

      // update linktrees
      await data.update({
        updated_by: id_user,
        title,
        description,
        unique_link,
        template_id,
        image,
        link_id,
      });

      await data.save();

      return res.status(200).send({
        status: true,
        message: CONSTANTS.update_success,
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
