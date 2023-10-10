// Initializes the `profiles` service on path `/profiles`
const { Profiles } = require('./profiles.class');
const createModel = require('../../models/profiles.model');
const hooks = require('./profiles.hooks');
const { BadRequest } = require('@feathersjs/errors');

// fix to local server time to avoid any unpleasantness, including DST offset
const correctedDateTime = (date) => {
  const localDate = date ? date : new Date();
  return new Date(new Date(localDate).getTime() - new Date(localDate).getTimezoneOffset() * 60 * 1000);
}

// input time split to dd:hh:mm
const timeTo = (to) => {
  const ret = {
    days: 0,
    hrs: 0,
    mins: 0,
  };
  // total seconds
  let delta = Math.abs(to - correctedDateTime()) / 1000;
  // strip out days
  ret.days = Math.floor(delta / 86400);
  delta -= ret.days * 86400;
  // strip out hours
  ret.hrs = Math.floor(delta / 3600) % 24;
  delta -= ret.hrs * 3600;
  // format remainder in minutes; discarding ms because WHO CARES
  ret.mins = Math.floor(delta / 60) % 60;
  return ret;
}

// input array of diary objects, optional start/end dates to be reusable for total or specific periods
const getDurationSums = (diaries, startDate = null, endDate = null) => {
  let durationSum = 0;
  if (startDate && endDate) {
    // only include period dates
    durationSum = diaries.reduce((acc, val, idx) => {
      if (val.metadata && val.metadata.duration && val.metadata.diaryDate >= startDate && val.metadata.diaryDate <= endDate) {
        acc += val.metadata.duration;
      }
      return acc;
    }, 0);
  } else {
    // restrictions are for suckers
    durationSum = diaries.reduce((acc, val, idx) => {
      if (val.metadata && val.metadata.duration) {
        acc += val.metadata.duration;
      }
      return acc;
    }, 0);
  }
  return durationSum / 60;
}

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // dedicated service for progress endpoint for mobile apps
  // i'm sure we could stash streaks/etc... but manual uploads + laziness say no
  // plus, stats page is reloaded to account for recent uploads and fetch current time left; saves low-speed devices
  app.use('/profiles/:id/progress',
    {
      async find(params) {
        const DiaryPayPeriodService = app.service('diaryPayPeriods');
        const ProfileService = app.service('profiles');
        const DiaryService = app.service('diaries');
        // regex for finding streaks of met goals (1)
        const regex = /(1)\1*/g;
        let allDiaries = [];
        const goalsMet = [];
        let continuingStreak = true;
        let profile = {};
        const ret = {
          totalContributionMinutes: 0,
          longestRecordingMinutes: 0,
          currentStreak: 0,
          bestStreak: 0,
          duration: 0,
          goal: 0,
          message: '',
          timeLeftCurrent: {
            days: 0,
            hrs: 0,
            mins: 0
          },
          timeToNext: {
            days: 0,
            hrs: 0,
            mins: 0
          },
        };

        const { data: allPayPeriods } = await DiaryPayPeriodService.find({ query: {
          startDate: { $lte: correctedDateTime().toISOString().substr(0, 10) },
          $sort: { startDate: -1 },
        }});

        if (allPayPeriods.length) {
          // remove 'current' goal from later streaks
          const payPeriodData = allPayPeriods.shift();
          if (payPeriodData.id) {
            ret.goal = payPeriodData.goal;
            const startDate = new Date(payPeriodData.startDate + 'T00:00:00Z');
            const endDate = new Date(payPeriodData.endDate + 'T23:59:59Z');
            // lazy way to find next start...
            const nextStart = new Date(endDate);
            nextStart.setTime(nextStart.getTime() + 1000 * 60);

            ret.timeLeftCurrent = timeTo(endDate);
            ret.timeToNext = timeTo(nextStart);


            profile = await ProfileService.get(params.route.id);
            if (profile) {
              if (profile.subject && profile.subject.id) {
                // profile has subjectId; include _all_ profiles associated to subject
                let allProfiles = await ProfileService.find({ query: { subjectId: profile.subject.id, $limit: 99999 }});
                allDiaries = await DiaryService.find({ query: {
                  profileId: {
                    $in: allProfiles.data.map(p => p.id)
                  },
                  $limit: 99999,
                }});
              } else {
                // no subjectId yet; include only this profile's diaries
                allDiaries = await DiaryService.find({ query: {
                  profileId: profile.id,
                  $limit: 99999
                }});
              }

              // needs natural sort as DB will not
              ret.longestRecordingMinutes = allDiaries.data.length
                ? Number((allDiaries.data.sort((a, b) => (a.metadata.duration > b.metadata.duration) ? -1 : 1)[0].metadata.duration / 60).toFixed(0))
                : 0;
              ret.totalContributionMinutes = Number(getDurationSums(allDiaries.data).toFixed(0));
              // duration for only current goal
              ret.duration = Number(getDurationSums(allDiaries.data, payPeriodData.startDate, payPeriodData.endDate).toFixed(1));

              for (const [ppIdx, payPeriod] of allPayPeriods.entries()) {
                // calculate past period durations, cast to integer for flattening
                goalsMet[ppIdx] = +(Number(getDurationSums(allDiaries.data, payPeriod.startDate, payPeriod.endDate).toFixed(1)) >= payPeriod.goal);
              }

              // find index of first failed goal
              ret.currentStreak = goalsMet.findIndex(gm => gm == 0);

              const flatGoalsMet = goalsMet.join('');
              let match;

              // find streaks and stash longest (frontend will override if currentStreak + 1 > bestStreak)
              while (match = regex.exec(flatGoalsMet)) {
                ret.bestStreak = match[0].length > ret.bestStreak ? match[0].length : ret.bestStreak;
              }

            } else {
              // kinda useless since no one ever gets this hahah
              return new BadRequest('No profile found by this id');
            }
          }
        } else {
              // ALSO kinda useless since no one ever gets this
          return new BadRequest('No biweekly period found for this date?');
        }
        return ret;
      }
    },
  );

  app.use('/profiles', new Profiles(options, app));

  const service = app.service('profiles');

  service.hooks(hooks);

  service.publish((data, hook) => {
    return  [
      app.channel('admins'),
      app.channel('assistants'),
      app.channel(`private/${data.id}`)
    ];
  });
};
