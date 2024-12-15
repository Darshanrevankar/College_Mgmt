pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const preview = document.getElementById('preview');
const semesterDropdown = document.getElementById('semesterDropdown');
const usnInput = document.getElementById('getusn');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
});

dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handlePDFFile(file);
    } else {
        showStatus('Please upload a PDF file', 'error');
    }
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        handlePDFFile(file);
    } else {
        showStatus('Please upload a PDF file', 'error');
    }
});

const showStatus = (message, type) => {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = message ? 'block' : 'none';
};

async function handlePDFFile(file) {
    try {
        showStatus('Processing PDF...', '');

        const semester = semesterDropdown.value;
        const usn = usnInput.value.trim();

        if (!semester) {
            showStatus('Please select a semester before uploading.', 'error');
            return;
        }

        if (!usn) {
            showStatus('Please enter a valid USN before uploading.', 'error');
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);

        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });

        const imageFile = new File([blob], 'page1.jpg', { type: 'image/jpeg' });

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('sem', semester);
        formData.append('usn', usn);

        const response = await fetch('https://college-mgmt.onrender.com/api/v1/user/upload-image', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const responseData = await response.json();

        if (response.ok) {
            showStatus('First page successfully converted and uploaded!', 'success');
            preview.src = URL.createObjectURL(blob);
            preview.style.display = 'block';
        } else {
            throw new Error(responseData.msg || 'Upload failed');
        }
    } catch (error) {
        showStatus('Error processing PDF: ' + error.message, 'error');
    }
}