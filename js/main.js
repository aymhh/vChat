function userContructorSignUp() {

    const email = document.getElementById("email");
    const username = document.getElementById("uid");
    const password = document.getElementById("pwd");

    console.log(`
    ${username.value} is the id
    ${email.value} is the email
    ${username.value} is the username
    ${password.value} is the password
    `)


    db.collection(username.value).add({
        id: username.value,
        name: username.value,
        email: email.value,
        password: password.value,
        icon: "https://cdn.discordapp.com/attachments/846374789156831272/865178398045110272/defaultCharacter.png"
      })
    
    return console.log("PLEASE WORK")
}

  
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

