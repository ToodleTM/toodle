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

At the moment, here's the script we use in our CI : 

    grunt serve --force &
    APP_PID=$! #get the app PID to be able to kill it at the end

    while ! nc -vz localhost 9042; do sleep 1; done #wait until app is ready

    #if selenium is already running, we don't want to try and run it again
    if [ ! nc -vz localhost 4300 ]; then 
        webdriver-manager start --seleniumPort=4300 &
        SELENIUM_PID=$!+7
    done

    while ! nc -vz localhost 4300; do sleep 1; done #wait until selenium webdriver is ready

    protractor ./test/client/spec/e2e/protractor.conf.js

    kill $APP_PID && echo "Killed App"
    
    
