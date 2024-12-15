async function fetchData() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/admin/getScheme');
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

    schemeDropdown.innerHTML = '<option value="" disabled selected>Scheme</option>';
    branchDropdown.innerHTML = '<option value="" disabled selected>Branch</option>';
    semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';

    schemes.forEach(scheme => {
        const schemeOption = document.createElement('option');
        schemeOption.value = scheme.scheme;
        schemeOption.textContent = scheme.scheme;
        schemeDropdown.appendChild(schemeOption);
    });

    schemeDropdown.addEventListener('change', function () {
        const selectedScheme = schemes.find(scheme => scheme.scheme === this.value);
        populateBranches(selectedScheme ? selectedScheme.branches : []);
        semesterDropdown.innerHTML = '<option value="" disabled selected>Semester</option>';
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
    }
}

const apiUrl = "http://localhost:5000/api/v1/admin/getAllStudentsDetails";
let studentsData = [];

async function fetchStudentDetails() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.payload.students.length > 0) {
            studentsData = data.payload.students;
            filterStudents("Information Science and Engineering", "4", "2021");
        } else {
            document.getElementById("students-container").innerText = "No student data available.";
        }
    } catch (error) {
        console.error("Error fetching student details:", error);
    }
}

function filterStudents(defaultBranch = "", defaultSemester = "", defaultScheme = "") {
    const branch = defaultBranch || document.getElementById("branch").value;
    const semester = defaultSemester || document.getElementById("semester").value;
    const scheme = defaultScheme || document.getElementById("scheme").value;
    console.log(branch, semester, scheme)
    const filteredStudents = studentsData.filter(student => {
        return (
            (!branch || student.branch === branch) &&
            (!scheme || student.scheme === scheme) &&
            student.academics.semesters.some(sem => sem.sem === semester)
        );
    });

    displayStudents(filteredStudents, semester);
    updateStatistics(filteredStudents, semester);
    generatePassPercentageChart(filteredStudents, semester);
    calculateStudentDistribution(filteredStudents, semester);
}

