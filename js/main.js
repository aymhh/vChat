function logThisShit() {
    console.log(document.getElementById("pfp").value);
    console.log(document.getElementById("email").value);
    console.log(document.getElementById("uid").value);
    console.log(document.getElementById("pwd").value);
    
}


function loginValidator(event) {
    event.preventDefault()

    const submitButton = document.getElementById("loginButton");
    const username = document.getElementById('uid')   

    if(username.value === "correct") {
        
    }

}

