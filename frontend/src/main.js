import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

document.getElementById("register-btn").addEventListener("click", () => {
    const registerEmail = document.getElementById("register-email").value;
    const registerPassword = document.getElementById("register-password").value;
    const registerName = document.getElementById("register-first-name").value;
    
    console.log(registerEmail, registerPassword, registerName);
    
    const options = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',        
        },
        body: JSON.stringify({
            email: registerEmail,
            password: registerEmail,
            name: registerName,
        }),
    }

    fetch("http://localhost:5005/auth/register", options)
        .then((res) => {
            res.json()
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        console.log("Success", data);
                    }
                });
            console.log("I got the response! ", res);
        });
});
