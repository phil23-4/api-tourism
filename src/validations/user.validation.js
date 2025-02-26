const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    username: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    rating: Joi.alternatives().try(
      Joi.number().min(1).max(5),
      Joi.object({
        gte: Joi.number().min(1),
        lte: Joi.number().max(5),
      })
    ),
    user: Joi.string().custom(objectId),
    attraction: Joi.string().custom(objectId),
    tour: Joi.string().custom(objectId),
    sortBy: Joi.string().valid('rating', '-rating', 'createdAt', '-createdAt', 'popularity'),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};
const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      username: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string().custom(password),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  getReviews,
  updateUser,
  deleteUser,
};
