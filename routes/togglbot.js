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

let slack;

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
      slack = getSlackClient(body.team_id);

      // Handle initialization failure
      if (!slack) {
          return console.error('No authorization found for this team. Did you add the auth token as an environment variable?');
      }

      // Make everything lowercase and split it into an array
      event.text = event.text.toLowerCase();
      let commands = event.text.split(' ');

      // Only do stuff if we already have a Toggle object
      if (userLookup[userId].togglObj !== null) {
          // Parse the command and run the correct sequence based on that
          let command = parseCommand(commands[0])
          if (command === 'start') {
            runStartSequence(event, userId, commands)
          } else if (command === 'stop') {
            runStopSequence(event, userId)
          } else if (command === 'projects') {
            fetchProject(userId, '').then((dat) => {
              let projectsMsg = assembleProjectsMsg('', dat.projects);
              sendThisMessage(projectsMsg, event)
            })
          } else {
              let errorMsg = `Hmmm... :thinking_face: I don't know that command.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
              sendThisMessage(errorMsg, event)
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

                if (projectName === undefined || txt === '') {
                    resolve({ message : 'Couldn\t find a project by that name.', projects : dat})
                } else {
                    resolve({ pid: projectId, pname: projectName });
                }

            })
        } catch (error) {
            reject(error);
        }
    })
}

function runStartSequence(event, userId, commands) {

  // CASE 1: If no description was given
  if(commands.length < 3) {
    // Let the user and back-end know that they need to add a description.
    let descripMsg = `:grimacing: You need to add a description before I can start a timer.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
    // console.log(descripMsg);
    sendThisMessage(descripMsg, event)
    return;
  }
  
  // CASE 2: 
  fetchProject(userId, commands[1]).then((dat) => {
      if(dat.projects === undefined) {
        // Save the project name and id
        let projectId = dat.pid,
            projectName = dat.pname;

        try {
            // Decipher what the description for the time entry should be
            let description = parseDescription(event.text, projectName);

            // Start the time entry
            userLookup[userId].togglObj.startTimeEntry({
                description: description,
                pid: projectId
            }, function(err, timeEntry) {
                // handle error
                if (!err) {
                  // Let the user and back-end know that we did good.
                  let startMsg = `Alright.\n:arrow_forward: I started a timer with the description \`` + description + `\` on the project called \`` + projectName + `\`.`;
                  sendThisMessage(startMsg, event)
                }
                else {
                  // Let the user and back-end know what we can't find the project under this user
                  let noProjectMsg = `Oh. :anguished: I don't think you can access project \`` + projectName + `\`. Go to Toggl to check if the project is public, or if you're assigned to it.`;
                  sendThisMessage(noProjectMsg, event)
                }
            })
        } catch (error) {
            console.error(error);
        }
      }
      else {
        let projectsMsg = assembleProjectsMsg(`:thinking_face: I don't think that project is on Toggl yet.\nYou should check for typos, or go create the project on Toggl.`, dat.projects)
        sendThisMessage(projectsMsg, event)
      }
  }).catch((err) => {
      console.error(err)
  })
}

function runStopSequence(event, userId) {
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
                      sendThisMessage(stopMsg, event)

                      // Don't forget to reset the important variables
                      clearInterval(userLookup[userId].togglReminder);
                      userLookup[userId].reminderCount = 0;
                  })
              } catch (error) {
                  // console.error(error);
              }
          }
          else {
            // If there is no timer, then let the user and back-end know
            let errorMsg = `:fearful: You don't seem to have an active timer right now.\nTry writing \`start PROJECT_NAME DESCRIPTION\`. E.g. \`Start pillemaskinen Månedligt check-up.\``;
            sendThisMessage(errorMsg, event)
          }
      })
  } catch (error) {
      // console.error(error);
  }
}

function assembleProjectsMsg(prefix, projects) {
  let projectMsg = prefix;
  if(projects) {
    projectMsg += '\nHere is a list of the projects on Toggl right now: ';
    for (let i = 0; i < projects.length; i++) {
      projectMsg += '`' + projects[i].name + '`';
      if(i !== projects.length - 1) projectMsg += ', ';
      else projectMsg += '.';
    }
  }
  return projectMsg
}

function sendThisMessage(msg, event) {
  slack.chat.postMessage({ channel: event.channel, text: msg }).catch(console.error);
}

function parseCommand(txt) {
  if(txt === 'start') return 'start';
  else if(RegExp('st.*p').test(txt)) return 'stop';
  else if(txt === 'projects') return 'projects';
  else return 'notfound'
}

function parseDescription(txt, projectName) {
  let description = txt.substring(txt.indexOf(projectName) + projectName.length, txt.length).trim();
  description = description.charAt(0).toUpperCase() + description.slice(1);
  return description;
}

module.exports = {
    router: router,
    userLookup: userLookup
}