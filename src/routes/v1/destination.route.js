const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { destinationValidation } = require('../../validations');
const { destinationController } = require('../../controllers');
const { singleFile } = require('../../utils/multer');
const sharp = require('../../utils/sharp');

const router = express.Router();

const {
  createDestination,
  getDestinations,
  getDestination,
  updateDestination,
  deleteDestination,
  getDestinationsWithin,
  getDestinationDistances,
} = destinationController;

router
  .route('/')
  .post(
    auth('manageDestinations'),
    validate(destinationValidation.createDestination),
    singleFile('cover'),
    sharp.resizeCoverPhoto,
    createDestination
  )
  .get(validate(destinationValidation.getDestinations), getDestinations);

router
  .route('/:destinationId')
  .get(validate(destinationValidation.getDestination), getDestination)
  .patch(
    auth('manageDestinations'),
    validate(destinationValidation.updateDestination),
    singleFile('cover'),
    sharp.resizeCoverPhoto,
    updateDestination
  )
  .delete(auth('manageDestinations'), validate(destinationValidation.deleteDestination), deleteDestination);

router.route('/destinations-within/:distance/center/:latLng/unit/:unit').get(getDestinationsWithin);

router.route('/distances/:latLng/unit/:unit').get(getDestinationDistances);
module.exports = router;
