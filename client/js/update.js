let currentStudentId = null;  // To store the ID of the currently selected student

async function fetchData() {
    try {
        const response = await fetch('https://college-mgmt.onrender.com/api/v1/admin/getScheme');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                populateDropdowns(data.payload.schemes);
            } else {
                console.error('No data available');
            }
        } else {
            console.error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function populateDropdowns(schemes) {
    const schemeDropdown = document.getElementById('scheme');
    const branchDropdown = document.getElementById('branch');
    const semesterDropdown = document.getElementById('semester');
    const subjectDropdown = document.getElementById('subject');

    // Clear existing options
    schemeDropdown.innerHTML = '<option value="" disabled selected>Scheme</option>';
    branchDropdown.innerHTML = '<option value="" disabled selected>Branch</option>';
    semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
    subjectDropdown.innerHTML = '<option value="" disabled selected>Subject</option>';

    schemes.forEach(scheme => {
        const schemeOption = document.createElement('option');
        schemeOption.value = scheme._id;
        schemeOption.textContent = scheme.scheme;
        schemeDropdown.appendChild(schemeOption);
    });

    // On change of Scheme, populate Branches dynamically
    schemeDropdown.addEventListener('change', function () {
        const selectedScheme = schemes.find(scheme => scheme._id === this.value);
        populateBranches(selectedScheme ? selectedScheme.branches : []);
        semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
        subjectDropdown.innerHTML = '<option value="" disabled selected>Subject</option>';
    });

    function populateBranches(branches) {
        branchDropdown.innerHTML = '<option value="" disabled selected>Branch</option>';
        branches.forEach(branch => {
            const branchOption = document.createElement('option');
            branchOption.value = branch.branchName;
            branchOption.textContent = branch.branchName;
            branchDropdown.appendChild(branchOption);
        });

        branchDropdown.addEventListener('change', function () {
            const selectedBranch = branches.find(branch => branch.branchName === this.value);
            populateSemesters(selectedBranch ? selectedBranch.semesters : []);
        });
    }

    function populateSemesters(semesters) {
        semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
        semesters.forEach(semester => {
            const semesterOption = document.createElement('option');
            semesterOption.value = semester.sem;
            semesterOption.textContent = semester.sem;
            semesterDropdown.appendChild(semesterOption);
        });

        semesterDropdown.addEventListener('change', function () {
            const selectedSemester = semesters.find(semester => semester.sem === this.value);
            populateSubjects(selectedSemester ? selectedSemester.subjects : []);
        });
    }

    function populateSubjects(subjects) {
        subjectDropdown.innerHTML = '<option value="" disabled selected>Subject</option>';
        subjects.forEach(subject => {
            const subjectOption = document.createElement('option');
            subjectOption.value = subject.subCode;
            subjectOption.textContent = subject.subName;
            subjectDropdown.appendChild(subjectOption);
        });
    }
}

async function filterData() {
    const selectedScheme = document.getElementById('scheme').value;
    const selectedBranch = document.getElementById('branch').value;
    const selectedSemester = document.getElementById('semester').value;
    const selectedSubject = document.getElementById('subject').value;

    if (selectedScheme && selectedBranch && selectedSemester && selectedSubject) {
        try {
            const response = await fetch(`https://college-mgmt.onrender.com/api/v1/admin/getAllStudentsDetails?scheme=${selectedScheme}&branch=${selectedBranch}&semester=${selectedSemester}&subject=${selectedSubject}`);
            const data = await response.json();

            if (data.success) {
                displayStudentDetails(data.payload.students, selectedSemester, selectedSubject);
            } else {
                alert('No students found for the selected criteria');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    } else {
        alert('Please select Scheme, Branch, Semester, and Subject.');
    }
}

function displayStudentDetails(students, selectedSemester, selectedSubject) {
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    if (students.length > 0) {
        const table = document.createElement('table');
        table.classList.add('student-table');

        // Table headers
        const headers = ['Name', 'USN', 'Internal Marks', 'External Marks', 'Total Marks', 'Result', 'Update'];
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        students.forEach(student => {
            const semesters = student.academics.semesters.filter(sem => sem.sem === selectedSemester);

            if (semesters.length > 0) {
                const subjects = semesters[0].subjects.filter(sub => sub.subCode === selectedSubject);
                subjects.forEach(subject => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.name}</td>
                        <td>${student.usn}</td>
                        <td><input type="text" value="${subject.internalMarks}" disabled /></td>
                        <td><input type="text" value="${subject.externalMarks}" disabled /></td>
                        <td>${subject.marks}</td>
                        <td>${subject.result}</td>
                        <td><button class="save-button" onclick="enableEditing('${student.usn}', '${subject.subCode}', '${subject.subName}', this)">Update</button></td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
        table.appendChild(tbody);

        detailsContainer.appendChild(table);
    } else {
        detailsContainer.innerHTML = '<p>No students found for the selected criteria.</p>';
    }
}

function enableEditing(studentId, subjectId, subjectName, button) {
    currentStudentId = studentId;

    const row = button.closest('tr');
    const cells = row.querySelectorAll('td'); // Get all `td` elements in the row

    const internalInput = cells[2].querySelector('input'); // Third column for Internal Marks
    const externalInput = cells[3].querySelector('input'); // Fourth column for External Marks

    if (internalInput) internalInput.disabled = false;
    if (externalInput) externalInput.disabled = false;

    // Change the button text to "Save"
    button.textContent = 'Save';
    button.setAttribute('onclick', `saveMarks('${studentId}', '${subjectId}','${subjectName}',  this)`);
}

async function saveMarks(studentId, subjectId, subjectName, button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');

    const internalInput = cells[2].querySelector('input'); // Internal Marks
    const externalInput = cells[3].querySelector('input'); // External Marks

    // Get the internal and external marks
    const internalMarks = parseInt(internalInput.value);
    const externalMarks = parseInt(externalInput.value);

    // Calculate total marks
    const totalMarks = internalMarks + externalMarks;

    // Determine result (pass or fail)
    const result = (internalMarks >= 18 && externalMarks >= 18) ? 'P' : 'F';

    // Update the row to show the total marks and result
    cells[4].textContent = totalMarks; // Total Marks
    cells[5].textContent = result; // Result

    // Prepare the data to send to the backend
    const updatedSubject = {
        subName: subjectName,
        subCode: subjectId,
        internalMarks: internalMarks,
        externalMarks: externalMarks,
        marks: totalMarks,
        result: result
    };

    // console.log(updatedSubject)
    // Prepare the data payload
    const data = {
        usn: studentId,
        sem: document.getElementById('semester').value,  // Get the semester from the row's dataset
        updatedSubjects: [updatedSubject]
    };
    console.log(data)

    try {
        // Send the updated data to the backend
        const response = await fetch('https://college-mgmt.onrender.com/api/v1/user/academics/addMarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log(response.json)

        const responseData = await response.json();
        if (responseData.success) {
            // alert('Marks updated successfully!');
            
            button.textContent = 'Updated';
            button.setAttribute('disabled', true);
        } else {
            alert('Failed to update marks');
        }
    } catch (error) {
        console.error('Error saving marks:', error);
        alert('Error saving marks');
    }
}

// Call the fetchData function to load the scheme and branch data
fetchData();
