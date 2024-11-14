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
    const dateSelectModal = document.getElementById('dateSelectModal');
    const dateSelectOverlay = document.getElementById('dateSelectOverlay');
    const yearSpinner = document.getElementById('yearSpinner');
    const monthSpinner = document.getElementById('monthSpinner');
    const closeButton = document.querySelector('.date-select-close');
    
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth() + 1;

    function setupSpinners() {
        yearSpinner.innerHTML = '';
        monthSpinner.innerHTML = '';
        
        const now = new Date();
        let tempYear = currentDate.getFullYear();
        let tempMonth = currentDate.getMonth() + 1;
        updateTodayButtonState(tempYear, tempMonth, now);
    
        // 연도 스피너 설정
        const currentYear = now.getFullYear();
        for (let year = currentYear - 50; year <= currentYear + 50; year++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'spinner-item' + (year === tempYear ? ' selected' : '');
            yearItem.textContent = year;
            yearItem.addEventListener('click', () => {
                tempYear = year;
                updateSelectedSpinnerItem(yearSpinner, year);
                scrollToSelected(yearSpinner, year); // 클릭 시에만 스크롤
            });
            yearSpinner.appendChild(yearItem);
        }
    
        // 월 스피너 설정
        for (let month = 1; month <= 12; month++) {
            const monthItem = document.createElement('div');
            monthItem.className = 'spinner-item' + (month === tempMonth ? ' selected' : '');
            monthItem.textContent = `${month}월`;
            monthItem.addEventListener('click', () => {
                tempMonth = month;
                updateSelectedSpinnerItem(monthSpinner, month);
                scrollToSelected(monthSpinner, month); // 클릭 시에만 스크롤
            });
            monthSpinner.appendChild(monthItem);
        }
    
        // 초기 스크롤 위치 설정 (모달 열때만)
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
    
        // 최근 휠 이벤트 기록
        wheelEvents.push({
            time: currentTime,
            delta: Math.abs(e.deltaY)
        });
    
        // 오래된 휠 이벤트 제거
        wheelEvents = wheelEvents.filter(event => currentTime - event.time <= WHEEL_TIMEOUT);
    
        // 휠 속도 계산
        const isRapidWheel = wheelEvents.length >= 3;
        const timeDiff = currentTime - lastWheelTime;
        lastWheelTime = currentTime;
    
        if (isRapidWheel) {
            // 빠른 휠 동작: 부드러운 스크롤
            const scrollAmount = e.deltaY * 2.5; // 스크롤 속도 감소 (0.5 → 0.3)
            spinner.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'  // 'auto' → 'smooth'로 변경하여 부드럽게
            });
        } else {
            // 천천히 한 칸씩 이동
            const direction = e.deltaY > 0 ? 1 : -1;
            const scrollAmount = direction * itemHeight;
            
            spinner.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        }
    
        // 스크롤 후 가장 가까운 항목 선택 업데이트 (시간 증가)
        clearTimeout(spinner.scrollTimeout);
        spinner.scrollTimeout = setTimeout(() => {
            handleSpinnerScroll({ target: spinner });
        }, 200); // 150 → 200ms로 증가하여 더 자연스러운 정렬
    }

    function easeOutQuad(t) { return t * (2 - t); }

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
        
        // 이전 달의 날짜 채우기
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            createDayElement(day, 'other-month', true);
        }
        
        // 현재 달의 날짜 채우기
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentDay(day);
            const isSelected = isSelectedDay(day);
            createDayElement(day, isToday ? 'today' : '', false, isSelected);
        }
        
        // 다음 달의 날짜 채우기
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
        showEventModal(day);
    }

    function showEventModal(day) {
        const dayElement = [...calendarDays.children].find(el => 
            el.querySelector('.day-number').textContent == day && 
            !el.classList.contains('other-month')
        );
            
        if (dayElement) {
            const rect = dayElement.getBoundingClientRect();
            eventModal.style.display = 'block';
            eventModal.style.top = `${rect.bottom + window.scrollY + 8}px`;
            eventModal.style.left = `${rect.left + window.scrollX}px`;
            eventInput.focus();
            updateEventList();
        }
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

    function updateEventList() {
        if (!selectedDate) return;
        
        eventList.innerHTML = '';
        const dateEvents = events[selectedDate] || [];
        
        dateEvents.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.textContent = event;
            eventElement.addEventListener('click', () => {
                dateEvents.splice(index, 1);
                events[selectedDate] = dateEvents;
                updateEventList();
                renderCalendar();
            });
            eventList.appendChild(eventElement);
        });
    }

    function handleEventInput(e) {
        if (e.key === 'Enter' && e.target.value.trim() && selectedDate) {
            const eventText = e.target.value.trim();
            if (!events[selectedDate]) {
                events[selectedDate] = [];
            }
            events[selectedDate].push(eventText);
            e.target.value = '';
            updateEventList();
            renderCalendar();
        }
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

        currentDateElement.addEventListener('click', showDateSelectModal);
        closeButton.addEventListener('click', closeDateSelectModal);
        dateSelectOverlay.addEventListener('click', closeDateSelectModal);
        
        yearSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
        monthSpinner.addEventListener('scroll', debounceScroll(handleSpinnerScroll, 100));
        
        eventInput.addEventListener('keypress', handleEventInput);

        document.addEventListener('click', (e) => {
            if (!eventModal.contains(e.target) && 
                !e.target.classList.contains('calendar-day')) {
                eventModal.style.display = 'none';
            }
        });
    }

    function debounceScroll(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }

    // 초기화
    function init() {
        updateCurrentDate();
        setupSpinners();
        renderCalendar();
        setupEventListeners();
    }

    init();
});