const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const destinationSchema = Schema(
  {
    name: {
      type: String,
      required: [true, 'A destination must have a name'],
      trim: true,
      unique: true,
    },
    cover: {
      url: String,
      publicId: String,
    },
    slug: String,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A destination must have a summary'],
    },
    description: String,
    keywords: [String],
    location: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: [true, 'A destination must have a location'],
      },
      coordinates: [Number],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
destinationSchema.plugin(toJSON);
destinationSchema.plugin(paginate);

destinationSchema.index({ slug: 1 });
destinationSchema.index({ location: '2dsphere' });

// Virtual populate
destinationSchema.virtual('includesAttraction', {
  ref: 'Attraction',
  foreignField: 'destination',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() !.update()
destinationSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/**
 * @typedef Destination
 */
const Destination = mongoose.model('Destination', destinationSchema);
module.exports = Destination;
