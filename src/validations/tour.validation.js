const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTour = {
  params: Joi.object().keys({
    attractionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    duration: Joi.number().required(),
    maxGroupSize: Joi.number().required(),
    difficulty: Joi.string().required().valid('easy', 'medium', 'difficult'),
    price: Joi.number().required(),
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
    tours: Joi.object().keys({
      name: Joi.string(),
      images: Joi.array().items(Joi.string()),
      booking: Joi.string(),
    }),
    keywords: Joi.array().items(Joi.string()),
    attraction: Joi.string().custom(objectId),
    location: Joi.object().keys({
      type: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number().precision(8)),
      name: Joi.string(),
      address: Joi.string(),
    }),
    openingHours: Joi.string(),
    highlightSpots: Joi.array().items(
      Joi.object().keys({
        type: Joi.string(),
        coordinates: Joi.array().items(Joi.number()),
        description: Joi.string(),
      })
    ),
    isAccessibleForFree: Joi.boolean(),
    publicAccess: Joi.boolean(),
    slogan: Joi.string(),
    ratingsAverage: Joi.number(),
    ratingsQuantity: Joi.number(),
  }),
};

const getTours = {
  query: Joi.object().keys({
    name: Joi.string(),
    ratingsAverage: Joi.string(),
    slug: Joi.string(),
    attraction: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTour = {
  params: Joi.object().keys({
    tourId: Joi.string().custom(objectId),
    slug: Joi.string(),
  }),
};

const updateTour = {
  params: Joi.object().keys({
    tourId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    altName: Joi.string(),
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
    summary: Joi.string(),
    description: Joi.string(),
    tours: Joi.object().keys({
      name: Joi.string(),
      images: Joi.array().items(Joi.string()),
      booking: Joi.string(),
    }),
    keywords: Joi.array().items(Joi.string()),
    attraction: Joi.string().custom(objectId),
    location: Joi.object().keys({
      description: Joi.string(),
      type: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number().precision(8)),
    }),
    openingHours: Joi.string(),
    highlightSpots: Joi.array().items(
      Joi.object().keys({
        type: Joi.string(),
        coordinates: Joi.array().items(Joi.number()),
        description: Joi.string,
      })
    ),
    isAccessibleForFree: Joi.boolean(),
    publicAccess: Joi.boolean(),
    slogan: Joi.string(),
    ratingsAverage: Joi.number(),
    ratingsQuantity: Joi.number(),
  }),
};

const deleteTour = {
  params: Joi.object().keys({
    tourId: Joi.string().custom(objectId),
  }),
};

module.exports = { createTour, getTours, getTour, updateTour, deleteTour };
