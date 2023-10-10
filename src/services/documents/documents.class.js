const { Service } = require('feathers-sequelize');

exports.Documents = class Documents extends Service {
  setup(app) {
    this.app = app;
  }

  async create(data, params) {
    const diaryService = this.app.service('diaries');
    const ret = {};
    const created = [];
    let diary = {};
    if (!data.parentId) {
      data.metadata = (data.metadata) ? data.metadata : {};
      data.metadata.diaryDate = (data.diaryDate) ? data.diaryDate : new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substr(0,10);
      diary = await diaryService.create(data);
    }
    if (params.files && (data.parentId || diary.id)) {
      for (let file of params.files) {
        var clone = {};
        clone.parentId = data.parentId || diary.id;
        clone.originalname = file.originalname;
        clone.mimetype = file.mimetype;
        clone.size = file.size;
        if (clone.description === '') {
          clone.description = clone.originalname;
        }
        clone.id = file.filename.split('.')[0];
        clone.fileext = file.filename.split('.')[1];
        const rec = await super.create(clone, params);
        created.push(rec);
      }
    }
    if (diary.id) {
      ret.diaryId = diary.id;
      ret.files = created;
      ret.message = 'success';
    } else {
      ret.parentId = data.parentId;
      ret.files = created;
      ret.message = 'success';
    }
    return ret;
  }
};
