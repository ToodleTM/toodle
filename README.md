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
This is an app based on a MEAN stack, so you'll need a machine with: NodeJS and MongoDB installed.

Then, once the app is configured to access your mongodb instance (via _/lib/config/env/<your environments>_) you should be able to install everything by running :

* npm i
* bower i

although most cloud based platforms like Heroku / Nodejitsu should do this for you when you deploy, if you choose to use such a platform.