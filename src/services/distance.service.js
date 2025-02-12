const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Query for destinations within a certain radius
 * @param {Object} destinationParams
 * @returns {Promise<Model>}
 */
const getPlacesWithin = async (Model, destinationParams) => {
  // "/places-within/233/center/34.111745,-118.113491/unit/mi",
  const { distance, latLng, unit } = destinationParams;
  const [lat, lng] = latLng.split(',');

  if (!lat || !lng) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide latitude and longitude in the format lat, lng');
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const places = await Model.find({
    destinationLocation: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });
  return places;
};

const getDistances = async (Model, destinationParams) => {
  // "/distances/34.111745,-118.113491/unit/mi",
  const { latLng, unit } = destinationParams;
  const [lat, lng] = latLng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide latitude and longitude in the format lat, lng');
  }

  const distances = await Model.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lat * 1, lng * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  return distances;
};

module.exports = {
  getPlacesWithin,
  getDistances,
};
