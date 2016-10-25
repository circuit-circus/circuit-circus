# circuit-circus.com
*this is the develop branch*  


✨ 🎪 🎪 🎪 ✨

  

#### Update May 24 ####
Removed old develop branch (was a mess anyway), in order to start fresh and use Git Flow for features n stuff, rather than random cluttered work on develop.  


## Repo structure 🌲🌳 ##

Our model is based on [Git Flow](http://nvie.com/posts/a-successful-git-branching-model/), and at some point we should probably implement it completely 😅😅 For now, we structure the repo like this:

** develop **  
branch for gathering features, etc., which we will merge into the *master* branch.  
develop branch should be working at all times

** features **  
used for all new things. merges into develop when they're done.

** master **  
aka Production branch. Everything that gets pushed to here will be live!! Be careful! 🙏 Don't merge develop into it, if develop doesn't work 100%

** hotfixes **  
quick and dirty fixes, merges directly to both develop and master


## App info 👌✨️##

We use [ExpressJS](http://expressjs.com/).  
 [Jade](http://jade-lang.com/) is used for templating.

### Setting up the project ###
- Download the repo, navigate to it, and run *npm install* in the terminal  
(make sure you have node installed first)

- To start the server, run *nodemon* in the terminal. Navigate to *http://localhost:3000/* and everything should be working 🙏   
 
Less is used as our css pre-processor. To compile it, run *gulp* in the terminal.  
I recommend installing the [Livereload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) Chrome plugin, which works with the gulp task.
