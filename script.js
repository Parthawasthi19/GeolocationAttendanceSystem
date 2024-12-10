document.addEventListener("DOMContentLoaded", () => {
    const teacherForm = document.getElementById("teacherForm");
    const startAttendance = document.getElementById("startAttendance");
    const stopAttendance = document.getElementById("stopAttendance");
    const exportBtn = document.getElementById("exportBtn");
    const attendanceTable = document.getElementById("attendanceTable").querySelector("tbody");

    let teacherDetails = {};
    let attendanceData = [];
    let attendanceInterval;

    const geocodingApiUrl = "https://nominatim.openstreetmap.org/reverse?format=jsonv2";

    teacherForm.addEventListener("submit", (e) => {
        e.preventDefault();

        teacherDetails = {
            Name: document.getElementById("name").value,
            ID: document.getElementById("id").value,
            Email: document.getElementById("email").value,
            Lesson: document.getElementById("lesson").value,
            Course: document.getElementById("course").value,
            Subject: document.getElementById("subject").value,
        };

        alert("Logged in successfully!");
        startAttendance.disabled = false;
        teacherForm.reset();
    });

    startAttendance.addEventListener("click", () => {
        if (navigator.geolocation) {
            alert("Starting attendance...");
            startAttendance.disabled = true;
            stopAttendance.disabled = false;

            attendanceInterval = setInterval(() => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const timestamp = new Date().toLocaleString();

                    const address = await fetchAddress(latitude, longitude);

                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${timestamp}</td><td>${latitude}</td><td>${longitude}</td><td>${address}</td>`;
                    attendanceTable.appendChild(row);

                    attendanceData.push({
                        Timestamp: timestamp,
                        Latitude: latitude,
                        Longitude: longitude,
                        Address: address,
                    });
                }, (error) => {
                    console.error("Error fetching geolocation:", error.message);
                    alert("Failed to fetch geolocation.");
                });
            }, 5000); // Updation in every 5 seconds
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    stopAttendance.addEventListener("click", () => {
        clearInterval(attendanceInterval);
        alert("Attendance recording stopped.");
        stopAttendance.disabled = true;
        exportBtn.disabled = false;
    });

    async function fetchAddress(lat, lon) {
        try {
            const response = await fetch(`${geocodingApiUrl}&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            return data.display_name || "Address not found";
        } catch (error) {
            console.error("Error fetching address:", error.message);
            return "Address not found";
        }
    }

    exportBtn.addEventListener("click", () => {
        alert("Exporting data...");

        const completeData = [
            { ...teacherDetails },
            ...attendanceData,
        ];

        const worksheet = XLSX.utils.json_to_sheet(completeData, { header: Object.keys(teacherDetails) });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        XLSX.writeFile(workbook, "EnhancedTeacherAttendance.xlsx");
    });
});
