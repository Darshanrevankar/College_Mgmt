let schema = {
    scheme: '',
    branches: []
};

// DOM Elements
const schemeYearInput = document.getElementById('schemeYear');
const addBranchButton = document.getElementById('addBranch');
const updateSchemaButton = document.getElementById('updateSchema');
const submitFormButton = document.getElementById('submitForm');
const addNewSchemaButton = document.getElementById('addNewSchema');
const branchesContainer = document.getElementById('branchesContainer');

// Event Listeners
schemeYearInput.addEventListener('input', (e) => {
    schema.scheme = e.target.value;
});

addBranchButton.addEventListener('click', addBranch);
updateSchemaButton.addEventListener('click', fetchSchemeData);
submitFormButton.addEventListener('click', handleSubmit);
addNewSchemaButton.addEventListener('click', () => {
    schema = { scheme: '', branches: [] }; // Reset schema
    schemeYearInput.value = ''; // Clear input field
    branchesContainer.innerHTML = ''; // Clear branches container
    alert('You can now add a new schema.');
});

// Add a new branch
function addBranch() {
    const branchIndex = schema.branches.length;
    schema.branches.push({ branchName: '', semesters: [] });
    renderBranch(branchIndex);
}

// Render a branch
function renderBranch(branchIndex) {
    const branch = schema.branches[branchIndex];
    const branchElement = document.createElement('div');
    branchElement.className = 'schema_card';
    branchElement.innerHTML = `
        <input type="text" class="branch-name" placeholder="Branch Name" value="${branch.branchName}" required>
        <div class="branch-content">
            <button class="add-semester primary-button">Add Semester</button>
            <div class="semesters-container"></div>
            <button class="delete-branch delete-button">Delete Branch</button>
        </div>
    `;

    branchElement.querySelector('.branch-name').addEventListener('input', (e) => {
        schema.branches[branchIndex].branchName = e.target.value;
    });

    branchElement.querySelector('.add-semester').addEventListener('click', () => addSemester(branchIndex));
    branchElement.querySelector('.delete-branch').addEventListener('click', () => deleteBranch(branchIndex));

    branchesContainer.appendChild(branchElement);
    renderSemesters(branchIndex);
}

// Add a semester to a branch
function addSemester(branchIndex) {
    const semesterIndex = schema.branches[branchIndex].semesters.length;
    schema.branches[branchIndex].semesters.push({ sem: `Semester ${semesterIndex + 1}`, subjects: [] });
    renderSemester(branchIndex, semesterIndex);
}

// Render semesters
function renderSemesters(branchIndex) {
    const semestersContainer = branchesContainer.children[branchIndex].querySelector('.semesters-container');
    semestersContainer.innerHTML = '';
    schema.branches[branchIndex].semesters.forEach((_, semesterIndex) => {
        renderSemester(branchIndex, semesterIndex);
    });
}

// Render a semester
function renderSemester(branchIndex, semesterIndex) {
    const semester = schema.branches[branchIndex].semesters[semesterIndex];
    const semesterElement = document.createElement('div');
    semesterElement.className = 'schema_card';
    semesterElement.innerHTML = `
        <div class="card-title">${semester.sem}</div>
        <div class="semester-content">
            <div class="subject-form">
                <input type="text" class="subject-name" placeholder="Subject Name">
                <input type="text" class="subject-code" placeholder="Subject Code">
                <input type="number" class="subject-credits" placeholder="Credits">
                <button class="add-subject primary-button">Add Subject</button>
            </div>
            <div class="subjects-container"></div>
            <button class="delete-semester delete-button">Delete Semester</button>
        </div>
    `;

    semesterElement.querySelector('.add-subject').addEventListener('click', () => {
        const subjectNameInput = semesterElement.querySelector('.subject-name');
        const subjectCodeInput = semesterElement.querySelector('.subject-code');
        const subjectCreditsInput = semesterElement.querySelector('.subject-credits');

        const subjectName = subjectNameInput.value.trim();
        const subjectCode = subjectCodeInput.value.trim();
        const subjectCredits = parseInt(subjectCreditsInput.value, 10);

        if (subjectName && subjectCode && !isNaN(subjectCredits)) {
            schema.branches[branchIndex].semesters[semesterIndex].subjects.push({
                subName: subjectName,
                subCode: subjectCode,
                subCredits: subjectCredits,
            });

            subjectNameInput.value = '';
            subjectCodeInput.value = '';
            subjectCreditsInput.value = '';

            renderSubjects(branchIndex, semesterIndex);
        } else {
            alert('Please fill out all fields correctly.');
        }
    });

    semesterElement.querySelector('.delete-semester').addEventListener('click', () => deleteSemester(branchIndex, semesterIndex));

    const semestersContainer = branchesContainer.children[branchIndex].querySelector('.semesters-container');
    semestersContainer.appendChild(semesterElement);

    renderSubjects(branchIndex, semesterIndex);
}

