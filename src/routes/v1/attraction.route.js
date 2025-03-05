/**
 * @fileoverview Routes for attraction-related endpoints
 * @module routes/v1/attraction
 * @requires express
 * @requires ../../middlewares/auth
 * @requires ../../middlewares/validate
 * @requires ../../validations
 * @requires ../../controllers
 * @requires ./review.route
 * @requires ./tour.route
 * @requires ../../utils/multer
 */

/**
 * Express router to mount attraction related functions on.
 * @type {object}
 * @const
 * @namespace attractionRouter
 */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { attractionValidation } = require('../../validations');
const { attractionController } = require('../../controllers');
const reviewRoute = require('./review.route');
const tourRoute = require('./tour.route');
const { multipleFiles } = require('../../utils/multer');

const router = express.Router();

router.use('/reviews', reviewRoute);
router.use('/:attractionId/review', reviewRoute);
router.use('/tours', tourRoute);
router.use('/:attractionId/tours', tourRoute);

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
  getAttractionCategories,
} = attractionController;

router.use('/top-5', aliasTopAttractions, getAttractions);
router.use('/attraction-stats', attractionStats);

/**
 * @api {get} /v1/attractions/categories Get all attraction categories
 * @apiDescription Get a list of all unique attraction categories
 * @apiPermission public
 * @apiParam none
 * @apiSuccess {String[]} categories List of unique attraction categories
 */
router.route('/categories').get(getAttractionCategories);

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
