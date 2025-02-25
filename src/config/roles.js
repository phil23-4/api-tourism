const allRoles = {
  user: ['viewAttractions', 'createReview', 'manageUser'],
  admin: [
    'getUsers',
    'manageUser',
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
