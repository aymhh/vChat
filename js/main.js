const pouchDB = require('pouchdb')
const db = new pouchDB('assets/data')

function userContructorSchema() {

    const email = document.getElementById("email");
    const username = document.getElementById("uid");
    const password = document.getElementById("pwd");
    const icon = document.getElementById("pfp");


    const userDetails = {
        _id: username.value,
        name: username.value,
        email: email.value,
        password: password.value,
        icon: icon.value
    }
}

db.remove('aymhh', function(err, response) {
    if (err) { return console.log(err); }
});

  


// very fucking usefull
function loginValidator() {
    const submitButton = document.getElementById("form");
    const username = document.getElementById('uid')
    const password = document.getElementById('pwd')

    console.log(`${username.value} is the inputed value.`)
    console.log(`${password.value} is the inputed value.`)

    submitButton.addEventListener('submit', function (e) {
        if (username.value === "thisIsTheUsername" && password.value === "thisIsThePassword") {
            console.log("matching details entered!");
        } else {
            e.preventDefault();
            alert('preventDefault');
        }
    })
}

