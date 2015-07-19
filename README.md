<img src="https://github.com/ToodleTM/toodle/blob/master/app/images/toodle_simple.png"/>oodle
======

Modular online tournament management tool.

Dependency status :

<a href="https://david-dm.org/toodletm/toodle"><img src="https://david-dm.org/ToodleTM/toodle.png"/></a> (courtesy of [DavidDM](https://david-dm.org))

# What is this ?
Toodle aims to be a tournament management app that'll be able to get you started on your new super awesome tournament in a matter of minutes and as few clicks as possible.
No login required, you just need to keep the admin URL close to you and send the participation url to the other participants.

# Which games / tournaments will it be designed for ?

## Available engines at the moment
Right now, 2 different engines are available :

* **Simple elimination brackets**. Your standart binary brackets. When a player loses a match he gets eliminated, winner is the last man standing
* **<a href="http://wiki.teamliquid.net/starcraft2/GOMTV_Global_StarCraft_II_League">GSL</a> Groups (as of early 2015)**. Groups w/ encounter rules like the ones we see for the GSL. Each group consists of 4 players.
The 1st one fights 4th, 2nd fights the 3rd, both winners fight each other, losers do too, and then there's a tie-breaker match between the winner's match loser and the loser's match winner

In order to, say, have a tournament w/ a 1st phase that consists of groups (for a round of 32 for example) and then it's a straight up bracket w/ the group winners, there's a link that pops up when the tournament seems to be over (no more matches to report) that exports the winners list to the format toodle uses to insert multiple players at a time.

# My tournament format isn't in there! How could you forget it !?
Chances are, we'll only implement tournament formats we're familiar with. This means we'll focus on various formats that can be seen in Starcraft 2 competitions (or general purpose ones). To fix this, you can let us know about what you need, or better, write your own tournament management module (using the ones available as a reference) and submit us a pull request, we'll be happy to integrate it.

## What if I do want to write my own engine then ?
We'd be more than happy to include new engines. What we advise right now is to follow the template engine that can be found in _/lib/engines/engineTemplate/engineInterfaceTemplate_. This file acts as an interface that, should your engine comply with it, should render it pretty much "plug and play" in Toodle (at least server-side wise, there's still a bit of work to be done on the app part of things).

The second requirement we ask is that the engine should be unit tested. We won't ask for 100% coverage because that makes no sense but to be added to the Toodle library you'll have to put some effort in testing the engine. We can help a bit if you think we can be of assistance, and there's already plenty of engine testing in the project's tests =).

# What do I need to run this ?
This is an app based on a MEAN stack, so you'll need a machine with: NodeJS, bower and MongoDB installed globally. If you mean to run the app in "development" mode, I suggest you use grunt (and grunt-cli !) to easily have an up and running server.
If what you're looking for is a packaged application to run I suggest to make the configuration adjustments needed (like mongodb connection settings) and then run the _scripts/appPackager.sh_ script (from the project root), it should package/minify/whatever the server and app in a ready-to-use _dist_ directory.
To be able to run the packager script you'll first need to download [Google's closure compiler](https://developers.google.com/closure/compiler/) ([link to the latest version](http://dl.google.com/closure-compiler/compiler-latest.zip)) when you've got the Closure Compiler jar, you can pack your application using :

    user@host:/toodleRoot$ ./scripts/appPackager.sh <path to the directory containing your closure compiler jar>

the dist directory generated can be run via a simple :

    user@host:/toodleRoot/dist$ npm install
    user@host:/toodleRoot/dist$ npm start #you can prefix this w/ the PORT or NODE_ENV variables if need be

or using pm2.

The app should also be deploy-able on platforms such as heroku / nodejitsu without too much trouble provided you follow their instructions.

The app runs on 'development' settings by default, if you want to enable gzip compression you need to set the NODE_ENV variable to 'production'. This is easily done in the NodeJitsu admin interface, and I guess it's as simple in the Heroku one. If you're just making some tests on a VM, you can enable the option as easily as changing the port :

    # the good ol' way
    user@host:/toodleRoot$ PORT=8080 NODE_ENV=production node server
    # if you're using pm2, you can use the pm2.conf.json of the source, adding "NODE_ENV=production" to the env array and the run pm2 :
    pm2 start pm2.conf.json
    # caution : if pm2 is already running the server, you probably will want to change the configuration another way and then restart
    NODE_ENV=production pm2 restart <your toodle instance name>
    # ... or
    pm2 delete <your toodle instance name> && pm2 start pm2.conf.json #w/ a conf file modified to suit your needs

will start a toodle instance on port 8080 in with the NODE_ENV variable set to 'production'

The version that we deploy on our test instance ([http://www.toodle.it](http://www.toodle.it)) is actually the result of running the _./scripts/appPackager.sh_ script (run from the project root) which is then run through pm2 with production configuration (gzip compression enabled, no livereload ...). When run, this build outputs a 'dist' directory to the root of the project that can be scp-ed or sent to heroku/nodejitsu/what-have-you (the post-install task already runs bower install so deployment should not be an issue).
# What do I need to run all tests in a CI tool ?
It's fairly straightforward to run the unit tests, you just need to add a build step that runs :

    grunt mochaTest # will run al unit tests
    npm test #will run unit and e2e tests (much longer than previous command, will need to have a toodle server running + webdriver driver and protractor)

And you should be OK, provided the build fails if the return value of the command is != 0

For E2E tests, it's a little more tricky, as you have to run your server, start a selenium server and have a phantomjs lib installed if you want all the process to be headless and useable in a build.

Starting the app shouldn't be a problem, unless you have configuration issues that break the CI.

Right now we're using pm2 + some scripting to stop / build / deploy / restart the application we want to test. The e2e tests are then run on the recently deployed app. There are scripts in [https://github.com/hoshin/toodle/tree/master/test/client/spec/e2e/runner](https://github.com/hoshin/toodle/tree/master/test/client/spec/e2e/runner) that allow you to run pretty much everything you might need on your machine. if you want to go a little further and have, say, a CI w/ an ever running webdriver the page linked provides some info about how to do so.

#What's up with the Piwik configuration?

##How do I make this work ?
First, you need to have setup a piwik instance that'll gather data for you. From its interface you can generate the piwik code that you should use, but, unless the base code changes a lot from what is in index.html, what you need is write the config file that need to be located in _config/piwik.config.js_.
Your config file should look like this :

    var piwik_config = {
        url:'//<your piwik's url or IP>',
        site_id:<the site ID piwik gave your toodle site>
    };

Nothing fancy here, but it allows for some flexibility deployment-wise.

For more info about how Piwik tracking works : [http://developer.piwik.org/api-reference/tracking-javascript](http://developer.piwik.org/api-reference/tracking-javascript)

Each Angular controller (besides of the navbar as it doesn't really make sense) is configured to signal Piwik at each load, so there's some kind of page tracking. You can perfect this or just leave this as is. If you do perfect this and think it might be interesting, please contact me or submit a pull request so that I can add this to the master branch.

##What if I don't care much about this ?

Then open the app/views/index.html file and remove the code between the "piwik" tags ;) To avoid JS errors you might want to remove the _paq calls you'll find in the angular controllers.

##Some of the things to come :

* Ability to rearrange players in a started tournament
* Player seeding in a started tournament
* Tournament export / restore
* "How-to" quickly deploy a standalone server / use toodle as a regular desktop app