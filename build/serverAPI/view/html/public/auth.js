"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_app_js_1 = require("https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js");
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js");
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC1f5cioxoKT1E06TEumrPzGPIwlWeW-oc",
    authDomain: "food-app-7cb62.firebaseapp.com",
    projectId: "food-app-7cb62",
    storageBucket: "food-app-7cb62.appspot.com",
    messagingSenderId: "602483393246",
    appId: "1:602483393246:web:785a926d8178a2739f784f",
    measurementId: "G-4GEJQZL0R3"
};
// import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
/**
 * This file is an example of how client side firebase API can be used in JavaScript.
 */
// Initialize Firebase
const app = (0, firebase_app_js_1.initializeApp)(firebaseConfig);
const auth = (0, firebase_auth_js_1.getAuth)(app);
let email = document.getElementById("email-label");
let password = document.getElementById("password-label");
let login = document.getElementById("login-btn");
login.addEventListener("click", () => {
    console.log(email.value);
    console.log(password.value);
    (0, firebase_auth_js_1.signInWithEmailAndPassword)(auth, email.value, password.value)
        .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
    })
        .catch((error) => {
        console.log("Boom");
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
    });
});
//# sourceMappingURL=auth.js.map