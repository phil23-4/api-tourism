const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const attractionSchema = Schema(
  {
    attractionName: {
      type: String,
      unique: true,
      required: true,
    },
    altName: {
      type: String,
    },
    category: String,
    slug: String,
    mainImage: {
      url: String,
      publicId: String,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    destination: {
      type: mongoose.Schema.ObjectId,
      ref: 'Destination',
    },
    attractionLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      name: String,
      address: String,
    },
    openingHours: String,
    highlightSpots: [
      {
        name: String,
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        images: [
          {
            url: String,
            publicId: String,
          },
        ],
        description: String,
      },
    ],
    isAccessibleForFree: {
      type: Boolean,
      default: false,
    },
    publicAccess: { type: Boolean, default: true },
    slogan: String,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
attractionSchema.plugin(toJSON);
attractionSchema.plugin(paginate);

attractionSchema.index({ attractionName: 1, destination: 1, review: 1 }, { unique: true });
attractionSchema.index({ slug: 1 });
attractionSchema.index({ attractionLocation: '2dsphere' });

// Virtual populate
attractionSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'attraction',
  localField: '_id',
});

attractionSchema.virtual('tours', {
  ref: 'Tour',
  foreignField: 'attraction',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() !.update()
attractionSchema.pre('save', function (next) {
  this.slug = slugify(this.attractionName, { lower: true });
  next();
});

// QUERY MIDDLEWARE:
attractionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'destination',
    select: 'name',
  });
  next();
});
/**
 * @typedef Attraction
 */
const Attraction = mongoose.model('Attraction', attractionSchema);
module.exports = Attraction;