// Render subjects
function renderSubjects(branchIndex, semesterIndex) {
    const subjectsContainer = branchesContainer.children[branchIndex].querySelector('.semesters-container').children[semesterIndex].querySelector('.subjects-container');
    subjectsContainer.innerHTML = '';
    schema.branches[branchIndex].semesters[semesterIndex].subjects.forEach((subject, subjectIndex) => {
        const subjectElement = document.createElement('div');
        subjectElement.className = 'subject-item';
        subjectElement.innerHTML = `
            <span>${subject.subName} (${subject.subCode}) - ${subject.subCredits} credits</span>
            <button class="delete-subject delete-button">Delete</button>
        `;
        subjectElement.querySelector('.delete-subject').addEventListener('click', () => deleteSubject(branchIndex, semesterIndex, subjectIndex));
        subjectsContainer.appendChild(subjectElement);
    });
}

// Delete branch
function deleteBranch(branchIndex) {
    schema.branches.splice(branchIndex, 1);
    branchesContainer.removeChild(branchesContainer.children[branchIndex]);
}

// Delete semester
function deleteSemester(branchIndex, semesterIndex) {
    schema.branches[branchIndex].semesters.splice(semesterIndex, 1);
    renderSemesters(branchIndex);
}

// Delete subject
function deleteSubject(branchIndex, semesterIndex, subjectIndex) {
    schema.branches[branchIndex].semesters[semesterIndex].subjects.splice(subjectIndex, 1);
    renderSubjects(branchIndex, semesterIndex);
}

// Fetch scheme details
async function fetchSchemeData() {
    const schemeYear = schemeYearInput.value.trim();
    if (!schemeYear) {
        alert('Please enter a scheme year to fetch details.');
        return;
    }

    try {
        updateSchemaButton.innerText = 'Loading...';
        updateSchemaButton.disabled = true;

        const response = await fetch(`http://localhost:5000/api/v1/admin/getScheme?year=${schemeYear}`);
        const data = await response.json();

        if (response.ok && data.success && data.payload.schemes.length > 0) {
            const fetchedSchema = data.payload.schemes.find(scheme => scheme.scheme === schemeYear);
            if (fetchedSchema) {
                schema = {
                    scheme: fetchedSchema.scheme,
                    branches: fetchedSchema.branches.map(branch => ({
                        branchName: branch.branchName,
                        semesters: branch.semesters.map(semester => ({
                            sem: semester.sem,
                            subjects: semester.subjects.map(subject => ({
                                subName: subject.subName,
                                subCode: subject.subCode,
                                subCredits: subject.subCredits
                            }))
                        }))
                    })),
                    id: true
                };

                branchesContainer.innerHTML = '';
                schema.branches.forEach((_, index) => renderBranch(index));
            } else {
                alert('No data found for the entered scheme.');
            }
        } else {
            alert('No scheme data found for the entered year.');
        }
    } catch (error) {
        alert('Error fetching scheme details.');
        console.error(error);
    } finally {
        updateSchemaButton.innerText = 'Update Schema';
        updateSchemaButton.disabled = false;
    }
}

async function handleSubmit() {
    if (!schema.scheme) {
        alert('Scheme year is required.');
        return;
    }

    console.log('Submitting schema:', schema);
    console.log('Submitting schema:', schema.id);

    const url = schema.id
        ? 'http://localhost:5000/api/v1/admin/updateScheme' 
        : 'http://localhost:5000/api/v1/admin/addScheme'; 

    const method = schema.id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schema),
        });

        const data = await response.json();

        if (data.success) {
            alert(schema.id ? 'Schema updated successfully.' : 'New schema added successfully.');
        } else {
            alert('Failed to save schema.');
        }
    } catch (error) {
        alert('Error saving schema.');
        console.error(error);
    }
}
