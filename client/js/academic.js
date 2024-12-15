document.addEventListener("DOMContentLoaded", async () => {
    const semesterSelect = document.getElementById('semester');
    const studentsContainer = document.getElementById('students-container');
    const token = localStorage.getItem('token');
    const API_BASE_URL = 'http://localhost:5000/api/v1';
    const totalExamsElement = document.querySelector('.total_container .total_card:nth-child(1) h1');
    const passElement = document.querySelector('.total_container .total_card:nth-child(2) h1');
    const failElement = document.querySelector('.total_container .total_card:nth-child(3) h1');
    const cgpaElement = document.querySelector('.total_container .total_card:nth-child(4) h1');
    const sgpaElement = document.querySelector('.total_container .total_card:nth-child(5) h1');
    const avgScoreElement = document.querySelector('.total_container .total_card:nth-child(6) h1');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const displaySubjects = (semesterData) => {
        studentsContainer.innerHTML = '';  

        // Table creation
        const table = document.createElement('table');
        table.classList.add('subject-table');
        table.innerHTML = `
                <thead>
                    <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Internal Marks</th>
                        <th>External Marks</th>
                        <th>Total Marks</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    ${semesterData.subjects.map(subject => `
                        <tr>
                            <td>${subject.subCode}</td>
                            <td>${subject.subName}</td>
                            <td>${subject.internalMarks}</td>
                            <td>${subject.externalMarks}</td>
                            <td>${subject.marks}</td>
                            <td>${subject.result}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        studentsContainer.appendChild(table);
    };

    const updateTotalStats = (academicDetails) => {
        let totalExams = 0;
        let passCount = 0;
        let failCount = 0;
        let totalSgpa = 0;
        let totalPercentage = 0;
        let totalSub = 0;

        console.log(academicDetails)


        academicDetails.semesters.forEach(semester => {
            totalExams += semester.subjects.length;
            semester.subjects.forEach(subject => {
                if (subject.result === 'p') {
                    passCount++;
                } else if (subject.result === 'f') {
                    failCount++;
                }
                if(subject.marks !== 0){
                    totalPercentage += parseFloat(subject.marks || 0);
                    totalSub += 1;
                    totalSgpa += semester.sgpa;
                }

  
            });
        });

        const numSubjects = academicDetails.semesters.length;
        const avgCgpa = academicDetails.cgpa;
        const avgSgpa = totalSgpa / totalSub;
        const avgPercentage = totalPercentage / totalSub;

        totalExamsElement.textContent = totalExams;
        passElement.textContent = passCount;
        failElement.textContent = failCount;
        cgpaElement.textContent = avgCgpa.toFixed(2);
        sgpaElement.textContent = avgSgpa.toFixed(2);
        avgScoreElement.textContent = avgPercentage.toFixed(2);
    };

    const fetchAcademicData = async (semester) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/academics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                const academicDetails = data.payload.academicDetails;

                const semesterData = academicDetails.semesters.find(s => s.sem === semester);
                if (semesterData) {
                    displaySubjects(semesterData);
                    updateTotalStats(academicDetails);
                } else {
                    studentsContainer.innerHTML = '<p>No data found for the selected semester.</p>';
                }
            } else {
                alert(data.msg);
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error fetching academic details:', error);
            alert('Failed to fetch data. Please try again.');
        }
    };

    const defaultSemester = '3'; 
    semesterSelect.value = defaultSemester;

    fetchAcademicData(defaultSemester);

    // Update the data when the semester selection changes
    semesterSelect.addEventListener('change', (e) => {
        const selectedSemester = e.target.value;
        if (selectedSemester) {
            fetchAcademicData(selectedSemester);
        }
    });
});
