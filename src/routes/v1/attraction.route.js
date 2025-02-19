const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { attractionValidation } = require('../../validations');
const { attractionController } = require('../../controllers');
// const reviewRoute = require('./review.route');
// const activityRoute = require('./activity.route');
const { multipleFiles } = require('../../utils/multer');

const router = express.Router();

const {
  aliasTopAttractions,
  createAttraction,
  getAttractions,
  getAttraction,
  getAttractionBySlug,
  updateAttraction,
  deleteAttraction,
  getAttractionsWithin,
  getAttractionDistances,
  attractionStats,
} = attractionController;

// router.use('/:attractionId/reviews', reviewRoute);
// router.use('/:attractionId/activities', activityRoute);

router.use('/top-5', aliasTopAttractions, getAttractions);
router.use('/attraction-stats', attractionStats);

router
  .route('/')
  .post(
    auth('manageAttractions'),
    validate(attractionValidation.createAttraction),
    multipleFiles(),
    // sharp.resizeAttractionImages,
    createAttraction
  )
  .get(validate(attractionValidation.getAttractions), getAttractions);

router
  .route('/:attractionId')
  .get(validate(attractionValidation.getAttraction), getAttraction)
  .patch(
    auth('manageAttractions'),
    validate(attractionValidation.updateAttraction),
    multipleFiles(),
    // sharp.resizeAttractionImages,
    updateAttraction
  )
  .delete(auth('manageAttractions'), validate(attractionValidation.deleteAttraction), deleteAttraction);

router.get('/attraction/:slug', validate(attractionValidation.getAttraction), getAttractionBySlug);
router.route('/attractions-within/:distance/center/:latLng/unit/:unit').get(getAttractionsWithin);

router.route('/distances/:latLng/unit/:unit').get(getAttractionDistances);
module.exports = router;
