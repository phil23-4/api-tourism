const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { attractionValidation } = require('../../validations');
const { attractionController } = require('../../controllers');
const reviewRoute = require('./review.route');
const { multipleFiles } = require('../../utils/multer');

const router = express.Router();

router.use('/reviews', reviewRoute);
router.use('/:attractionId/review', reviewRoute);

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

router.use('/top-5', aliasTopAttractions, getAttractions);
router.use('/attraction-stats', attractionStats);

router
  .route('/')
  .post(
    auth('manageAttractions'),
    validate(attractionValidation.createAttraction),
    multipleFiles('tourism/attractions', [
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    createAttraction
  )
  .get(validate(attractionValidation.getAttractions), getAttractions);

router
  .route('/:attractionId')
  .get(validate(attractionValidation.getAttraction), getAttraction)
  .patch(
    auth('manageAttractions'),
    validate(attractionValidation.updateAttraction),
    multipleFiles('tourism/attractions', [
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    updateAttraction
  )
  .delete(auth('manageAttractions'), validate(attractionValidation.deleteAttraction), deleteAttraction);

router.get('/attraction/:slug', validate(attractionValidation.getAttraction), getAttractionBySlug);
router.route('/attractions-within/:distance/center/:latLng/unit/:unit').get(getAttractionsWithin);

router.route('/distances/:latLng/unit/:unit').get(getAttractionDistances);
module.exports = router;
