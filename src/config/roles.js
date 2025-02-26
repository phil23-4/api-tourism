const allRoles = {
  user: ['viewAttractions', 'createReview', 'manageReviews', 'deleteReview', 'manageUser'],
  admin: [
    'getUsers',
    'manageUser',
    'createReview',
    'manageUsers',
    'manageDestinations',
    'manageAttractions',
    'manageReviews',
    'manageTours',
    'manageBookings',
  ],
  guide: ['viewAttractions', 'createReview', 'manageUser', 'manageTours'],
  leadGuide: ['viewAttractions', 'createReview', 'manageUser', 'manageTours', 'manageGuides'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
