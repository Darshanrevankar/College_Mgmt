document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const responseMessage = document.querySelector(".response-message");
    const API_BASE_URL = 'https://college-mgmt.onrender.com/api/v1/main';

    const showMessage = (message, isError = false) => {
        responseMessage.textContent = message;
        responseMessage.style.color = isError ? 'red' : 'green';
        responseMessage.style.display = 'block';
        setTimeout(() => {
            responseMessage.style.display = 'none';
        }, 3000);
    };

    const handleRequest = async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            showMessage('Server error. Please try again later.', true);
        }
    };

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Prepare data based on the updated JSON structure
        const signupData = {
            name: signupForm.elements["signupName"].value.trim(),
            id: signupForm.elements["signupId"].value.trim(), // Ensure this is 'id' as per backend model
            email: signupForm.elements["signupEmail"].value.trim(),
            password: signupForm.elements["signupPassword"].value.trim(),
            word: signupForm.elements["signupScheme"].value.trim(), // Update this to 'word' as per backend model
        };

        // Check if any field is empty
        if (Object.values(signupData).some((field) => !field)) {
            showMessage("All fields are required.", true);
            return;
        }

        console.log(signupData); // Check the payload before sending

        // Send data to the API
        const response = await handleRequest(`${API_BASE_URL}/admin-register`, signupData);

        // Handle the response from the backend
        if (response && response.success) {
            showMessage(response.msg);
            signupForm.reset(); 
            setTimeout(() => { 
                window.location.href = 'main.html'; // Redirect after success
            }, 2000);
        } else {
            showMessage(response?.msg || 'Signup failed. Please try again.', true);
        }
    });
});
