const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
  params: Joi.object()
    .keys({
      tourId: Joi.string().custom(objectId),
      attractionId: Joi.string().custom(objectId),
    })
    .xor('tourId', 'attractionId')
    .messages({
      'object.xor': 'Review must belong to either a tour or attraction, not both',
      'object.missing': 'Must provide either tourId or attractionId',
    }),
  body: Joi.object().keys({
    review: Joi.string().required().min(10).max(500).messages({
      'string.base': 'Review must be a text',
      'string.empty': 'Review cannot be empty',
      'string.min': 'Review must be at least 10 characters long',
      'string.max': 'Review cannot exceed 500 characters',
      'any.required': 'Review is required',
    }),
    rating: Joi.number().required().min(1).max(5).precision(1).messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1.0',
      'number.max': 'Rating cannot exceed 5.0',
      'any.required': 'Rating is required',
    }),
  }),
};

const getReviews = {
  params: Joi.object()
    .keys({
      tourId: Joi.string().custom(objectId).optional(),
      attractionId: Joi.string().custom(objectId).optional(),
    })
    .nand('tourId', 'attractionId')
    .messages({
      'object.nand': 'You can specify either a tour or attraction, or none',
    }),
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

const getReview = {
  params: Joi.object()
    .keys({
      reviewId: Joi.string().custom(objectId).required(),
      tourId: Joi.string().custom(objectId).optional(),
      attractionId: Joi.string().custom(objectId).optional(),
    })
    .or('tourId', 'attractionId')
    .messages({
      'object.or': 'Must specify either tourId or attractionId, or none',
    }),
};

const updateReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      review: Joi.string().min(10).max(500),
      rating: Joi.number().min(1).max(5),
    })
    .or('review', 'rating')
    .messages({
      'object.missing': 'Must provide at least one field to update',
    }),
};

const deleteReview = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    reviewId: Joi.string().custom(objectId),
  }),
};

module.exports = { createReview, getReviews, getReview, updateReview, deleteReview };