function displayStudents(students, semesterFilter) {
    const container = document.getElementById("students-container");
    container.innerHTML = "";

    if (students.length === 0) {
        container.innerHTML = "<p class='no-data'>No students match the selected criteria.</p>";
        return;
    }

    const uniqueSubjects = new Set();

    // Collect unique subjects for the semester
    students.forEach(student => {
        const semester = student.academics.semesters.find(sem => sem.sem === semesterFilter);
        if (semester) {
            semester.subjects.forEach(subject => uniqueSubjects.add(subject.subCode.trim().toUpperCase()));
        }
    });

    const subjectsArray = Array.from(uniqueSubjects);

    // Create table and add headers
    const table = document.createElement("table");
    const thead = `
        <thead>
            <tr>
                <th>Name</th>
                <th>USN</th>
                ${subjectsArray.map(subject => `<th>${subject}</th>`).join('')}
                <th>SGPA</th>
                <th>CGPA</th>
                <th>Result</th>
            </tr>
        </thead>
    `;
    table.innerHTML = thead;

    // Create table body
    const tbody = document.createElement("tbody");

    students.forEach(student => {
        const semester = student.academics.semesters.find(sem => sem.sem === semesterFilter);

        if (semester) {
            const row = document.createElement("tr");

            const totalSGPA = student.academics.semesters.reduce((acc, sem) => acc + sem.sgpa, 0);

            const cgpa = ((totalSGPA / student.academics.semesters.length)*10).toFixed(2) || "N/A";

            const result = semester.subjects.some(sub => sub.result !== "p") ? "Fail" : semester.subjects.some(sub => sub.marks !== 0) ? "Pass" : "None";

            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.usn}</td>
                ${subjectsArray.map(subjectCode => {
                    const subject = semester.subjects.find(s => {
                        const isExactMatch = s.subCode.trim() === subjectCode.trim();
                        const isPartialMatch =
                            s.subCode.trim().substring(0, 2) === subjectCode.trim().substring(0, 2) &&
                            s.subCode.trim().slice(-2) === subjectCode.trim().slice(-2);
                        return isExactMatch || isPartialMatch;
                    });
                return `<td>${subject ? subject.marks : "N/A"}</td>`;
            }).join('')}
                <td>${(semester.sgpa).toFixed(2)}</td>
                <td>${cgpa}</td>
                <td>${result}</td>
`;
            tbody.appendChild(row);

        }
    });

    table.appendChild(tbody);
    container.appendChild(table);
}



async function updateStatistics(students, semesterFilter) {
    try {
        const totalStudents = students.length
        let totalMarks = 0;
        let totalSubjects = 0;
        let passedStudents = 0;
        students.forEach(student => {
            const semester = student.academics.semesters.find(sem => sem.sem === semesterFilter);

            if (semester) {
                const isPassed = semester.subjects.every(subject => subject.result === "p");
                if (isPassed) {
                    passedStudents++;
                }

                semester.subjects.forEach(subject => {
                    totalMarks += subject.marks || 0;
                    totalSubjects++;
                });
            }
        });
        const failedStudents = totalStudents - passedStudents;
        // const averageScore = totalSubjects > 0 ? ((totalMarks / (totalSubjects * 100)) * 100).toFixed(2) : "0.00";
        const averageScore = totalSubjects > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : "0.00";
        document.querySelectorAll(".total_card h1")[0].innerText = totalStudents;
        document.querySelectorAll(".total_card h1")[1].innerText = passedStudents;
        document.querySelectorAll(".total_card h1")[2].innerText = failedStudents;
        document.querySelectorAll(".total_card h1")[3].innerText = `${averageScore}%`;

    }
    catch (error) {
        console.error("Error fetching student statistics:", error);
    }
}

let chartInstance = null;

function generatePassPercentageChart(students, semesterFilter) {
    const subjectsMap = new Map();


    students.forEach(student => {
        const semester = student.academics.semesters.find(sem => sem.sem === semesterFilter);
        if (semester) {
            semester.subjects.forEach(subject => {
                if (!subjectsMap.has(subject.subCode.trim().toUpperCase())) {
                    subjectsMap.set(subject.subCode, { subName: subject.subCode, total: 0, passed: 0 });
                }

                const subjectStats = subjectsMap.get(subject.subCode);
                subjectStats.total++;
                if (subject.result === "p") {
                    subjectStats.passed++;
                }
                subjectsMap.set(subject.subCode, subjectStats);
            });
        }
    });

    // Prepare data for the chart
    const subjectNames = [];
    const passPercentages = [];

    subjectsMap.forEach(({ subName, total, passed }) => {
        subjectNames.push(subName);
        passPercentages.push(((passed / total) * 100).toFixed(2));
    });


    const ctx = document.getElementById("passPercentageChart").getContext("2d");
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: subjectNames,
            datasets: [{
                label: "Pass Percentage (%)",
                data: passPercentages,
                backgroundColor: "sky-blue",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Student Analysis",
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Percentage (%)"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Subjects"
                    }
                }
            }
        }
    });
}


let PieInstance = null;

async function calculateStudentDistribution(students, semesterFilter) {
    try {
        const categories = {
            "80-100%": 0,
            "60-79%": 0,
            "40-59%": 0,
            "Below 40%": 0
        };

        students.forEach(student => {
            // Calculate total marks for the student
            const filteredSemesters = student.academics.semesters.find(sem => sem.sem === semesterFilter);
            if (filteredSemesters) {
                let totalMarks = 0;
                let totalMaxMarks = 0;
                let numOfSubjects = 0;
                console.log(filteredSemesters)
                filteredSemesters.subjects.forEach(subject => {
                    totalMarks += subject.marks; 
                    totalMaxMarks += subject.subCredits * 100; // Total maximum marks for the selected semester
                    numOfSubjects += 1; // Count the subjects for the selected semester
                });
                
            const percentage = (totalMarks / numOfSubjects);

            if (percentage >= 80) {
                categories["80-100%"]++;
            } else if (percentage >= 60) {
                categories["60-79%"]++;
            } else if (percentage >= 40) {
                categories["40-59%"]++;
            } else {
                categories["Below 40%"]++;
            }
        }
        });

        const studentCategories = categories;

        // Create Pie Chart for student distribution
        const ctx = document.getElementById("studentDistributionChart").getContext("2d");
        if (PieInstance) {
            PieInstance.destroy();
        }
            
        PieInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(studentCategories),
                datasets: [{
                    label: "Student Distribution",
                    data: Object.values(studentCategories),
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.6)", // 80-100%
                        "rgba(255, 206, 86, 0.6)", // 60-79%
                        "rgba(54, 162, 235, 0.6)", // 40-59%
                        "rgba(255, 99, 132, 0.6)"  // Below 40%
                    ],
                    borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 99, 132, 1)"
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Student Analysis",
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        display: true,
                        position: "top"
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const total = Object.values(studentCategories).reduce((acc, value) => acc + value, 0);
                                const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
                                return `${tooltipItem.label}: ${percentage}% (${tooltipItem.raw} students)`;
                            }
                        }
                    }
                }
            }
        });

    }
    catch (error) {
        console.error("Error fetching student statistics:", error);
    }
}



fetchData();
fetchStudentDetails();