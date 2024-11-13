document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let selectedDate = null;
    let events = {};
    
    const calendarDays = document.getElementById('calendarDays');
    const currentDateElement = document.getElementById('currentDate');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const eventModal = document.getElementById('eventModal');
    const eventInput = document.getElementById('eventInput');
    const eventList = document.getElementById('eventList');

    // 달력 초기화
    function initCalendar() {
        updateCurrentDate();
        renderCalendar();
        setupEventListeners();
    }

    // 현재 날짜 표시 업데이트
    function updateCurrentDate() {
        currentDateElement.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    }

    // 달력 렌더링
    function renderCalendar() {
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        
        // 이전 달의 날짜들
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            createDayElement(day, 'other-month', true);
        }
        
        // 현재 달의 날짜들
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentDay(day);
            const isSelected = isSelectedDay(day);
            createDayElement(day, isToday ? 'today' : '', false, isSelected);
        }
        
        // 다음 달의 날짜들
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            createDayElement(day, 'other-month', true);
        }
    }

    // 날짜 요소 생성
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

    // 이벤트 리스너 설정
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
    }

    // 날짜 클릭 핸들러
    function handleDateClick(day) {
        selectedDate = getDateString(day);
        renderCalendar();
        showEventModal(day);
        updateEventList();
    }

    // 이벤트 모달 표시
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

    // 이벤트 추가
    function addEvent(eventText) {
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(eventText);
        updateEventList();
        renderCalendar();
    }

    // 이벤트 목록 업데이트
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

    // 이벤트 제거
    function removeEvent(index) {
        events[selectedDate].splice(index, 1);
        if (events[selectedDate].length === 0) {
            delete events[selectedDate];
        }
        updateEventList();
        renderCalendar();
    }

    // 유틸리티 함수들
    function isCurrentDay(day) {
        const today = new Date();
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear();
    }

    function isSelectedDay(day) {
        return selectedDate === getDateString(day);
    }

    function getDateString(day) {
        return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    }

    // 달력 초기화
    initCalendar();
});