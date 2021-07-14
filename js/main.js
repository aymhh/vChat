function logThisShit() {
    console.log(document.getElementById("pfp").value);
    console.log(document.getElementById("email").value);
    console.log(document.getElementById("uid").value);
    console.log(document.getElementById("pwd").value);
    
}


function loginValidator() {
    const submitButton = document.getElementById("form");
    const username = document.getElementById('uid')
    const password = document.getElementById('pwd')

    console.log(`${username.value} is the inputed value.`)
    console.log(`${password.value} is the inputed value.`)

    submitButton.addEventListener('submit', function (e) {
        if (username.value === "thisIsTheUsername" && password.value === "thisIsTheUsername") {
            console.log("matching login Details entered!");
        } else {
            e.preventDefault();
           alert('preventDefault');
        }
    })
}

