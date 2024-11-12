document.addEventListener('DOMContentLoaded', function() {
    const actionBtns = document.querySelectorAll('#success, #delete');
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const otherBtns = document.querySelectorAll('#other');
    const contents = document.querySelector('.contents');
    const confirmModalBackground = document.querySelector('.confirm-modal-background');
    const yesBtn = document.getElementById('yes');
    const noBtn = document.getElementById('no');
    const donateBtn = document.querySelector('.donate');
    const donateclose = document.getElementById('donate-close');
    const donateModalBackground = document.querySelector('.donate-modal-background');
    const detailButtons = document.querySelectorAll('.detail-group');
    const donateOptions = document.querySelectorAll('.chocolate, .pocari');
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
    const searchBtn = document.querySelector('.search');
    const searchModalBackground = document.querySelector('.search-modal-background');
    const searchInput = document.getElementById('category-search-input');
    const searchResults = document.getElementById('category-search-results');
    const searchLabel = document.getElementById('search-label');
    const addCategoryBtn = document.getElementById('add-category');
    const addCategoryBackground = document.querySelector('.add-category-modal-background');
    const addCategoryInput = document.getElementById('add-category-input');
    const editCategoryInput = document.getElementById('edit-category-input');
    const confirmCategoryBtn = document.getElementById('confirm-category');
    const confirmEditCategoryBtn = document.getElementById('confirm-edit-category');
    const editDeleteButtons = document.querySelectorAll('#edit-delete');
    const editDeleteBackground = document.querySelector('.edit-delete-modal-background');
    const categoryContainer = document.querySelector('.other_categories');
    const settingBtn = document.querySelector('.setting');
    const settingModalBackground = document.querySelector('.setting-modal-background');
    const themeBtn = document.querySelector('.theme-selector-btn');
    const themeDropdown = document.querySelector('.theme-dropdown');
    const themedropdownItems = document.querySelectorAll('.theme-dropdown-item');
    const container = document.querySelector('.container');
    const sizeBtn = document.querySelector('.size-selector-btn');
    const sizeDropdown = document.querySelector('.size-dropdown');
    const sizeDropdownItems = document.querySelectorAll('.size-dropdown-item');
    const positionBtn = document.querySelector('.position-selector-btn');
    const positionDropdown = document.querySelector('.position-dropdown');
    const positionDropdownItems = document.querySelectorAll('.position-dropdown-item');

    let draggedCategory = null;
    let categoryPlaceholder = null;
    let isDraggingCategory = false;
    let categoryDragOffsetY = 0;
    let dragStartTime = 0;
    let moveDistance = 0;
    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let originalRect;
    let dragOffsetY;

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
            settingModalBackground.style.display = 'flex';
            localStorage.removeItem('settingModalOpen');
        }
    }

    function handleAutoHideSuccess() {
        const todoContainer = document.querySelector('.contents');
        const isAutoHideEnabled = localStorage.getItem('autoHideCompleted') === 'true';
        const todos = todoContainer.querySelectorAll('.todo-item');
        const hasCompletedTodos = todos.length > 0;
        const existingMessage = todoContainer.querySelector('.no-success-message, .auto-hide-message');
    
        if (existingMessage) {
            existingMessage.remove();
        }
    
        if (isAutoHideEnabled) {
            // 자동 숨김이 켜져 있을 때는 항상 자동 숨김 메시지 표시
            const autoHideMessage = document.createElement('div');
            autoHideMessage.className = 'auto-hide-message';
            autoHideMessage.innerHTML = `
                <p>완료된 할 일 자동 숨김이 켜져 있습니다</p>
                <p>설정에서 자동 숨김을 끄면 완료된 할 일을 볼 수 있습니다</p>
            `;
            todoContainer.innerHTML = '';
            todoContainer.appendChild(autoHideMessage);
        } else if (!hasCompletedTodos) {
            // 자동 숨김이 꺼져 있고 할 일이 없을 때만 표시
            const noSuccessMessage = document.createElement('div');
            noSuccessMessage.className = 'no-success-message';
            noSuccessMessage.innerHTML = `
                <p>완료된 항목이 없습니다</p>
                <p>메인 페이지에서 체크 아이콘을 클릭하여 항목을 완료 처리할 수 있습니다</p>
            `;
            todoContainer.appendChild(noSuccessMessage);
        }
    }

    // checkEmptySuccess 함수 수정
    function checkEmptySuccess() {
        const todoContainer = document.querySelector('.contents');
        const isAutoHideEnabled = localStorage.getItem('autoHideCompleted') === 'true';
        
        // 자동 숨김이 켜져 있을 때만 handleAutoHideSuccess 실행
        if (isAutoHideEnabled) {
            handleAutoHideSuccess();
            return;
        }

        const successItems = todoContainer.querySelectorAll('.todo-item');
        const existingMessage = todoContainer.querySelector('.no-success-message');
        
        if (successItems.length === 0 && !existingMessage) {
            const noSuccessMessage = document.createElement('div');
            noSuccessMessage.className = 'no-success-message';
            noSuccessMessage.innerHTML = `
                <p>완료된 항목이 없습니다</p>
                <p>메인 페이지에서 체크 아이콘을 클릭하여 항목을 완료 처리할 수 있습니다</p>
            `;
            todoContainer.appendChild(noSuccessMessage);
        } else if (successItems.length > 0 && existingMessage) {
            existingMessage.remove();
        }
    }

    if (settingBtn) {
        settingBtn.addEventListener('click', function() {
            settingModalBackground.style.display = 'flex';
        });
    }
    
    // Modal background click events (includes setting modal)
    modalBackgrounds.forEach(background => {
        background.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
                // ... other modal cleanup code ...
            }
        });
    });
    
    // Size related functions
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
    
    // Size button event listeners
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
    
    // Position related functions
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
    
    // Position button event listeners
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
    
    // Theme related code
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
    
    // Theme button event listeners
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
    
    // Initialize functions
    initializeTextSize();
    initializeSidebarPosition();
    initializeTheme();

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
        
        Object.assign(categoryItem.style, {
            ...sharedStyles,
            position: 'fixed',
            zIndex: '1000',
            width: `${rect.width - 16}px`,
            left: `${rect.left - 8}px`,
            top: `${rect.top}px`,
            padding: computedStyle.padding,
            boxSizing: 'border-box',
            transition: 'none'
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

    if (addCategoryInput) {
        addCategoryInput.addEventListener('focus', function() {
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

    if (editCategoryInput) {
        editCategoryInput.addEventListener('focus', function() {
            clearErrorMessage(this);
        });
    }

    if (confirmEditCategoryBtn) {
        confirmEditCategoryBtn.addEventListener('click', function() {
            const categoryName = editCategoryInput ? editCategoryInput.value : '';
    
            if (!categoryName.trim()) {
                setupErrorMessage(editCategoryInput, '카테고리 이름을 입력해주세요');
                return;
            }
    
            fetch('/update_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_name: newName,
                    category_id: categoryId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    categoryContainer.querySelector('#category_btn').textContent = newName;
                    document.querySelector('.edit-delete-modal-background').style.display = 'none';
                } else {
                    const errorMessage = editModal.querySelector('.error-message');
                    errorMessage.textContent = data.message || '카테고리 수정에 실패했습니다.';
                    errorMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessage = editModal.querySelector('.error-message');
                errorMessage.textContent = '오류가 발생했습니다.';
                errorMessage.style.display = 'block';
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

    editDeleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const categoryContainer = this.closest('.category-container');
            const categoryId = categoryContainer.getAttribute('data-category-id');
            const categoryName = categoryContainer.querySelector('#category_btn').textContent.trim();
            const editCategoryInput = document.getElementById('edit-category-input');
            
            editCategoryInput.value = categoryName;
            editCategoryInput.setAttribute('data-category-id', categoryId);
            editDeleteBackground.style.display = 'flex';
            
            editCategoryInput.focus();
            editCategoryInput.setSelectionRange(categoryName.length, categoryName.length);
        });
    });

    document.getElementById('delete-category').addEventListener('click', function() {
        const editCategoryInput = document.getElementById('edit-category-input');
        const categoryId = editCategoryInput.getAttribute('data-category-id');
        const categoryContainer = document.querySelector(`.category-container[data-category-id="${categoryId}"]`);
        const categoryName = categoryContainer.querySelector('#category_btn').textContent.trim();
    
        const originalModalTitle = document.querySelector('.confirm-modal h3').textContent;
        document.querySelector('.confirm-modal h3').textContent = `정말 "${categoryName}" 카테고리를\n삭제하시겠습니까?`;
        document.querySelector('.edit-delete-modal-background').style.display = 'none';
        document.querySelector('.confirm-modal-background').style.display = 'flex';
    
        const yesBtn = document.getElementById('yes');
        const noBtn = document.getElementById('no');
        const oldYesClick = yesBtn.onclick;
        const oldNoClick = noBtn.onclick;
        
        yesBtn.onclick = function() {
            fetch('/delete_category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_id: categoryId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert(data.message || '카테고리 삭제에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('카테고리 삭제 중 오류가 발생했습니다.');
            })
            .finally(() => {
                document.querySelector('.confirm-modal-background').style.display = 'none';
                document.querySelector('.confirm-modal h3').textContent = originalModalTitle;
    
                yesBtn.onclick = oldYesClick;
                noBtn.onclick = oldNoClick;
            });
        };
    
        noBtn.onclick = function() {
            document.querySelector('.confirm-modal-background').style.display = 'none';
            document.querySelector('.confirm-modal h3').textContent = originalModalTitle;
    
            yesBtn.onclick = oldYesClick;
            noBtn.onclick = oldNoClick;
        };
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

    modalBackgrounds.forEach(background => {
        background.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
                if (searchInput) searchInput.value = '';
                if (searchResults) searchResults.innerHTML = '';
                if (searchLabel) {
                    searchLabel.innerHTML = '힌트를 주시면 제가 찾아볼게요';
                    searchLabel.classList.remove('no-results', 'has-results');
                }
            }
        });
    });

    const modals = document.querySelectorAll('.confirm-modal, .donate-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    donateOptions.forEach(option => {
        option.addEventListener('click', function() {
          const qrSrc = this.classList.contains('chocolate') ? 'chocolate-QR.jpg' : 'pocari-QR.jpg';
          qrImage.src = `/static/img/${qrSrc}`;
          qrOverlay.style.display = 'flex';
        });
    });
    backButton.addEventListener('click', function() { qrOverlay.style.display = 'none'; });

    if (donateBtn && donateModalBackground) {
        donateBtn.addEventListener('click', function() {
            donateModalBackground.style.display = 'flex';
        });
    }

    if (donateclose && donateModalBackground) {
        donateclose.addEventListener('click', function() {
            donateModalBackground.style.display = 'none';
        });
    }

    contents.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    setupActionButtons();
    setupFavoriteButtons();
    checkEmptySuccess();

    function handleMouseDown(e) {
        const gripElement = e.target.closest('#grip');
        if (!gripElement) return;

        const todoItem = gripElement.closest('.todo-item');
        if (!todoItem) return;

        e.preventDefault();
        draggedItem = todoItem;
        originalRect = todoItem.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(todoItem);
        dragOffsetY = e.clientY - originalRect.top;
        startScrollY = window.scrollY;
        isDragging = true;

        setupPlaceholder(todoItem, computedStyle);
        setupDraggedItemStyle(todoItem, computedStyle, originalRect);
    }

    function handleMouseMove(e) {
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
    }

    function handleMouseUp() {
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
    }

    function setupFavoriteButtons() {
        favoriteBtns.forEach(btn => {
            const starIcon = btn.querySelector('i');
            const todoDiv = btn.closest('.todo-item');
            updateFavoriteUI(starIcon, todoDiv);

            btn.addEventListener('click', handleFavoriteClick);
        });
    }

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

    document.querySelectorAll('.remove-group').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const todoItem = this.closest('.todo-item');
            todoToRemove = todoItem;
            confirmModalBackground.style.display = 'flex';
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
        }
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

    function handleFavoriteClick() {
        const todoId = this.getAttribute('data-id');
        const starIcon = this.querySelector('i');
        const todoDiv = this.closest('.todo-item');
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
    }

    function updateFavoriteUI(starIcon, todoDiv, isFavorite = null) {
        if (isFavorite === null) {
            isFavorite = starIcon.classList.contains('fa-solid');
        }
        
        if (isFavorite) {
            starIcon.classList.replace('fa-regular', 'fa-solid');
            starIcon.style.color = '#FFD43B';
            todoDiv.classList.add('active');
        } else {
            starIcon.classList.replace('fa-solid', 'fa-regular');
            starIcon.style.color = '';
            todoDiv.classList.remove('active');
        }
    }

    function setupActionButtons() {
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

            btn.addEventListener('click', handleActionButtonClick);
        });
    }

    function handleActionButtonClick() {
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
                checkEmptySuccess();
            } else {
                console.error('완료 상태 업데이트 실패');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

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
            checkEmptySuccess();
        } else {
            console.error('할 일 삭제 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function setupPlaceholder(todoItem, computedStyle) {
    placeholder = document.createElement('div');
    placeholder.className = 'todo-item-placeholder';
    placeholder.style.height = `${originalRect.height}px`;
    placeholder.style.marginBottom = computedStyle.marginBottom;
    placeholder.style.border = '2px dashed #ccc';
    placeholder.style.backgroundColor = '#f0f0f0';
    todoItem.parentNode.insertBefore(placeholder, todoItem.nextSibling);
}

function setupDraggedItemStyle(todoItem, computedStyle, originalRect) {
    const originalStyles = {
        position: todoItem.style.position,
        zIndex: todoItem.style.zIndex,
        boxShadow: todoItem.style.boxShadow,
        transition: todoItem.style.transition,
        background: todoItem.style.background,
        opacity: todoItem.style.opacity
    };

    Object.assign(todoItem.style, {
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
        paddingLeft: '50px',
        paddingTop: '15px'
    });

    document.body.appendChild(todoItem);
    todoItem.originalStyles = originalStyles;
}

function getPlaceholderPosition(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item, .todo-item-placeholder')];
    
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
    const todoItems = document.querySelectorAll('.todo-item');
    const newOrder = Array.from(todoItems)
        .map(item => item.getAttribute('todo-id'))
        .filter(id => id !== null && id !== "" && id !== undefined);

    if (newOrder.length === 0) {
        console.error("No valid todo IDs found");
        return;
    }

    fetch('/update_success_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({order: newOrder})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            console.error('Failed to update todo order:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}