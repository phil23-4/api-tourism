const mongoose = require('mongoose');

const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const profileSchema = Schema(
  {
    personal_info: {
      firstName: String,
      lastName: String,
      age: Number,
    },
    photo: {
      url: String,
      publicId: String,
    },
    contact_details: {
      phone: {
        mobile: String,
        work: String,
      },
      email: {
        personal: String,
        work: String,
      },
      social_media: {
        x: String,
        linkedin: String,
      },
    },
    emergency_contacts: [
      {
        name: String,
        relationship: String,
        phone: String,
        notes: String,
      },
    ],
    profile_status: { type: Boolean, default: true, select: false },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: [true, 'Profile must belong to a user.'], unique: true },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
profileSchema.plugin(toJSON);
profileSchema.plugin(paginate);

// QUERY MIDDLEWARE:
profileSchema.pre(/^find/, function (next) {
  //  this points to the current query
  this.find({ profile_status: { $ne: false } });
  this.start = Date.now();
  next();
});
/**
 * @typedef Profile
 */
const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
