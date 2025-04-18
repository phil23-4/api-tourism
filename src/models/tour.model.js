const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const tourSchema = Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less than or equal to 40 characters'],
      minlength: [10, 'A tour name must not be less than 10 characters'],
    },
    slug: String,
    category: String,
    duration: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: '{VALUE} is not supported! Difficulty is either: easy, medium, or hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mainImage: {
      url: String,
      publicId: String,
    },
    images: [{ url: String, publicId: String, _id: false }],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
      _id: false,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
        _id: false,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    attraction: { type: mongoose.Schema.ObjectId, ref: 'Attraction' },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// add plugin that converts mongoose to json
tourSchema.plugin(toJSON);
tourSchema.plugin(paginate);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate reviews for a tour
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* tourSchema.pre("save", async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

// QUERY MIDDLEWARE:
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// AGGREGATION MIDDLEWARE:
/* tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this);
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
