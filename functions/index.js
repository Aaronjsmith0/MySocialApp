const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');
const app = express();

const firebaseConfig = {
    apiKey: "AIzaSyCSFINlgDSpcTqGpZL1UIzk_V6wGXbIPoU",
    authDomain: "socialape-8c618.firebaseapp.com",
    databaseURL: "https://socialape-8c618.firebaseio.com",
    projectId: "socialape-8c618",
    storageBucket: "socialape-8c618.appspot.com",
    messagingSenderId: "349259332849",
    appId: "1:349259332849:web:051981f8c0e7c76dabbd50",
    measurementId: "G-BS3DCQPNM4"
};

admin.initializeApp();
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
})

app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };
    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({
                message: `document ${doc.id} created succesfully`
            });
        })
        .catch(err => console.error(err));
})

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    //To Do: validate data
    db.doc(`/users/${newuser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: 'This handle is already in use'
                });
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return res.status(201).json({
                token
            });
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
})

exports.api = functions.https.onRequest(app);