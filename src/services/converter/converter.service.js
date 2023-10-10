const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { parseAsync } = require('json2csv');
const jszip = require('jszip');

exports.getMetadata = async (app, id, serviceName) => {
  const documentService = app.service('documents');
  const docParentService = app.service(serviceName);
  const { id: docId, fileext, parentId } = await documentService.get(id);
  const docParent = await docParentService.get(parentId);
  return new Promise(async (resolve, reject) => {
    await ffmpeg.ffprobe(app.get('uploads') + '/' + docId + '.' + fileext, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      delete metadata.format.filename;
      docParentService.patch(docParent.id, {
        metadata: { ...docParent.metadata, duration: metadata.format.duration }
      });
      documentService.patch(docId, { metadata })
        .then(() => {
          return resolve(metadata);
        })
        .catch((err) => {
          console.log('error creating metadata for', docId);
          return reject(err);
        });
    });
  });
}

exports.audio = async (req, res, next) => {
  const destination = res.app.get('uploads');
  const newid = uuidv4();

  const defaults = {
    to: 'mp3',
    channels: 1,
    raw: false,
    redact: false,
    transcriptionId: null
  };
  const options = { ...defaults, ...req.query, ...req.body };
  options.channels = options.channels * 1;
  options.redact = options.redact !== 'false';
  options.raw = options.raw !== 'false';
  const outputFileName = `${newid}${options.redact ? '-redacted' : ''}.${options.to}`;
  const diary = await res.app.service('diaries').get(res.data.parentId);
  const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';

  let runner = ffmpeg(destination + '/' + res.data.id + '.' + res.data.fileext);
  try {
    if (options.to == 'wav' && !options.redact) {
      res.setHeader('X-FileName', options.raw ? res.data.id + '.wav' : sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + (options.redact ? '-redacted.' : '.') + options.to);
      res.download(destination + '/wav/' + res.data.id + '.wav', res.data.id + '.wav');
    }
    else {
      if (options.redact && options.transcriptionId) {
        const transcriptSentences = await res.app.service('transcriptSentences').find({
          query: {
            transcriptionId: options.transcriptionId,
            'metadata.redact': 'true'
          }
        });
        const redactedSentences = transcriptSentences.data.filter(ts => ts.metadata.redact);
        for (const redactedSentence of redactedSentences) {
          runner = runner.audioFilters(`volume=0:enable='between(t,${redactedSentence.startTime},${redactedSentence.endTime})'`);
        }
      }
      runner = runner.withAudioChannels(options.channels);
      if (options.to == 'mp3') {
        runner = runner
          .withAudioCodec('libmp3lame')
          .withAudioBitrate('192k');
      }
      return runner
        .on('end', function() {
          const outFile = destination + '/' + outputFileName;
          res.setHeader('X-FileName', sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + (options.redact ? '-redacted.' : '.') + options.to);
          res.download(outFile, outputFileName, (err) => {
            if (!err) {
              setTimeout(() => {
                removeFile(destination, outputFileName);
              }, 1000);
            }
          });
        })
        .on('error', (err) => {
          console.log('Error converting to', options.to);
          throw err;
        })
        .save(destination + '/' + outputFileName);
    }
  }
  catch (err) {
    console.log(err);
  }
}

exports.saveStreamCopy = async (app, id) => {
  const destination = app.get('uploads');
  const documentService = app.service('documents');
  const { id: docId, fileext, parentId } = await documentService.get(id);

  const outputFileName = docId + '.mp3';

  let runner = ffmpeg(destination + '/' + docId + '.' + fileext);
  try {
    return runner
      .withAudioChannels(1)
      .withAudioCodec('libmp3lame')
      .withAudioBitrate('192k')
      .on('error', (err) => {
        console.log('Error converting to stream copy mp3');
        throw err;
      })
      .save(`${destination}/stream/${id}.mp3`);
  }
  catch (err) {
    console.log(err);
  }
}

exports.saveWavCopy = async (app, destination, id, fileName) => {
  console.log('converting...');
  return new Promise(async (resolve, reject) => {
    return ffmpeg(destination + '/' + fileName)
      .withAudioChannels(1)
      .on('end', function() {
        resolve(1);
      })
      .on('error', () => {
        reject('what');
      })
      .save(`${destination}/wav/${id}.wav`);
  });
}

const removeFile = async (destination, fileName) => {
  console.log('removing local temp file...');
  try {
    fs.unlink(destination + '/' + fileName, () => {});
  }
  catch {(err) => { console.log('couldn\'t remove temp') }}
};

const createSentenceObjects = (sid, options, sentences) => {
  return sentences.map((s) => {
    s.startTime = (parseFloat(s.startTime) + parseFloat('0.01')).toFixed(2);
    s.endTime = parseFloat(s.endTime).toFixed(2);
    s.metadata.header2 = s.metadata.speaker === 1 ? sid : 'Other';
    s.content = s.metadata.redact && options.redact ? '[REDACTED]' : s.content;
    return s;
  });
}

