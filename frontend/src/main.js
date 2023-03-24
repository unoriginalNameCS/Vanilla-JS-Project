import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

const showErrorMessage = (message) => {

    if (document.getElementById("error-popup-wrapper").style.display === 'none') {
        document.getElementById("error-popup-wrapper").classList.remove("hide");
        const er = document.getElementById("error-popup");
        const textNode = document.createTextNode(message);
        er.appendChild(textNode);
    } else {
        document.getElementById("error-popup-wrapper").classList.add("hide");
    }
}

const cloneShowErrorMessage = (message, element) => {
    // removed the hide class and id of the cloned node
    // for each child node, remove the id
    const err = document.getElementById("error-popup-wrapper").cloneNode(true);
    err.removeAttribute('id');
    err.classList.remove();

    err.childNodes.forEach(node => {
        console.log(node);
    });
    const textNode = document.createTextNode(message);
    err.appendChild(textNode);
    console.log(err);

    const matches = document.querySelectorAll("p");

    //element.appendChild(err);
}

const apiCall = (path, method, payload, success) => {
    const options = {
        method: method,
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
                        //showErrorMessage(data.error);
                        cloneShowErrorMessage(data.error);
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


// create fake job
document.getElementById("fake-job").addEventListener("click", () => {
    const payload = {
        "title": "COO for cupcake factory",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "start": "2011-10-05T14:48:00.000Z",
        "description": "Dedicated technical wizard with a passion and interest in human relationships"
    }
    apiCall("job", "POST", payload, (data) => {
        console.log(data);
    });
});



// if register button is clicked
document.getElementById("register-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        name: document.getElementById("register-name").value,
    }

    
    // check if confirmed password and password are the same
    const confirmed_password = document.getElementById("register-confirm-password").value;
    if (confirmed_password != payload.password) {
        showErrorMessage("Password's don't match, try again");
        return;
    }

    apiCall("auth/register", "POST", payload, (data) => {
        setToken(data.token);
    });

});


// if login button is clicked
document.getElementById("login-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    }
    apiCall('auth/login', "POST", payload, (data) => {
        console.log("Successfully logged in", data);
        setToken(data.token);
        hide("section-logged-out");
        show("section-logged-in");
    });
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

// if modal form "watch" is clicked
document.getElementById("water-user-submit").addEventListener("click", () => {
    // get the email entered
    const email = document.getElementById("watch-user-email").value;
    // now just package it up and send it in an api
    const payload = {
        "email": email,
        "turnon": true,
    }

    apiCall("user/watch", "PUT", payload, (data) => {
        console.log(data);
    })
    

})


// logout button
document.getElementById("logout").addEventListener("click", () => {
    hide("section-logged-in");
    show("section-logged-out");
    localStorage.removeItem("token");
});


// MAIN
// if a token exists
if (localStorage.getItem('token')) {
    hide("section-logged-out");
    show("section-logged-in");
}