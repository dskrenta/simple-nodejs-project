'use strict';

// import fs
const fs = require('fs');
// import crypto module
const crypto = require('crypto');
// import express
const express = require('express');
// import cors
const cors = require('cors');

// constants
const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.static('public'));

// createProfile (http://localhost:3000/createProfile?name=david&email=david@appearix.com&password=foo)
app.get('/createProfile', (req, res) => {
  const profile = {
    name: req.query.name,
    email: req.query.email,
    password: req.query.password
  };

  const profileFile = genFileIdFromEmail(profile.email);

  fs.writeFile(profileFile, JSON.stringify(profile), (err) => {
    if (err) {
      res.json({error: 'Create user failed'});
    }
    else {
      res.json(profile);
    }
  });
});

// getProfile (http://localhost:3000/getProfile?email=david@appearix.com)
app.get('/getProfile', (req, res) => {
  const profileEmail = req.query.email;
  const profileFile = genFileIdFromEmail(profileEmail);
  fileExists(profileFile, (fExists) => {
    if (fExists) {
      fs.readFile(profileFile, 'utf-8', (err, data) => {
        if (err) {
          res.json({error: 'Could not read user record.'});
        }
        else {
          res.json(JSON.parse(data));
        }
      })
    }
    else {
      // send user does not exist error
      res.json({error: `User ${profileEmail} does not exist.`});
    }
  });
});

// userAuth (http://localhost:3000/userAuth?email=david@appearix.com&password=foo)
app.get('/userAuth', (req, res) => {
  const profileEmail = req.query.email;
  const profilePassword = req.query.password;
  const profileFile = genFileIdFromEmail(profileEmail);
  fileExists(profileFile, (fExists) => {
    if (fExists) {
      fs.readFile(profileFile, 'utf-8', (err, data) => {
        if (err) {
          res.json({error: 'Could not read user record.'});
        }
        else {
          const readProfile = JSON.parse(data);
          if (readProfile.password === profilePassword) {
            res.json(readProfile);
          }
          else {
            res.json({error: 'Incorrect password, fuck off'});
          }
        }
      })
    }
    else {
      // send user does not exist error
      res.json({error: `User ${profileEmail} does not exist.`});
    }
  });
});

app.listen(
  PORT,
  () => console.log(`simple-nodejs-project server listening on ${PORT}`)
);

// generates profile file path from email
function genFileIdFromEmail(email) {
  return `./profiles/${crypto.createHash('md5').update(email).digest('hex')}.json`;
}

// function that checks if filename exists
function fileExists(filename, cb) {
  fs.access(filename, fs.F_OK, (err) => {
    if (err) {
      cb(false);
    }
    else {
      cb(true);
    }
  })
}
