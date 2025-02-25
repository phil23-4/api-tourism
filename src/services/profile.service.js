// Utils
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const factoryService = require('./factory.service');
// Model
const { Profile } = require('../models');

/**
 * @desc    Create New Profile
 * @param   { Object } user - An object contains logged in user data
 * @param   { Object } body - Body object data
 * @returns { Promise<profile> }
 */
const createProfile = async (docBody) => {
  const checkUser = await Profile.find({ user: docBody.user });
  // 1) Check if the user has already created a profile
  if (checkUser.length !== 0)
    throw new ApiError(httpStatus.FORBIDDEN, `You've already created your Profile! Use update instead.`);
  const doc = await Profile.create(docBody);
  return doc;
};
/**
 * Update Profile by id
 * @param {ObjectId} profileId
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const updateProfileById = async (profileId, updateBody) => {
  const profile = await factoryService.getOne(Profile, profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  if (updateBody.email && (await Profile.isEmailTaken(updateBody.email, profileId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(profile, updateBody);
  await profile.save();
  return profile;
};
module.exports = { createProfile, updateProfileById };
