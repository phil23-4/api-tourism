const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProfile = {
  body: Joi.object().keys({
    personal_info: {
      firstName: Joi.string(),
      lastName: Joi.string(),
      age: Joi.number(),
    },
    photo: Joi.object().keys({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
    contact_details: {
      phone: {
        mobile: Joi.string(),
        work: Joi.string(),
      },
      email: {
        personal: Joi.string(),
        work: Joi.string(),
      },
      social_media: {
        x: Joi.string(),
        linkedin: Joi.string(),
      },
      emergency_contact: [{ name: Joi.string(), relationship: Joi.string(), phone: Joi.string() }],
    },
    account_status: Joi.string().valid('active', 'disabled'),
    user: Joi.string().custom(objectId),
  }),
};
const getProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};
const updateProfile = {
  params: Joi.object().keys({
    profileId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    personal_info: {
      firstName: Joi.string(),
      lastName: Joi.string(),
      age: Joi.number(),
    },
    photo: Joi.object().keys({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
    contact_details: {
      phone: {
        mobile: Joi.string(),
        work: Joi.string(),
      },
      email: {
        personal: Joi.string(),
        work: Joi.string(),
      },
      social_media: {
        x: Joi.string(),
        linkedin: Joi.string(),
      },
      emergency_contact: [{ name: Joi.string(), relationship: Joi.string(), phone: Joi.string() }],
    },
  }),
};

const deleteProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

module.exports = { createProfile, getProfile, updateProfile, deleteProfile };
