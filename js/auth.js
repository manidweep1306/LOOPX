// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const signupFormWrapper = document.getElementById('signup-form-wrapper');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToSignupLink = document.getElementById('switch-to-signup');
    const switchToLoginLink = document.getElementById('switch-to-login');
    const navLoginLink = document.getElementById('nav-login-link');
    const navSignupLink = document.getElementById('nav-signup-link');
    const authMessageDiv = document.getElementById('auth-message');

    // Function to display messages
    const displayMessage = (message, type = 'info') => {
        authMessageDiv.textContent = message;
        authMessageDiv.className = 'auth-message'; // Reset classes
        if (type === 'success') {
            authMessageDiv.classList.add('success');
        } else if (type === 'error') {
            authMessageDiv.classList.add('error');
        } else {
            authMessageDiv.classList.add('info');
        }
        authMessageDiv.style.display = 'block';
        setTimeout(() => {
            authMessageDiv.style.display = 'none';
        }, 5000); // Hide message after 5 seconds
    };

    // Function to show a specific form and update active tab/nav link
    const showForm = (formType) => {
        authMessageDiv.style.display = 'none'; // Hide any previous messages
        if (formType === 'login') {
            loginFormWrapper.classList.remove('hidden');
            signupFormWrapper.classList.add('hidden');
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            if (navLoginLink) navLoginLink.classList.add('active-auth-link');
            if (navSignupLink) navSignupLink.classList.remove('active-auth-link');
        } else if (formType === 'signup') {
            signupFormWrapper.classList.remove('hidden');
            loginFormWrapper.classList.add('hidden');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            if (navSignupLink) navSignupLink.classList.add('active-auth-link');
            if (navLoginLink) navLoginLink.classList.remove('active-auth-link');
        }
    };

    // Event listeners for tab clicks
    if (loginTab) {
        loginTab.addEventListener('click', () => showForm('login'));
    }
    if (signupTab) {
        signupTab.addEventListener('click', () => showForm('signup'));
    }

    // Event listeners for switch links within forms
    if (switchToSignupLink) {
        switchToSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('signup');
        });
    }
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }

    // Handle initial form display based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const initialForm = urlParams.get('form');
    if (initialForm === 'signup') {
        showForm('signup');
    } else {
        showForm('login'); // Default to login form
    }

    // Firebase Authentication and Firestore Logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target['login-email'].value;
            const password = e.target['login-password'].value;

            if (!window.auth) {
                displayMessage('Firebase Auth not initialized. Cannot log in.', 'error');
                return;
            }

            try {
                // Sign in user with email and password
                const userCredential = await firebase.auth.signInWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;
                console.log('User logged in:', user.uid);
                displayMessage('Login successful! Redirecting...', 'success');

                // Optionally, fetch user profile data from Firestore
                const userProfileRef = firebase.firestore.doc(window.db, `artifacts/${window.appId}/users/${user.uid}/userProfiles`, user.uid);
                const userProfileSnap = await firebase.firestore.getDoc(userProfileRef);
                if (userProfileSnap.exists()) {
                    console.log('User profile:', userProfileSnap.data());
                } else {
                    console.log('User profile not found in Firestore.');
                }

                // Redirect to a dashboard or home page after successful login
                // For demonstration, we'll just show a message. In a real app, you'd navigate.
                setTimeout(() => {
                    window.location.href = 'index.html'; // Example redirect
                }, 1500);

            } catch (error) {
                console.error('Login error:', error.code, error.message);
                let errorMessage = 'Login failed. Please check your credentials.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Invalid email or password.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email format.';
                }
                displayMessage(errorMessage, 'error');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target['signup-username'].value;
            const email = e.target['signup-email'].value;
            const password = e.target['signup-password'].value;
            const confirmPassword = e.target['signup-confirm-password'].value;

            if (password !== confirmPassword) {
                displayMessage('Passwords do not match!', 'error');
                return;
            }

            if (!window.auth) {
                displayMessage('Firebase Auth not initialized. Cannot sign up.', 'error');
                return;
            }

            try {
                // Create user with email and password
                const userCredential = await firebase.auth.createUserWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;
                console.log('User signed up:', user.uid);

                // Store additional user data in Firestore
                const userProfileRef = firebase.firestore.doc(window.db, `artifacts/${window.appId}/users/${user.uid}/userProfiles`, user.uid);
                await firebase.firestore.setDoc(userProfileRef, {
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.serverTimestamp()
                });
                console.log('User profile created in Firestore for:', user.uid);

                displayMessage('Sign Up successful! Welcome to LoopX. Redirecting...', 'success');
                // Redirect to a dashboard or home page after successful sign up
                setTimeout(() => {
                    window.location.href = 'index.html'; // Example redirect
                }, 1500);

            } catch (error) {
                console.error('Sign Up error:', error.code, error.message);
                let errorMessage = 'Sign Up failed. Please try again.';
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already in use. Please try logging in or use a different email.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Please use at least 6 characters.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email format.';
                }
                displayMessage(errorMessage, 'error');
            }
        });
    }

    // Existing script.js functionality (hamburger menu)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle'); // Optional: for animating the hamburger icon
        });
    }
});
