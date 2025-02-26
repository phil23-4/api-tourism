const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { tourValidation } = require('../../validations');
const { tourController } = require('../../controllers');
const reviewRoute = require('./review.route');
const { multipleFiles } = require('../../utils/multer');

const router = express.Router({ mergeParams: true });

router.use('/:tourId/reviews', reviewRoute);

const {
  aliasTopTours,
  getTours,
  getTour,
  getTourBySlug,
  updateTour,
  deleteTour,
  getToursWithin,
  getTourDistances,
  tourMonthlyPlan,
  tourStats,
} = tourController;

router.use('/top-5', aliasTopTours, getTours);
router.use('/tour-stats', tourStats);
router.use('/monthly-plan/:year', tourMonthlyPlan);

router
  .route('/')
  .get(validate(tourValidation.getTours), getTours)
  .post(
    auth('manageTours'),
    validate(tourValidation.createTour),
    multipleFiles('tourism/tours', [
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    tourController.createTour
  );
router
  .route('/:tourId')
  .get(validate(tourValidation.getTour), getTour)
  .patch(
    auth('manageTours'),
    validate(tourValidation.updateTour),
    multipleFiles('tourism/tours', [
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    updateTour
  )
  .delete(auth('manageTours'), validate(tourValidation.deleteTour), deleteTour);

router.get('/tour/:slug', validate(tourValidation.getTourBySlug), getTourBySlug);
router.route('/tours-within/:distance/center/:latLng/unit/:unit').get(getToursWithin);
router.route('/distances/:latLng/unit/:unit').get(getTourDistances);
