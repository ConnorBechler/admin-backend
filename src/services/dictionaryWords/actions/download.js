const { parseAsync } = require('json2csv');
const { correctedDateTime } = require('../../../hooks/helpers');

const runner = async (req, res, next) => {
  console.log()
  const options = {
    header: false,
    fields: [
      {
        label: 'word',
        value: 'word'
      },
      {
        label: 'phonemes',
        value: 'phonemes'
      },
    ],
    delimiter: '  ',
    quote: '',
    eol: ' \n',
  };

  const filename = correctedDateTime().toISOString().substr(0, 10) + '_dict.txt';

  try {
    parseAsync(res.data, options)
      .then((ret) => {
        res.setHeader('X-FileName', filename);
        res.attachment(filename);
        res.send(ret);
      })
      .catch((err) => { throw err });
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = runner;