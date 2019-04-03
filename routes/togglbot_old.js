var express = require('express');
var router = express.Router();

var TogglClient = require('toggl-api');
let togglReminder, togglReminderLength = 60000;

let workspaceId = 3330324;
let userLookup = {
	'U1XAT54TY' : {
		'personName' : 'Jesper',
		'togglAPIToken' : 'd93b2334320a73ea122f6cee685634a2',
		'togglObj' : null,
		'togglReminder' : null,
		'reminderCount' : 0
	},
	'U0JQPEATH' : {
		'personName' : 'Christian',
		'togglAPIToken' : '7e4ca323e30ecae6474ef9bf13581209',
		'togglObj' : null,
		'togglReminder' : null,
		'reminderCount' : 0
	}
}

// Initialize using signing secret from environment variables
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
	includeBody : true
});

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event, body)=> {
  let userId = event.user;

  if(userLookup[userId].personName !== undefined) {
  	// Start a new Toggl object, if it doesn't exist
  	if(userLookup[userId].togglObj === null) {
  		userLookup[userId].togglObj = new TogglClient({apiToken: userLookup[userId].togglAPIToken});
  	}
  }

  event.text = event.text.toLowerCase();
  let commands = event.text.split(' ');

  // Only do stuff if we already have a Toggle object
  if(userLookup[userId].togglObj !== null) {
  	// Do this if the user started by writing 'start'
  	if(commands[0] === 'start') {
  		fetchProject(userId, commands[1]).then((dat) => {
  			let projectId = dat.pid, projectName = dat.pname;
	  		try {
	  			let description = event.text.substring(event.text.indexOf(projectName) + projectName.length, event.text.length);
	  			console.log('Attempting to start time entry with description: ' + description);
		  		userLookup[userId].togglObj.startTimeEntry({
					  description: description,
					  pid: projectId
					}, function(err, timeEntry) {
					  // handle error
					  if(err) throw err;
					  console.log('Successfully started time entry with description: ' + description + ' and id: ' + timeEntry.id);

					  userLookup[userId].togglReminder = setInterval(function() {
					  	userLookup[userId].reminderCount++;
					  	console.log('You haven\'t stopped this timer, even though it was ' + ((togglReminderLength / 1000 / 60) * userLookup[userId].reminderCount)  + ' minutes ago!');
					  }, togglReminderLength)
					})
	  		} catch(error) {
	  			console.error(error);
	  		}
  		}).catch((err) => {
  			console.error(err);
  		})
  	}
  	else if(commands[0] === 'stop') {
  		try {
  			userLookup[userId].togglObj.getCurrentTimeEntry((err, timeEntry) => {
  				if(err) throw err;

  				try {
  					userLookup[userId].togglObj.stopTimeEntry(timeEntry.id, function(err) {
  					  // handle error
  					  if(err) throw err;

  					  console.log('Successfully stopped timeEntry with id: ' + timeEntry.id);
  					  clearInterval(userLookup[userId].togglReminder);
  					  userLookup[userId].reminderCount = 0;
  					})
  				} catch(error) {
  					console.error(error);
  				}
  			})
  		} catch(error) {
  			console.error(error);
  		}
  	}
  	else {
  		console.log('Could not recognize that command!');
  	}
  }
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);
router.use('/', slackEvents.expressMiddleware());

router.post('/', function(req, res, next) {
    // Respond to this event with HTTP 200 status
    res.sendStatus(200);
});

// Get the project that was mentioned in the text
function fetchProject(userId, txt) {
	return new Promise((resolve, reject) => {
		try {
			userLookup[userId].togglObj.getWorkspaceProjects(workspaceId, (err, dat) => {
				if(err) throw err;

				let projectName, projectId;
				for(let project of dat) {
					if(txt === project.name) {
						projectId = project.id;
						projectName = project.name;
					}
				}

				// only go further if we have a project name
				if(projectName === undefined) {
					reject('Couldn\'t find a project name!')
				}
				else {
					resolve({pid : projectId, pname : projectName});
				}
				
			})
		} catch(error) {
			reject(error);
		}
	})
}

module.exports = {
	router : router,
	userLookup : userLookup
}