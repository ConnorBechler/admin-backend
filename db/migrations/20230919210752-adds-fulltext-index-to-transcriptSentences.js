'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addIndex('transcriptSentences',
        {
          type: 'FULLTEXT',
          name: 'content',
          fields: ['content'],
        }
      )
      .then(() => { console.log('added content fulltext index'); })
      .catch((err) => { throw err; })
      .then(() => {
        return Promise.resolve();
      })
      .catch(async (err) => {
        console.log('failed, rolling back');
        await module.exports.down(queryInterface, Sequelize);
        throw err;
      })


    } catch (err) {
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('transcriptSentences', 'content')
      .then(() => {console.log('removed transcriptSentences content fulltext index')})
      .catch((err) => {throw err});
  }
};
