# End to end testing
## About the configuration
Comment out the seleniumAddress attribute if 'non phantom' E2E tests are needed in order to use phantomjs, webdriver must have been installed and updated

## Going headless
For the phantomjs driver to be available, you might want to try installing it this way :

    npm install -g phantomjs

## Using protractor to run the tests
### Installing protractor globally
You need to install protractor globally, this also installs the webdriver-manager that'll allow you to run headless tests using phantomjs.

    # npm install protractor -g

Once this is done, you'll want to update webdriver manager so that it'll be able to run :

    # webdriver-manager update

### Daemonizing webdriver-manager using pm2
To run the webdriver-manager as a daemon, you can use pm2 + the webdriver-manager.json file conveniently located in this very directory.

Fair warning : the webdriver-manager script is probably not at the same location so I'd encourage checking it out first (using _'which webdriver-manager'_, for example) before trying to daemonize.

You create the daemon like so :

    $ pm2 start -n <the fancy name you want for your webdriver-manager in pm2's listings> <path to>/webdriver-manager.json

you can, of course, mix things up and change the port, the script, add more params (pm2's documentation is pretty nice and has tons of examples)

You stop it like this :

    $ pm2 stop <fancy name | unique id given by pm2>

You can get info about your running pm2 instances using :

    $ pm2 list

You can restart an already defined pm2 process like this :

    $ pm2 restart <fancy name | unique id given by pm2>

More on pm2's github pages (especially the tutorial) : [https://github.com/angular/protractor/blob/master/docs/tutorial.md](https://github.com/angular/protractor/blob/master/docs/tutorial.md)
