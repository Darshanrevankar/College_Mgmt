document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const changePasswordForm = document.getElementById("signupForm");
    const responseMessage = document.querySelector(".response-message");

    const API_BASE_URL = 'https://college-mgmt.onrender.com/api/v1/main';

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

        const response = await handleRequest(`${API_BASE_URL}/admin-login`, loginData);
        if (response && response.success) {
            showMessage(response.msg);
            localStorage.setItem("token", response.payload.token);
            window.location.href = 'main.html';
        } else {
            showMessage(response?.msg || 'Login failed', true);
        }
    });


    changePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const changePasswordData = {
            email: changePasswordForm.elements["signupEmail"].value,
            word: changePasswordForm.elements["signupId"].value,
            newPassword: changePasswordForm.elements["signupPassword"].value,
        };

        const response = await handleRequest(`${API_BASE_URL}/changepassword`, changePasswordData);
        if (response && response.success) {
            showMessage(response.msg);
            changePasswordForm.reset();
            window.location.href = 'admin.html';
        } else {
            // Handle specific word error
            if (response?.msg === "The entered word is incorrect") {
                showMessage("The Key is incorrect", true);
            } else {
                showMessage(response?.msg || 'Password change failed', true);
            }
        }
    });
});