exports.text = async (req, res, next) => {
  const type = req.params.type;
  const data = res.data;
  const options = req.query;
  options.header = (options.header != "false");
  options.redact = (options.redact != "false");
  const doc = await res.app.service('documents').get(data.documentId);
  const diary = await res.app.service('diaries').get(doc.parentId);
  const { data: sentences } = await res.app.service('transcriptSentences').find({ query: { transcriptionId: data.id }});
  const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';
  const tsSentences = createSentenceObjects(sid, options, sentences);
  const filename = sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + (options.redact ? '-redacted' : '');

  try {
    parseAsync(tsSentences, options)
      .then((ret) => {
        if (type === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
        }
        res.setHeader('X-FileName', `${filename}.${type === 'tsv' ? 'txt' : 'csv'}`);
        res.attachment(`${filename}.${type === 'tsv' ? 'txt' : 'csv'}`);
        res.send(ret);
      })
      .catch((err) => { throw err });
  }
  catch (err) {
    console.log(err)
  }
}

const createTextGridHeader = (sid, data, speakerCount = 1) => {
  const ret = [];
  ret.push('File type = "ooTextFile"\n');
  ret.push('Object class = "TextGrid"\n');
  ret.push('\n');
  ret.push(`xmin = ${data[0].startTime}\n`);
  ret.push(`xmax = ${data[data.length - 1].endTime}\n`);
  ret.push('tiers? <exists>\n');
  ret.push(`size = ${speakerCount}\n`);
  ret.push('item []:\n');
  return ret;
}

const createTextGridIntervalHeader = (ret, idx, name, data) => {
  ret.push(`  item[${idx + 1}]\n`);
  ret.push('    class = "IntervalTier"\n');
  ret.push(`    name = "${name}"\n`);
  ret.push(`    xmin = ${data[0].startTime}\n`);
  ret.push(`    xmax = ${data[data.length - 1].endTime}\n`);
  ret.push(`    intervals: size = ${data.length}\n`);
  return ret;
}

const createTextGridInterval = (ret, idx, data) => {
  ret.push(`    intervals [${idx + 1}]\n`);
  ret.push(`      xmin = ${data.startTime}\n`);
  ret.push(`      xmax = ${data.endTime}\n`);
  ret.push(`      text = "${data.content.replace(/"/g, '\'')}"\n`);
  return ret;
}

const splitSpeakers = (speakerNumbers, sentences) => {
  const ret = [];
  speakerNumbers.forEach(sp => {
    ret.push(sentences.filter(s => s.metadata.speaker == sp));
  });
  return ret;
}

exports.textgrid = async (req, res, next) => {
  const type = req.params.type;
  const data = res.data;
  const options = req.query;
  options.redact = (options.redact != "false");
  options.raw = (options.raw != "false");
  const transcription = await res.app.service('transcriptions').get(data.id);
  const doc = await res.app.service('documents').get(transcription.documentId);
  const diary = await res.app.service('diaries').get(doc.parentId);
  const { data: sentences } = await res.app.service('transcriptSentences').find({ query: { transcriptionId: transcription.id }});
  const sid = diary.profile.subject ? diary.profile.subject.shortcode : 'NOSID';
  const tsSentences = createSentenceObjects(sid, options, sentences);
  let filename = options.raw ? transcription.documentId + (options.redact ? '-redacted' : '') : (sid + '_' + (diary.metadata.diaryDate || new Date(new Date(diary.createdAt).getTime() - new Date(diary.createdAt).getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10)) + '_' + (diary.metadata.sequence.toString().padStart(2, 0) || '00') + '_rev' + transcription.revision + (options.redact ? '-redacted' : ''));
  filename = transcription.edited ? `${filename}-corrected` : filename;
  const speakerNumbers = [...new Set(tsSentences.map(s => s.metadata.speaker))];

  const ret = createTextGridHeader(sid, tsSentences, speakerNumbers.length);

  const speakers = [];
  speakerNumbers.forEach(sn => {
    speakers.push(tsSentences.filter(s => s.metadata.speaker == sn));
  });

  speakers.forEach((sp, idx) => {
    createTextGridIntervalHeader(ret, idx, idx == 0 ? sid : `${sid}-${idx + 1}`, sp);
    sp.forEach((s, idx) => {
      createTextGridInterval(ret, idx, s);
    });
  });

  const zip = new jszip();
  zip.file(`${filename}.textgrid`, ret.join(''));
  zip.file(`${filename}.wav`, fs.readFileSync(`${res.app.get('uploads')}/wav/${doc.id}.wav`));
  zip.generateAsync({type: 'nodebuffer'})
    .then(function(content) {
      res.setHeader('X-FileName', `${filename}.zip`);
      res.attachment(`${filename}.zip`);
      res.send(content)
    }.bind(res));
}