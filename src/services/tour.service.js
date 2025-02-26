const { Tour } = require('../models');

/**
 * Retrieves tour statistics based on certain criteria.
 *
 * This function aggregates tour data to calculate statistics such as the number of tours,
 * average rating, average price, minimum price, and maximum price for tours with a rating
 * of 4.5 or higher. The results are grouped by the difficulty level of the tours and sorted
 * by average price in descending order.
 *
 * @async
 * @function getTourStats
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing
 * the aggregated tour statistics.
 */
const getTourStats = async () => {
  const stats = await Tour.aggregate([
    {
      $match: {
        rating: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        averageRating: {
          $avg: '$rating',
        },
        averagePrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        averagePrice: -1,
      },
    },
  ]);
  return stats;
};

/**
 * Retrieves the monthly plan for tours within a specified year.
 *
 * This function aggregates tour data to calculate the number of tour starts per month
 * and lists the names of the tours starting in each month. The results are sorted
 * by the number of tour starts in descending order and limited to the top 12 months.
 *
 * @param {number} year - The year for which to retrieve the monthly plan.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects,
 * each representing a month with the number of tour starts and the names of the tours.
 */
const getMonthlyPlan = async (year) => {
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    { $addFields: { month: '$_id' } },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numToursStarts: -1 } },
    { $limit: 12 },
  ]);
  return plan;
};

module.exports = { getTourStats, getMonthlyPlan };
