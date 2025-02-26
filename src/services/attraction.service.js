const { Attraction } = require('../models');

/**
 * Retrieves statistics for attractions with an average rating of 4.5 or higher.
 * Create an Aggregation pipeline which calculates attraction statistics
 *
 * The statistics include:
 * - Number of attractions
 * - Number of tours
 * - Number of ratings
 * - Average rating
 * - Destination name
 *
 * The results are sorted by average rating in ascending order.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing attraction statistics.
 */
const getAttractionStats = async () => {
  const stats = Attraction.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: '$destination',
        'Number of attractions': {
          $sum: 1,
        },
        'Number of tours': {
          $sum: '$tours',
        },
        'Number of Ratings': {
          $sum: '$ratingsQuantity',
        },
        'Average Rating': {
          $avg: '$ratingsAverage',
        },
      },
    },
    {
      $lookup: {
        from: 'destinations',
        localField: '_id',
        foreignField: '_id',
        as: 'Destination',
      },
    },
    {
      $unwind: {
        path: '$Destination',
      },
    },
    {
      $project: {
        _id: 0,
        'Number of attractions': 1,
        'Number of Ratings': 1,
        'Number of tours': 1,
        'Average Rating': 1,
        Destination: {
          name: 1,
        },
      },
    },
    {
      $sort: {
        'Average Rating': 1,
      },
    },
  ]);
  return stats;
};

module.exports = { getAttractionStats };
