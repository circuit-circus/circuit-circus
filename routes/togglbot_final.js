const slackEventsApi = require('@slack/events-api');
const SlackClient = require('@slack/client').WebClient;

const passport = require('passport');
const LocalStorage = require('node-localstorage').LocalStorage;
const SlackStrategy = require('@aoberoi/passport-slack').default.Strategy;

const http = require('http');
const express = require('express');
var router = express.Router();

var TogglClient = require('toggl-api');
let togglReminder, togglReminderLength = 28800000; // Equals eight hours

let workspaceId = 3330324;
let userLookup = {
    'U1XAT54TY': {
        'personName': 'Jesper',
        'togglAPIToken': 'd93b2334320a73ea122f6cee685634a2',
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    },
    'U0JQPEATH': {
        'personName': 'Christian',
        'togglAPIToken': '7e4ca323e30ecae6474ef9bf13581209',
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    }
}

// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    includeBody: true
});

// Initialize a Local Storage object to store authorization info
// NOTE: This is an insecure method and thus for demo purposes only!
const botAuthorizationStorage = new LocalStorage('./storage');

// Helpers to cache and lookup appropriate client
// NOTE: Not enterprise-ready. if the event was triggered inside a shared channel, this lookup
// could fail but there might be a suitable client from one of the other teams that is within that
// shared channel.
const clients = {};

function getClientByTeamId(teamId) {
    if (!clients[teamId] && botAuthorizationStorage.getItem(teamId)) {
        clients[teamId] = new SlackClient(botAuthorizationStorage.getItem(teamId));
    }
    if (clients[teamId]) {
        return clients[teamId];
    }
    return null;
}

// Initialize Add to Slack (OAuth) helpers
passport.use(new SlackStrategy({
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    skipUserProfile: true,
}, (accessToken, scopes, team, extra, profiles, done) => {
    botAuthorizationStorage.setItem(team.id, extra.bot.accessToken);
    done(null, {});
}));

// Plug the Add to Slack (OAuth) helpers into the express app
router.use(passport.initialize());
router.get('/auth/slack', passport.authenticate('slack', {
    scope: ['bot']
}));
router.get('/auth/slack/callback',
    passport.authenticate('slack', { session: false }),
    (req, res) => {
        res.send('<p>Greet and React was successfully installed on your team.</p>');
    },
    (err, req, res, next) => {
        res.status(500).send(`<p>Greet and React failed to install</p> <pre>${err}</pre>`);
    }
);

// *** Plug the event adapter into the express app as middleware ***
router.use('/slack/events', slackEvents.expressMiddleware());

// *** Attach listeners to the event adapter ***

