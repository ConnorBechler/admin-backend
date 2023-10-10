'use strict';
const { users } = require('../models');

// Define the migration
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    // Convert plain strings to string-versions of an array
    const usersToUpdate = await users.findAll({ paranoid: false });
    for (const user of usersToUpdate) {
      if (typeof user.roles == "string") {
        console.log(`updating user ${user.email}`);
        const updatedRoles = [user.roles];
        await user.update({ roles: updatedRoles });
      }
    }

    // Update the column type to JSON
    await queryInterface.changeColumn('users', 'roles', {
      type: DataTypes.JSON,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const usersToUpdate = await users.findAll({ paranoid: false });
    for (const user of usersToUpdate) {
      const updatedRoles = user.roles.join(',').split('"').join('') || null;
      await user.update({ roles: updatedRoles });
    }

    // Update the column type back to VARCHAR(200)
    await queryInterface.changeColumn('users', 'roles', {
      type: DataTypes.STRING(200),
      allowNull: false
    });
  }
};