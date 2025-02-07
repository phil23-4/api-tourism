const allRoles = {
  user: ['manageUser'],
  admin: ['getUsers', 'manageUser', 'manageUsers'],
  guide: ['manageUser'],
  leadGuide: ['manageUser'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
