document.addEventListener('DOMContentLoaded', function() {
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
    let currentDateButton = null;
    let selectedDate = null;
    let events = {};
    let selectedYear = currentDate.getFullYear();
    let selectedMonth = currentDate.getMonth() + 1;
    let days = ['일', '월', '화', '수', '목', '금', '토'];
    let currentTimeButton = null;
    let selectedPeriod = 'AM';
    let selectedHour = 10;
    let selectedMinute = 0;
    let tempDisplayDate = new Date();
    let selectedFullDate = null;

    function fetchNotifications(selectedDate = null) {
        const url = selectedDate ? 
            `/get_notifications?date=${selectedDate.toISOString()}` : 
            '/get_notifications';
            
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    return data.notifications;
                }
                throw new Error(data.message || '알림을 불러오는데 실패했습니다.');
            });
    }

    function renderNotifications(notifications) {
        const notificationList = document.querySelector('.notification-list');
        notificationList.innerHTML = '';
    
        if (notifications.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-notification';
            emptyMessage.textContent = '알림이 없습니다.';
            notificationList.appendChild(emptyMessage);
            return;
        }
    
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item${notification.is_read ? ' read' : ''}`;
            
            const eventTime = new Date(notification.notification_time);
            const timeUntil = getTimeUntilEvent(eventTime);
            
            notificationItem.innerHTML = `
                <div class="notification-title">
                    ${notification.title}
                    ${!notification.is_read ? '<span class="unread-badge"></span>' : ''}
                </div>
                <div class="notification-time">
                    ${formatEventDate(notification.notification_time)} ${formatEventTime(notification.notification_time)}
                    ${timeUntil ? `<span class="time-until">(${timeUntil})</span>` : ''}
                </div>
            `;
            
            notificationItem.addEventListener('click', () => {
                markNotificationAsRead(notification.id);
                notificationItem.classList.add('read');
                showEventDetails(notification.event_id);
            });
            
            notificationList.appendChild(notificationItem);
        });
    }

    function getTimeUntilEvent(eventTime) {
        const now = new Date();
        const diff = eventTime - now;
        
        if (diff < 0) return '지남';
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}분 전`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;
        
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    }

    function markNotificationAsRead(notificationId) {
        fetch('/mark_notification_read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notification_id: notificationId })
        });
    }

    function initNotifications() {
        const notificationButton = document.querySelector('.notification-button');
        const sideboardContent = document.querySelector('.sideboard-content');
        let isNotificationActive = false;
        let originalContent = null;
    
        function createNotificationPanel() {
            const wrapper = document.createElement('div');
            wrapper.className = 'notification-content-wrapper';
            
            const tabs = document.createElement('div');
            tabs.className = 'notification-tabs';
            tabs.innerHTML = `
                <div class="notification-tab active" data-tab="all">전체 알림</div>
                <div class="notification-tab" data-tab="date">선택된 날짜</div>
            `;
            
            const notificationList = document.createElement('div');
            notificationList.className = 'notification-list';
            wrapper.appendChild(tabs);
            wrapper.appendChild(notificationList);
            
            // 초기 알림 로드
            fetchNotifications().then(renderNotifications);
            
            // 탭 클릭 이벤트
            tabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.notification-tab');
                if (!tab) return;
                
                tabs.querySelectorAll('.notification-tab').forEach(t => 
                    t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tab.dataset.tab === 'date' && selectedDate) {
                    const date = new Date(currentDate.getFullYear(), 
                                        currentDate.getMonth(), 
                                        parseInt(selectedDate.split('-')[2]));
                    fetchNotifications(date).then(renderNotifications);
                } else {
                    fetchNotifications().then(renderNotifications);
                }
            });
            
            return wrapper;
        }
    
        notificationButton.addEventListener('click', () => {
            isNotificationActive = !isNotificationActive;
            notificationButton.classList.toggle('active', isNotificationActive);
            
            notificationButton.innerHTML = isNotificationActive ? 
                '<i class="fa-solid fa-bell"></i>' : 
                '<i class="fa-regular fa-bell"></i>';
    
            if (isNotificationActive) {
                originalContent = sideboardContent.innerHTML;
                const notificationPanel = createNotificationPanel();
                sideboardContent.innerHTML = '';
                sideboardContent.appendChild(notificationPanel);
                notificationPanel.classList.add('active');
            } else {
                if (originalContent) {
                    sideboardContent.innerHTML = originalContent;
                }
            }
        });
    }

    function getEventRows(events) {
        const rows = new Map();
        const eventPositions = new Map();
    
        events.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
    
        events.forEach(event => {
            const start = new Date(event.start_datetime);
            const end = new Date(event.end_datetime);
            let rowIndex = 0;
            let foundRow = false;
            while (!foundRow) {
                foundRow = true;
                for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                    const dateStr = date.toISOString().split('T')[0];
                    if (!rows.has(dateStr)) {
                        rows.set(dateStr, new Set());
                    }
                    if (rows.get(dateStr).has(rowIndex)) {
                        foundRow = false;
                        rowIndex++;
                        break;
                    }
                }
            }

            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dateStr = date.toISOString().split('T')[0];
                rows.get(dateStr).add(rowIndex);
            }
    
            eventPositions.set(event.id, rowIndex);
        });
    
        return eventPositions;
    }
    
    function renderEvents(calendarDays) {
        calendarDays.querySelectorAll('.event-container').forEach(container => {
            container.innerHTML = '';
        });
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        fetch(`/get_events?start=${firstDay.toISOString()}&end=${lastDay.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.events) {
                    const eventPositions = getEventRows(data.events);
                    const eventsByDay = new Map();
                    const hiddenEventIds = new Set();
                    
                    data.events.forEach(event => {
                        const startDate = new Date(event.start_datetime);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(event.end_datetime);
                        endDate.setHours(0, 0, 0, 0);
                        
                        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                            const dateKey = date.toISOString().split('T')[0];
                            if (!eventsByDay.has(dateKey)) {
                                eventsByDay.set(dateKey, []);
                            }
                            
                            eventsByDay.get(dateKey).push({
                                event,
                                isStart: date.getTime() === startDate.getTime(),
                                isEnd: date.getTime() === endDate.getTime(),
                                isSingleDay: startDate.getTime() === endDate.getTime(),
                                rowIndex: eventPositions.get(event.id)
                            });
                        }
                    });
    
                    eventsByDay.forEach((events) => {
                        if (events.length > 3) {
                            events.slice(3).forEach(({ event }) => {
                                hiddenEventIds.add(event.id);
                            });
                        }
                    });
    
                    calendarDays.querySelectorAll('.calendar-day').forEach(dayCell => {
                        const dayNumber = dayCell.querySelector('.day-number');
                        if (!dayNumber) return;
                        
                        const day = parseInt(dayNumber.textContent);
                        if (isNaN(day)) return;
                        
                        const isOtherMonth = dayCell.classList.contains('other-month');
                        if (isOtherMonth) return;
                        
                        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateKey = cellDate.toISOString().split('T')[0];
                        let dayEvents = eventsByDay.get(dateKey) || [];
                        
                        const hiddenEvents = dayEvents.filter(({ event }) => hiddenEventIds.has(event.id));
                        dayEvents = dayEvents.filter(({ event }) => !hiddenEventIds.has(event.id));
                        
                        const eventContainer = dayCell.querySelector('.event-container');
                        if (eventContainer) {
                            dayEvents.slice(0, 3).forEach(({ event, isStart, isEnd, isSingleDay, rowIndex }) => {
                                const eventBar = document.createElement('div');
                                eventBar.className = 'event-bar';
                                eventBar.style.gridRow = rowIndex + 1;
                                
                                if (isSingleDay) {
                                    eventBar.classList.add('single-day');
                                    eventBar.textContent = event.title;
                                } else {
                                    if (isStart) {
                                        eventBar.classList.add('start');
                                        eventBar.textContent = event.title;
                                    }
                                    if (isEnd) {
                                        eventBar.classList.add('end');
                                    }
                                }
                                
                                eventBar.dataset.eventId = event.id;
                                
                                eventBar.addEventListener('mouseenter', () => {
                                    document.querySelectorAll(`[data-event-id="${event.id}"]`)
                                        .forEach(bar => bar.classList.add('hover'));
                                });
                                
                                eventBar.addEventListener('mouseleave', () => {
                                    document.querySelectorAll(`[data-event-id="${event.id}"]`)
                                        .forEach(bar => bar.classList.remove('hover'));
                                });
                                
                                eventBar.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                });
                                
                                eventContainer.appendChild(eventBar);
                            });
    
                            if (hiddenEvents.length > 0) {
                                const moreText = document.createElement('div');
                                moreText.className = 'more-events';
                                moreText.textContent = `+${hiddenEvents.length}`;
                                moreText.style.gridRow = 4;
                                eventContainer.appendChild(moreText);
                            }
                        }
                    });
                }
            })
            .catch(error => console.error('이벤트 로딩 오류:', error));
    }

    function handleEventClick(event) {
        const clickedDate = new Date(event.start_datetime);
        const day = clickedDate.getDate();
        
        if (currentDate.getMonth() !== clickedDate.getMonth() || 
            currentDate.getFullYear() !== clickedDate.getFullYear()) {
            currentDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);
            updateCurrentDate();
            renderCalendar();
        }
        handleDateClick(day);
        setTimeout(() => showEditEventModal(event), 100);
    }

    function showFullDateSelectModal(button) {
        currentDateButton = button;
        const fullDateSelectModal = document.querySelector('.full-date-select-modal');
        const fullDateSelectOverlay = document.querySelector('.full-date-select-overlay');
        const dateText = button.textContent;
        const matches = dateText.match(/(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/);
        if (matches) {
            tempDisplayDate = new Date(
                parseInt(matches[1]),
                parseInt(matches[2]) - 1,
                parseInt(matches[3])
            );
            selectedFullDate = new Date(tempDisplayDate);
        }
        
        updateFullCalendar();
        fullDateSelectModal.style.display = 'block';
        fullDateSelectOverlay.style.display = 'block';
    }

    function updateFullCalendar() {
        const currentMonth = document.querySelector('.current-month');
        const calendarDays = document.querySelector('.full-calendar-days');
        
        currentMonth.textContent = `${tempDisplayDate.getFullYear()}년 ${tempDisplayDate.getMonth() + 1}월`;
        
        const firstDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth(), 1);
        const lastDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth(), 0);
        
        let startOffset = firstDay.getDay();
        calendarDays.innerHTML = '';
        
        for (let i = startOffset - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            createFullCalendarDay(day, true);
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            createFullCalendarDay(day, false);
        }
        
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            createFullCalendarDay(day, true);
        }
    }

    function createFullCalendarDay(day, isOtherMonth) {
        const calendarDays = document.querySelector('.full-calendar-days');
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        
        const today = new Date();
        const isToday = !isOtherMonth && 
                    day === today.getDate() && 
                    tempDisplayDate.getMonth() === today.getMonth() && 
                    tempDisplayDate.getFullYear() === today.getFullYear();
                    
        const isSelected = !isOtherMonth && 
                        selectedFullDate && 
                        day === selectedFullDate.getDate() && 
                        tempDisplayDate.getMonth() === selectedFullDate.getMonth() && 
                        tempDisplayDate.getFullYear() === selectedFullDate.getFullYear();
        
        dayElement.className = `full-calendar-day${isOtherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`;
        
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                document.querySelectorAll('.full-calendar-day').forEach(el => el.classList.remove('selected'));
                dayElement.classList.add('selected');
                selectedFullDate = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth(), day);
            });
        }
        
        calendarDays.appendChild(dayElement);
    }

    function initFullDateSelect() {
        const prevMonthBtn = document.querySelector('.prev-month-btn');
        const nextMonthBtn = document.querySelector('.next-month-btn');
        const todayBtn = document.querySelector('.full-date-select-today');
        const confirmBtn = document.querySelector('.full-date-select-confirm');
        const overlay = document.querySelector('.full-date-select-overlay');
        
        prevMonthBtn.addEventListener('click', () => {
            tempDisplayDate.setMonth(tempDisplayDate.getMonth() - 1);
            updateFullCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            tempDisplayDate.setMonth(tempDisplayDate.getMonth() + 1);
            updateFullCalendar();
        });
        
        todayBtn.addEventListener('click', () => {
            tempDisplayDate = new Date();
            selectedFullDate = new Date();
            updateFullCalendar();
        });
        
        confirmBtn.addEventListener('click', () => {
            if (selectedFullDate && currentDateButton) {
                currentDateButton.textContent = `${selectedFullDate.getFullYear()}년 ${selectedFullDate.getMonth() + 1}월 ${selectedFullDate.getDate()}일`;
            }
            hideFullDateSelectModal();
        });
        
        overlay.addEventListener('click', hideFullDateSelectModal);
    }

    function hideFullDateSelectModal() {
        const modal = document.querySelector('.full-date-select-modal');
        const overlay = document.querySelector('.full-date-select-overlay');
        modal.style.display = 'none';
        overlay.style.display = 'none';
        currentDateButton = null;
    }

    function initDateTimeButtons() {
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        
        startDateBtn.addEventListener('click', () => showFullDateSelectModal(startDateBtn));
        endDateBtn.addEventListener('click', () => showFullDateSelectModal(endDateBtn));
        
        updateDateButtonText(startDateBtn, new Date());
        updateDateButtonText(endDateBtn, new Date());
        
        initFullDateSelect();
    }

    function updateDateButtonText(button, date) {
        button.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }

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
    
        startTimeBtn.addEventListener('click', () => showTimeSelectModal(startTimeBtn));
        endTimeBtn.addEventListener('click', () => showTimeSelectModal(endTimeBtn));
        timeSelectOverlay.addEventListener('click', hideTimeSelectModal);
        cancelBtn.addEventListener('click', hideTimeSelectModal);
        confirmBtn.addEventListener('click', confirmTimeSelection);
        periodSpinner.addEventListener('wheel', handleWheel, { passive: false });
        hourSpinner.addEventListener('wheel', handleWheel, { passive: false });
        minuteSpinner.addEventListener('wheel', handleWheel, { passive: false });
        periodSpinner.addEventListener('scroll', debounceScroll(handleTimeSpinnerScroll, 100));
        hourSpinner.addEventListener('scroll', debounceScroll(handleTimeSpinnerScroll, 100));
        minuteSpinner.addEventListener('scroll', debounceScroll(handleTimeSpinnerScroll, 100));
    }
    
    function showTimeSelectModal(button) {
        currentTimeButton = button;
        const timeSelectOverlay = document.querySelector('.time-select-overlay');
        const timeSelectModal = document.querySelector('.time-select-modal');
        const modalTitle = timeSelectModal.querySelector('.time-select-title');
        const currentTime = button.textContent;
        
        if (button.id === 'startTimeButton') {
            modalTitle.textContent = '시작 시간';
        } else {
            modalTitle.textContent = '종료 시간';
        }
        
        parseCurrentTime(currentTime);
        setupTimeSpinners();
        
        timeSelectOverlay.style.display = 'block';
        timeSelectModal.style.display = 'block';
    }
    
    function parseCurrentTime(timeString) {
        const matches = timeString.match(/^(오전|오후)\s+(\d+):(\d+)$/);
        if (matches) {
            const period = matches[1] === '오전' ? 'AM' : 'PM';
            const hour = parseInt(matches[2]);
            const minute = parseInt(matches[3]);
            selectedPeriod = period;
            selectedHour = hour;
            selectedMinute = minute;
        } else {
            const [hours, minutes] = timeString.split(':').map(Number);
            selectedHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
            selectedPeriod = hours >= 12 ? 'PM' : 'AM';
            selectedMinute = minutes;
        }
    }
    
    function setupTimeSpinners() {
        const periodSpinner = document.querySelector('.period-spinner');
        const hourSpinner = document.querySelector('.hour-spinner');
        const minuteSpinner = document.querySelector('.minute-spinner');
    
        periodSpinner.innerHTML = '';
        [['AM', '오전'], ['PM', '오후']].forEach(([value, text]) => {
            const periodItem = document.createElement('div');
            periodItem.className = 'spinner-item' + (value === selectedPeriod ? ' selected' : '');
            periodItem.textContent = text;
            periodItem.dataset.value = value;
            periodItem.addEventListener('click', () => {
                selectedPeriod = value;
                updateSelectedSpinnerItem(periodSpinner, value);
                scrollToSelected(periodSpinner, value, true);
            });
            periodSpinner.appendChild(periodItem);
        });
    
        hourSpinner.innerHTML = '';
        for (let hour = 1; hour <= 12; hour++) {
            const hourItem = document.createElement('div');
            hourItem.className = 'spinner-item' + (hour === selectedHour ? ' selected' : '');
            hourItem.textContent = hour;
            hourItem.addEventListener('click', () => {
                selectedHour = hour;
                updateSelectedSpinnerItem(hourSpinner, hour);
                scrollToSelected(hourSpinner, hour);
            });
            hourSpinner.appendChild(hourItem);
        }
    
        minuteSpinner.innerHTML = '';
        for (let minute = 0; minute < 60; minute += 5) {
            const minuteItem = document.createElement('div');
            minuteItem.className = 'spinner-item' + (minute === selectedMinute ? ' selected' : '');
            minuteItem.textContent = minute.toString().padStart(2, '0');
            minuteItem.addEventListener('click', () => {
                selectedMinute = minute;
                updateSelectedSpinnerItem(minuteSpinner, minute);
                scrollToSelected(minuteSpinner, minute);
            });
            minuteSpinner.appendChild(minuteItem);
        }
    
        setTimeout(() => {
            scrollToSelected(periodSpinner, selectedPeriod, true);
            scrollToSelected(hourSpinner, selectedHour);
            scrollToSelected(minuteSpinner, selectedMinute);
        }, 0);
    }
    
    function confirmTimeSelection() {
        if (!currentTimeButton) return;
        
        let hours = selectedHour;
        if (selectedPeriod === 'PM' && hours !== 12) {
            hours += 12;
        } else if (selectedPeriod === 'AM' && hours === 12) {
            hours = 0;
        }
    
        const period = selectedPeriod === 'AM' ? '오전' : '오후';
        const displayHour = selectedHour;
        const timeString = `${period} ${displayHour}:${selectedMinute.toString().padStart(2, '0')}`;
        currentTimeButton.textContent = timeString;
        
        hideTimeSelectModal();
    }
    
    function hideTimeSelectModal() {
        const timeSelectOverlay = document.querySelector('.time-select-overlay');
        const timeSelectModal = document.querySelector('.time-select-modal');
        timeSelectModal.style.display = 'none';
        timeSelectOverlay.style.display = 'none';
        currentTimeButton = null;
    }

    function showEventModal() {
        hideAllModals();
        
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        eventCreateOverlay.style.display = 'block';
        eventCreateModal.style.display = 'block';
        
        const today = new Date(selectedDate);
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        updateDateButtonText(startDateBtn, today);
        updateDateButtonText(endDateBtn, today);
        
        const startTimeBtn = document.getElementById('startTimeButton');
        const endTimeBtn = document.getElementById('endTimeButton');
        if (startTimeBtn) startTimeBtn.textContent = '오전 10:00';
        if (endTimeBtn) endTimeBtn.textContent = '오전 11:00';
        
        eventCreateModal.querySelector('#eventTitle').focus();
    }

    function hideEventModal() {
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventCreateModal = document.querySelector('.event-create-modal');
        const eventForm = eventCreateModal?.querySelector('.event-form');
        eventCreateOverlay.style.display = 'none';
        eventCreateModal.style.display = 'none';
        if (eventForm) {
            eventForm.reset();
            delete eventForm.dataset.eventId;
            eventCreateModal.querySelector('.event-modal-title').textContent = '새로운 일정';
        }
    }

    function showEditEventModal(event) {
        hideAllModals();
        
        const eventCreateModal = document.querySelector('.event-create-modal');
        const eventCreateOverlay = document.querySelector('.event-create-overlay');
        const eventForm = document.querySelector('.event-form');
        const modalTitle = eventCreateModal.querySelector('.event-modal-title');
        
        modalTitle.textContent = '일정 수정';
        eventForm.querySelector('#eventTitle').value = event.title;
        eventForm.querySelector('#eventUrl').value = event.url || '';
        eventForm.querySelector('#eventMemo').value = event.memo || '';
        eventForm.querySelector('#eventNotification').value = event.notification || 'none';
    
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);
        
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        const startTimeBtn = document.getElementById('startTimeButton');
        const endTimeBtn = document.getElementById('endTimeButton');
        
        updateDateButtonText(startDateBtn, startDate);
        updateDateButtonText(endDateBtn, endDate);
        
        startTimeBtn.textContent = formatTimeButtonText(startDate);
        endTimeBtn.textContent = formatTimeButtonText(endDate);
        eventForm.dataset.eventId = event.id;
        
        eventCreateOverlay.style.display = 'block';
        eventCreateModal.style.display = 'block';
        eventForm.querySelector('#eventTitle').focus();
    }

    function formatTimeButtonText(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    }

    function createEvent(e) {
        e.preventDefault();
        const eventForm = document.querySelector('.event-form');
        const title = eventForm.querySelector('#eventTitle').value;
        const startDate = document.getElementById('startDateButton').textContent;
        const startTime = document.getElementById('startTimeButton').textContent;
        const endDate = document.getElementById('endDateButton').textContent;
        const endTime = document.getElementById('endTimeButton').textContent;
        const notification = eventForm.querySelector('#eventNotification').value;
        const url = eventForm.querySelector('#eventUrl').value;
        const memo = eventForm.querySelector('#eventMemo').value;
        const eventId = eventForm.dataset.eventId;
    
        if (!title) {
            alert('제목을 입력해주세요.');
            return;
        }
    
        function parseDateTime(dateStr, timeStr) {
            const [year, month, day] = dateStr.match(/(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/).slice(1);
            const [period, hourMin] = timeStr.match(/(오전|오후)\s+(\d{1,2}:\d{2})/).slice(1);
            const [hours, minutes] = hourMin.split(':').map(num => parseInt(num));
            
            let hour = parseInt(hours);
            if (period === '오후' && hour !== 12) {
                hour += 12;
            } else if (period === '오전' && hour === 12) {
                hour = 0;
            }
    
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }
    
        const startDateTime = parseDateTime(startDate, startTime);
        const endDateTime = parseDateTime(endDate, endTime);
    
        const eventData = {
            title,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            notification,
            url,
            memo
        };
    
        function refreshCalendarAndSideboard() {
            renderCalendar();
            
            if (selectedDate) {
                const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(selectedDate.split('-')[2]));
                updateSideboardEvents(selectedDateObj);
            }
        }
    
        if (eventId) {
            fetch(`/update_event/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    hideEventModal();
                    refreshCalendarAndSideboard();
                } else {
                    alert(data.message || '일정 수정에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('일정 수정 오류:', error);
                alert('일정 수정에 실패했습니다.');
            });
        } else {
            fetch('/save_event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    hideEventModal();
                    refreshCalendarAndSideboard();
                } else {
                    alert(data.message || '일정 저장에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('일정 저장 오류:', error);
                alert('일정 저장에 실패했습니다.');
            });
        }
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
                    <button class="delete-event"><i class="fa-solid fa-trash-can"></i></button>
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
        const eventForm = document.querySelector('.event-form');
        
        addEventButton.addEventListener('click', showEventModal);
        
        document.querySelector('.event-create-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                hideEventModal();
            }
        });
    
        document.querySelector('.time-select-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                hideTimeSelectModal();
            }
        });
        
        eventForm.querySelector('.modal-cancel').addEventListener('click', hideEventModal);
        closeBtn.addEventListener('click', closeSideboard);
    }

    function hideAllModals() {
        hideTimeSelectModal();
        hideEventModal();
        closeDateSelectModal();
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

    function scrollToSelected(spinner, value, isPeriod = false) {
        const items = spinner.querySelectorAll('.spinner-item');
        const selectedItem = Array.from(items).find(item => {
            if (isPeriod) {
                return item.dataset.value === value;
            }
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
            if (item.dataset.value) {
                item.classList.toggle('selected', item.dataset.value === value);
            } else {
                const itemValue = parseInt(item.textContent);
                item.classList.toggle('selected', itemValue === value);
            }
        });
    }

    function handleTimeSpinnerScroll(event) {
        const spinner = event.target;
        const spinnerRect = spinner.getBoundingClientRect();
        const spinnerCenter = spinnerRect.top + (spinnerRect.height / 2);
        
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
            if (spinner.classList.contains('period-spinner')) {
                const value = closestItem.dataset.value;
                selectedPeriod = value;
                updateSelectedSpinnerItem(spinner, value);
            } else if (spinner.classList.contains('hour-spinner')) {
                const value = parseInt(closestItem.textContent);
                selectedHour = value;
                updateSelectedSpinnerItem(spinner, value);
            } else if (spinner.classList.contains('minute-spinner')) {
                const value = parseInt(closestItem.textContent);
                selectedMinute = value;
                updateSelectedSpinnerItem(spinner, value);
            }
        }
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
            const dayElement = createDayElement(day, 'other-month', true);
            calendarDays.appendChild(dayElement);
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentDay(day);
            const isSelected = isSelectedDay(day);
            const dayElement = createDayElement(day, isToday ? 'today' : '', false, isSelected);
            calendarDays.appendChild(dayElement);
        }
        
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = createDayElement(day, 'other-month', true);
            calendarDays.appendChild(dayElement);
        }
        renderEvents(calendarDays);
    }

    function createDayElement(day, className, isOtherMonth, isSelected = false) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className} ${isSelected ? 'selected' : ''}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event-container';
        dayElement.appendChild(eventContainer);
        
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => handleDateClick(day));
        }
        
        return dayElement;
    }

    function closeDateSelectModal() {
        dateSelectModal.style.display = 'none';
        dateSelectOverlay.style.display = 'none';
        currentDateButton = null;
    }

    function handleDateChange() {
        if (currentDateButton) {
            const selectedDate = new Date(selectedYear, selectedMonth - 1);
            updateDateButtonText(currentDateButton, selectedDate);
        }
        else { 
            currentDate = new Date(selectedYear, selectedMonth - 1);
            updateCurrentDate();
            renderCalendar();
        }
        closeDateSelectModal();
    }

    function updateSideboardEvents(selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
    
        fetch(`/get_events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const eventList = document.querySelector('.event-list');
                    if (eventList) {
                        const addEventButton = eventList.querySelector('.add-event-button');
                        eventList.innerHTML = '';
                        if (addEventButton) {
                            eventList.appendChild(addEventButton);
                        }
                        
                        const sortedEvents = data.events.sort((a, b) => {
                            const dateA = new Date(a.created_at);
                            const dateB = new Date(b.created_at);
                            return dateB - dateA;
                        });
                        
                        sortedEvents.forEach(event => {
                            const eventElement = createEventElement(event);
                            eventList.appendChild(eventElement);
                        });
                    }
                }
            })
            .catch(error => console.error('이벤트 로딩 오류:', error));
    }
    
    function formatEventTime(dateStr) {
        const date = new Date(dateStr);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    function formatEventDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    
    function createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.dataset.eventId = event.id;
    
        const header = document.createElement('div');
        header.className = 'event-header';
    
        const title = document.createElement('span');
        title.className = 'event-title';
        title.textContent = event.title;
    
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-event';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            handleEventDelete(event.id);
        };
    
        const time = document.createElement('div');
        time.className = 'event-time';
        time.innerHTML = `${formatEventDate(event.start_datetime)} ${formatEventTime(event.start_datetime)}부터<br>${formatEventDate(event.end_datetime)} ${formatEventTime(event.end_datetime)}까지`;
    
        header.appendChild(title);
        header.appendChild(deleteBtn);
        eventDiv.appendChild(header);
        eventDiv.appendChild(time);
    
        if (event.memo) {
            const memo = document.createElement('p');
            memo.className = 'event-memo';
            memo.textContent = event.memo;
            eventDiv.appendChild(memo);
        }
    
        if (event.url) {
            const url = document.createElement('a');
            url.className = 'event-url';
            url.href = event.url;
            url.target = '_blank';
            url.textContent = event.url;
            eventDiv.appendChild(url);
        }
        eventDiv.addEventListener('click', () => showEditEventModal(event));
        return eventDiv;
    }

    function handleEventDelete(eventId) {
        const deleteModal = document.querySelector('.delete-confirm-modal');
        const overlay = document.querySelector('.delete-confirm-overlay');
        const cancelBtn = deleteModal.querySelector('.modal-cancel');
        const deleteBtn = deleteModal.querySelector('.modal-delete');
        
        deleteModal.style.display = 'block';
        overlay.style.display = 'block';
        
        function closeModal() {
            deleteModal.style.display = 'none';
            overlay.style.display = 'none';
        }
        
        function refreshCalendarAndSideboard() {
            renderCalendar();
            
            if (selectedDate) {
                const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(selectedDate.split('-')[2]));
                updateSideboardEvents(selectedDateObj);
            }
        }
        
        cancelBtn.onclick = closeModal;
        
        deleteBtn.onclick = () => {
            fetch('/delete_event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    refreshCalendarAndSideboard();
                } else {
                    alert('일정 삭제에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('일정 삭제 오류:', error);
                alert('일정 삭제 중 오류가 발생했습니다.');
            })
            .finally(closeModal);
        };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function handleDateClick(day) {
        selectedDate = getDateString(day);
        renderCalendar();
        showSideboard(day);
        
        const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        updateSideboardEvents(selectedDateObj);
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
    
        currentDateElement.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedYear = currentDate.getFullYear();
            selectedMonth = currentDate.getMonth() + 1;
            currentDateButton = null;
            dateSelectModal.style.display = 'block';
            dateSelectOverlay.style.display = 'block';
            setupSpinners();
        });
    
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
        if (e.key === 'Escape') {
            const timeSelectModal = document.querySelector('.time-select-modal');
            if (timeSelectModal && window.getComputedStyle(timeSelectModal).display === 'block') {
                hideTimeSelectModal();
                return;
            }
    
            const fullDateSelectModal = document.querySelector('.full-date-select-modal');
            if (fullDateSelectModal && window.getComputedStyle(fullDateSelectModal).display === 'block') {
                hideFullDateSelectModal();
                return;
            }
    
            const dateSelectModal = document.getElementById('dateSelectModal');
            if (dateSelectModal && window.getComputedStyle(dateSelectModal).display === 'block') {
                closeDateSelectModal();
                return;
            }
    
            const eventCreateModal = document.querySelector('.event-create-modal');
            if (eventCreateModal && window.getComputedStyle(eventCreateModal).display === 'block') {
                hideEventModal();
                return;
            }
    
            const sideboard = document.querySelector('.sideboard');
            if (sideboard && sideboard.classList.contains('active')) {
                closeSideboard();
                return;
            }
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
        initDateTimeButtons();
        applyWeekStart();
        renderCalendar();
        setupEventListeners();
        initSideboardEvents();
        initNotifications();
        
        const eventForm = document.querySelector('.event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', createEvent);
        }
    }
    init();
});