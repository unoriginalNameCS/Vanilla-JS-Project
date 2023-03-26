import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

/*
    - message: the string to be displayed as the error message
    - element: the page/div the error message/modal to be displayed on
*/
const cloneShowErrorMessage = (message, element) => {
    // remove any modal before that has an error id
    if (document.querySelectorAll("#error")) {
        document.querySelectorAll("#error").forEach(element => {
            element.removeAttribute("id");
        });
    }
    const err = document.getElementById("error-modal").cloneNode(true);
    err.removeAttribute('id');
    err.setAttribute('id', "error")
    const div = document.createElement("div");
    const textNode = document.createTextNode(message);
    div.appendChild(textNode);
    div.classList.add("alert", "alert-danger");
    const modal_body = err.querySelector(".modal-body");
    modal_body.appendChild(div);

    // append to some div-page
    const page = document.getElementById(element);
    console.log(page);
    page.appendChild(err);
    $("#error").modal("show");
    return;
}


/*  Function for making API calls
    Params:
    path - string to be appended onto end of url as the path in site
    method - string of method to be executed e.g. "GET", "POST"
    payload - the params within the request
    success - function to be executed if request is successfully made
*/
const apiCall = (path, method, payload, page, success) => {
    const options = {
        method: method,
        headers: {
            'Content-type': 'application/json',
        },
    }
    
    if (method === "GET") {
        console.log("Get method")
        path += '?' + ( new URLSearchParams( payload ) ).toString();
        console.log("http://localhost:5005/" + path)
    } else {
        options.body = JSON.stringify(payload)
    }

    if (localStorage.getItem('token')) {
        options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    fetch("http://localhost:5005/" + path, options)
        .then((res) => {
            res.json()
                .then((data) => {
                    if (data.error) {
                        // show the error message via a modal
                        cloneShowErrorMessage(data.error, page);
                    } else {
                        if (success) {
                            success(data);
                        }
                    }
                });
        });
}

// Stores token within localStorage
const setToken = (token) => {
    localStorage.setItem('token', token);
};


// create job
document.getElementById("create-job-submit").addEventListener("click", () => {
    const payload = {
        title: document.getElementById("create-job-title").value,
        image: document.getElementById("create-job-image").value,
        start: document.getElementById("create-job-start").value,
        description: document.getElementById("create-job-desc").value,
    }
    console.log(payload);
    apiCall("job", "POST", payload, "section-logged-in", (data) => {
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
        cloneShowErrorMessage("Password's don't match, try again", "register-page");
        return;
    }

    apiCall("auth/register", "POST", payload, "register-page", (data) => {
        setToken(data.token);
    });

});


// if login button is clicked
document.getElementById("login-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    }
    apiCall('auth/login', "POST", payload, "login-page", (data) => {
        console.log("Successfully logged in", data);
        setToken(data.token);
        hide("section-logged-out");
        show("section-logged-in");
        // store the user id in local-storage
        localStorage.setItem("userid", data.userId);
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
document.getElementById("watch-user-submit").addEventListener("click", () => {
    // get the email entered
    const email = document.getElementById("watch-user-email").value;
    // now just package it up and send it in an api
    const payload = {
        "email": email,
        "turnon": true,
    }
    apiCall("user/watch", "PUT", payload, "section-logged-in", (data) => {
        console.log(data);
    })
    
})

// view my profile
document.getElementById("my-profile").addEventListener("click", () => {
    // get userId from localStorage
    const id = localStorage.getItem("userid");
    // Now we can make the api call with the user id as one of the params
    console.log("From down under, ", id);

    const payload = {
        userId: id,
    }

    apiCall("user", "GET", payload, "section-logged-in", (data) => {
        console.log("we made it")
        console.log(data);
    })
});





// logout button
document.getElementById("logout").addEventListener("click", () => {
    hide("section-logged-in");
    show("section-logged-out");
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
});


// MAIN
// if a token exists
if (localStorage.getItem('token')) {
    hide("section-logged-out");
    show("section-logged-in");
    console.log(localStorage.getItem("token"));
}