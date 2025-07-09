// js/auth.js

// 1. Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyCB22CO6nb_22lvy2Ho5PByT3585CEkMfc",
    authDomain: "loopx-md.firebaseapp.com",
    projectId: "loopx-md",
    storageBucket: "loopx-md.firebasestorage.app",
    messagingSenderId: "47281549186",
    appId: "1:47281549186:web:2428c80c1a5a26cdbf299b",
    measurementId: "G-GEC5V0L164"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 2. Helper function to display messages
// THIS IS THE POSITION FOR displayMessage FUNCTION
function displayMessage(message, type) {
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
        messageBox.textContent = message;
        // Ensure only 'show' and the specific type class are added
        messageBox.className = 'message-box show ' + type;
        setTimeout(() => {
            messageBox.classList.remove('show');
            // Optionally, clear text if you want it completely gone
            // messageBox.textContent = '';
        }, 5000); // Hide after 5 seconds
    }
}


// 3. The auth.onAuthStateChanged listener (which builds dynamic navigation)
auth.onAuthStateChanged(user => {
    const navLinks = document.querySelector('.nav-links');

    if (navLinks) {
        navLinks.innerHTML = ''; // Clear existing navigation links
    } else {
        console.warn("Element with class 'nav-links' not found in the DOM.");
        return;
    }

    // --- Define the base navigation items ---
    const baseNavItems = [
        { text: 'Home', href: 'index.html' },
        { text: 'Earn', href: 'earn.html' },
        { text: 'Redeem', href: 'redeem.html' },
        { text: 'Sell', href: 'sell.html' },
        { text: 'About', href: 'about.html' },
        { text: 'Contact', href: 'contact.html' }
    ];

    baseNavItems.forEach(item => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.text;
        // For general navigation, usually you want page reloads.
        // If you want a Single Page Application (SPA) experience,
        // you'd add e.preventDefault() here and handle routing.
        listItem.appendChild(link);
        navLinks.appendChild(listItem);
    });

    // --- Add dynamic login/signup/logout links based on auth state ---
    if (user) {
        console.log("User logged in:", user.email);
        const logoutListItem = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = "#"; // Use '#' for a JS-handled link
        logoutLink.id = "logoutButton";
        logoutLink.textContent = "Logout";

        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default link behavior
            try {
                await auth.signOut();
                window.location.href = 'index.html'; // Redirect to home after logout
            } catch (error) {
                console.error("Logout error:", error);
                displayMessage(error.message, "error"); // Display error if logout fails
            }
        });
        logoutListItem.appendChild(logoutLink);
        navLinks.appendChild(logoutListItem);

    } else {
        console.log("User logged out.");
        const loginListItem = document.createElement('li');
        loginListItem.innerHTML = `<a href="login.html">Login</a>`;
        navLinks.appendChild(loginListItem);

        const signupListItem = document.createElement('li');
        signupListItem.innerHTML = `<a href="signup.html">Sign Up</a>`;
        navLinks.appendChild(signupListItem);
    }
});


// 4. Your signupForm event listener
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm['signup-name'].value;
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                credits: 0
            });

            console.log("User signed up and data stored:", user);
            displayMessage("Account created successfully! Redirecting...", "success");
            signupForm.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error("Signup error:", error);
            displayMessage(error.message, "error");
        }
    });
}

// 5. Your loginForm event listener
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        try {
            await auth.signInWithEmailAndPassword(email, password);

            console.log("User logged in.");
            displayMessage("Logged in successfully! Redirecting...", "success");
            loginForm.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error("Login error:", error);
            displayMessage(error.message, "error");
        }
    });
}
