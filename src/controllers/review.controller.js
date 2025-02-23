const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Review } = require('../models');
const { factoryService } = require('../services');

// const setTourAttractionUserIds = (req, res, next) => {
//   if (!req.body.tour && !req.body.attraction) {
//     return res.status(httpStatus.BAD_REQUEST).json({
//       status: 'fail',
//       message: 'Please specify either a tour or attraction',
//     });
//   }

//   if (req.params.tourId) req.body.tour = req.params.tourId;
//   if (req.params.attractionId) req.body.attraction = req.params.attractionId;
//   req.body.user = req.user.id;
//   next();
// };

const createReview = catchAsync(async (req, res) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.params.attractionId) req.body.attraction = req.params.attractionId;
  req.body.user = req.user.id;
  if (!req.body.tour && !req.body.attraction) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'fail',
      message: 'Please specify either a tour or attraction',
    });
  }

  const user = req.user.id;
  const checkUser = await Review.find({ user, attraction: req.body.attraction });
  // 1) Check if the user has already created a review
  if (checkUser.length !== 0) throw new ApiError(httpStatus.FORBIDDEN, `Review already exists! Use update instead.`);
  const newReview = await factoryService.createOne(Review, req.body);
  res.status(httpStatus.CREATED).json({ status: 'success', newReview });
  //   console.log(req.body);
});

module.exports = { createReview };
