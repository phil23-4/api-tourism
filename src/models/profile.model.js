const mongoose = require('mongoose');
const toJSON = require('./plugins');

const profileSchema = new mongoose.Schema(
  {
    personal_info: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      age: { type: Number },
    },
    contact_details: {
      phone: {
        mobile: { type: String },
        work: { type: String },
      },
      email: {
        personal: { type: String },
        work: { type: String },
      },
      social_media: {
        x: String,
        linkedin: String,
      },
      emergency_contact: [
        {
          name: String,
          relationship: String,
          phone: String,
        },
      ],
    },
    // preferences: {},
    // metadata: {},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
profileSchema.plugin(toJSON);

/**
 * @typedef Profile
 */
const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
