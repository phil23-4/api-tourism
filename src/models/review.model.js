/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('./tour.model');

const { Schema } = mongoose;
// Plugins
const { toJSON, paginate } = require('./plugins');

const reviewSchema = Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      required: [true, 'Rating cannot be empty!'],
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour'],
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// QUERY MIDDLEWARE:
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findByIdAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'fullName photo' });
  next();
});

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.attraction);
});

reviewSchema.post(/^findByIdAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.rev.constructor.calcAverageRatings(this.rev.attraction);
});

/**
 * @typedef Review
 */
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