// *** Greeting any user that says "hi" ***
slackEvents.on('message', (event, body) => {
    let userId = event.user;
    console.log(event);

    if (userLookup[userId].personName !== undefined) {
        // Start a new Toggl object, if it doesn't exist
        if (userLookup[userId].togglObj === null) {
            userLookup[userId].togglObj = new TogglClient({ apiToken: userLookup[userId].togglAPIToken });
        }
    }

    event.text = event.text.toLowerCase();
    let commands = event.text.split(' ');

    // Only do stuff if we already have a Toggle object
    if (userLookup[userId].togglObj !== null) {

        // Init slack client
        const slack = getClientByTeamId(body.team_id);
        // Handle initialization failure
        if (!slack) {
            return console.error('No authorization found for this team. Did you install the app through the url provided by ngrok?');
        }

        // Do this if the user started by writing 'start'
        if (commands[0] === 'start') {
            fetchProject(userId, commands[1]).then((dat) => {
                // Save the project name and id
                let projectId = dat.pid,
                    projectName = dat.pname;

                try {
                    // Decipher what the description for the time entry should be
                    let description = event.text.substring(event.text.indexOf(projectName) + projectName.length, event.text.length).trim();
                    description = description.charAt(0).toUpperCase() + description.slice(1);
                    console.log('Attempting to start time entry with description: ' + description);

                    // Start the time entry
                    userLookup[userId].togglObj.startTimeEntry({
                        description: description,
                        pid: projectId
                    }, function(err, timeEntry) {
                        // handle error
                        if (err) throw err;

                        // Let the user and back-end know that we did good.
                        let startMsg = `Alright, <@${event.user}>.\n:arrow_forward: I started a timer with the description \`` + description + `\` on the project called \`` + projectName + `\`.`;
                        console.log(startMsg);
                        // Respond to the message back in the same channel
                        slack.chat.postMessage({ channel: event.channel, text: startMsg }).catch(console.error);

                        // Send a timer reminder after each 8 hours
                        userLookup[userId].togglReminder = setInterval(function() {
                            userLookup[userId].reminderCount++;

                            // Respond to the message back in the same channel
                            let reminderMsg = `Hey there <@${event.user}>.\nYou haven\'t stopped this timer, even though it was ` + ((togglReminderLength / 1000 / 60) * userLookup[userId].reminderCount) + ` minutes ago! :stopwatch:`;
                            console.log(reminderMsg);
                            slack.chat.postMessage({ channel: event.channel, text: reminderMsg }).catch(console.error);
                        }, togglReminderLength)
                    })
                } catch (error) {
                    console.error(error);
                }
            }).catch((err) => {
                console.error(err);

                // If the project does not exist, let the user and back-end know
                let projectMsg = `:thinking_face: I don't think that project is on Toggl yet.\nYou should check for typos, or go create the project on Toggl.`;
                console.log(projectMsg);
                slack.chat.postMessage({ channel: event.channel, text: projectMsg }).catch(console.error);
            })
        } else if (commands[0] === 'stop') {
            try {
                // First try to get the current time entry
                userLookup[userId].togglObj.getCurrentTimeEntry((err, timeEntry) => {
                    if (err) throw err;

                    if (timeEntry !== null) {
                        try {
                            // Then stop the time entry
                            userLookup[userId].togglObj.stopTimeEntry(timeEntry.id, function(err) {
                                // handle error
                                if (err) throw err;

                                // If we were successful, let the user know and reset the timer
                                let stopMsg = `Okay then, <@${event.user}>.\n:black_square_for_stop: I stopped your current timer with the description \`` + timeEntry.description + `\`.`;
                                console.log(stopMsg);
                                slack.chat.postMessage({ channel: event.channel, text: stopMsg }).catch(console.error);

                                clearInterval(userLookup[userId].togglReminder);
                                userLookup[userId].reminderCount = 0;
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    else {
                      // If there is no timer, then let the user and back-end know
                      let errorMsg = `:fearful: You don't seem to have an active timer right now.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start Precis Buying supplies.\``;
                      console.log(errorMsg);
                      slack.chat.postMessage({ channel: event.channel, text: errorMsg }).catch(console.error);
                    }
                })
            } catch (error) {
                console.error(error);
            }
        } else {
            let errorMsg = `Hmmm... :thinking_face: I don't know that command.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start Precis Buying supplies.\``;
            console.log(errorMsg);

            // Respond to the message back in the same channel
            slack.chat.postMessage({ channel: event.channel, text: errorMsg }).catch(console.error);
        }
    }
});

// *** Handle errors ***
slackEvents.on('error', (error) => {
    console.error(`An error occurred while handling a Slack event: ${error.message}`);
});

// Get the project that was mentioned in the text
function fetchProject(userId, txt) {
    return new Promise((resolve, reject) => {
        try {
            userLookup[userId].togglObj.getWorkspaceProjects(workspaceId, (err, dat) => {
                if (err) throw err;

                let projectName, projectId;
                for (let project of dat) {
                    if (txt === project.name) {
                        projectId = project.id;
                        projectName = project.name;
                    }
                }

                // only go further if we have a project name
                if (projectName === undefined) {
                    reject('Couldn\'t find a project name!')
                } else {
                    resolve({ pid: projectId, pname: projectName });
                }

            })
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    router: router,
    userLookup: userLookup
}