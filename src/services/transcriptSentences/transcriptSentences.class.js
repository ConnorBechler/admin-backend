const { Service } = require('feathers-sequelize');

exports.TranscriptSentences = class TranscriptSentences extends Service {
  setup(app) {
    this.app = app;
  }

  async find(params) {
    const resp = await super.find({ query: { transcriptionId: params.query.transcriptionId }});
    resp.data = resp.data.sort((a,b) => { return a.startTime - b.startTime; });
    return resp;
  }
};
