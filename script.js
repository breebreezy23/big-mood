const calendar = document.getElementById('calendar');
const moodSelect = document.getElementById('mood');
const saveMoodButton = document.getElementById('save-mood');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthDisplay = document.getElementById('current-month');
const barChartCanvas = document.getElementById('bar-chart');
const lineChartCanvas = document.getElementById('line-chart');
const pieChartCanvas = document.getElementById('pie-chart');
const barChartButton = document.getElementById('bar-chart-btn');
const lineChartButton = document.getElementById('line-chart-btn');
const pieChartButton = document.getElementById('pie-chart-btn');
const startTrackingButton = document.getElementById('start-tracking');
const openingScreen = document.getElementById('opening-screen');
const app = document.getElementById('app');

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let currentDate = new Date();
let selectedDay = null;

function updateCalendar() {
    calendar.innerHTML = '';
    currentMonthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const moods = JSON.parse(localStorage.getItem(`moods-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`)) || {};

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        calendar.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.textContent = i;

        if (moods[i]) {
            day.classList.add(moods[i]);
        }

        day.addEventListener('click', () => {
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            selectedDay = day;
            selectedDay.classList.add('selected');
        });

        calendar.appendChild(day);
    }

    updateCharts(moods, daysInMonth);
}

document.addEventListener('DOMContentLoaded', function () {
    // Function to check if dark mode is active
    const isDarkModeActive = () => document.body.classList.contains('dark-mode');

    // Function to update clouds visibility based on dark mode state
    const updateCloudsVisibility = () => {
        const clouds = document.querySelectorAll('.cloud');
        clouds.forEach(cloud => {
            if (isDarkModeActive()) {
                cloud.classList.add('hidden'); // Assuming 'hidden' is a class that hides the element
            } else {
                cloud.classList.remove('hidden');
            }
        });
    };

    // Function to generate stars in the night sky
    const generateStars = () => {
        const nightSky = document.querySelector('.night-sky');
        for (let i = 0; i < 100; i++) { // Generate 100 stars
            const star = document.createElement('div');
            star.className = 'star';
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            nightSky.appendChild(star);
        }
    };

    // Toggle dark mode, update clouds visibility, and change button text
    document.getElementById('dark-mode-toggle').addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        updateCloudsVisibility(); // Update clouds visibility based on the new state
        // Optionally, update the button text based on dark mode state
        this.textContent = isDarkModeActive() ? '☼' : '☾';
    });

    // Initial setup: Generate stars, ensure clouds visibility is correct
    generateStars();
    updateCloudsVisibility();
});


saveMoodButton.addEventListener('click', () => {
    if (!selectedDay) {
        alert('Please select a day.');
        return;
    }

    const mood = moodSelect.value;
    const day = selectedDay.textContent;
    const monthKey = `moods-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

    const moods = JSON.parse(localStorage.getItem(monthKey)) || {};
    moods[day] = mood;
    localStorage.setItem(monthKey, JSON.stringify(moods));

    selectedDay.className = `day ${mood}`;
    selectedDay.classList.remove('selected');
    selectedDay = null;

    updateCharts(moods, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate());
});

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

barChartButton.addEventListener('click', () => {
    barChartCanvas.style.display = 'block';
    lineChartCanvas.style.display = 'none';
    pieChartCanvas.style.display = 'none';
});

lineChartButton.addEventListener('click', () => {
    barChartCanvas.style.display = 'none';
    lineChartCanvas.style.display = 'block';
    pieChartCanvas.style.display = 'none';
});

pieChartButton.addEventListener('click', () => {
    barChartCanvas.style.display = 'none';
    lineChartCanvas.style.display = 'none';
    pieChartCanvas.style.display = 'block';
});

function updateCharts(moods, daysInMonth) {
    const moodCounts = {
        happy: 0,
        sad: 0,
        neutral: 0,
        angry: 0,
        excited: 0
    };

    for (let i = 1; i <= daysInMonth; i++) {
        if (moods[i]) {
            moodCounts[moods[i]]++;
        }
    }

    const chartData = {
        labels: Object.keys(moodCounts),
        datasets: [{
            label: 'Mood Counts',
            data: Object.values(moodCounts),
            backgroundColor: ['#ffeb3b', '#2196f3', '#9e9e9e', '#f44336', '#ff5722']
        }]
    };

    if (barChart) {
        barChart.destroy();
    }

    if (lineChart) {
        lineChart.destroy();
    }

    if (pieChart) {
        pieChart.destroy();
    }

    const commonOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            },
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: ''
            }
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        animation: {
            duration: 1000,
            easing: 'easeOutBounce'
        }
    };

    barChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: chartData,
        options: {
            ...commonOptions,
            title: {
                display: true,
                text: 'Mood Distribution - Bar Chart'
            }
        }
    });

    lineChart = new Chart(lineChartCanvas, {
        type: 'line',
        data: chartData,
        options: {
            ...commonOptions,
            title: {
                display: true,
                text: 'Mood Distribution - Line Chart'
            }
        }
    });

    pieChart = new Chart(pieChartCanvas, {
        type: 'pie',
        data: chartData,
        options: {
            ...commonOptions,
            title: {
                display: true,
                text: 'Mood Distribution - Pie Chart'
            }
        }
    });
}

let barChart, lineChart, pieChart;

updateCalendar();

// Handle transition from opening screen to main app content
startTrackingButton.addEventListener('click', () => {
    openingScreen.style.display = 'none';
    app.style.display = 'block';
});
