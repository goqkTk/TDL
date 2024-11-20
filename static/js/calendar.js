document.addEventListener('DOMContentLoaded', function() {
    const categoryContainer = document.querySelector('.other_categories');
    const calendarDays = document.getElementById('calendarDays');
    const currentDateElement = document.getElementById('currentDate');
    const prevMonthButton = document.querySelector('.nav-buttons button:first-child');
    const nextMonthButton = document.querySelector('.nav-buttons button:last-child');
    const dateSelectModal = document.getElementById('dateSelectModal');
    const dateSelectOverlay = document.getElementById('dateSelectOverlay');
    const yearSpinner = document.getElementById('yearSpinner');
    const monthSpinner = document.getElementById('monthSpinner');
    const sideboard = document.querySelector('.sideboard');
    const calendarContainer = document.querySelector('.calendar-container');
    const calendarNav = document.querySelector('.calendar-nav');
    const calendarBody = document.querySelector('.calendar-body');
    
    let currentDate = new Date();
    let selectedDate = null;
    let events = {};
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth() + 1;
    let days = ['일', '월', '화', '수', '목', '금', '토'];
    let currentTimeButton = null;
    let selectedPeriod = 'AM';
    let selectedHour = 10;
    let selectedMinute = 0;

    function setupTimeSelect() {
        const startTimeBtn = document.getElementById('startTimeButton');
        const endTimeBtn = document.getElementById('endTimeButton');
        const timeSelectOverlay = document.querySelector('.time-select-overlay');
        const timeSelectModal = document.querySelector('.time-select-modal');
        const cancelBtn = timeSelectModal.querySelector('.time-select-cancel');
        const confirmBtn = timeSelectModal.querySelector('.time-select-confirm');
        const periodSpinner = timeSelectModal.querySelector('.period-spinner');
        const hourSpinner = timeSelectModal.querySelector('.hour-spinner');
        const minuteSpinner = timeSelectModal.querySelector('.minute-spinner');
    
        // 이벤트 리스너 설정
        startTimeBtn.addEventListener('click', () => showTimeSelectModal(startTimeBtn));
        endTimeBtn.addEventListener('click', () => showTimeSelectModal(endTimeBtn));
        timeSelectOverlay.addEventListener('click', hideTimeSelectModal);
        cancelBtn.addEventListener('click', hideTimeSelectModal);
        confirmBtn.addEventListener('click', confirmTimeSelection);
    
        // 스피너에 wheel 이벤트 추가
        periodSpinner.addEventListener('wheel', handleWheel, { passive: false });
        hourSpinner.addEventListener('wheel', handleWheel, { passive: false });
        minuteSpinner.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    function showTimeSelectModal(button) {
        currentTimeButton = button;
        const timeSelectOverlay = document.querySelector('.time-select-overlay');
        const timeSelectModal = document.querySelector('.time-select-modal');
        const currentTime = button.textContent;
        
        // 현재 선택된 시간 파싱
        parseCurrentTime(currentTime);
        
        // 스피너 설정
        setupTimeSpinners();
        
        timeSelectOverlay.style.display = 'block';
        timeSelectModal.style.display = 'block';
    }
    
    function parseCurrentTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        selectedHour = hours > 12 ? hours - 12 : hours;
        selectedPeriod = hours >= 12 ? 'PM' : 'AM';
        selectedMinute = minutes;
    }
    
    function setupTimeSpinners() {
        const periodSpinner = document.querySelector('.period-spinner');
        const hourSpinner = document.querySelector('.hour-spinner');
        const minuteSpinner = document.querySelector('.minute-spinner');
    
        // 오전/오후 스피너 설정
        periodSpinner.innerHTML = '';
        ['AM', 'PM'].forEach(period => {
            const periodItem = document.createElement('div');
            periodItem.className = 'spinner-item' + (period === selectedPeriod ? ' selected' : '');
            periodItem.textContent = period;
            periodItem.addEventListener('click', () => {
                selectedPeriod = period;
                updateSelectedSpinnerItem(periodSpinner, period);
            });
            periodSpinner.appendChild(periodItem);
        });
    
        // 시간 스피너 설정
        hourSpinner.innerHTML = '';
        for (let hour = 1; hour <= 12; hour++) {
            const hourItem = document.createElement('div');
            hourItem.className = 'spinner-item' + (hour === selectedHour ? ' selected' : '');
            hourItem.textContent = hour;
            hourItem.addEventListener('click', () => {
                selectedHour = hour;
                updateSelectedSpinnerItem(hourSpinner, hour);
            });
            hourSpinner.appendChild(hourItem);
        }
    
        // 분 스피너 설정
        minuteSpinner.innerHTML = '';
        for (let minute = 0; minute < 60; minute += 5) {
            const minuteItem = document.createElement('div');
            minuteItem.className = 'spinner-item' + (minute === selectedMinute ? ' selected' : '');
            minuteItem.textContent = minute.toString().padStart(2, '0');
            minuteItem.addEventListener('click', () => {
                selectedMinute = minute;
                updateSelectedSpinnerItem(minuteSpinner, minute);
            });
            minuteSpinner.appendChild(minuteItem);
        }
    
        // 스크롤 초기 위치 설정
        setTimeout(() => {
            scrollToSelected(periodSpinner, selectedPeriod);
            scrollToSelected(hourSpinner, selectedHour);
            scrollToSelected(minuteSpinner, selectedMinute);
        }, 0);
    }
    
    function confirmTimeSelection() {
        if (!currentTimeButton) return;
        
        // 24시간 형식으로 변환
        let hours = selectedHour;
        if (selectedPeriod === 'PM' && hours !== 12) {
            hours += 12;
        } else if (selectedPeriod === 'AM' && hours === 12) {
            hours = 0;
        }
    
        // 시간 문자열 생성
        const timeString = `${hours.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        currentTimeButton.textContent = timeString;
        
        // 모달 닫기
        hideTimeSelectModal();
    }
    
    function hideTimeSelectModal() {
        const timeSelectOverlay = document.querySelector('.time-select-overlay');
        const timeSelectModal = document.querySelector('.time-select-modal');
        timeSelectOverlay.style.display = 'none';
        timeSelectModal.style.display = 'none';
        currentTimeButton = null;
    }

    function showEventModal() {
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        eventCreateOverlay.style.display = 'block';
        eventCreateModal.style.display = 'block';
        const today = new Date(selectedDate);
        const formattedDate = today.toISOString().split('T')[0];
        eventCreateModal.querySelector('#eventStartDate').value = formattedDate;
        eventCreateModal.querySelector('#eventEndDate').value = formattedDate;
        eventCreateModal.querySelector('#eventTitle').focus();
    }

    function hideEventModal() {
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        const eventForm = eventCreateModal.querySelector('.event-form');
        eventCreateOverlay.style.display = 'none';
        eventCreateModal.style.display = 'none';
        eventForm.reset();
        eventForm.querySelector('#eventStartTime').value = '10:00';
        eventForm.querySelector('#eventEndTime').value = '11:00';
    }

    function createEvent(e) {
        e.preventDefault();
        const eventForm = document.querySelector('.event-form');
        const title = eventForm.querySelector('#eventTitle').value;
        const startDate = eventForm.querySelector('#eventStartDate').value;
        const startTime = eventForm.querySelector('#eventStartTime').value;
        const endDate = eventForm.querySelector('#eventEndDate').value;
        const endTime = eventForm.querySelector('#eventEndTime').value;
        const notification = eventForm.querySelector('#eventNotification').value;
        const url = eventForm.querySelector('#eventUrl').value;
        const memo = eventForm.querySelector('#eventMemo').value;

        if (!title || !startDate || !startTime || !endDate || !endTime) return;

        const eventData = {
            title,
            startDateTime: `${startDate} ${startTime}`,
            endDateTime: `${endDate} ${endTime}`,
            notification,
            url,
            memo,
            created: new Date().toISOString()
        };

        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(eventData);

        updateEventList();
        renderCalendar();
        hideEventModal();
    }

    function updateEventList() {
        const eventList = document.querySelector('.event-list');
        eventList.innerHTML = '';
        const dateEvents = events[selectedDate] || [];
        
        dateEvents.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            
            const startDate = new Date(event.startDateTime);
            const endDate = new Date(event.endDateTime);
            const isSameDay = startDate.toDateString() === endDate.toDateString();
            
            const formatDate = (date) => {
                const options = { 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit'
                };
                return date.toLocaleString('ko-KR', options);
            };

            eventElement.innerHTML = `
                <div class="event-header">
                    <span class="event-title">${event.title}</span>
                    <button class="delete-event"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="event-time">
                    ${formatDate(startDate)} ~ ${formatDate(endDate)}
                </div>
                ${event.memo ? `<p class="event-memo">${event.memo}</p>` : ''}
                ${event.url ? `<a href="${event.url}" class="event-url" target="_blank">${event.url}</a>` : ''}
            `;

            const deleteBtn = eventElement.querySelector('.delete-event');
            deleteBtn.addEventListener('click', () => {
                events[selectedDate].splice(index, 1);
                updateEventList();
                renderCalendar();
            });
            
            eventList.appendChild(eventElement);
        });
    }

    function initSideboardEvents() {
        const closeBtn = sideboard.querySelector('.sideboard-close');
        const addEventButton = sideboard.querySelector('.add-event-button');
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        const eventForm = eventCreateModal.querySelector('.event-form');
        const cancelButton = eventCreateModal.querySelector('.modal-cancel');
    
        addEventButton.addEventListener('click', showEventModal);
        eventCreateOverlay.addEventListener('click', hideEventModal);
        cancelButton.addEventListener('click', hideEventModal);
        eventForm.addEventListener('submit', createEvent);
        closeBtn.addEventListener('click', closeSideboard);

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.calendar-day') && 
                !e.target.closest('.sideboard') && 
                !e.target.closest('.event-create-modal') && 
                sideboard.classList.contains('active') &&
                eventCreateModal.style.display !== 'block') {
                closeSideboard();
            }
        });
    }

    function applyWeekStart() {
        const weekStart = localStorage.getItem('weekStart') || 'sunday';
        const weekdays = document.querySelector('.weekdays');
        
        if (weekStart === 'monday') {
            days = ['월', '화', '수', '목', '금', '토', '일'];
        } else {
            days = ['일', '월', '화', '수', '목', '금', '토'];
        }

        if (weekdays) {
            weekdays.innerHTML = days.map(day => `<div>${day}</div>`).join('');
        }
    }

    function setupSpinners() {
        yearSpinner.innerHTML = '';
        monthSpinner.innerHTML = '';
        
        const now = new Date();
        let tempYear = currentDate.getFullYear();
        let tempMonth = currentDate.getMonth() + 1;
        updateTodayButtonState(tempYear, tempMonth, now);
    
        const currentYear = now.getFullYear();
        for (let year = currentYear - 50; year <= currentYear + 50; year++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'spinner-item' + (year === tempYear ? ' selected' : '');
            yearItem.textContent = year;
            yearItem.addEventListener('click', () => {
                tempYear = year;
                updateSelectedSpinnerItem(yearSpinner, year);
                scrollToSelected(yearSpinner, year);
            });
            yearSpinner.appendChild(yearItem);
        }
    
        for (let month = 1; month <= 12; month++) {
            const monthItem = document.createElement('div');
            monthItem.className = 'spinner-item' + (month === tempMonth ? ' selected' : '');
            monthItem.textContent = `${month}월`;
            monthItem.addEventListener('click', () => {
                tempMonth = month;
                updateSelectedSpinnerItem(monthSpinner, month);
                scrollToSelected(monthSpinner, month);
            });
            monthSpinner.appendChild(monthItem);
        }
        
        setTimeout(() => {
            scrollToSelected(yearSpinner, tempYear);
            scrollToSelected(monthSpinner, tempMonth);
        }, 0);
    
        const todayBtn = document.querySelector('.date-select-today');
        const confirmBtn = document.querySelector('.date-select-confirm');
        todayBtn.removeEventListener('click', handleTodayClick);
        todayBtn.addEventListener('click', handleTodayClick);
        confirmBtn.removeEventListener('click', handleConfirm);
        confirmBtn.addEventListener('click', handleConfirm);
        yearSpinner.addEventListener('wheel', handleWheel, { passive: false });
        monthSpinner.addEventListener('wheel', handleWheel, { passive: false });
    }

    let lastWheelTime = Date.now();
    let wheelEvents = [];
    const WHEEL_TIMEOUT = 150;

    function handleWheel(e) {
        e.preventDefault();
        
        const currentTime = Date.now();
        const spinner = e.currentTarget;
        const itemHeight = 40;
    
        wheelEvents.push({
            time: currentTime,
            delta: Math.abs(e.deltaY)
        });
    
        wheelEvents = wheelEvents.filter(event => currentTime - event.time <= WHEEL_TIMEOUT);
    
        const isRapidWheel = wheelEvents.length >= 3;
        lastWheelTime = currentTime;
    
        if (isRapidWheel) {
            const scrollAmount = e.deltaY * 2.5;
            spinner.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        } else {
            const direction = e.deltaY > 0 ? 1 : -1;
            const scrollAmount = direction * itemHeight;
            
            spinner.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        }
        clearTimeout(spinner.scrollTimeout);
        spinner.scrollTimeout = setTimeout(() => {
            handleSpinnerScroll({ target: spinner });
        }, 200);
    }

    function handleConfirm() {
        const yearItems = yearSpinner.querySelectorAll('.spinner-item');
        const monthItems = monthSpinner.querySelectorAll('.spinner-item');
        
        const selectedYearItem = Array.from(yearItems).find(item => item.classList.contains('selected'));
        const selectedMonthItem = Array.from(monthItems).find(item => item.classList.contains('selected'));
        
        if (selectedYearItem && selectedMonthItem) {
            selectedYear = parseInt(selectedYearItem.textContent);
            selectedMonth = parseInt(selectedMonthItem.textContent);
            handleDateChange();
        }
    }

    function scrollToSelected(spinner, value) {
        const items = spinner.querySelectorAll('.spinner-item');
        const selectedItem = Array.from(items).find(item => {
            const itemValue = parseInt(item.textContent);
            return itemValue === value;
        });
    
        if (selectedItem) {
            const spinnerRect = spinner.getBoundingClientRect();
            const selectedRect = selectedItem.getBoundingClientRect();
            const offset = (spinnerRect.height - selectedRect.height) / 2 + 10;
            const scrollTop = selectedItem.offsetTop - offset;
    
            spinner.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    }

    function updateSelectedSpinnerItem(spinner, value) {
        const items = spinner.querySelectorAll('.spinner-item');
        items.forEach(item => {
            const itemValue = parseInt(item.textContent);
            item.classList.toggle('selected', itemValue === value);
        });
    }

    function updateTodayButtonState(year, month, now = new Date()) {
        const todayBtn = document.querySelector('.date-select-today');
        const isCurrentDate = year === now.getFullYear() && month === now.getMonth() + 1;
        todayBtn.disabled = isCurrentDate;
    }
    
    function handleTodayClick() {
        const now = new Date();
        selectedYear = now.getFullYear();
        selectedMonth = now.getMonth() + 1;
        
        updateSelectedSpinnerItem(yearSpinner, selectedYear);
        updateSelectedSpinnerItem(monthSpinner, selectedMonth);
        scrollToSelected(yearSpinner, selectedYear);
        scrollToSelected(monthSpinner, selectedMonth);
        updateTodayButtonState(selectedYear, selectedMonth);
    }

    function handleSpinnerScroll(event) {
        const spinner = event.target;
        const spinnerRect = spinner.getBoundingClientRect();
        const spinnerCenter = spinnerRect.top + (spinnerRect.height / 2) - 10;
        
        let closestItem = null;
        let minDistance = Infinity;
        
        const visibleItems = Array.from(spinner.querySelectorAll('.spinner-item')).filter(item => {
            const itemRect = item.getBoundingClientRect();
            return itemRect.top >= spinnerRect.top - itemRect.height &&
                   itemRect.bottom <= spinnerRect.bottom + itemRect.height;
        });
    
        visibleItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + (itemRect.height / 2);
            const distance = Math.abs(spinnerCenter - itemCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
    
        if (closestItem) {
            const value = parseInt(closestItem.textContent);
            updateSelectedSpinnerItem(spinner, value);
            
            const now = new Date();
            const selectedYear = parseInt(yearSpinner.querySelector('.spinner-item.selected')?.textContent) || currentDate.getFullYear();
            const selectedMonth = parseInt(monthSpinner.querySelector('.spinner-item.selected')?.textContent) || currentDate.getMonth() + 1;
            updateTodayButtonState(selectedYear, selectedMonth, now);
        }
    }

    function updateCurrentDate() { 
        currentDateElement.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`; 
    }

    function renderCalendar() {
        calendarDays.innerHTML = '';
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        
        const weekStart = localStorage.getItem('weekStart') || 'sunday';
        let startOffset = firstDay.getDay();
        
        if (weekStart === 'monday') {
            startOffset = startOffset === 0 ? 6 : startOffset - 1;
        }
        
        for (let i = startOffset - 1; i >= 0; i--) {
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

    function createDayElement(day, className, isOtherMonth, isSelected = false) {
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

    function showDateSelectModal(e) {
        e.stopPropagation();
        dateSelectModal.style.display = 'block';
        dateSelectOverlay.style.display = 'block';
        setupSpinners();
    }

    function closeDateSelectModal() {
        dateSelectModal.style.display = 'none';
        dateSelectOverlay.style.display = 'none';
    }

    function handleDateChange() {
        currentDate = new Date(selectedYear, selectedMonth - 1);
        updateCurrentDate();
        renderCalendar();
        closeDateSelectModal();
    }

    function handleDateClick(day) {
        selectedDate = getDateString(day);
        renderCalendar();
        showSideboard(day);
    }

    function showSideboard(day) {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${day}일`;
        
        sideboard.querySelector('.sideboard-title').textContent = formattedDate;
        sideboard.classList.add('active');
        
        calendarContainer.classList.add('sideboard-open');
        calendarNav.classList.add('sideboard-open');
        calendarBody.classList.add('sideboard-open');
        
        updateEventList();
        window.dispatchEvent(new Event('resize'));
    }

    function closeSideboard() {
        sideboard.classList.remove('active');
        
        calendarContainer.classList.remove('sideboard-open');
        calendarNav.classList.remove('sideboard-open');
        calendarBody.classList.remove('sideboard-open');
        
        selectedDate = null;
        renderCalendar();
        
        window.dispatchEvent(new Event('resize'));
    }

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
    
        currentDateElement.addEventListener('click', showDateSelectModal);
        dateSelectOverlay.addEventListener('click', closeDateSelectModal);
        yearSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
        monthSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'weekStart') {
            applyWeekStart();
            renderCalendar();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideboard.classList.contains('active')) {
            closeSideboard();
        }
    });

    window.addEventListener('resize', () => {
        if (sideboard.classList.contains('active')) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                calendarContainer.style.width = '100%';
            }
        }
    });

    function debounceScroll(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }

    function init() {
        updateCurrentDate();
        setupSpinners();
        setupTimeSelect();
        applyWeekStart();
        renderCalendar();
        setupEventListeners();
        initSideboardEvents();
    }
    init();
});