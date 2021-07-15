function findName() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4) {
            if(xhr.readyState === 200) {
                console.log(xhr.responseText)
            }

            if(xhr.readyState === 404) {
                console.log("THERE IS NOTHIGN HERE I CAN'T DISPLAY ANYTHING IF THERE IS NOTHING HERE 4000000000000004 ")
            }
        }
    }

    xhr.open('get', )
}




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
        if (username.value === "thisIsTheUsername" && password.value === "thisIsThePassword") {
            console.log("matching details entered!");
        } else {
            e.preventDefault();
            alert('preventDefault');
        }
    })
}

