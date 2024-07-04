const fs = require('fs').promises;

const runner = async (req, res, next) => {
  if (res.data.fileContents) {
    res.setHeader('X-FileName', res.data.filename);
    res.attachment(res.data.filename);
    res.send(res.data.fileContents);
  } else {
    await fs.readFile(`${res.data.file}`)
      .then(file => {
        res.setHeader('X-FileName', res.data.filename);
        res.attachment(res.data.filename);
        res.send(file);
      });
  }
}

module.exports = runner;
