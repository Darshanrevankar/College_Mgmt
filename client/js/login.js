document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const responseMessage = document.querySelector(".response-message");

    const API_BASE_URL = 'https://college-mgmt.onrender.com/api/v1/auth';

    const showMessage = (message, isError = false) => {
        responseMessage.textContent = message;
        responseMessage.style.color = isError ? 'red' : 'green';
        responseMessage.style.display = 'block';
        setTimeout(() => responseMessage.style.display = 'none', 3000);
    };

    const handleRequest = async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            showMessage('Server error. Please try again later.', true);
        }
    };

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const loginData = {
            email: loginForm.elements["loginEmail"].value,
            password: loginForm.elements["loginPassword"].value,
        };

        const response = await handleRequest(`${API_BASE_URL}/login`, loginData);
        if (response && response.success) {
            showMessage(response.msg);
            localStorage.setItem("token", response.payload.token);
            window.location.href = 'academic.html'; 
        } else {
            showMessage(response?.msg || 'Login failed', true);
        }
    });

    // Handle Signup Form Submission
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const signupData = {
            name: signupForm.elements["signupName"].value,
            email: signupForm.elements["signupEmail"].value,
            usn: signupForm.elements["signupId"].value,
            password: signupForm.elements["signupPassword"].value,
            branch: signupForm.elements["signupBranch"].value,
            scheme: signupForm.elements["signupScheme"].value,
        };

        const response = await handleRequest(`${API_BASE_URL}/register`, signupData);
        if (response && response.success) {
            showMessage(response.msg);
            window.location.href = 'login.html'; 
            signupForm.reset();
        } else {
            showMessage(response?.msg || 'Signup failed', true);
        }
    });
});
