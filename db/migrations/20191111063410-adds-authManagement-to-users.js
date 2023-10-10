'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    try {
      await queryInterface.describeTable('users')
        .then(async (attributes) => {
          if (!attributes.isVerified) {
            await queryInterface.addColumn('users', 'isVerified', {
              type: DataTypes.BOOLEAN,
              defaultValue: false,
              allowNull: false,
              after: 'hidden'
            }).then(() => {console.log('added column isVerified');});
          }
          if (!attributes.verifyToken) {
            await queryInterface.addColumn('users', 'verifyToken', {
              type: DataTypes.STRING(200),
              allowNull: true,
              after: 'isVerified'
            }).then(() => {console.log('added column verifyToken');});
          }
          if (!attributes.resetToken) {
            await queryInterface.addColumn('users', 'resetToken', {
              type: DataTypes.STRING(200),
              allowNull: true,
              after: 'verifyToken'
            }).then(() => {console.log('added column resetToken');});
          }
          if (!attributes.verifyShortToken) {
            await queryInterface.addColumn('users', 'verifyShortToken', {
              type: DataTypes.STRING(200),
              allowNull: true,
              after: 'resetToken'
            }).then(() => {console.log('added column verifyShortToken');});
          }
          if (!attributes.resetShortToken) {
            await queryInterface.addColumn('users', 'resetShortToken', {
              type: DataTypes.STRING(200),
              allowNull: true,
              after: 'verifyShortToken'
            }).then(() => {console.log('added column resetShortToken');});
          }
          if (!attributes.verifyExpires) {
            await queryInterface.addColumn('users', 'verifyExpires', {
              type: DataTypes.DATE,
              allowNull: true,
              after: 'resetShortToken'
            }).then(() => {console.log('added column verifyExpires');});
          }
          if (!attributes.resetExpires) {
            await queryInterface.addColumn('users', 'resetExpires', {
              type: DataTypes.DATE,
              allowNull: true,
              after: 'verifyExpires'
            }).then(() => {console.log('added column resetExpires');});
          }
        })
        .catch(async (err) => {
          console.log('failed, rolling back');
          await module.exports.down(queryInterface, Sequelize);
          throw err;
        });


    } catch (err) {
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.describeTable('users')
      .then(async (attributes) => {
        if (attributes.resetExpires) {
          await queryInterface.removeColumn('users', 'resetExpires')
          .then(() => {console.log('removed column resetExpires');});
        }
        if (attributes.verifyExpires) {
          await queryInterface.removeColumn('users', 'verifyExpires')
          .then(() => {console.log('removed column verifyExpires');});
        }
        if (attributes.resetShortToken) {
          await queryInterface.removeColumn('users', 'resetShortToken')
          .then(() => {console.log('removed column resetShortToken');});
        }
        if (attributes.verifyShortToken) {
          await queryInterface.removeColumn('users', 'verifyShortToken')
          .then(() => {console.log('removed column verifyShortToken');});
        }
        if (attributes.resetToken) {
          await queryInterface.removeColumn('users', 'resetToken')
          .then(() => {console.log('removed column resetToken');});
        }
        if (attributes.verifyToken) {
          await queryInterface.removeColumn('users', 'verifyToken')
          .then(() => {console.log('removed column verifyToken');});
        }
        if (attributes.isVerified) {
          await queryInterface.removeColumn('users', 'isVerified')
          .then(() => {console.log('removed column isVerified');});
        }
      })
  }
};
