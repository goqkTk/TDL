document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let selectedDate = null;
    let events = {};
    
    const calendarDays = document.getElementById('calendarDays');
    const currentDateElement = document.getElementById('currentDate');
    const prevMonthButton = document.querySelector('.nav-buttons button:first-child');
    const nextMonthButton = document.querySelector('.nav-buttons button:last-child');
    const eventModal = document.getElementById('eventModal');
    const eventInput = document.getElementById('eventInput');
    const eventList = document.getElementById('eventList');
    const modalHTML = `
        <div class="modal-overlay" id="dateSelectOverlay"></div>
        <div class="date-select-modal" id="dateSelectModal">
            <div class="date-select-header">
                <div class="date-select-title">날짜 선택</div>
                <button class="date-select-close">&times;</button>
            </div>
            <div class="date-select-content">
                <div class="year-select">
                    <label class="select-label">년도</label>
                    <select class="select-input" id="yearSelect"></select>
                </div>
                <div class="month-select">
                    <label class="select-label">월</label>
                    <select class="select-input" id="monthSelect"></select>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const dateSelectModal = document.getElementById('dateSelectModal');
    const dateSelectOverlay = document.getElementById('dateSelectOverlay');
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const closeButton = document.querySelector('.date-select-close');

    function initCalendar() {
        setupYearOptions();
        setupMonthOptions();
        updateCurrentDate();
        renderCalendar();
        setupEventListeners();
    }

    function updateCurrentDate() { currentDateElement.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`; }

    function renderCalendar() {
        calendarDays.innerHTML = '';
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            createDayElement(day, 'other-month', true);
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentDay(day);
            const isSelected = isSelectedDay(day);
            createDayElement(day, isToday ? 'today' : '', false, isSelected);
        }
        
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            createDayElement(day, 'other-month', true);
        }
    }

    function createDayElement(day, className, isOtherMonth, isSelected) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className} ${isSelected ? 'selected' : ''}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        if (!isOtherMonth) {
            const dateString = getDateString(day);
            if (events[dateString] && events[dateString].length > 0) {
                const marker = document.createElement('div');
                marker.className = 'event-marker';
                dayElement.appendChild(marker);
            }
            
            dayElement.addEventListener('click', () => handleDateClick(day));
        }
        
        calendarDays.appendChild(dayElement);
    }

    function setupYearOptions() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentDate.getFullYear();
    }

    function setupMonthOptions() {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = `${month}월`;
            monthSelect.appendChild(option);
        }
        monthSelect.value = currentDate.getMonth() + 1;
    }

    function showDateSelectModal(e) {
        e.stopPropagation();
        dateSelectModal.style.display = 'block';
        dateSelectOverlay.style.display = 'block';
        yearSelect.value = currentDate.getFullYear();
        monthSelect.value = currentDate.getMonth() + 1;
    }

    function closeDateSelectModal() {
        dateSelectModal.style.display = 'none';
        dateSelectOverlay.style.display = 'none';
    }
    
    function handleDateChange() {
        const newYear = parseInt(yearSelect.value);
        const newMonth = parseInt(monthSelect.value) - 1;
        currentDate = new Date(newYear, newMonth, 1);
        updateCurrentDate();
        renderCalendar();
        closeDateSelectModal();
    }

    function handleDateClick(day) {
        selectedDate = getDateString(day);
        renderCalendar();
        showEventModal(day);
        updateEventList();
    }

    function showEventModal(day) {
        const dayElement = calendarDays.children[[...calendarDays.children].findIndex(el => 
            el.querySelector('.day-number').textContent == day && 
            !el.classList.contains('other-month'))];
            
        const rect = dayElement.getBoundingClientRect();
        eventModal.style.display = 'block';
        eventModal.style.top = `${rect.bottom + window.scrollY + 8}px`;
        eventModal.style.left = `${rect.left + window.scrollX}px`;
        
        eventInput.focus();
    }

    function addEvent(eventText) {
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(eventText);
        updateEventList();
        renderCalendar();
    }

    function updateEventList() {
        eventList.innerHTML = '';
        if (events[selectedDate]) {
            events[selectedDate].forEach((event, index) => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.textContent = event;
                eventElement.addEventListener('click', () => removeEvent(index));
                eventList.appendChild(eventElement);
            });
        }
    }

    function removeEvent(index) {
        events[selectedDate].splice(index, 1);
        if (events[selectedDate].length === 0) {
            delete events[selectedDate];
        }
        updateEventList();
        renderCalendar();
    }

    function isCurrentDay(day) {
        const today = new Date();
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear();
    }

    function isSelectedDay(day) { return selectedDate === getDateString(day); }
    function getDateString(day) { return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`; }

    function setupEventListeners() {
        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCurrentDate();
            renderCalendar();
        });

        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCurrentDate();
            renderCalendar();
        });

        eventInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim() && selectedDate) {
                addEvent(e.target.value.trim());
                e.target.value = '';
            }
        });

        document.addEventListener('click', (e) => {
            if (!eventModal.contains(e.target) && 
                !e.target.classList.contains('calendar-day')) {
                eventModal.style.display = 'none';
            }
        });

        currentDateElement.addEventListener('click', showDateSelectModal);
        closeButton.addEventListener('click', closeDateSelectModal);
        dateSelectOverlay.addEventListener('click', closeDateSelectModal);
        yearSelect.addEventListener('change', handleDateChange);
        monthSelect.addEventListener('change', handleDateChange);
    }
    initCalendar();
});