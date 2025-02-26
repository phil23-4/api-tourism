const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAttraction = {
  body: Joi.object().keys({
    attractionName: Joi.string(),
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
    keywords: Joi.array().items(Joi.string()),
    destination: Joi.string().custom(objectId),
    attractionLocation: Joi.object().keys({
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

const getAttractions = {
  query: Joi.object().keys({
    attractionName: Joi.string(),
    ratingsAverage: Joi.string(),
    slug: Joi.string(),
    destination: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAttraction = {
  params: Joi.object().keys({
    attractionId: Joi.string().custom(objectId),
    slug: Joi.string(),
  }),
};

const updateAttraction = {
  params: Joi.object().keys({
    attractionId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    attractionName: Joi.string(),
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
    destination: Joi.string().custom(objectId),
    attractionLocation: Joi.object().keys({
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

const deleteAttraction = {
  params: Joi.object().keys({
    attractionId: Joi.string().custom(objectId),
  }),
};

module.exports = { createAttraction, getAttractions, getAttraction, updateAttraction, deleteAttraction };
