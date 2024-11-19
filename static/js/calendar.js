document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let selectedDate = null;
    let events = {};
    
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
    const closeBtn = sideboard.querySelector('.sideboard-close');
    const eventInput = sideboard.querySelector('.event-input');
    const addButton = sideboard.querySelector('.add-button');
    const eventList = sideboard.querySelector('.event-list');
    
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth() + 1;
    let days = ['일', '월', '화', '수', '목', '금', '토'];

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

    function createSideboard() {
        sideboard.innerHTML = `
            <div class="sideboard-header">
                <h2 class="sideboard-title"></h2>
                <button class="sideboard-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="sideboard-content">
                <button class="add-event-button">
                    <i class="fa-solid fa-plus"></i>
                    새로운 일정 추가
                </button>
                <div class="event-list"></div>
            </div>
        `;
    
        // 이벤트 생성 모달 추가
        const eventModalHTML = `
            <div class="event-create-overlay"></div>
            <div class="event-create-modal">
                <div class="event-modal-header">
                    <h3 class="event-modal-title">새로운 일정</h3>
                </div>
                <form class="event-form">
                    <div class="form-group">
                        <label class="form-label">제목</label>
                        <input type="text" class="form-input" id="eventTitle" placeholder="일정 제목을 입력하세요" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">설명</label>
                        <textarea class="form-input" id="eventDescription" rows="3" placeholder="일정에 대한 설명을 입력하세요"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">시간</label>
                        <input type="time" class="form-input" id="eventTime" required>
                    </div>
                    <div class="event-modal-footer">
                        <button type="button" class="modal-cancel">취소</button>
                        <button type="submit" class="modal-confirm">확인</button>
                    </div>
                </form>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', eventModalHTML);
    
        const closeBtn = sideboard.querySelector('.sideboard-close');
        const addEventButton = sideboard.querySelector('.add-event-button');
        const eventList = sideboard.querySelector('.event-list');
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        const eventForm = eventCreateModal.querySelector('.event-form');
        const cancelButton = eventCreateModal.querySelector('.modal-cancel');
    
        function showEventModal() {
            eventCreateOverlay.style.display = 'block';
            eventCreateModal.style.display = 'block';
            eventCreateModal.querySelector('#eventTitle').focus();
        }
    
        function hideEventModal() {
            eventCreateOverlay.style.display = 'none';
            eventCreateModal.style.display = 'none';
            eventForm.reset();
        }
    
        function createEvent(e) {
            e.preventDefault();
            const title = eventForm.querySelector('#eventTitle').value;
            const description = eventForm.querySelector('#eventDescription').value;
            const time = eventForm.querySelector('#eventTime').value;
    
            if (!title || !time) return;
    
            const eventData = {
                title,
                description,
                time,
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
            eventList.innerHTML = '';
            const dateEvents = events[selectedDate] || [];
            
            dateEvents.forEach((event, index) => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <div class="event-header">
                        <span class="event-title">${event.title}</span>
                        <button class="delete-event"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                    <div class="event-time">${event.time}</div>
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
    
        closeBtn.addEventListener('click', closeSideboard);
        addEventButton.addEventListener('click', showEventModal);
        eventCreateOverlay.addEventListener('click', hideEventModal);
        cancelButton.addEventListener('click', hideEventModal);
        eventForm.addEventListener('submit', createEvent);
    
        window.updateEventList = updateEventList;
    }

    function showSideboard(day) {
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${day}일`;
        
        sideboard.querySelector('.sideboard-title').textContent = formattedDate;
        sideboard.classList.add('active');
        
        calendarContainer.classList.add('sideboard-open');
        calendarNav.classList.add('sideboard-open');
        calendarBody.classList.add('sideboard-open');
        
        window.updateEventList?.();
        window.dispatchEvent(new Event('resize'));
    
        const eventInput = sideboard.querySelector('.event-input');
        eventInput?.focus();
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
    
        currentDateElement.addEventListener('click', showDateSelectModal);
        dateSelectOverlay.addEventListener('click', closeDateSelectModal);
        yearSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
        monthSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
    
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.calendar-day') && 
                !e.target.closest('.sideboard') && 
                sideboard.classList.contains('active')) {
                closeSideboard();
            }
        });
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
        applyWeekStart();
        renderCalendar();
        setupEventListeners();
        createSideboard();
    }
    
    init();
});