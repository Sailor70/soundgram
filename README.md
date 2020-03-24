# Soundgram

Soundgram is a social network web app that was based on JHipster 6.5.1 and tools such as:
Java Spring boot, Angular, PostgraSQL, Hibernate, NPM, Maven and many more that you can find in [package.json](package.json).
This project is being developed as part of my IT studies engineering work

## Screenshots

![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGHomeLogin.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGHome.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGTags.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGProfile.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGMusic.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGUsers.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGPost.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGEditPost.JPG)
![alt tag](https://github.com/Sailor70/soundgram/blob/master/screenshots/1SGSettings.JPG)

## Building this project

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    ./mvnw
    npm start

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.
