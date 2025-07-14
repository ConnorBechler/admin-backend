const { BadRequest, Forbidden, NotAuthenticated, TooManyRequests } = require('@feathersjs/errors');
const generate = require('nanoid/generate');
const Sequelize = require('sequelize');

exports.isNotAdmin = roles => context => {
  let rolesToCheck = ['admin', 'super'];
  if (roles) {
    rolesToCheck = [...rolesToCheck, ...roles.split(',')];
  }
  const userRoles = context.params.user.roles.map(role => role.toLowerCase());
  const ret = rolesToCheck.every(adminRole => userRoles.indexOf(adminRole.trim().toLowerCase()) === -1);
  return ret;
};

exports.isAction = (...args) => hook => args.includes(hook.data.action);

exports.cancel = error => hook => {
  throw new Forbidden(error || 'Ha. No. No Touchy.');
}

exports.lacksMatchingDiaryID = async hook => {
  /* Provides a method for verifiying if a diary was uploaded by a basic user, if the diary
  in question has a matching email */
  const sequelizeClient = hook.app.get('sequelizeClient');
  var diaryId = false;
  var docId = false;
  var result = false;
  if (hook.path == "documents") { diaryId = hook.params.query.parentId }
  if (hook.path == "diaries") { diaryId = hook.id}
  if (!diaryId) {
    if (hook.path == "transcriptions") { 
      if (!("documentId" in hook.params.query)) {transcriptionId = hook.id}
      else {docId = hook.params.query.documentId}
    }
    if (hook.path == "audio") {docId = hook.id}
    if (!docId) {
      if (hook.path == "transcriptSentences") {transcriptionId = hook.params.query.transcriptionId}
      if (hook.path == "transcriptions/:transcriptionId/:type") {transcriptionId = hook.params.route.transcriptionId}
      if (hook.path == "transcriptMaintenance") {transcriptionId = hook.data.id}
      let rawq = `
      SELECT transcriptions.*
      FROM transcriptions
        WHERE transcriptions.deletedAt IS NULL
        AND transcriptions.id LIKE '%${transcriptionId}%';`
      let ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });
      if (ret.length == 0) {result = true}
      docId = ret.at(0).documentId
      }
    
    let rawq = `
      SELECT documents.*
      FROM documents
        WHERE documents.deletedAt IS NULL
        AND documents.id LIKE '%${docId}%';`

    /* console.log(rawq); */
    let ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });
    /* console.log(ret) */
    if (ret.length == 0) {result = true}
    diaryId = ret.at(0).parentId
    /* console.log(diaryId) */
  }

  let rawq2 = `
    SELECT diaries.*
    FROM diaries
    LEFT JOIN profiles ON profiles.id = diaries.profileId
    LEFT JOIN subjects ON subjects.id = profiles.subjectId
      WHERE diaries.deletedAt IS NULL
      AND diaries.active = 1
      AND subjects.email LIKE '%${hook.params.user.email}%'
      AND diaries.id LIKE '%${diaryId}%';`

  /* console.log(rawq2) */
  let ret2 = await sequelizeClient.query(rawq2, { type: Sequelize.QueryTypes.SELECT });
  /* console.log(ret2)*/
  if (ret2.length == 0) { result = true }
  if (result == true) {console.log(hook)}
  return result;
}

exports.lacksMatchingSubId = async hook => { 
  console.log('AUTHENTICATING')
  const SubjectService = hook.app.service('subjects');
  const ProfileService = hook.app.service('profiles');
  const DiaryService = hook.app.service('diaries');
  let allDiaries = [];
  let userSubjectId = null;
  let subjects = {};
  var diaryId = false;
  var docId = false;
  var result = false;

  if (hook.path == "documents") { diaryId = hook.params.query.parentId }
  if (hook.path == "diaries") { diaryId = hook.id}
  //If no diaryId provided, check to see if docId available
  if (!diaryId) {
    const DocumentService = hook.app.service('documents');
    if (hook.path == "transcriptions") {
      if (!("documentId" in hook.params.query)) {transcriptionId = hook.id}
        else {docId = hook.params.query.documentId}
      }
    if (hook.path == "audio") {docId = hook.id}
    // If no docId provided, check to see if transcriptionId available
    if (!docId) {
      const TranscriptionService = hook.app.service('transcriptions');
      if (hook.path == "transcriptSentences") {
        if (hook.method == 'find') {transcriptionId = hook.params.query.transcriptionId}
        else if (hook.method == 'remove') {
          // Get transcriptionId from transcriptSentences service
          const TranscriptSentences = hook.app.service('transcriptSentences');
          transcriptSentence = await TranscriptSentences.get(hook.id);
          transcriptionId = transcriptSentence.transcriptionId;
        }
        else {transcriptionId = hook.data.transcriptionId}
      }
      if (hook.path == "transcriptions/:transcriptionId/:type") {
        transcriptionId = hook.params.route.transcriptionId
      }
      if (hook.path == "transcriptMaintenance") {transcriptionId = hook.data.id}
      // Get documentId from transcriptionId
      transcription = await TranscriptionService.get(transcriptionId);
      docId = transcription.documentId;
    }
    // Get DiaryId from documentId
    document = await DocumentService.get(docId);
    diaryId = document.parentId;
  }
  
  subjects = await SubjectService.find({query : {email : hook.params.user.email}});
  if (subjects.data.length == 1) {userSubjectId = subjects.data.at(0).id}
  else {result = true}
  if (userSubjectId) {
    let allProfiles = await ProfileService.find({ query: { subjectId: userSubjectId, $limit: 99999 }});
    allDiaries = await DiaryService.find({ query: {
      profileId: {
        $in: allProfiles.data.map(p => p.id)
      },
      $limit: 99999,
    }});
  }

  let approved_diaries = allDiaries.data.map(d => d.id)
  if (!approved_diaries.includes(diaryId)) {result = true}  
  return result;
}

