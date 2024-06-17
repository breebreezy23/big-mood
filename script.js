const calendar = document.getElementById('calendar');
const moodSelect = document.getElementById('mood');
const saveMoodButton = document.getElementById('save-mood');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const currentMonthDisplay = document.getElementById('current-month');
const moodChartCanvas = document.getElementById('mood-chart');

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

    updateChart(moods, daysInMonth);
}

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

    updateChart(moods, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate());
});

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

function updateChart(moods, daysInMonth) {
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

    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(moodChartCanvas, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Mood Distribution'
                }
            }
        }
    });
}

let moodChart;

updateCalendar();
