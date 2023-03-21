import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

const apiCall = (path, payload, success) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(payload),
    }

    if (localStorage.getItem('token')) {
        options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    fetch("http://localhost:5005/" + path, options)
        .then((res) => {
            res.json()
                .then((data) => {
                    if (data.error) {
                        // give a better error message
                        alert(data.error);
                    } else {
                        if (success) {
                            success(data);    
                        }
                    }
                });
        });
}


const setToken = (token) => {
    localStorage.setItem('token', token);
    hide("section-logged-out");
    show("section-logged-in");
};

// if register button is clicked
document.getElementById("register-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        name: document.getElementById("register-name").value,
    }

    apiCall("auth/register", payload, (data) => {
        setToken(data.token);
    });
    console.log(payload.email, payload.password, payload.name);

});


// if login button is clicked
document.getElementById("login-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    }
    apiCall('auth/login', payload, (data) => {
        console.log("Successfully logged in", data);
        setToken(data.token);
    });
    console.log("Bro, Login details: ", payload.email, payload.password);
    hide("section-logged-out");
    show("section-logged-in");
});

const show = (element) => {
    document.getElementById(element).classList.remove("hide");
}

const hide = (element) => {
    document.getElementById(element).classList.add("hide");
}


// if we click on nav-register, we should hide the other div's and just show register
document.getElementById("nav-register").addEventListener("click", () => {
    show("register-page");
    hide("login-page");
});

// if we click on nav-login, we should hide the other div's and just show register
document.getElementById("nav-login").addEventListener("click", () => {
    show("login-page");
    hide("register-page");
});

// if a token exists
/* if (localStorage.getItem('token')) {
    hide("section-logged-out");
    show("section-logged-in");
} */

// logout button
document.getElementById("logout").addEventListener("click", () => {
    hide("section-logged-in");
    show("section-logged-out");
    localStorage.removeItem("token");
});