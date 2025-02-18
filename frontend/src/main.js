import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

// To show an element by removing the hide class
const show = (element) => {
    document.getElementById(element).classList.remove("hide");
}

// To hide an element by adding the hide class
const hide = (element) => {
    document.getElementById(element).classList.add("hide");
}

/*  Displays an error message
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
    page.appendChild(err);
    $("#error").modal("show");
}

// Displays a success message, reuses the error modal but makes adjustments
const cloneShowSuccessMessage = (message, element) => {
    if (document.querySelectorAll("#error")) {
        document.querySelectorAll("#error").forEach(element => {
            element.removeAttribute("id");
        });
    }
    const err = document.getElementById("error-modal").cloneNode(true);
    err.removeAttribute('id');
    err.setAttribute('id', "error")

    let title = err.querySelector("#error-modal-title")
    let text = document.createTextNode("Success!")
    title.innerText = "";
    title.appendChild(text);

    const div = document.createElement("div");
    const textNode = document.createTextNode(message);
    div.appendChild(textNode);
    div.classList.add("alert", "alert-success");
    const modal_body = err.querySelector(".modal-body");
    modal_body.appendChild(div);

    // append to some div-page
    const page = document.getElementById(element);
    page.appendChild(err);
    $("#error").modal("show");
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
        path += '?' + ( new URLSearchParams( payload ) ).toString();
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
    apiCall("job", "POST", payload, "section-logged-in", (data) => {
        cloneShowSuccessMessage("Successfully created a job", "section-logged-in")
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
        cloneShowSuccessMessage("Successfully registered email, try logging in", "register-page");
    });

});


// if login button is clicked
document.getElementById("login-btn").addEventListener("click", () => {
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    }
    apiCall('auth/login', "POST", payload, "login-page", (data) => {
        setToken(data.token);
        hide("section-logged-out");
        show("section-logged-in");
        localStorage.setItem("userid", data.userId);
    });
});


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
    // get the email entered within the modal
    const email = document.getElementById("watch-user-email").value;
    const payload = {
        "email": email,
        "turnon": true,
    }
    apiCall("user/watch", "PUT", payload, "section-logged-in", (data) => {
        cloneShowSuccessMessage(`Started watching user with the email ${email}`, "section-logged-in")
    })
    
})

// view my profile
document.getElementById("my-profile-btn").addEventListener("click", () => {
    // get userId from localStorage
    const id = localStorage.getItem("userid");
    // Now we can make the api call with the user id as one of the params

    const payload = {
        userId: id,
    }

    apiCall("user", "GET", payload, "own-profile", (data) => {
        hide("home");
        show("own-profile");

        if (document.querySelector("#profile-made")) {
            const element = document.querySelector("#profile-made");
            element.innerText = '';
            element.removeAttribute("id");
        };
        
        // make the profile page
        if (!document.querySelector("#profile-made")) {
            const page = document.getElementById("own-profile");
            let ul = document.createElement("ul");
            ul.classList.add("list-group");
            ul.setAttribute("id", "profile-made")

            // add name to page
            let li = document.createElement("li");
            li.classList.add("list-group-item")
            let textNode = document.createTextNode(`Name: ${data.name}`)
            li.appendChild(textNode);
            ul.appendChild(li);

            // add email to page
            li = document.createElement("li");
            li.classList.add("list-group-item")
            textNode = document.createTextNode(`Email: ${data.email}`)
            li.appendChild(textNode);
            ul.appendChild(li);

            // add User id
            li = document.createElement("li");
            li.classList.add("list-group-item")
            textNode = document.createTextNode(`User ID: ${data.id}`)
            li.appendChild(textNode);
            ul.appendChild(li);

            // the number of users who watch the logged in user
            li = document.createElement("li");
            li.classList.add("list-group-item")
            textNode = document.createTextNode(`Number of users who watch me: ${data.watcheeUserIds.length}`)
            li.appendChild(textNode);
            ul.appendChild(li);


            // Users who watch this profile, title of list
            li = document.createElement("li");
            li.classList.add("list-group-item")
            textNode = document.createTextNode(`User IDs who watch me: `)
            li.appendChild(textNode);
            
            // make list for list of users who watch user
            let innerUL = document.createElement("ul");
            innerUL.classList.add("list-group");
            // Each user who watches logged in user
            for (let i = 0; i < data.watcheeUserIds.length; i++) {
                let innerLi = document.createElement("li");
                innerLi.classList.add("list-group-item")
                textNode = document.createTextNode(data.watcheeUserIds[i]);
                innerLi.appendChild(textNode);
                innerUL.appendChild(innerLi);
            }
            
            li.appendChild(innerUL);
            ul.appendChild(li);
            
            // Job list
            li = document.createElement("li");
            li.classList.add("list-group-item")
            textNode = document.createTextNode(`Jobs: `)
            li.appendChild(textNode);
            
            // make list for list of users who watch user
            innerUL = document.createElement("ul");
            innerUL.classList.add("list-group");
            // Each user who watches logged in user
            for (let i = 0; i < data.jobs.length; i++) {
                let innerLi = document.createElement("li");
                innerLi.classList.add("list-group-item")
                textNode = document.createTextNode(`Job Title: ${data.jobs[i].title}`);
                innerLi.appendChild(textNode);
                innerUL.appendChild(innerLi);
            }
            
            li.appendChild(innerUL);
            ul.appendChild(li);


            // add whole list to page
            page.appendChild(ul);
        }
    })
});

// updating details
document.getElementById("update-details-submit").addEventListener("click", () => {
    const payload = {
        name: document.getElementById("update-details-name").value,
        email: document.getElementById("update-details-email").value,
        password: document.getElementById("update-details-password").value,
        image: document.getElementById("update-details-image").value,
    }
    apiCall("user", "PUT", payload, "own-profile", (data) => {
        cloneShowSuccessMessage("Successfully updated your details, click the My Profile tab to see changes", "section-logged-in")
    })
});



// home button
document.getElementById("home-btn").addEventListener("click", () => {
    hide("own-profile");
    show("home");
    const payload = {
        start: 0,
    }
    apiCall('job/feed', 'GET', payload, "home", (data) => {
        console.log(data)
        document.getElementById('feed-items').textContent = '';
        const page = document.getElementById("feed-items");
        const ul = document.createElement("ul");
        ul.classList.add("list-group");
        for (const feedItem of data) {
            let li = document.createElement("li");
            li.classList.add("list-group-item")

            let innerUL = document.createElement("ul");
            innerUL.classList.add("list-group")
            
            let textNode = document.createTextNode(`Job Title: ${feedItem.title}`);
            let innerLi = document.createElement("li");
            innerLi.classList.add("list-group-item")
            innerLi.appendChild(textNode);
            innerUL.appendChild(innerLi);

            // Image
            innerLi = document.createElement("li");
            innerLi.classList.add("list-group-item")
            let img = document.createElement("img");
            img.setAttribute("src", feedItem.image);
            img.setAttribute("alt", `image for ${feedItem.title}`)
            innerLi.appendChild(img);
            innerUL.appendChild(innerLi);

            // Created at time
            innerLi = document.createElement("li");
            innerLi.classList.add("list-group-item")
            textNode = document.createTextNode(`Created : ${feedItem.createdAt}`);
            innerLi.appendChild(textNode);
            innerUL.appendChild(innerLi);

            // Description
            innerLi = document.createElement("li");
            innerLi.classList.add("list-group-item")
            textNode = document.createTextNode(`Description: ${feedItem.description}`);
            innerLi.appendChild(textNode);
            
            innerUL.appendChild(innerLi);
            li.appendChild(innerUL);
            ul.appendChild(li);

            // Like Count and Comment Count
            innerLi = document.createElement("li");
            innerLi.classList.add("list-group-item")
            textNode = document.createTextNode(`Likes: ${feedItem.likes.length}, Comments: ${feedItem.comments.length}`);
            innerLi.appendChild(textNode);
            innerUL.appendChild(innerLi);
            

            li.appendChild(innerUL);
            ul.appendChild(li);

      }
      page.appendChild(ul);
    });
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
}