exports.checkForWorkerKey = (hook) => {
  if ((hook.params && hook.params.query && hook.params.query.remoteWorkerKey) || (hook.data && hook.data.remoteWorkerKey) ) {
    return hook;
  } else {
    return false;
  }
}


exports.checkWorkerKey = (hook) => {
  return async hook => {
    const remoteWorkerKey = hook.method === 'create' ? hook.data.remoteWorkerKey : hook.params.query.remoteWorkerKey;
    if (remoteWorkerKey) {
      await hook.app.service('remoteWorkers').find( { query: {
        secret: remoteWorkerKey,
      }})
      .then((resp) => {
        if (resp && resp.total) {
          const remoteWorker = resp.data[0];
          if (!remoteWorker.enabled) {
            throw new NotAuthenticated('Error: Worker currently deactivated');
          }
          if (hook.method === 'create') {
            hook.data.remoteWorker = {
              id: remoteWorker.id,
              maxConcurrent: remoteWorker.maxConcurrent,
              metadata: remoteWorker.metadata,
            };
          } else {
            hook.params.query.api = true;
          }
        } else {
          throw new NotAuthenticated('Error: Invalid worker secret');
        }
      })
      .catch((err) => {
        throw err;
      })
    } else {
      throw new BadRequest('Error: Worker key required');
    }
  }
}

exports.checkWorkerJobs = (hook) => {
  return async hook => {
    if (hook.data && hook.data.action && hook.data.action == 'checkForWork') {
      const activeJobs = await hook.app.service('processingJobs').find( { query: {
        remoteWorkerId: hook.data.remoteWorker.id,
        $and: [
          { status: { $ne: 999 } },
          { status: { $ne: -1 } },
        ],
        $limit: 0,
      }});
      if (activeJobs && activeJobs.total) {
        if (activeJobs.total >= hook.data.remoteWorker.maxConcurrent) {
          throw new TooManyRequests('Error: Reached maximum number of concurrent jobs');
        }
      }
    }
  }
}

exports.cleanupRemoteWorkerRequest = (hook) => {
  return async hook => {
    if (hook.data && hook.data.remoteWorkerKey) {
      delete hook.data.remoteWorkerKey;
    }
    if (hook.params && hook.params.query && hook.params.query.remoteWorkerKey) {
      delete hook.params.query.remoteWorkerKey;
    }
  }
}

exports.correctedDateTime = (date) => {
  const localDate = date || new Date();
  return new Date(new Date(localDate).getTime() - new Date(localDate).getTimezoneOffset() * 60 * 1000);
}

exports.trimmer = (...args) => hook => {
  if (args) {
    for (const idx in args) {
      if (hook.data[args[idx]]) {
        hook.data[args[idx]] = hook.data[args[idx]].trim();
      }
    }
  }
}

exports.uppercase = (...args) => hook => {
  if (args) {
    for (const idx in args) {
      if (hook.data[args[idx]]) {
        hook.data[args[idx]] = hook.data[args[idx]].toUpperCase();
      }
    }
  }
}

exports.assignNextSID = async hook => {
  const sequelizeClient = hook.app.get('sequelizeClient');

  let rawq = `select (substring_index(shortcode, '-', -1) * 1) + 1 as sid
    from subjects
    where shortcode like '${process.env.SUBJECT_PREFIX}-%'
    order by sid DESC
    limit 1`;

  const ret = await sequelizeClient.query(rawq, { type: Sequelize.QueryTypes.SELECT });
  delete hook.data.assignSID;

  hook.data.shortcode = ret.length ? `${process.env.SUBJECT_PREFIX}-${ret[0].sid.toString().padStart(process.env.SUBJECT_LENGTH, '0')}` : `${process.env.SUBJECT_PREFIX}-${"1".padStart(process.env.SUBJECT_LENGTH, '0')}`;
}

exports.generateRandomShortcode = config => async hook => {
  if (config) {
    config.alphabet = config.alphabet || '0123456789ABCEFGHJKLMNPQRSTWXYZ'
  }
  let tempcodes = [];
  let exists = {total: 1};
  let tries = 0;
  while (exists.total !== 0 && tries < 10) {
    for (let n = 0; n < config.chunks; n += 1) {
      tempcodes.push(generate(config.alphabet, config.lengthEach));
    }
    exists = await hook.app.service(config.service).find({
      query: {
        $limit: 1,
        shortcode: tempcodes.join('-')
      }
    });
    tries = tries + 1;
  }
  if (tries === 10) {
    throw new BadRequest('tried too many times');
  } else {
    hook.data.shortcode = tempcodes.join('-');
  }
}

/** Function that count occurrences of a substring in a string;
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
exports.occurrences = (string, subString, allowOverlapping = false) => {
  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
  pos = 0,
  step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }

  return n;
}
