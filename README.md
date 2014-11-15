Toodle
======

Modular online tournament management tool.

# What is this ?
Toodle aims to be a tournament management app that'll be able to get you started on your new super awesome tournament in a matter of minutes and as few clicks as possible.
No login required, you just need to keep the admin URL close to you and send the participation url to the other participants.

# Which games / tournaments will it be designed for ?
At first, straight up single elimination tournament brackets, then we'll integrate other sets of rules such as the possibility of a 3rd place decider match, group stages ... and more (at least we hope ^^') !

# My tournament format isn't in there! How could you forget it !?
Chances are, we'll only implement tournament formats we're familiar with. This means we'll focus on various formats that can be seen in Starcraft 2 competitions. To fix this, you can let us know about what you need, or better, write your own tournament management module (using the ones available as a reference) and submit us a pull request, we'll be happy to integrate it.

# What do I need to run this ?
This is an app based on a MEAN stack, so you'll need a machine with: NodeJS, grunt (and grunt-cli !), bower and MongoDB installed globally.

Then, once the app is configured to access your mongodb instance (via _/lib/config/env/<your environments>_) you should be able to install everything by running :

* npm i
* bower i

although most cloud based platforms like Heroku / Nodejitsu should do this for you when you deploy, if you choose to use such a platform.

The app runs on 'development' settings by default, if you want to enable gzip compression you need to set the NODE_ENV variable to 'production'. This is easily done in the NodeJitsu admin interface, and I guess it's as simple in the Heroku one. If you're just making some tests on a VM, you can enable the option as easily as changing the port :

    user@host:/toodleRoot$ PORT=8080 NODE_ENV=production node server

will start a toodle instance on port 8080 in with the NODE_ENV variable set to 'production'

The version that we deploy on our test instance ([http://www.toodle.it](http://www.toodle.it)) is actually the result of the 'softBuild' grunt task which is then run through pm2 with production configuration (gzip compression enabled, no livereload ...). When run, this build outputs a 'dist' directory to the root of the project that can be scp-ed or sent to heroku/nodejitsu/what-have-you (the post-install task already runs bower install so deployment should not be an issue).
# What do I need to run all tests in a CI tool ?
It's fairly straightforward to run the unit tests, you just need to add a build step that runs : 

    grunt mochaTest

And you should be OK, provided the build fails if the return value of the command is != 0

For E2E tests, it's a little more tricky, as you have to run your server, start a selenium server and have a phantomjs lib installed if you want all the process to be headless and useable in a build.

Starting the app shouldn't be a problem, unless you have configuration issues that break the CI. In my CI, we use : 

    grunt serve --force

The '--force' option is there because we don't care about compass at the moment and it's not yet installed on our CI server. You should be able to run the app without that flag though.

You also need to have protractor / webdriver-manager installed :

    npm install -g protractor

And start it for protractor to be able to connect to it (it'll serve as an interface to the app).

I recommend selenium driver and the app to be tested to run as services that you shutdown / reboot when needed.

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

Then open the app/views/index.html file and remove the code between the "<piwik>" tags ;) To avoid JS errors you might want to remove the _paq calls you'll find in the angular controllers.

    
