const apiUrl = "http://localhost:5000/api/v1/admin/getAllStudentsDetails";
    let studentsData = [];

    // Fetch Student Data
    async function fetchStudentDetails() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.success && data.payload.students.length > 0) {
                studentsData = data.payload.students;
            } else {
                document.getElementById("students-container").innerText = "No student data available.";
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
        }
    }

    // Populate dropdowns with fetched data
    async function populateDropdowns() {
        try {
            const schemesResponse = await fetch("http://localhost:5000/api/v1/admin/getScheme");
            const schemesData = await schemesResponse.json();

            if (schemesData.success) {
                const schemes = schemesData.payload.schemes;
                const schemeDropdown = document.getElementById("scheme");
                const branchDropdown = document.getElementById("branch");
                const semesterDropdown = document.getElementById("semester");

                // Populate scheme dropdown
                schemeDropdown.innerHTML = '<option value="" disabled selected>Scheme</option>';
                schemes.forEach(scheme => {
                    const option = document.createElement("option");
                    option.value = scheme.scheme;
                    option.textContent = scheme.scheme;
                    schemeDropdown.appendChild(option);
                });

                // Update branches on scheme change
                schemeDropdown.addEventListener("change", function () {
                    const selectedScheme = schemes.find(s => s.scheme === this.value);
                    populateBranches(selectedScheme.branches);
                    semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
                });

                // Populate branches
                function populateBranches(branches) {
                    branchDropdown.innerHTML = '<option value="" disabled selected>Branch</option>';
                    branches.forEach(branch => {
                        const option = document.createElement("option");
                        option.value = branch.branchName;
                        option.textContent = branch.branchName;
                        branchDropdown.appendChild(option);
                    });

                    branchDropdown.addEventListener("change", function () {
                        const selectedBranch = branches.find(b => b.branchName === this.value);
                        populateSemesters(selectedBranch.semesters);
                    });
                }

                // Populate semesters
                function populateSemesters(semesters) {
                    semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
                    semesters.forEach(semester => {
                        const option = document.createElement("option");
                        option.value = semester.sem;
                        option.textContent = semester.sem;
                        semesterDropdown.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error("Error populating dropdowns:", error);
        }
    }

    // Filter top 5 students
    async function filterTopStudents() {
        const scheme = document.getElementById("scheme").value;
        const branch = document.getElementById("branch").value;
        const semester = document.getElementById("semester").value;

        if (!scheme || !branch || !semester) {
            alert("Please select Scheme, Branch, and Semester.");
            return;
        }

        const filteredStudents = studentsData.filter(student => {
            return (
                student.scheme === scheme &&
                student.branch === branch &&
                student.academics.semesters.some(sem => sem.sem === semester)
            );
        });

        // Calculate total marks for each student and find average
        const studentsWithMarks = filteredStudents.map(student => {
            const semesterData = student.academics.semesters.find(sem => sem.sem === semester);
            const totalMarks = semesterData.subjects.reduce((sum, subject) => sum + (subject.marks || 0), 0);
            const avgMarks = totalMarks / semesterData.subjects.length;
            return {
                name: student.name,
                usn: student.usn,
                avgMarks: avgMarks.toFixed(2),
                sgpa: semesterData.sgpa,
                cgpa: calculateCGPA(student.academics.semesters),
            };
        });

        // Sort by average marks in descending order and get top 5
        const topStudents = studentsWithMarks
            .sort((a, b) => b.avgMarks - a.avgMarks)
            .slice(0, 10);

        // Display top students
        displayTopStudents(topStudents);
    }

    function calculateCGPA(semesters) {
        const totalSGPA = semesters.reduce((sum, sem) => sum + sem.sgpa, 0);
        return ((totalSGPA / semesters.length)*10).toFixed(2);
    }

    function displayTopStudents(topStudents) {
        const container = document.getElementById("students-container");
        container.innerHTML = "";

        if (topStudents.length === 0) {
            container.innerHTML = "<p class='no-data'>No students match the selected criteria.</p>";
            return;
        }

        const table = document.createElement("table");
        const thead = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>USN</th>
                    <th>Average Marks</th>
                    <th>SGPA</th>
                    <th>CGPA</th>
                </tr>
            </thead>
        `;
        table.innerHTML = thead;

        const tbody = document.createElement("tbody");
        topStudents.forEach(student => {
            const row = `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.usn}</td>
                    <td>${student.avgMarks}</td>
                    <td>${student.sgpa.toFixed(2)}</td>
                    <td>${student.cgpa}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }

    fetchStudentDetails();
    populateDropdowns();