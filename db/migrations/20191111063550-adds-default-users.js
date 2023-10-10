'use strict';
const { users } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await users.create({
        first: 'SYSTEM',
        last: 'SYSTEM',
        email: 'system@elc.msu.edu',
        roles: ["system"],
        active: true,
        hidden: true
      })
      .then((user) => {console.log('added user -', user.email, user.id)})
      .catch((err) => {throw err});

      await users.create({
        first: 'Setup',
        last: 'User',
        email: 'setup@this.app',
        password: '$2a$10$liCzzcWeqLjL6HNe39WSq.gI3TotNazaz3txQDWKclj6nwXpmnv4a',
        roles: ["admin"],
        isVerified: true,
        active: true,
        hidden: false,
      })
      .then((user) => {
        console.log('added user -', user.email, user.id);
        console.log(`IMPORTANT: added initial setup user: setup@this.app - password: 'ChangeMePlease!'`);
      })
      .catch((err) => {throw err});

      return Promise.resolve();
    }
    catch (err) {
      console.log('failed, rolling back');
      await module.exports.down(queryInterface, Sequelize);
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await users.findOne({where: {email: 'wernerru@msu.edu'}, force: true})
      .then(async (user) => {
        await users.destroy({where: {id: user.id}, force: true});
        console.log('removed user - ', user.email);
      })
      .catch(() => {});
    await users.destroy({where: {email: 'system@elc.msu.edu'}, force: true})
      .then((user) => {console.log('removed user - system@elc.msu.edu')})
      .catch((err) => {throw err});
  }
};
