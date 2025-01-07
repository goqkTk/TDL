window.addEventListener('load', checkForHighlight);
document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const actionBtns = document.querySelectorAll('#success, #delete');
    const addBtn = document.getElementById('add');
    const detailInput = document.getElementById('detail');
    const addmodalBackground = document.querySelector('.add-modal-background');
    const addCloseButton = document.querySelector('#add-close');
    const editmodalBackground = document.querySelector('.edit-modal-background');
    const addContentBtn = document.getElementById('add-content');
    const editContentBtn = document.querySelector('.edit-group');
    const otherBtns = document.querySelectorAll('#other')
    const confirmModalBackground = document.querySelector('.confirm-modal-background');
    const donateBtn = document.querySelector('.donate');
    const donateModalBackground = document.querySelector('.donate-modal-background');
    const yesBtn = document.getElementById('yes');
    const noBtn = document.getElementById('no');
    const fixButtons = document.querySelectorAll('#fix');
    const detailButtons = document.querySelectorAll('.detail-group');
    const donateOptions = document.querySelectorAll('.netflix, .cycle');
    const qrOverlay = document.querySelector('.qr-overlay');
    const qrImage = qrOverlay.querySelector('.qr-image');
    const backButton = qrOverlay.querySelector('.back-button');
    const modalBackgrounds = document.querySelectorAll(`
        .add-modal-background,
        .edit-modal-background,
        .confirm-modal-background,
        .donate-modal-background,
        .add-category-modal-background,
        .search-modal-background,
        .edit-delete-modal-background,
        .setting-modal-background
    `);
    const loginRequiredModal = document.querySelector('.login-required-modal-background');
    const goToLoginBtn = document.getElementById('go-to-login');
    const addCategoryBtn = document.getElementById('add-category');
    const addCategoryBackground = document.querySelector('.add-category-modal-background');
    const addCategoryInput = document.getElementById('add-category-input');
    const editCategoryInput = document.getElementById('edit-category-input');
    const confirmCategoryBtn = document.getElementById('confirm-category');
    const confirmEditCategoryBtn = document.getElementById('confirm-edit-category');
    const searchBtn = document.querySelector('.search');
    const searchModalBackground = document.querySelector('.search-modal-background');
    const searchInput = document.getElementById('category-search-input');
    const searchResults = document.getElementById('category-search-results');
    const searchLabel = document.getElementById('search-label');
    const editDeleteButtons = document.querySelectorAll('#edit-delete');
    const editDeleteBackground = document.querySelector('.edit-delete-modal-background');
    const settingBtn = document.querySelector('.setting');
    const settingModalBackground = document.querySelector('.setting-modal-background');
    const categoryContainer = document.querySelector('.other_categories');
    const contents = document.querySelector('.contents');
    const themeBtn = document.querySelector('.theme-selector-btn');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const themedropdownItems = document.querySelectorAll('.theme-dropdown-item');
    const container = document.querySelector('.container');
    const dateSelectToggle = document.getElementById('date-select-toggle');
    const dateSelectionPanel = document.querySelector('.date-selection-panel');
    const todoTime = document.getElementById('todo-time');
    const allDayCheckbox = document.getElementById('all-day');
    const calendarLink = document.querySelector('.calendar-link');
    const datetimeGroup = document.querySelector('.datetime-group');

    let isCalendarLinked = false;
    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let originalRect;
    let dragOffsetY;
    let todoToRemove = null;
    let startScrollY;
    let draggedCategory = null;
    let categoryPlaceholder = null;
    let isDraggingCategory = false;
    let categoryDragOffsetY = 0;
    let moveDistance = 0;
    let wasSelected = false;
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    let selectedDate = new Date();
    let selectedStartDate = new Date();
    let selectedEndDate = new Date();
    let currentDateButton = null;

    checkForHighlight();
    initDateTimeFeatures();

    function resetModal() {
        if (calendarLink) calendarLink.style.display = 'block';
        if (datetimeGroup) datetimeGroup.style.display = 'none';
        isCalendarLinked = false;
        
        const titleInput = document.getElementById('title');
        const detailInput = document.getElementById('detail');
        if (titleInput) titleInput.value = '';
        if (detailInput) detailInput.value = '';
        
        const allDayCheckbox = document.getElementById('allDayEvent');
        if (allDayCheckbox) allDayCheckbox.checked = false;
        
        const now = new Date();
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        if (startDateBtn) startDateBtn.textContent = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
        if (endDateBtn) endDateBtn.textContent = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
        
        const startTimeBtn = document.getElementById('startTimeButton');
        const endTimeBtn = document.getElementById('endTimeButton');
        if (startTimeBtn) startTimeBtn.textContent = '오전 10:00';
        if (endTimeBtn) endTimeBtn.textContent = '오전 11:00';
    }

    if (calendarLink) {
        calendarLink.addEventListener('click', function() {
            isCalendarLinked = true;
            this.style.display = 'none';
            datetimeGroup.style.display = 'flex';
        });
    }

    if (addCloseButton) {
        addCloseButton.addEventListener('click', function() {
            addmodalBackground.style.display = 'none';
            resetModal();
        });
    }

    if (addmodalBackground) {
        addmodalBackground.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                resetModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && addmodalBackground.style.display === 'flex') {
            addmodalBackground.style.display = 'none';
            resetModal();
        }
    });

    const fullDateSelectOverlay = document.querySelector('.full-date-select-overlay');
    const confirmDateBtn = document.querySelector('.full-date-select-confirm');
    const todayBtn = document.querySelector('.full-date-select-today');
    const prevMonthBtn = document.querySelector('.prev-month-btn');
    const nextMonthBtn = document.querySelector('.next-month-btn');
    
    fullDateSelectOverlay?.addEventListener('click', hideFullDateSelectModal);
    confirmDateBtn?.addEventListener('click', confirmDateSelection);
    todayBtn?.addEventListener('click', () => {
        const today = new Date();
        selectedYear = today.getFullYear();
        selectedMonth = today.getMonth() + 1;
        selectedDay = today.getDate();
        updateFullCalendar();
    });
    
    prevMonthBtn?.addEventListener('click', () => {
        selectedMonth--;
        if (selectedMonth < 1) {
            selectedMonth = 12;
            selectedYear--;
        }
        updateFullCalendar();
    });
    
    nextMonthBtn?.addEventListener('click', () => {
        selectedMonth++;
        if (selectedMonth > 12) {
            selectedMonth = 1;
            selectedYear++;
        }
        updateFullCalendar();
    });

    const weekBtn = document.querySelector('.week-selector-btn');
    const weekDropdown = document.querySelector('.week-dropdown');
    const weekDropdownItems = document.querySelectorAll('.week-dropdown-item');

    function initializeWeek() {
        const savedWeek = localStorage.getItem('weekStart') || 'sunday';
        updateSelectedWeek(savedWeek === 'sunday' ? '일요일' : '월요일');
        localStorage.setItem('weekStart', savedWeek);
    }

    function updateSelectedWeek(weekName) {
        weekBtn.textContent = weekName;
        weekDropdownItems.forEach(item => {
            item.classList.toggle('selected', item.textContent === weekName);
        });
    }

    weekBtn.addEventListener('click', () => {
        weekBtn.classList.toggle('active');
        weekDropdown.classList.toggle('show');
    });

    weekDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const weekName = item.textContent;
            const weekStart = weekName === '일요일' ? 'sunday' : 'monday';
            
            localStorage.setItem('weekStart', weekStart);
            updateSelectedWeek(weekName);
            weekBtn.classList.remove('active');
            weekDropdown.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.week-selector')) {
            weekBtn.classList.remove('active');
            weekDropdown.classList.remove('show');
        }
    });
    initializeWeek();
    
    const autoHideToggle = document.querySelector('.toggle-switch input[type="checkbox"]');
    
    if (autoHideToggle) {
        const isAutoHideEnabled = localStorage.getItem('autoHideCompleted') === 'true';
        autoHideToggle.checked = isAutoHideEnabled;
        
        autoHideToggle.addEventListener('change', function() {
            localStorage.setItem('autoHideCompleted', this.checked);
            
            if (this.checked) {
                handleAutoHideSuccess();
            } else {
                localStorage.setItem('settingModalOpen', 'true');
                window.location.reload();
            }
        });

        if (localStorage.getItem('settingModalOpen') === 'true') {
            document.querySelector('.setting-modal-background').style.display = 'flex';
            localStorage.removeItem('settingModalOpen');
        }
    }

    const sizeBtn = document.querySelector('.size-selector-btn');
    const sizeDropdown = document.querySelector('.size-dropdown');
    const sizeDropdownItems = document.querySelectorAll('.size-dropdown-item');
    
    function initializeTextSize() {
        const savedSize = localStorage.getItem('textSize') || 'small';
        updateTextSize(savedSize);
        updateSelectedSize(getSizeDisplayName(savedSize));
    }

    function getSizeDisplayName(size) {
        const sizeMap = {
            'small': '작게',
            'medium': '보통',
            'large': '크게'
        };
        return sizeMap[size];
    }

    function getSizeValue(displayName) {
        const reverseMap = {
            '작게': 'small',
            '보통': 'medium',
            '크게': 'large'
        };
        return reverseMap[displayName];
    }

    function updateSelectedSize(sizeName) {
        sizeBtn.textContent = sizeName;
        sizeDropdownItems.forEach(item => {
            item.classList.toggle('selected', item.textContent === sizeName);
        });
    }

    function updateTextSize(size) {
        container.classList.remove('text-small', 'text-medium', 'text-large');
        container.classList.add(`text-${size}`);
        localStorage.setItem('textSize', size);
    }

    sizeBtn.addEventListener('click', () => {
        sizeBtn.classList.toggle('active');
        sizeDropdown.classList.toggle('show');
    });

    sizeDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const displayName = item.textContent;
            const size = getSizeValue(displayName);
            
            updateTextSize(size);
            updateSelectedSize(displayName);
            sizeBtn.classList.remove('active');
            sizeDropdown.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.size-selector')) {
            sizeBtn.classList.remove('active');
            sizeDropdown.classList.remove('show');
        }
    });
    initializeTextSize();

    const positionBtn = document.querySelector('.position-selector-btn');
    const positionDropdown = document.querySelector('.position-dropdown');
    const positionDropdownItems = document.querySelectorAll('.position-dropdown-item');
    
    function initializeSidebarPosition() {
        const savedPosition = localStorage.getItem('sidebarPosition') || 'left';
        container.setAttribute('data-sidebar', savedPosition);
        updateSelectedPosition(savedPosition === 'left' ? '왼쪽' : '오른쪽');
    }

    function updateSelectedPosition(positionName) {
        positionBtn.textContent = positionName;
        positionDropdownItems.forEach(item => {
            item.classList.toggle('selected', item.textContent === positionName);
        });
    }

    positionBtn.addEventListener('click', () => {
        positionBtn.classList.toggle('active');
        positionDropdown.classList.toggle('show');
    });

    positionDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const positionName = item.textContent;
            const position = positionName === '왼쪽' ? 'left' : 'right';
            
            container.setAttribute('data-sidebar', position);
            localStorage.setItem('sidebarPosition', position);
            
            updateSelectedPosition(positionName);
            positionBtn.classList.remove('active');
            positionDropdown.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.position-selector')) {
            positionBtn.classList.remove('active');
            positionDropdown.classList.remove('show');
        }
    });
    initializeSidebarPosition();

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    const savedThemeMode = localStorage.getItem('themeMode');
    
    function initializeTheme() {
        if (savedThemeMode === 'system') {
            setThemeBasedOnSystem();
            updateSelectedTheme('시스템 설정 사용');
        } else if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateSelectedTheme(savedTheme === 'dark' ? '다크 모드' : '라이트 모드');
        } else {
            setThemeBasedOnSystem();
            updateSelectedTheme('시스템 설정 사용');
        }
    }

    function setThemeBasedOnSystem() {
        const isDarkMode = systemTheme.matches;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('themeMode', 'system');
    }

    function updateSelectedTheme(themeName) {
        themeBtn.textContent = themeName;
        themedropdownItems.forEach(item => {
            item.classList.toggle('selected', item.textContent === themeName);
        });
    }

    themeBtn.addEventListener('click', () => {
        themeBtn.classList.toggle('active');
        themeDropdown.classList.toggle('show');
    });

    themedropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const themeName = item.textContent;
            
            if (themeName === '시스템 설정 사용') {
                setThemeBasedOnSystem();
            } else {
                const theme = themeName === '다크 모드' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                localStorage.setItem('themeMode', 'manual');
            }
            
            updateSelectedTheme(themeName);
            themeBtn.classList.remove('active');
            themeDropdown.classList.remove('show');
        });
    });

    systemTheme.addEventListener('change', (e) => {
        if (localStorage.getItem('themeMode') === 'system') {
            const isDarkMode = e.matches;
            document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-selector')) {
            themeBtn.classList.remove('active');
            themeDropdown.classList.remove('show');
        }
    });
    initializeTheme();

    contents.addEventListener('mousedown', function(e) {
        const gripElement = e.target.closest('#grip');
        if (!gripElement) return;
    
        const todoItem = gripElement.closest('.todo-item');
        if (!todoItem) return;

        if (todoItem.classList.contains('fixed')) {
            todoItem.classList.add('shake');
            todoItem.addEventListener('animationend', function() {
                todoItem.classList.remove('shake');
            }, { once: true });
            return;
        }
    
        e.preventDefault();
        draggedItem = todoItem;
    
        e.preventDefault();
        draggedItem = todoItem;
        originalRect = todoItem.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(todoItem);
        dragOffsetY = e.clientY - originalRect.top;
        startY = e.clientY;
        startScrollY = window.scrollY;
        isDragging = true;
    
        placeholder = document.createElement('div');
        placeholder.className = 'todo-item-placeholder';
        placeholder.style.height = `${originalRect.height}px`;
        placeholder.style.marginBottom = computedStyle.marginBottom;
        placeholder.style.border = '2px dashed #ccc';
        placeholder.style.backgroundColor = '#f0f0f0';
    
        const originalStyles = {
            position: draggedItem.style.position,
            zIndex: draggedItem.style.zIndex,
            boxShadow: draggedItem.style.boxShadow,
            transition: draggedItem.style.transition,
            background: draggedItem.style.background,
            opacity: draggedItem.style.opacity
        };
    
        Object.assign(draggedItem.style, {
            position: 'fixed',
            zIndex: '1000',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            transition: 'none',
            background: computedStyle.background,
            opacity: '0.9',
            width: `${originalRect.width}px`,
            height: `${originalRect.height}px`,
            left: `${originalRect.left}px`,
            top: `${originalRect.top}px`,
            padding: computedStyle.padding,
            boxSizing: 'border-box'
        });
    
        todoItem.parentNode.insertBefore(placeholder, todoItem.nextSibling);
        document.body.appendChild(draggedItem);
        draggedItem.originalStyles = originalStyles;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
    
        const scrollDiff = window.scrollY - startScrollY;
        const draggedTop = e.clientY - dragOffsetY + scrollDiff;
        draggedItem.style.top = `${draggedTop}px`;
    
        const currentPosition = getPlaceholderPosition(contents, e.clientY);
        if (currentPosition.element && currentPosition.element !== placeholder) {
            if (currentPosition.beforeElement) {
                contents.insertBefore(placeholder, currentPosition.element);
            } else {
                contents.insertBefore(placeholder, currentPosition.element.nextElementSibling);
            }
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
    
        placeholder.parentNode.insertBefore(draggedItem, placeholder);
        placeholder.parentNode.removeChild(placeholder);
    
        Object.assign(draggedItem.style, draggedItem.originalStyles);
        draggedItem.style.position = '';
        draggedItem.style.top = '';
        draggedItem.style.left = '';
        draggedItem.style.width = '';
        draggedItem.style.height = '';
    
        delete draggedItem.originalStyles;
        updateTodoOrder();
        draggedItem = null;
        placeholder = null;
    });

    document.querySelector('.other_categories').addEventListener('mousedown', function(e) {
        const editDeleteBtn = e.target.closest('#edit-delete');
        if (!editDeleteBtn) return;
        if (e.button !== 0) return;
    
        const categoryItem = editDeleteBtn.closest('.category-container');
        if (!categoryItem) return;
    
        e.preventDefault();
        dragStartTime = Date.now();
        moveDistance = 0;
        isDraggingCategory = true;
        draggedCategory = categoryItem;
        draggedCategory.classList.add('dragging');
        const rect = categoryItem.getBoundingClientRect();
        categoryDragOffsetY = e.clientY - rect.top;
        categoryStartY = e.clientY;
        startScrollY = window.scrollY;
    
        categoryPlaceholder = document.createElement('div');
        categoryPlaceholder.className = 'category-container-placeholder';
        categoryPlaceholder.style.height = `${rect.height}px`;
        categoryPlaceholder.style.marginBottom = window.getComputedStyle(categoryItem).marginBottom;
        categoryPlaceholder.style.border = '2px dashed #ccc';
        categoryPlaceholder.style.backgroundColor = 'rgba(102, 102, 102, 0.3)';
        categoryPlaceholder.style.borderRadius = '5px';
        const sharedStyles = {
            height: `${rect.height}px`,
            borderRadius: '8px',
            backgroundColor: 'rgba(102, 102, 102, 0.3)',
            marginRight: '12px',
            marginLeft: '6px'
        };
        
        const computedStyle = window.getComputedStyle(categoryItem);
        Object.assign(categoryPlaceholder.style, {
            ...sharedStyles,
            border: '2px dashed #ccc'
        });

        if (categoryItem.classList.contains('selected')) {
            wasSelected = true;
            categoryItem.classList.remove('selected');
        }
        
        Object.assign(categoryItem.style, {
            ...sharedStyles,
            position: 'fixed',
            zIndex: '1000',
            width: `${rect.width - 16}px`,
            left: `${rect.left - 8}px`,
            top: `${rect.top}px`,
            padding: computedStyle.padding,
            boxSizing: 'border-box',
            transition: 'none',
        });
    
        categoryItem.parentNode.insertBefore(categoryPlaceholder, categoryItem);
        document.body.appendChild(categoryItem);
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDraggingCategory || !draggedCategory) return;
        
        moveDistance += Math.abs(e.movementY);
        e.preventDefault();
    
        const scrollDiff = window.scrollY - startScrollY;
        const draggedTop = e.clientY - categoryDragOffsetY + scrollDiff;
        draggedCategory.style.top = `${draggedTop}px`;
    
        const categories = [...categoryContainer.querySelectorAll('.category-container:not([style*="position: fixed"])')];
        let newPosition = null;
    
        for (const category of categories) {
            const rect = category.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
    
            if (e.clientY < centerY) {
                newPosition = category;
                break;
            }
        }
    
        if (newPosition) {
            if (categoryPlaceholder.nextSibling !== newPosition) {
                categoryContainer.insertBefore(categoryPlaceholder, newPosition);
            }
        } else if (categories.length > 0) {
            const lastCategory = categories[categories.length - 1];
            if (categoryPlaceholder.previousSibling !== lastCategory) {
                categoryContainer.insertBefore(categoryPlaceholder, lastCategory.nextSibling);
            }
        }
    });

    document.addEventListener('mouseup', function() {
        if (!isDraggingCategory) return;
        if (draggedCategory && wasSelected) {
            draggedCategory.classList.add('selected');
        }
        wasSelected = false;
        
        const wasDragged = moveDistance > 5;

        if (!wasDragged) {
            if (draggedCategory) {
                const categoryId = draggedCategory.getAttribute('data-category-id');
                const categoryName = draggedCategory.querySelector('#category_btn').textContent.trim();
                const editCategoryInput = document.getElementById('edit-category-input');

                editCategoryInput.value = categoryName;
                editCategoryInput.setAttribute('data-category-id', categoryId);
                document.querySelector('.edit-delete-modal-background').style.display = 'flex';
                editCategoryInput.focus();
                editCategoryInput.setSelectionRange(categoryName.length, categoryName.length);
            }
        }

        isDraggingCategory = false;
        document.body.classList.remove('dragging');
        
        if (draggedCategory && categoryPlaceholder) {
            draggedCategory.classList.remove('dragging');
            draggedCategory.removeAttribute('style');
            categoryPlaceholder.parentNode.insertBefore(draggedCategory, categoryPlaceholder);
            categoryPlaceholder.remove();
            if (wasDragged) {
                updateCategoryOrder();
            }
        }

        draggedCategory = null;
        categoryPlaceholder = null;
        moveDistance = 0;
    });

    if (settingBtn) {
        settingBtn.addEventListener('click', function() {
            settingModalBackground.style.display = 'flex';
        });
    }
    
    document.querySelector('#delete-category').addEventListener('click', function() {
        const editCategoryInput = document.getElementById('edit-category-input');
        const categoryId = editCategoryInput.getAttribute('data-category-id');
        const categoryContainer = document.querySelector(`.category-container[data-category-id="${categoryId}"]`);
        const categoryName = categoryContainer.querySelector('#category_btn').textContent.trim();
        
        document.querySelector('.edit-delete-modal-background').style.display = 'none';
        document.querySelector('.confirm-modal-background').style.display = 'flex';
        document.querySelector('.confirm-modal h3').textContent = `정말 "${categoryName}" 카테고리를\n삭제하시겠습니까?`;
    
        document.getElementById('yes').onclick = function() {
            fetch('/delete_category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: parseInt(categoryId) })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                }
            });
        };
    
        document.getElementById('no').onclick = function() {
            document.querySelector('.confirm-modal-background').style.display = 'none';
        };
    });

    editDeleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isDraggingCategory) return;
            
            const categoryContainer = this.closest('.category-container');
            const categoryId = categoryContainer.getAttribute('data-category-id');
            console.log("설정된 카테고리 ID:", categoryId);
            
            const editCategoryInput = document.getElementById('edit-category-input');
            editCategoryInput.value = categoryContainer.textContent.trim();
            editCategoryInput.setAttribute('data-category-id', categoryId);
            
            editDeleteBackground.style.display = 'flex';
            editCategoryInput.focus();
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            fetch('/check_login')
                .then(response => response.json())
                .then(data => {
                    if (data.logged_in) {
                        if (searchModalBackground) {
                            searchModalBackground.style.display = 'flex';
                            if (searchInput) {
                                searchInput.value = '';
                                searchInput.focus();
                            }
                            if (searchResults) {
                                searchResults.innerHTML = '';
                            }
                            if (searchLabel) {
                                searchLabel.innerHTML = '힌트를 주시면 제가 찾아볼게요';
                                searchLabel.classList.remove('no-results', 'has-results');
                            }
                        }
                    } else {
                        if (searchModalBackground) searchModalBackground.style.display = 'none';
                        loginRequiredModal.style.display = 'flex';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length > 0) {
            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({search_term: searchTerm})
            })
            .then(response => response.json())
            .then(data => {
                searchResults.innerHTML = '';
                if (data.categories.length === 0 && data.todos.length === 0) {
                    searchLabel.innerHTML = '단서가 부족한 거 같아요. 다른 힌트는 없나요?';
                    searchLabel.classList.add('no-results');
                    searchLabel.classList.remove('has-results');
                } else {
                    searchLabel.innerHTML = '이거 같은데요?!';
                    searchLabel.classList.add('has-results');
                    searchLabel.classList.remove('no-results');
                    
                    data.categories.forEach(category => {
                        const categoryElement = document.createElement('div');
                        categoryElement.className = 'search-result-item';
                        categoryElement.innerHTML = `
                            <span class="result-type category">카테고리</span>
                            ${category.name}
                        `;
                        categoryElement.addEventListener('click', function() {
                            window.location.href = `/category/${category.id}`;
                        });
                        searchResults.appendChild(categoryElement);
                    });
                    data.todos.forEach(todo => {
                        const todoElement = document.createElement('div');
                        todoElement.className = 'search-result-item';
                        todoElement.innerHTML = `
                            <span class="result-type todo">할 일</span>
                            ${todo.title}
                        `;
                        todoElement.addEventListener('click', function() {
                            if (todo.category_id) {
                                window.location.href = `/category/${todo.category_id}?highlight=${todo.id}`;
                            } else {
                                window.location.href = `/?highlight=${todo.id}`;
                            }
                        });
                        searchResults.appendChild(todoElement);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            searchResults.innerHTML = '';
            searchLabel.innerHTML = '힌트를 주시면 제가 찾아볼게요';
            searchLabel.classList.remove('no-results', 'has-results');
        }
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.length === 0) {
            searchLabel.classList.add('focus');
        }
    });
    
    searchInput.addEventListener('blur', function() {
        searchLabel.classList.remove('focus');
    });

    const todoContainer = document.querySelector('.contents');
    let isCurrentlyEmpty = todoContainer.querySelector('.todo-item') === null;

    function checkEmptyMain() {
        const todoContainer = document.querySelector('.contents');
        const mainItems = todoContainer.querySelectorAll('.todo-item');
        const existingMessage = todoContainer.querySelector('.no-main-message');
        
        if (mainItems.length === 0) {
            if (!existingMessage) {
                const noMainMessage = document.createElement('div');
                noMainMessage.className = 'no-main-message';
                noMainMessage.innerHTML = `
                    <p>할 일 목록이 비어있습니다</p>
                    <p>새로운 할 일을 추가해보세요!</p>
                `;
                todoContainer.appendChild(noMainMessage);
            }
        } else {
            if (existingMessage) {
                existingMessage.remove();
            }
        }
    }
    checkEmptyMain();
    setTimeout(checkEmptyMain, 100);

    if (addContentBtn) {
        addContentBtn.addEventListener('click', function() {
            fetch('/check_login')
                .then(response => response.json())
                .then(data => {
                    if (data.logged_in) {
                        if (addmodalBackground) {
                            addmodalBackground.style.display = 'flex';
                            if (titleInput) titleInput.value = '';
                            if (detailInput) detailInput.value = '';
                        }
                    } else {
                        if (addmodalBackground) addmodalBackground.style.display = 'none';
                        loginRequiredModal.style.display = 'flex';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            fetch('/check_login')
                .then(response => response.json())
                .then(data => {
                    if(data.logged_in) {
                        addCategoryBackground.style.display = 'flex';
                        if (addCategoryInput) addCategoryInput.value = '';
                        addCategoryInput.focus();
                    } else {
                        if(addCategoryBackground) addCategoryBackground.style.display = 'none';
                        loginRequiredModal.style.display = 'flex';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    if (confirmEditCategoryBtn) {
        confirmEditCategoryBtn.addEventListener('click', function() {
            const editCategoryInput = document.getElementById('edit-category-input');
            const categoryName = editCategoryInput.value.trim();
            const categoryId = editCategoryInput.getAttribute('data-category-id');
    
            if (!categoryName) {
                setupErrorMessage(editCategoryInput, '카테고리 이름을 입력해주세요');
                return;
            }
    
            fetch('/update_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_name: categoryName,
                    category_id: parseInt(categoryId)
                })
            })
            .then(response => {
                if (!response.ok) throw new Error('서버 응답 오류');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const categoryContainer = document.querySelector(`.category-container[data-category-id="${categoryId}"]`);
                    if (categoryContainer) {
                        const categoryBtn = categoryContainer.querySelector('#category_btn');
                        if (categoryBtn) {
                            categoryBtn.textContent = categoryName;
                        }
                    }
                    document.querySelector('.edit-delete-modal-background').style.display = 'none';
                } else {
                    throw new Error(data.message || '카테고리 수정에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setupErrorMessage(editCategoryInput, error.message || '오류가 발생했습니다.');
            });
        });
    }

    if (editCategoryInput) {
        editCategoryInput.addEventListener('input', function() {
            const originalName = editCategoryInput.getAttribute('original-value') || editCategoryInput.value;
            const hint = this.closest('.edit-category-modal').querySelector('p');
            
            if (this.value !== originalName && this.value.trim() !== '') {
                hint.textContent = '멋진 이름인데요?';
                hint.style.color = '#73d373';
            } else {
                hint.textContent = '더 멋진 이름이 생각났나요?';
                hint.style.color = '';
            }
        });
    
        editCategoryInput.addEventListener('focus', function() {
            editCategoryInput.setAttribute('original-value', editCategoryInput.value);
            clearErrorMessage(this);
        });
    }

    if (confirmCategoryBtn) {
        confirmCategoryBtn.addEventListener('click', function() {
            const categoryName = addCategoryInput ? addCategoryInput.value : '';
            
            if (!categoryName.trim()) {
                setupErrorMessage(addCategoryInput, '카테고리 이름을 입력해주세요');
                return;
            }
    
            fetch('/add_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({category_name: categoryName})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addCategoryBackground.style.display = 'none';
                    addCategoryInput.value = '';
                    clearErrorMessage(addCategoryInput);
                    window.location.reload();
                } else {
                    setupErrorMessage(addCategoryInput, data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setupErrorMessage(addCategoryInput, '카테고리 추가 중 오류가 발생했습니다.');
            });
        });
    }

    if (addCategoryInput) {
        addCategoryInput.addEventListener('focus', function() {
            clearErrorMessage(this);
        });
    }

    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }

    loginRequiredModal.addEventListener('click', function(event) {
        if (event.target === this) {
            this.style.display = 'none';
        }
    });

    modalBackgrounds.forEach(background => {
        background.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
                if (addCategoryInput) addCategoryInput.value = '';

                if (searchInput) searchInput.value = '';
                if (searchResults) searchResults.innerHTML = '';
                if (searchLabel) {
                    searchLabel.innerHTML = '힌트를 주시면 제가 찾아볼게요';
                    searchLabel.classList.remove('no-results', 'has-results');
                }
            }
        });
    });

    const modals = document.querySelectorAll('.add-modal, .edit-modal, .confirm-modal, .donate-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    donateOptions.forEach(option => {
        option.addEventListener('click', function() {
          const qrSrc = this.classList.contains('netflix') ? 'netflix-QR.jpg' : 'cycle-QR.jpg';
          qrImage.src = `/static/img/${qrSrc}`;
          qrOverlay.style.display = 'flex';
        });
    });
    backButton.addEventListener('click', function() { qrOverlay.style.display = 'none'; });

    document.querySelectorAll('.todo-item').forEach(item => {
        const isFixed = item.getAttribute('fixed') === 'true';
        updateFixItemUI(item, isFixed);
    });

    detailButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const todoItem = this.closest('.todo-item');
            const infoContainer = todoItem.querySelector('.info-container');
            
            document.querySelectorAll('.other-container, .info-container').forEach(container => {
                container.style.display = 'none';
            });
            if (infoContainer.style.display === 'none' || infoContainer.style.display === '') {
                infoContainer.style.display = 'block';
            } else {
                infoContainer.style.display = 'none';
            }
            todoItem.querySelector('.other-container').style.display = 'none';
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.other-container, .info-container').forEach(container => {
            container.style.display = 'none';
        });
    });

    fixButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const todoItem = this.closest('.todo-item');
            const todoId = todoItem.getAttribute('todo-id');
            const img = this.querySelector('img');
            const isFixed = todoItem.classList.contains('fixed');
    
            fetch('/update_fix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_fixed: !isFixed
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newIsFixed = !isFixed;
                    updateFixButtonUI(img, newIsFixed);
                    todoItem.setAttribute('data-fixed', newIsFixed);
                    todoItem.classList.toggle('fixed', newIsFixed);
    
                    if (newIsFixed) {
                        todoItem.setAttribute('data-original-order', todoItem.style.order || '');
                        todoItem.style.order = '-1';
                    } else {
                        const originalOrder = todoItem.getAttribute('data-original-order');
                        todoItem.style.order = originalOrder;
                    }
                    updateTodoOrder();
                } else {
                    console.error('고정 상태 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    favoriteBtns.forEach(btn => {
        const starIcon = btn.querySelector('i');
        const todoDiv = btn.closest('.todo-item');
        updateFavoriteUI(starIcon, todoDiv);
    
        btn.addEventListener('click', function() {
            const todoId = this.getAttribute('data-id');
            const isFavorite = starIcon.classList.contains('fa-solid');
            
            fetch('/update_favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_favorite: !isFavorite
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateFavoriteUI(starIcon, todoDiv, !isFavorite);
                } else {
                    console.error('즐겨찾기 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    otherBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const todoItem = this.closest('.todo-item');
            const otherContainer = todoItem.querySelector('.other-container');
            
            document.querySelectorAll('.other-container').forEach(container => {
                if (container !== otherContainer) {
                    container.style.display = 'none';
                }
            });
            otherContainer.style.display = otherContainer.style.display === 'none' || otherContainer.style.display === '' ? 'block' : 'none';
            todoItem.querySelector('.info-container').style.display = 'none';
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.other-container').forEach(container => {
            container.style.display = 'none';
        });
    });

    document.querySelectorAll('.edit-group').forEach(btn => {
        btn.addEventListener('click', function() {
            const todoItem = this.closest('.todo-item');
            const todoId = todoItem.getAttribute('todo-id');
            const title = todoItem.querySelector('.title').textContent;
            const detail = todoItem.querySelector('.detail').textContent;
    
            document.getElementById('edit-title').value = title;
            document.getElementById('edit-detail').value = detail;
            document.getElementById('edit-todo-id').value = todoId;
    
            editmodalBackground.style.display = 'flex';
        });
    });

    if (donateBtn && donateModalBackground) {
        donateBtn.addEventListener('click', function() {
            donateModalBackground.style.display = 'flex';
        });
    }

    const editBtn = document.getElementById('edit');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const todoId = document.getElementById('edit-todo-id').value;
            const title = document.getElementById('edit-title').value;
            const detail = document.getElementById('edit-detail').value;

            fetch('/update_todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    title: title,
                    detail: detail
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server responded with status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data);
                if (data.success) {
                    editmodalBackground.style.display = 'none';
                    const todoItem = document.querySelector(`.todo-item[todo-id="${todoId}"]`);
                    if (todoItem) {
                        todoItem.querySelector('.title').textContent = data.title;
                        todoItem.querySelector('.detail').textContent = data.detail;
                        const infoContainer = todoItem.querySelector('.info-container');
                        if (infoContainer) {
                            infoContainer.innerHTML = `
                                <p><span><i class="fa-regular fa-calendar-plus"></i> 생성일</span><span> ${data.created_at}</span></p>
                                <p><span><i class="fa-solid fa-pen"></i> 수정일</span><span> ${data.updated_at}</span></p>
                            `;
                            console.log('Updated info container:', infoContainer.innerHTML);
                        } else {
                            console.log('Info container not found');
                        }
                    } else {
                        console.log('Todo item not found');
                    }
                } else {
                    console.error('할 일 수정 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('할 일 수정 중 오류가 발생했습니다: ' + error.message);
            });
        });
    }

    actionBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        
        if (btn.id === 'delete') {
            icon.className = 'fa-regular fa-circle-xmark';
            btn.style.color = '#ff4d4d';
        } else {
            icon.className = 'fa-regular fa-circle-check';
        }
        
        btn.addEventListener('mouseenter', function() {
            if (this.id === 'delete') {
                icon.className = 'fa-solid fa-circle-xmark';
                this.style.color = '#ff0000';
            } else {
                icon.className = 'fa-solid fa-circle-check';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (this.id === 'delete') {
                icon.className = 'fa-regular fa-circle-xmark';
                this.style.color = '#ff4d4d';
            } else {
                icon.className = 'fa-regular fa-circle-check';
            }
        });
        
        btn.addEventListener('click', function() {
            const todoId = this.getAttribute('data-id');
            const todoItem = this.closest('.todo-item');
            const isDelete = this.id === 'delete';
            
            fetch('/update_success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_success: !isDelete
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    todoItem.remove();
                    checkEmptyMain();
                } else {
                    console.error('완료 상태 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    if (addContentBtn) {
        addContentBtn.addEventListener('click', function() {
            if (addmodalBackground) addmodalBackground.style.display = 'flex';
            if (titleInput) titleInput.value = '';
            if (detailInput) detailInput.value = '';
        });
    }

    if (editContentBtn) {
        editContentBtn.addEventListener('click', function() {
            if (editmodalBackground) editmodalBackground.style.display = 'flex';
        });
    }

    
    function addTodoToDOM(todo) {
        const todoContainer = document.querySelector('.contents');
        const todoDiv = document.createElement('div');
        todoDiv.id = 'todo';
        todoDiv.className = `todo-item${todo.favorite ? ' active' : ''}${todo.is_fixed ? ' fixed' : ''}`;
        todoDiv.setAttribute('todo-id', todo.id);
        todoDiv.setAttribute('fixed', todo.is_fixed ? 'true' : 'false');
        todoDiv.setAttribute('order', todo.order);
        todoDiv.setAttribute('category-id', todo.category_id);
    
        const createdDate = todo.day ? new Date(todo.day) : new Date();
        const editedDate = todo.edit_day ? new Date(todo.edit_day) : null;
    
        todoDiv.innerHTML = `
            <button id="grip"><i class="fa-solid fa-grip-vertical"></i></button>
            <h3 id="todo2" class="title">${todo.title}</h3>
            <p class="detail">${todo.detail}</p>
            <button id="fix"><img src="/static/img/pin-${todo.is_fixed ? 'on' : 'off'}.png" alt="고정 아이콘"></button>
            <button id="favorite" class="favorite-btn" data-id="${todo.id}">
                <i class="fa-${todo.favorite ? 'solid' : 'regular'} fa-star"></i>
            </button>
            <button id="other"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            <button id="success" data-id="${todo.id}"><i class="fa-regular fa-circle-check"></i></button>
            <div class="other-container" style="display: none;">
                <div class="edit-group" id="other-group">
                    <i class="fa-solid fa-pen"></i>수정
                </div>
                <div class="remove-group" id="other-group">
                    <i class="fa-regular fa-trash-can"></i>삭제
                </div>
                <div class="detail-group" id="other-group">
                    <i class="fa-solid fa-circle-info"></i>상세 정보
                </div>
            </div>
            <div class="info-container" style="display: none;">
                <p>생성일: ${createdDate.toLocaleString()}</p>
                <p>수정일: ${editedDate ? editedDate.toLocaleString() : '수정되지 않음'}</p>
            </div>
        `;
    
        const existingTodos = Array.from(todoContainer.querySelectorAll('.todo-item'));
        let inserted = false;
    
        if (todo.is_fixed) {
            const fixedTodos = existingTodos.filter(item => item.getAttribute('fixed') === 'true');
            for (let i = 0; i < fixedTodos.length; i++) {
                if (i === fixedTodos.length - 1) {
                    fixedTodos[i].after(todoDiv);
                    inserted = true;
                    break;
                }
            }
            if (!inserted && fixedTodos.length > 0) {
                fixedTodos[fixedTodos.length - 1].after(todoDiv);
                inserted = true;
            }
        } else {
            const unfixedTodos = existingTodos.filter(item => item.getAttribute('fixed') !== 'true');
            for (let item of unfixedTodos) {
                const itemOrder = parseInt(item.getAttribute('order'));
                if (!isNaN(itemOrder) && todo.order < itemOrder) {
                    item.before(todoDiv);
                    inserted = true;
                    break;
                }
            }
        }
        if (!inserted) {
            todoContainer.appendChild(todoDiv);
        }
    
        if (isCurrentlyEmpty) {
            const noMainMessage = todoContainer.querySelector('.no-main-message');
            if (noMainMessage) {
                noMainMessage.remove();
            }
        }
    
        setupNewTodoEventListeners(todoDiv);
        isCurrentlyEmpty = false;
    }

    function setupNewTodoEventListeners(todoDiv) {
        const favoriteBtn = todoDiv.querySelector('.favorite-btn');
        const starIcon = favoriteBtn.querySelector('i');
        updateFavoriteUI(starIcon, todoDiv);

        favoriteBtn.addEventListener('click', function() {
            const todoId = this.getAttribute('data-id');
            const isFavorite = starIcon.classList.contains('fa-solid');
            
            fetch('/update_favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_favorite: !isFavorite
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateFavoriteUI(starIcon, todoDiv, !isFavorite);
                } else {
                    console.error('즐겨찾기 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });

        const otherBtn = todoDiv.querySelector('#other');
        const otherContainer = todoDiv.querySelector('.other-container');
        const infoContainer = todoDiv.querySelector('.info-container');

        otherBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.other-container').forEach(container => {
                if (container !== otherContainer) {
                    container.style.display = 'none';
                }
            });
            otherContainer.style.display = otherContainer.style.display === 'none' || otherContainer.style.display === '' ? 'block' : 'none';
            infoContainer.style.display = 'none';
        });

        const editGroup = todoDiv.querySelector('.edit-group');
        editGroup.addEventListener('click', function() {
            const todoId = todoDiv.getAttribute('todo-id');
            const title = todoDiv.querySelector('.title').textContent;
            const detail = todoDiv.querySelector('.detail').textContent;
    
            document.getElementById('edit-title').value = title;
            document.getElementById('edit-detail').value = detail;
            document.getElementById('edit-todo-id').value = todoId;
    
            editmodalBackground.style.display = 'flex';
        });

        const removeGroup = todoDiv.querySelector('.remove-group');
        removeGroup.addEventListener('click', function(e) {
            e.stopPropagation();
            todoToRemove = todoDiv;
            confirmModalBackground.style.display = 'flex';
        });

        const detailGroup = todoDiv.querySelector('.detail-group');
        detailGroup.addEventListener('click', function(e) {
            e.stopPropagation();
            const infoContainer = todoDiv.querySelector('.info-container');
            const otherContainer = todoDiv.querySelector('.other-container');
            
            document.querySelectorAll('.other-container, .info-container').forEach(container => {
                container.style.display = 'none';
            });
            if (infoContainer.style.display === 'none' || infoContainer.style.display === '') {
                infoContainer.style.display = 'block';
            } else {
                infoContainer.style.display = 'none';
            }
            otherContainer.style.display = 'none';
        });

        const fixButton = todoDiv.querySelector('#fix');
        fixButton.addEventListener('click', function() {
            const todoId = todoDiv.getAttribute('todo-id');
            const isFixed = !todoDiv.classList.contains('fixed');
            updateFixStatus(todoId, isFixed);
        });

        const successButton = todoDiv.querySelector('#success');
        successButton.addEventListener('click', function() {
            const todoId = this.getAttribute('data-id');
            
            fetch('/update_success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_success: true
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    todoDiv.remove();
                    checkEmptyMain();
                } else {
                    console.error('완료 상태 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    if (dateSelectToggle) {
        dateSelectToggle.addEventListener('click', function() {
            if (dateSelectionPanel.style.display === 'none' || !dateSelectionPanel.style.display) {
                dateSelectionPanel.style.display = 'block';
            } else {
                dateSelectionPanel.style.display = 'none';
            }
        });
    }

    // 종일 체크박스 이벤트
    if (allDayCheckbox) {
        allDayCheckbox.addEventListener('change', function() {
            todoTime.style.display = this.checked ? 'none' : 'block';
        });
    }

    function initDateTimeFeatures() {
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        const startTimeBtn = document.getElementById('startTimeButton');
        const endTimeBtn = document.getElementById('endTimeButton');
        const allDayCheckbox = document.getElementById('allDayEvent');
        const fullDateModal = document.querySelector('.full-date-select-modal');
        const fullDateOverlay = document.querySelector('.full-date-select-overlay');
        const timeModal = document.querySelector('.time-select-modal');
        const timeOverlay = document.querySelector('.time-select-overlay');
        
        // 날짜 버튼 이벤트
        if (startDateBtn) {
            startDateBtn.addEventListener('click', () => showFullDateSelectModal('start'));
        }
        if (endDateBtn) {
            endDateBtn.addEventListener('click', () => showFullDateSelectModal('end'));
        }
    
        // 시간 버튼 이벤트
        if (startTimeBtn) {
            startTimeBtn.addEventListener('click', () => showTimeSelectModal('start'));
        }
        if (endTimeBtn) {
            endTimeBtn.addEventListener('click', () => showTimeSelectModal('end'));
        }
    
        // 종일 체크박스 이벤트
        if (allDayCheckbox) {
            allDayCheckbox.addEventListener('change', function() {
                const timeButtons = document.querySelectorAll('.time-select-button');
                timeButtons.forEach(btn => {
                    if (this.checked) {
                        btn.style.display = 'none';
                        startTimeBtn.textContent = '오전 12:00';
                        endTimeBtn.textContent = '오후 11:59';
                    } else {
                        btn.style.display = 'block';
                        startTimeBtn.textContent = '오전 10:00';
                        endTimeBtn.textContent = '오전 11:00';
                    }
                });
            });
        }
    
        // 초기 날짜/시간 설정
        initializeDateTime();
        setupFullDateSelect();
        setupTimeSelect();
    }

    function setupTimeSelect() {
        const periodSpinner = document.querySelector('.period-spinner');
        const hourSpinner = document.querySelector('.hour-spinner');
        const minuteSpinner = document.querySelector('.minute-spinner');
        const confirmBtn = document.querySelector('.time-select-confirm');
        const cancelBtn = document.querySelector('.time-select-cancel');
        const overlay = document.querySelector('.time-select-overlay');
    
        if (!periodSpinner || !hourSpinner || !minuteSpinner) return;
    
        periodSpinner.addEventListener('wheel', handleWheel);
        hourSpinner.addEventListener('wheel', handleWheel);
        minuteSpinner.addEventListener('wheel', handleWheel);
    
        confirmBtn.addEventListener('click', confirmTimeSelection);
        cancelBtn.addEventListener('click', hideTimeSelectModal);
        overlay.addEventListener('click', hideTimeSelectModal);
    }

    function setupFullDateSelect() {
        const prevMonthBtn = document.querySelector('.prev-month-btn');
        const nextMonthBtn = document.querySelector('.next-month-btn');
        const todayBtn = document.querySelector('.full-date-select-today');
        const confirmBtn = document.querySelector('.full-date-select-confirm');
        const overlay = document.querySelector('.full-date-select-overlay');
        
        if (!prevMonthBtn || !nextMonthBtn || !todayBtn || !confirmBtn) return;
    
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

    if (calendarLink) {
        calendarLink.addEventListener('click', function() {
            isCalendarLinked = true;
            this.style.display = 'none';
            datetimeGroup.style.display = 'flex';
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const title = document.getElementById('title').value;
            const detail = document.getElementById('detail').value;
            
            if (!title.trim()) {
                setupErrorMessage(document.getElementById('title'), '할 일을 입력해주세요');
                return;
            }

            const todoData = {
                title: title,
                detail: detail
            };

            if (isCalendarLinked) {
                const isAllDay = document.getElementById('allDayEvent').checked;
                const startDate = document.getElementById('startDateButton').textContent;
                const startTime = document.getElementById('startTimeButton').textContent;
                const endDate = document.getElementById('endDateButton').textContent;
                const endTime = document.getElementById('endTimeButton').textContent;

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

                Object.assign(todoData, {
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    isAllDay: isAllDay
                });
            }

            fetch('/add_todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todoData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addmodalBackground.style.display = 'none';
                    if (titleInput) titleInput.value = '';
                    if (detailInput) detailInput.value = '';
                    location.reload();
                } else {
                    setupErrorMessage(titleInput, data.message || '할 일 추가에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setupErrorMessage(titleInput, '오류가 발생했습니다.');
            });
        });
    }
    
    function showFullDateSelectModal(buttonId) {
        currentDateButton = document.getElementById(`${buttonId}DateButton`);
        const fullDateModal = document.querySelector('.full-date-select-modal');
        const fullDateOverlay = document.querySelector('.full-date-select-overlay');
        const dateText = currentDateButton.textContent;
        
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
        fullDateModal.style.display = 'block';
        fullDateOverlay.style.display = 'block';
    }

    function hideFullDateSelectModal() {
        const modal = document.querySelector('.full-date-select-modal');
        const overlay = document.querySelector('.full-date-select-overlay');
        modal.style.display = 'none';
        overlay.style.display = 'none';
        currentDateButton = null;
    }
    
    function showTimeSelectModal(buttonType) {
        const timeModal = document.querySelector('.time-select-modal');
        const timeOverlay = document.querySelector('.time-select-overlay');
        const currentButton = document.getElementById(`${buttonType}TimeButton`);
        const timeText = currentButton.textContent;
        
        parseCurrentTime(timeText);
        setupTimeSpinners();
        
        timeModal.style.display = 'block';
        timeOverlay.style.display = 'block';
        currentTimeButton = currentButton;
    }
    
    function hideTimeSelectModal() {
        const timeModal = document.querySelector('.time-select-modal');
        const timeOverlay = document.querySelector('.time-select-overlay');
        timeModal.style.display = 'none';
        timeOverlay.style.display = 'none';
        currentTimeButton = null;
    }
    
    function updateFullCalendar() {
        const currentMonthEl = document.querySelector('.current-month');
        const calendarDays = document.querySelector('.full-calendar-days');
        
        currentMonthEl.textContent = `${tempDisplayDate.getFullYear()}년 ${tempDisplayDate.getMonth() + 1}월`;
        
        const firstDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth(), 1);
        const lastDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(tempDisplayDate.getFullYear(), tempDisplayDate.getMonth(), 0);
        
        let startOffset = firstDay.getDay();
        calendarDays.innerHTML = '';
        
        // 이전 달의 날짜
        for (let i = startOffset - 1; i >= 0; i--) {
            const day = prevMonthLastDay.getDate() - i;
            createFullCalendarDay(day, true);
        }
        
        // 현재 달의 날짜
        for (let day = 1; day <= lastDay.getDate(); day++) {
            createFullCalendarDay(day, false);
        }
        
        // 다음 달의 날짜
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            createFullCalendarDay(day, true);
        }
    }

    function generateCalendarDays() {
        const days = [];
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        
        // 이전 달의 날짜 추가
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, -i);
            days.push({ date, isCurrentMonth: false });
        }
        
        // 현재 달의 날짜 추가
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(currentYear, currentMonth - 1, i);
            days.push({ date, isCurrentMonth: true });
        }
        
        // 다음 달의 날짜 추가
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(currentYear, currentMonth, i);
            days.push({ date, isCurrentMonth: false });
        }
        
        return days;
    }

    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function updateDateButtonText(button, date) {
        if (button) button.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    
    function initializeDateTime() {
        const now = new Date();
        const startDateBtn = document.getElementById('startDateButton');
        const endDateBtn = document.getElementById('endDateButton');
        
        updateDateButtonText(startDateBtn, now);
        updateDateButtonText(endDateBtn, now);
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

    function handleWheel(e) {
        e.preventDefault();
        const spinner = e.currentTarget;
        const itemHeight = 40;
        const direction = e.deltaY > 0 ? 1 : -1;
        const scrollAmount = direction * itemHeight;
        
        spinner.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
        });
    
        clearTimeout(spinner.scrollTimeout);
        spinner.scrollTimeout = setTimeout(() => {
            handleSpinnerScroll({ target: spinner });
        }, 150);
    }

    function setupTimeSpinners() {
        const periodSpinner = document.querySelector('.period-spinner');
        const hourSpinner = document.querySelector('.hour-spinner');
        const minuteSpinner = document.querySelector('.minute-spinner');
    
        // Period spinner setup
        periodSpinner.innerHTML = '';
        [['AM', '오전'], ['PM', '오후']].forEach(([value, text]) => {
            const item = document.createElement('div');
            item.className = 'spinner-item' + (value === selectedPeriod ? ' selected' : '');
            item.textContent = text;
            item.dataset.value = value;
            periodSpinner.appendChild(item);
        });
    
        // Hour spinner setup
        hourSpinner.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const item = document.createElement('div');
            item.className = 'spinner-item' + (i === selectedHour ? ' selected' : '');
            item.textContent = i;
            hourSpinner.appendChild(item);
        }
    
        // Minute spinner setup
        minuteSpinner.innerHTML = '';
        for (let i = 0; i < 60; i += 5) {
            const item = document.createElement('div');
            item.className = 'spinner-item' + (i === selectedMinute ? ' selected' : '');
            item.textContent = i.toString().padStart(2, '0');
            minuteSpinner.appendChild(item);
        }
    
        setTimeout(() => {
            scrollToSelected(periodSpinner, selectedPeriod, true);
            scrollToSelected(hourSpinner, selectedHour);
            scrollToSelected(minuteSpinner, selectedMinute);
        }, 0);
    }

    function scrollToSelected(spinner, value, isPeriod = false) {
        const items = spinner.querySelectorAll('.spinner-item');
        const selectedItem = Array.from(items).find(item => {
            if (isPeriod) {
                return item.dataset.value === value;
            }
            return parseInt(item.textContent) === value;
        });
    
        if (selectedItem) {
            const spinnerRect = spinner.getBoundingClientRect();
            const selectedRect = selectedItem.getBoundingClientRect();
            const offset = (spinnerRect.height - selectedRect.height) / 2;
            spinner.scrollTo({
                top: selectedItem.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    }
    
    function handleSpinnerScroll(event) {
        const spinner = event.target;
        const items = spinner.querySelectorAll('.spinner-item');
        const spinnerRect = spinner.getBoundingClientRect();
        const center = spinnerRect.top + spinnerRect.height / 2;
    
        let closestItem = null;
        let minDistance = Infinity;
    
        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const distance = Math.abs(itemRect.top + itemRect.height / 2 - center);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
    
        if (closestItem) {
            items.forEach(item => item.classList.remove('selected'));
            closestItem.classList.add('selected');
    
            if (spinner.classList.contains('period-spinner')) {
                selectedPeriod = closestItem.dataset.value;
            } else if (spinner.classList.contains('hour-spinner')) {
                selectedHour = parseInt(closestItem.textContent);
            } else if (spinner.classList.contains('minute-spinner')) {
                selectedMinute = parseInt(closestItem.textContent);
            }
        }
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
        const timeString = `${period} ${selectedHour}:${selectedMinute.toString().padStart(2, '0')}`;
        currentTimeButton.textContent = timeString;
    
        hideTimeSelectModal();
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
        }
    }
    
    function confirmDateSelection() {
        if (currentDateButton && selectedYear && selectedMonth && selectedDay) {
            const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
            updateDateButtonText(currentDateButton, selectedDate);
        }
        hideFullDateSelectModal();
    }

    document.querySelectorAll('.remove-group').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            todoToRemove = this.closest('.todo-item');
            confirmModalBackground.style.display = 'flex';
        });
    });

    document.querySelectorAll('#success').forEach(btn => {
        btn.addEventListener('click', function() {
            const todoId = this.getAttribute('data-id');
            const todoItem = this.closest('.todo-item');
            
            fetch('/update_success', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: todoId,
                    is_success: true
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    todoItem.remove();
                    isCurrentlyEmpty = todoContainer.querySelectorAll('.todo-item').length === 0;
                    checkEmptyMain();
                } else {
                    console.error('완료 상태 업데이트 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    noBtn.addEventListener('click', function() {
        confirmModalBackground.style.display = 'none';
        todoToRemove = null;
    });

    yesBtn.addEventListener('click', function() {
        if (todoToRemove) {
            const todoId = todoToRemove.getAttribute('todo-id');
            deleteTodo(todoId, todoToRemove);
            confirmModalBackground.style.display = 'none';
            todoToRemove = null;
        }
    });

    checkEmptyMain();

    document.querySelectorAll('#fix').forEach(btn => {
        btn.addEventListener('click', function() {
            const todoItem = this.closest('.todo-item');
            const todoId = todoItem.getAttribute('todo-id');
            const isFixed = todoItem.classList.contains('fixed');
            
            fetch('/update_fix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todo_id: parseInt(todoId),
                    is_fixed: !isFixed
                })
            })
            .then(data => {
                if (data.success) {
                    const newIsFixed = !isFixed;
                    todoItem.classList.toggle('fixed', newIsFixed);
                    todoItem.setAttribute('fixed', newIsFixed ? 'true' : 'false');
                    
                    const fixButton = todoItem.querySelector('#fix img');
                    if (fixButton) {
                        fixButton.src = `/static/img/pin-${newIsFixed ? 'on' : 'off'}.png`;
                    }
                    
                    const container = todoItem.parentNode;
                    if (newIsFixed) {
                        container.insertBefore(todoItem, container.firstChild);
                    } else {
                        const firstUnfixed = Array.from(container.children)
                            .find(item => !item.classList.contains('fixed'));
                        if (firstUnfixed) {
                            container.insertBefore(todoItem, firstUnfixed);
                        } else {
                            container.appendChild(todoItem);
                        }
                    }
                    updateTodoOrder();
                } else {
                    console.error('고정 상태 업데이트 실패:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('할 일 고정 상태 업데이트 중 오류가 발생했습니다.');
            });
        });
    });
});

function updateCategoryOrder() {
    const categoryContainer = document.querySelector('.other_categories');
    const categories = Array.from(categoryContainer.querySelectorAll('.category-container'));
    
    const newOrder = categories.map((category, index) => ({
        id: category.getAttribute('data-category-id'),
        order: index
    }));

    fetch('/update_category_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            categories.forEach((category, index) => {
                category.setAttribute('data-order', index);
            });
        } else {
            console.error('Failed to update category order:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function checkForHighlight() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    
    if (highlightId) {
        const todoElement = document.querySelector(`.todo-item[todo-id="${highlightId}"]`);
        if (todoElement) {
            todoElement.classList.add('highlight-shake');
            todoElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            todoElement.addEventListener('animationend', function() {
                todoElement.classList.remove('highlight-shake');
                removeHighlightParam();
            }, { once: true });
        } else {
            removeHighlightParam();
        }
    }
}

function removeHighlightParam() {
    const url = new URL(window.location);
    url.searchParams.delete('highlight');
    window.history.replaceState({}, '', url);
}

function updateFixItemUI(item, isFixed) {
    item.classList.toggle('fixed', isFixed);
    item.setAttribute('fixed', isFixed);
    const fixButton = item.querySelector('#fix img');
    if (fixButton) {
        fixButton.src = `/static/img/pin-${isFixed ? 'on' : 'off'}.png`;
    }
}

function updateFixStatus(todoId, isFixed) {
    fetch('/update_fix', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            todo_id: todoId,
            is_fixed: isFixed
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const todoItem = document.querySelector(`.todo-item[todo-id="${todoId}"]`);
            if (todoItem) {
                todoItem.classList.toggle('fixed', isFixed);
                todoItem.setAttribute('fixed', isFixed ? 'true' : 'false');
                
                const fixButton = todoItem.querySelector('#fix img');
                if (fixButton) {
                    fixButton.src = `/static/img/pin-${isFixed ? 'on' : 'off'}.png`;
                }

                if (!isFixed) {
                    const unfixedItems = Array.from(todoItem.parentNode.querySelectorAll('.todo-item:not(.fixed)'));
                    const newOrder = unfixedItems.indexOf(todoItem);
                    todoItem.setAttribute('order', newOrder);
                }

                updateTodoOrder();

                const container = todoItem.parentNode;
                if (isFixed) {
                    const firstFixed = container.querySelector('.todo-item.fixed');
                    if (firstFixed && firstFixed !== todoItem) {
                        container.insertBefore(todoItem, firstFixed);
                    } else {
                        container.insertBefore(todoItem, container.firstChild);
                    }
                } else {
                    const unfixedItems = Array.from(container.querySelectorAll('.todo-item:not(.fixed)'));
                    const newOrder = parseInt(todoItem.getAttribute('order'));
                    const targetItem = unfixedItems.find(item => parseInt(item.getAttribute('order')) > newOrder);
                    if (targetItem) {
                        container.insertBefore(todoItem, targetItem);
                    } else {
                        container.appendChild(todoItem);
                    }
                }
            }
        } else {
            console.error('고정 상태 업데이트 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateFixButtonUI(img, isFixed) {
    img.src = '/static/img/pin-' + (isFixed ? 'on' : 'off') + '.png';
    const todoItem = img.closest('.todo-item');
    todoItem.classList.toggle('fixed', isFixed);
}

function repositionUnfixedItem(todoItem) {
    const parentContainer = todoItem.parentNode;
    const siblings = Array.from(parentContainer.children);
    const originalOrder = parseInt(todoItem.getAttribute('data-original-order')) || 0;
    
    const targetIndex = siblings.findIndex(sibling => {
        const siblingOrder = parseInt(sibling.style.order) || 0;
        const siblingIsFixed = sibling.getAttribute('data-fixed') === 'true';
        return !siblingIsFixed && siblingOrder > originalOrder;
    });

    if (targetIndex !== -1) {
        parentContainer.insertBefore(todoItem, siblings[targetIndex]);
    } else {
        parentContainer.appendChild(todoItem);
    }
}

function getPlaceholderPosition(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.fixed), .todo-item-placeholder')];
    
    for (let i = 0; i < draggableElements.length; i++) {
        const box = draggableElements[i].getBoundingClientRect();
        const boxCenter = box.top + box.height / 2;
        
        if (y < boxCenter) {
            return { element: draggableElements[i], beforeElement: true };
        }
    }
    
    if (draggableElements.length > 0) {
        return { element: draggableElements[draggableElements.length - 1], beforeElement: false };
    }
    
    return { element: null, beforeElement: false };
}

function updateTodoOrder() {
    const todoContainer = document.querySelector('.contents');
    const todoItems = Array.from(todoContainer.querySelectorAll('.todo-item'));
    const currentCategoryId = document.getElementById('category-id') ? 
                            document.getElementById('category-id').value : 
                            null;
    const fixedItems = todoItems.filter(item => item.classList.contains('fixed'));
    const unfixedItems = todoItems.filter(item => !item.classList.contains('fixed'));

    todoContainer.innerHTML = '';
    fixedItems.forEach(item => todoContainer.appendChild(item));
    unfixedItems.forEach(item => todoContainer.appendChild(item));

    const newOrder = unfixedItems.map((item, index) => ({
        id: item.getAttribute('todo-id'),
        order: index,
        category_id: currentCategoryId
    }));

    fixedItems.forEach(item => {
        newOrder.push({
            id: item.getAttribute('todo-id'),
            order: null,
            category_id: currentCategoryId
        });
    });

    fetch('/update_todo_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order: newOrder,
            category_id: currentCategoryId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            unfixedItems.forEach((item, index) => {
                item.setAttribute('order', index);
            });
        } else {
            console.error('Failed to update todo order:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteTodo(todoId, todoElement) {
    fetch('/delete_todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({todo_id: todoId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            todoElement.remove();
            window.location.reload();
        } else {
            console.error('할 일 삭제 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateFavoriteUI(starIcon, todoDiv, isFavorite = null) {
    if (isFavorite === null) {
        isFavorite = starIcon.classList.contains('fa-solid');
    }
    
    if (isFavorite) {
        starIcon.className = 'fa-solid fa-star';
        starIcon.style.color = '#FFD43B';
        todoDiv.classList.add('active');
        todoDiv.style.backgroundColor = '#fff9db';
    } else {
        starIcon.className = 'fa-regular fa-star';
        starIcon.style.color = '';
        todoDiv.classList.remove('active');
        todoDiv.style.backgroundColor = '';
    }
}

function setupErrorMessage(inputElement, messageText) {
    if (!inputElement) return;
    const inputGroup = inputElement.closest('.input-group');
    if (!inputGroup) return;
    let errorMessage = inputGroup.querySelector('.error-message');
    
    if (!errorMessage) {
        errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        inputGroup.appendChild(errorMessage);
    }
    
    errorMessage.textContent = messageText;
    errorMessage.style.display = 'block';
    inputElement.classList.add('error');
}

function clearErrorMessage(inputElement) {
    const inputGroup = inputElement.closest('.input-group');
    const errorMessage = inputGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    inputElement.classList.remove('error');
}

const titleInput = document.getElementById('title');
if (titleInput) {
    titleInput.addEventListener('focus', function() {
        this.classList.remove('error');
        const inputGroup = this.closest('.input-group');
        if (inputGroup) {
            const errorMessage = inputGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        }
    });
}