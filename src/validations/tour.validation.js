const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTour = {
  params: Joi.object().keys({
    attractionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    duration: Joi.number().required(),
    maxGroupSize: Joi.number().required(),
    difficulty: Joi.string().required().valid('easy', 'medium', 'difficult'),
    price: Joi.number().required(),
    priceDiscount: Joi.number(),
    summary: Joi.string().required(),
    description: Joi.string(),
    mainImage: Joi.object().keys({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
    images: Joi.array().items(
      Joi.object().keys({
        url: Joi.string(),
        publicId: Joi.string(),
      })
    ),
    startDates: Joi.array().items(Joi.date()).required(),
    secretTour: Joi.boolean().optional(),
    location: Joi.object().keys({
      type: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number().precision(8)),
      name: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      day: Joi.number().required(),
    }),
    locations: Joi.array()
      .items({
        description: Joi.string().required(),
        coordinates: Joi.array().items(Joi.number()).required(),
        day: Joi.number().required(),
      })
      .required(),
    guides: Joi.array().items(Joi.string().custom(objectId)).required(),
    attraction: Joi.string().custom(objectId).required(),
  }),
};

const getTours = {
  query: Joi.object().keys({
    name: Joi.string(),
    ratingsAverage: Joi.string(),
    rating: Joi.alternatives().try(
      Joi.number().min(1).max(5),
      Joi.object({
        gte: Joi.number().min(1),
        lte: Joi.number().max(5),
      })
    ),
    slug: Joi.string(),
    attraction: Joi.string().custom(objectId),
    sortBy: Joi.string().valid(
      'rating',
      'ratingsAverage',
      'attraction',
      'difficulty',
      'duration',
      'maxGroupSize',
      'price',
      'name'
    ),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getTour = {
  params: Joi.object()
    .keys({
      tourId: Joi.string().custom(objectId).required(),
    })
    .messages({
      'object.missing': 'Must specify a tourId',
    }),
};

const updateTour = {
  params: Joi.object().keys({
    tourId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    duration: Joi.number(),
    maxGroupSize: Joi.number(),
    difficulty: Joi.string().valid('easy', 'medium', 'difficult'),
    price: Joi.number(),
    priceDiscount: Joi.number(),
    summary: Joi.string(),
    description: Joi.string(),
    mainImage: Joi.object().keys({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
    images: Joi.array().items(
      Joi.object().keys({
        url: Joi.string(),
        publicId: Joi.string(),
      })
    ),
    startDates: Joi.array().items(Joi.date()),
    secretTour: Joi.boolean().optional(),
    location: Joi.object().keys({
      type: Joi.string(),
      coordinates: Joi.array().items(Joi.number().precision(8)),
      name: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      day: Joi.number(),
    }),
    locations: Joi.array().items({
      description: Joi.string(),
      coordinates: Joi.array().items(Joi.number()),
      day: Joi.number(),
    }),
    guides: Joi.array().items(Joi.string().custom(objectId)),
    attraction: Joi.string().custom(objectId),
  }),
};

const deleteTour = {
  params: Joi.object().keys({
    tourId: Joi.string().custom(objectId),
  }),
};

module.exports = { createTour, getTours, getTour, updateTour, deleteTour };
