const fastCsv = require('fast-csv');
const fs = require('fs');
const { Forbidden, BadRequest } = require('@feathersjs/errors');
const { correctedDateTime } = require('../../../hooks/helpers');

const runner = async (app, { audioDocId, textDocId }) => {
  const destination = app.get('uploads');
  const DocumentService = app.service('documents');
  const TranscriptionService = app.service('transcriptions');
  const SentenceService = app.service('transcriptSentences');
  const csvOptions = {
    objectMode: true,
    delimiter: "\t",
    quote: null,
    headers: true,
    renameHeaders: false,
  };
  const lineToSentenceObject = line => {
    return {
      startTime: line.Chunk_Start,
      endTime: line.Chunk_End,
      content: line.Chunk,
      metadata: {
        speaker: line.Speaker.trim()==="" ? line.Speaker : isNaN(+line.Speaker) ? line.Speaker : +line.Speaker,
        header2: line.Header2,
      },
    }
  };

  return new Promise(async (resolve, reject) => {

    const { id: audioDocumentId, fileext: audioFileext, parentId } = await DocumentService.get(audioDocId);
    const { id: textDocumentId, fileext: textFileext } = await DocumentService.get(textDocId);
    const fileName = textDocumentId + '.' + textFileext;

    try {
      const curSeq = await TranscriptionService.find({ query: {
          documentId: audioDocumentId,
          $limit: 0}
        });
      const transcription = await TranscriptionService.create({
        documentId: audioDocumentId,
        revision: curSeq.total + 1,
        metadata: {
          imported: true
        }
      });
      try {
        await TranscriptionService.patch(
          transcription.id, {
            // 1: processing
            status: 1
          });
      } catch (err) {
        reject(err);
      }

      try {
        fs.createReadStream(`${destination}/${fileName}`)
          .pipe(fastCsv.parse(csvOptions))
          .on('error', (error) => {
            reject(error);
          })
          .on('data', async (line) => {
            await SentenceService.create({transcriptionId: transcription.id, ...lineToSentenceObject(line)})
          })
          .on('end', (lineCount) => {
            TranscriptionService.patch(
              transcription.id, {
                // 99: completed
                // 66: empty
                status: (lineCount) ? 99 : 66,
              });
            resolve(true);
          })
      } catch (err) {
        reject(err);
      }
    } catch {
      reject(`couldn't open file`);
    }
  });

};

module.exports = runner;
