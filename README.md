Toodle
======

Modular online tournament management tool.

# What is this ?
Toodle aims to be a tournament management app that'll be able to get you started on your new super awesome tournament in a matter of minutes and as few clicks as possible.
No login required, you just need to keep the admin URL close to you and send the participation url to the other participants.

# Which games / tournaments will it be designed for ?
At first, straight up single elimination tournament brackets, then we'll integrate other sets of rules such as the possibility of a 3rd place decider match, group stages ... and more (at least we hope ^^') !

# What do i need to run this ?
This is an app based on a MEAN stack, so you'll need a machine with: NodeJS and MongoDB installed.

Then, once the app is configured to access your mongodb instance (via _/lib/config/env/<your environments>_) you should be able to install everything by running :

1 npm i
2 bower i

although most cloud based platforms like heroku / nodejitsu should do this for you when you deploy, if you choose to use such a platform.