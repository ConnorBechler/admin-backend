const { Forbidden, BadRequest } = require('@feathersjs/errors');
const unique = require('lodash/uniq');
const uniqueBy = require('lodash/uniqBy');
const concat = require('lodash/concat');
const keys = require('lodash/keys');
const { occurrences, correctedDateTime } = require('../../../hooks/helpers');

const runner = async (app, data) => {
  let ret = false;
  const DiaryService = app.service('diaries');
  const DocumentService = app.service('documents');
  const TranscriptService = app.service('transcriptions');
  const SentenceService = app.service('transcriptSentences');
  const DictionaryService = app.service('dictionaryWords');
  const errors = [];
  const warnings = [];

  console.time(`${data.id}-checkForErrors`);
  // pull transcript to stash metadata for later patch call
  const transcript = await TranscriptService.get(data.id);

  // pull all transcript sentences for sentence- and word-level checks
  const sentences = await SentenceService.find({ query: { transcriptionId: transcript.id } });
  
  const sentencesSplitBySpeaker = {};
  // checks: sentence-level syntax
  for (const [idx, sentence] of sentences.data.entries()) {
    // TODO: modularize rules for custom usage later, or at least move to function to be called
    const defaultContents = {
      id: sentence.id,
      startTime: sentence.startTime,
    };
    // check for blank lines as they should be pruned in transcript editor
    const emptySentence = (sentence.content === null || sentence.content.length === 0 || sentence.content === "");
    if (emptySentence) {
      warnings.push({
        ...defaultContents,
        errorId: `${sentence.id}-EMPTY`,
        type: 'EMPTY',
      });
    }
    // check for matching ()
    const pCount = occurrences(sentence.content, '(') - occurrences(sentence.content, ')');
    if (pCount) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-SYNTAX1`,
        type: 'SYNTAX',
        target: '()'
      });
    }
    // check for matching []
    const bCount = occurrences(sentence.content, '[') - occurrences(sentence.content, ']');
    if (bCount) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-SYNTAX2`,
        type: 'SYNTAX',
        target: '[]'
      });
    }
    // check for matching {}
    const mCount = occurrences(sentence.content, '{') - occurrences(sentence.content, '}');
    if (mCount) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-SYNTAX3`,
        type: 'SYNTAX',
        target: '{}'
      });
    }
    // check for <=100ms time
    const tooShort = (sentence.endTime - sentence.startTime) <= .11
    if (tooShort) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-TOOSHORT`,
        type: 'SHORT',
        target: `TIMES`
      });
    }
    // check for >30s time
    const tooLong = (sentence.endTime - sentence.startTime) >= 75
    if (tooLong) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-TOOLONG`,
        type: 'LONG',
        target: `TIMES`
      });
    }
    // check for numbers that haven't been changed to the word version
    if (/\d/.test(sentence.content)) {
      errors.push({
        ...defaultContents,
        errorId: `${sentence.id}-NUMBERS`,
        type: 'NUMBERS',
      });
    }

    //
    // 20231102 - move to sentencesSplitBySpeaker in order to worry about overlap per speaker,
    //   not globally in a transcript
    //
    // check for overlapping, end after next start
    typeof sentencesSplitBySpeaker[sentence.metadata.speaker] === 'object'
      ? sentencesSplitBySpeaker[sentence.metadata.speaker].push({
          id: sentence.id,
          startTime: sentence.startTime,
          endTime: sentence.endTime
        })
      : sentencesSplitBySpeaker[sentence.metadata.speaker] = [{
          id: sentence.id,
          startTime: sentence.startTime,
          endTime: sentence.endTime
        }];
    // if ( idx + 1 < sentences.data.length) {
    //   const overLapping = (sentence.endTime - sentences.data[idx + 1].startTime) > 0;
    //   if (overLapping) {
    //     errors.push({
    //       ...defaultContents,
    //       errorId: `${sentence.id}-OVERLAP+`,
    //       type: 'OVERLAP',
    //       target: `Next @ ${sentences.data[idx + 1].startTime}`
    //     });
    //   }
    // }
    
    /*
    // 20210918 - disabled as requested
    const qCount = occurrences(sentence.content, '"') % 2;
    if (qCount) {
      warnings.push({
        ...defaultContents,
        type: 'UNCLOSED_QUOTE',
      });
    }
    const endsInComma = sentence.content.substr(-1) === ',';
    if (endsInComma) {
      warnings.push({
        ...defaultContents,
        type: 'ENDS_IN_COMMA',
      });
    }
    */

    /*
    // checks each sentence in full; move to a unique-filtered list for lookups for performance reasons
    const splitSentence = sentence.content.replace(/[^a-zA-Z\-\&\ \'\{\}\[\]\(\)]|(\-){2,}/gmi, '').split(' ');
    for (const word of splitSentence) {
      let tempWord = word.trim();
      // ignore word-, ((word)), [word]
      if (
        tempWord !== ''
        && tempWord.substr(-1) !== '-'
        && (tempWord.substr(0,2) !== '((' && tempWord.substr(-2) !== '))')
        // && (tempWord.substr(0,1) !== '[' && tempWord.substr(-1) !== ']')
      ) {
        // final strip just because we can, leaving (hopefully) only: word, word-word, {word}, word's
        tempWord = tempWord.replace(/[^a-zA-Z\'\{\}\-]/gmi, '');

        //dictionary is uppercase so we shout at it
        const inDict = await DictionaryService.find({ query: { word: tempWord.toUpperCase() }});
        if (inDict.total === 0) {
          errors.push({
            ...defaultContents,
            type: 'WORD',
            target: word.trim(),
          });
        }

      }
    }
    */

  }


  for (speakerKey of keys(sentencesSplitBySpeaker)) {
    for (const [idx, sentence] of sentencesSplitBySpeaker[speakerKey].entries()) {
      if ( idx + 1 < sentencesSplitBySpeaker[speakerKey].length) {
        const overLapping = (sentence.endTime - sentencesSplitBySpeaker[speakerKey][idx + 1].startTime) > 0;
        if (overLapping) {
          errors.push({
            id: sentence.id,
            startTime: sentence.startTime,
            errorId: `${sentence.id}-OVERLAP+`,
            type: 'OVERLAP',
            target: `Next @ ${sentencesSplitBySpeaker[speakerKey][idx + 1].startTime}`
          });
        }
      }
    }
  }


  // make array of unique words for lookups
  const uniqueWords = uniqueBy(
    sentences.data.reduce(
      (acc, val) => {
        // split into array of only alpha, spaces, and: - & ' {} () []; discards --
        const sentence = val.content.replace(/[^a-zA-Z\-\&\ \'\{\}\[\]\(\)\*]|(\-){2,}/gmi, '').split(' ').reduce(
          (acc, val) => {
            // just in case i'm an idiot
            let tempVal = val.trim();
            if (
              // ignore blanks, *word, word-, and ((word))
              tempVal !== ''
              && tempVal.substr(-1) !== '-'
              && (tempVal.substr(0,2) !== '((' && tempVal.substr(-2) !== '))')
              && (tempVal.substr(0,1) !== '*')
              // && (tempVal.substr(0,1) !== '[' && tempVal.substr(-1) !== ']')
            ) {
              // final strip just because we can, leaving (hopefully) only: word, word-word, {word}, word's
              tempVal = tempVal.replace(/[^a-zA-Z\'\{\}\-]/gmi, '');
              // ignore non-word words. word.
              if (tempVal.replace(/[^a-zA-Z\']/gmi, '').length) {
                //dictionary is uppercase so we shout at it
                acc.push(tempVal.toUpperCase());
              }
            }
            return acc;
          }, []);
        //include sentence context
        sentence.forEach(word => acc.push({
          id: val.id,
          startTime: val.startTime,
          word
        }));
        return acc;
      }, []), 'word'
  );

  // checks: word level dictionary lookup
  // utilizes unique list instead of every word for db/performance reasons
  for (const uniqueWord of uniqueWords) {
    const inDict = await DictionaryService.find({ query: { word: uniqueWord.word }});
    if (inDict.total === 0) {
      errors.push({
        id: uniqueWord.id,
        startTime: uniqueWord.startTime,
        type: 'WORD',
        target: uniqueWord.word
      });
    }
  }

  // update transcript itself with results, including sorted errors/warnings and marking as clean
  await TranscriptService.patch(transcript.id, {
    metadata: {
      ...transcript.metadata,
      errors: errors.sort((a, b) => Number(a.startTime) < Number(b.startTime) ? -1 : 1),
      warnings: warnings.sort((a, b) => Number(a.startTime) < Number(b.startTime) ? -1 : 1),
      lastCheckedAt: correctedDateTime(),
      hasChanged: false,
    }
  });
  DocumentService.get(transcript.documentId)
    .then((doc) => {
      DiaryService.get(doc.parentId)
        .then((diary) => {
          DiaryService.patch(diary.id, {
            metadata: {
              ...diary.metadata,
              lastCheckedAt: correctedDateTime(),
              validated: (errors.length === 0 && warnings.length === 0),
            }
          })
        })
    })

  console.timeEnd(`${transcript.id}-checkForErrors`);

  return ret;
};

module.exports = runner;
