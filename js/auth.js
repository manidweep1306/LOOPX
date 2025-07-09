// Your Firebase configuration (copy this from your Firebase project settings)
const firebaseConfig = {
    apiKey: "AIzaSyCB22CO6nb_22lvy2Ho5PByT3585CEkMfc",
    authDomain: "loopx-md.firebaseapp.com",
    projectId: "loopx-md",
    storageBucket: "loopx-md.firebasestorage.app",
    messagingSenderId: "47281549186",
    appId: "1:47281549186:web:2428c80c1a5a26cdbf299b",
    measurementId: "G-GEC5V0L164"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase Auth and Firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// --- Helper function to display messages ---
function displayMessage(elementId, message, type) {
    const msgBox = document.getElementById(elementId);
    if (msgBox) {
        msgBox.textContent = message;
        msgBox.className = `message-box show ${type}`; // Add type for styling
        setTimeout(() => {
            msgBox.className = 'message-box'; // Hide after a delay
        }, 5000);
    }
}

// --- Signup Logic ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm['signupName'].value;
        const email = signupForm['signupEmail'].value;
        const password = signupForm['signupPassword'].value;
        const confirmPassword = signupForm['confirmPassword'].value;
        const signupMessage = document.getElementById('signupMessage');

        if (password !== confirmPassword) {
            displayMessage('signupMessage', 'Passwords do not match.', 'error');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store additional user info in Firestore (e.g., name, initial credits)
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                credits: 0, // New users start with 0 credits
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            displayMessage('signupMessage', 'Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html'; // Redirect to login page
            }, 2000);

        } catch (error) {
            console.error("Signup error:", error);
            let errorMessage = "An error occurred during signup.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password should be at least 6 characters.";
            }
            displayMessage('signupMessage', errorMessage, 'error');
        }
    });
}

// --- Login Logic ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['loginEmail'].value;
        const password = loginForm['loginPassword'].value;
        const loginMessage = document.getElementById('loginMessage');

        try {
            await auth.signInWithEmailAndPassword(email, password);
            displayMessage('loginMessage', 'Login successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'earn.html'; // Redirect to earnings dashboard or a user dashboard
            }, 2000);
        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Invalid email or password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            }
            displayMessage('loginMessage', errorMessage, 'error');
        }
    });
}

// --- Logout Logic (Add to existing script.js or main header if desired) ---
// This part is illustrative and assumes you'll add a logout button.
/*
const logoutButton = document.getElementById('logoutButton'); // You'll need to add this button to your HTML
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('Logged out successfully!');
            window.location.href = 'index.html'; // Redirect to home page after logout
        } catch (error) {
            console.error("Logout error:", error);
            alert('Error logging out: ' + error.message);
        }
    });
}
*/

// --- Auth State Listener (for protecting routes/showing user info) ---
auth.onAuthStateChanged(user => {
    // This function runs whenever the user's sign-in state changes.
    // You can use this to update UI (e.g., show "Welcome, [User Name]" or "Login/Signup" links)
    // or to redirect users if they try to access protected pages without logging in.

    // Example for updating header:
    const navLinks = document.querySelector('.nav-links');
    const authLinks = `
        <li id="navLogin"><a href="login.html">Login</a></li>
        <li id="navSignup"><a href="signup.html">Sign Up</a></li>
    `;
    const userLinks = `
        <li><a href="earn.html">My Dashboard</a></li>
        <li id="navLogout"><a href="#">Logout</a></li>
    `;

    // Remove existing login/signup/user links before adding new ones
    if (document.getElementById('navLogin')) document.getElementById('navLogin').remove();
    if (document.getElementById('navSignup')) document.getElementById('navSignup').remove();
    if (document.getElementById('navLogout')) document.getElementById('navLogout').remove(); // If exists

    if (user) {
        // User is signed in.
        console.log("User logged in:", user.email);
        if (navLinks) {
             // You might want to remove existing Sell, Earn, Redeem, App links and add user-specific links.
             // For simplicity, let's just add logout. You can refine this based on your UX.
            const logoutListItem = document.createElement('li');
            logoutListItem.innerHTML = `<a href="#" id="logoutButton">Logout</a>`;
            navLinks.appendChild(logoutListItem);

            // Add event listener for logout
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await auth.signOut();
                        // alert('Logged out successfully!'); // Consider removing this for smoother UX
                        window.location.href = 'index.html'; // Redirect to home
                    } catch (error) {
                        console.error("Logout error:", error);
                        // alert('Error logging out: ' + error.message);
                    }
                });
            }
        }
    } else {
        // User is signed out.
        console.log("User logged out.");
        if (navLinks) {
            const loginListItem = document.createElement('li');
            loginListItem.id = 'navLogin';
            loginListItem.innerHTML = `<a href="login.html">Login</a>`;
            navLinks.appendChild(loginListItem);

            const signupListItem = document.createElement('li');
            signupListItem.id = 'navSignup';
            signupListItem.innerHTML = `<a href="signup.html">Sign Up</a>`;
            navLinks.appendChild(signupListItem);
        }
    }
});
