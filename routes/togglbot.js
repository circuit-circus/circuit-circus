const slackEventsApi = require('@slack/events-api');
const SlackClient = require('@slack/client').WebClient;

const http = require('http');
const express = require('express');
var router = express.Router();

var TogglClient = require('toggl-api');
let togglReminder, togglReminderLength = 28800000; // Equals eight hours

let workspaceId = process.env.TOGGL_WORKSPACE_ID;
let userLookup = {
    'U0JQPEATH': {
        'personName': 'Christian',
        'togglAPIToken': process.env.TOGGL_API_CHRISTIAN,
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    },
    'U1XAT54TY': {
        'personName': 'Jesper',
        'togglAPIToken': process.env.TOGGL_API_JESPER,
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    },
    'U0JQJ84SU': {
        'personName': 'Nina',
        'togglAPIToken': process.env.TOGGL_API_NINA,
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    },
    'U0JR1KPU2': {
        'personName': 'Thomas',
        'togglAPIToken': process.env.TOGGL_API_THOMAS,
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    },
    'U0JR1AWDP': {
        'personName': 'Victor',
        'togglAPIToken': process.env.TOGGL_API_VICTOR,
        'togglObj': null,
        'togglReminder': null,
        'reminderCount': 0
    }
}

// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    includeBody: true
});

let client = null;
let botAccessToken = process.env.TOGGLBOT_ACCESS_TOKEN;
function getSlackClient(teamId) {
    // Init client, if it hasn't already been
    if(!client && botAccessToken) {
      client = new SlackClient(botAccessToken);
    }
    if(client) {
        return client;
    }
    return null;
}

// *** Plug the event adapter into the express app as middleware ***
router.use('/slack/events', slackEvents.expressMiddleware());

// *** Responding to user's messages
slackEvents.on('message', (event, body) => {
    // Only do stuff, if it's a simple text message from a person
    if(!event.subtype) {

      let userId = event.user;
      if (userLookup[userId].personName !== undefined) {
          // Start a new Toggl object, if it doesn't exist
          if (userLookup[userId].togglObj === null) {
              userLookup[userId].togglObj = new TogglClient({ apiToken: userLookup[userId].togglAPIToken });
          }
      }

      // Init slack client
      const slack = getSlackClient(body.team_id);

      // Handle initialization failure
      if (!slack) {
          return console.error('No authorization found for this team. Did you add the auth token as an environment variable?');
      }

      // Make everything lowercase and split it into an array
      event.text = event.text.toLowerCase();
      let commands = event.text.split(' ');

      // Only do stuff if we already have a Toggle object
      if (userLookup[userId].togglObj !== null) {

          // Do this if the user started by writing 'start'
          if (commands[0] === 'start') {
              if(commands.length < 3) {
                // Let the user and back-end know that they need to add a description.
                let descripMsg = `:grimacing: You need to add a description before I can start a timer.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
                console.log(descripMsg);
                slack.chat.postMessage({ channel: event.channel, text: descripMsg }).catch(console.error);
                return;
              }
              
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
                          let startMsg = `Alright.\n:arrow_forward: I started a timer with the description \`` + description + `\` on the project called \`` + projectName + `\`.`;
                          console.log(startMsg);
                          slack.chat.postMessage({ channel: event.channel, text: startMsg }).catch(console.error);

                          // Send a timer reminder after each 8 hours, but only if it has not been added yet
                          if(userLookup[userId].togglReminder === null || userLookup[userId].togglReminder._idleTimeout !== -1) {
                            userLookup[userId].togglReminder = setInterval(function() {
                                userLookup[userId].reminderCount++;

                                // Respond to the message back in the same channel
                                let reminderMsg = `Hey there <@${event.user}>.\nYou haven\'t stopped this timer, even though it has already been ` + ((togglReminderLength / 1000 / 60 / 60) * userLookup[userId].reminderCount) + ` hours ago! :stopwatch:`;
                                console.log(reminderMsg);
                                slack.chat.postMessage({ channel: event.channel, text: reminderMsg }).catch(console.error);
                            }, togglReminderLength)
                          }
                      })
                  } catch (error) {
                      console.error(error);
                  }
              }).catch((err) => {
                  console.error(err.message);

                  // If the project does not exist, let the user and back-end know
                  let projectMsg = `:thinking_face: I don't think that project is on Toggl yet.\nYou should check for typos, or go create the project on Toggl.`;
                  if(err.projects) {
                    projectMsg += '\nHere is a list of the projects on Toggl right now: ';
                    for (let i = 0; i < err.projects.length; i++) {
                      projectMsg += '`' + err.projects[i].name + '`';
                      if(i !== err.projects.length - 1) projectMsg += ', ';
                      else projectMsg += '.';
                    }
                  }
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

                                  // If we were successful, let the user know
                                  let stopMsg = `Okay then.\n:black_square_for_stop: I stopped your current timer with the description \`` + timeEntry.description + `\`.`;
                                  console.log(stopMsg);
                                  slack.chat.postMessage({ channel: event.channel, text: stopMsg }).catch(console.error);

                                  // Don't forget to reset the important variables
                                  clearInterval(userLookup[userId].togglReminder);
                                  userLookup[userId].reminderCount = 0;
                              })
                          } catch (error) {
                              console.error(error);
                          }
                      }
                      else {
                        // If there is no timer, then let the user and back-end know
                        let errorMsg = `:fearful: You don't seem to have an active timer right now.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
                        console.log(errorMsg);
                        slack.chat.postMessage({ channel: event.channel, text: errorMsg }).catch(console.error);
                      }
                  })
              } catch (error) {
                  console.error(error);
              }
          } else {
              let errorMsg = `Hmmm... :thinking_face: I don't know that command.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
              console.log(errorMsg);

              // Respond to the message back in the same channel
              slack.chat.postMessage({ channel: event.channel, text: errorMsg }).catch(console.error);
          }
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
                    reject({message : 'Couldn\t find a project by that name.', projects : dat})
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