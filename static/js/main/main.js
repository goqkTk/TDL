window.addEventListener('load', checkForHighlight);
document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const actionBtns = document.querySelectorAll('#success, #delete');
    const addBtn = document.getElementById('add');
    const detailInput = document.getElementById('detail');
    const addmodalBackground = document.querySelector('.add-modal-background');
    const editmodalBackground = document.querySelector('.edit-modal-background');
    const addContentBtn = document.getElementById('add-content');
    const editContentBtn = document.querySelector('.edit-group');
    const otherBtns = document.querySelectorAll('#other');
    const contents = document.querySelector('.contents');
    const confirmModalBackground = document.querySelector('.confirm-modal-background');
    const donateBtn = document.querySelector('.donate');
    const donateModalBackground = document.querySelector('.donate-modal-background');
    const yesBtn = document.getElementById('yes');
    const noBtn = document.getElementById('no');
    const fixButtons = document.querySelectorAll('#fix');
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

    let todoToRemove = null;

    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let dragOffsetY;

    let draggedCategory = null;
    let categoryPlaceholder = null;
    let isDraggingCategory = false;

    checkForHighlight();

    document.querySelector('.other_categories').addEventListener('mousedown', function(e) {
        const editDeleteBtn = e.target.closest('#edit-delete');
        if (!editDeleteBtn) return;
    
        const categoryItem = editDeleteBtn.closest('.category-container');
        if (!categoryItem) return;
    
        e.preventDefault();
        draggedCategory = categoryItem;
        const rect = categoryItem.getBoundingClientRect();
        categoryDragOffsetY = e.clientY - rect.top;
        categoryStartY = e.clientY;
        isDraggingCategory = true;
        document.body.classList.add('dragging');

        categoryPlaceholder = document.createElement('div');
        categoryPlaceholder.className = 'category-container-placeholder';
        categoryPlaceholder.style.height = `${rect.height}px`;
        categoryPlaceholder.style.marginBottom = window.getComputedStyle(categoryItem).marginBottom;
        categoryPlaceholder.style.border = '2px dashed #ccc';
        categoryPlaceholder.style.backgroundColor = '#666';
        categoryPlaceholder.style.borderRadius = '5px';
        categoryItem.parentNode.insertBefore(categoryPlaceholder, categoryItem.nextSibling);

        const computedStyle = window.getComputedStyle(categoryItem);
        Object.assign(categoryItem.style, {
            position: 'fixed',
            zIndex: '1000',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            backgroundColor: computedStyle.backgroundColor,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            transition: 'none',
            opacity: '0.9',
            padding: computedStyle.padding,
            boxSizing: 'border-box'
        });

        document.body.appendChild(categoryItem);
    });

    if (settingBtn) {
        settingBtn.addEventListener('click', function() {
            fetch('/check_login')
                .then(response => response.json())
                .then(data => {
                    if (data.logged_in) {
                        
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

    editDeleteButtons.forEach(button => {
        let isDragging = false;
        let startY;
        let draggedCategory = null;
        let categoryPlaceholder = null;
    
        button.addEventListener('mousedown', function(e) {
            startY = e.clientY;
            const categoryItem = this.closest('.category-container');
            if (!categoryItem) return;
    
            const handleMouseMove = (moveEvent) => {
                if (!isDragging && Math.abs(moveEvent.clientY - startY) > 5) {
                    isDragging = true;
                    e.preventDefault();
    
                    const rect = categoryItem.getBoundingClientRect();
    
                    const existingPlaceholder = document.querySelector('.category-container-placeholder');
                    if (existingPlaceholder) {
                        existingPlaceholder.remove();
                    }
    
                    categoryPlaceholder = document.createElement('div');
                    categoryPlaceholder.className = 'category-container-placeholder';
                    categoryPlaceholder.style.height = `${rect.height}px`;
                    categoryPlaceholder.style.backgroundColor = '#666666';
                    categoryPlaceholder.style.border = '2px dashed #888888';
                    categoryPlaceholder.style.borderRadius = '5px';
                    categoryPlaceholder.style.marginRight = '15px';
                    categoryPlaceholder.style.opacity = '0.7';
                    categoryItem.parentNode.insertBefore(categoryPlaceholder, categoryItem);
    
                    draggedCategory = categoryItem;
                    Object.assign(draggedCategory.style, {
                        position: 'fixed',
                        width: `${rect.width - 20}px`,
                        height: `${rect.height}px`,
                        left: `0`,
                        top: `${rect.top}px`,
                        backgroundColor: '#4d4d4d',
                        zIndex: '1000',
                        pointerEvents: 'none',
                        transition: 'none',
                        marginLeft: '8px'
                    });
    
                    document.body.appendChild(draggedCategory);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mousemove', handleDrag);
                }
            };
    
            const handleDrag = (moveEvent) => {
                if (!isDragging || !draggedCategory) return;
                moveEvent.preventDefault();
    
                const y = moveEvent.clientY - (e.clientY - startY);
                draggedCategory.style.top = `${y}px`;
    
                const addCategoryBtn = document.querySelector('#add-category');
                const otherCategories = document.querySelector('.other_categories');
                const addCategoryRect = addCategoryBtn.getBoundingClientRect();
                const categories = Array.from(otherCategories.querySelectorAll('.category-container:not([style*="position: fixed"])'));
                const placeholder = document.querySelector('.category-container-placeholder');
    
                if (moveEvent.clientY >= addCategoryRect.top) {
                    if (categories.length > 0) {
                        const lastCategory = categories[categories.length - 1];
                        if (placeholder && lastCategory && lastCategory !== placeholder) {
                            lastCategory.after(placeholder);
                        }
                    }
                    return;
                }
    
                let inserted = false;
                for (const category of categories) {
                    const rect = category.getBoundingClientRect();
                    const centerY = rect.top + (rect.height / 2);
    
                    if (moveEvent.clientY < centerY) {
                        if (placeholder && 
                            category !== placeholder && 
                            category.previousElementSibling !== placeholder) {
                            category.parentNode.insertBefore(placeholder, category);
                            inserted = true;
                            break;
                        }
                    }
                }
    
                if (!inserted && categories.length > 0) {
                    const lastCategory = categories[categories.length - 1];
                    const lastRect = lastCategory.getBoundingClientRect();
                    
                    if (placeholder && 
                        lastCategory !== placeholder && 
                        lastCategory.nextElementSibling !== placeholder &&
                        moveEvent.clientY >= lastRect.top + (lastRect.height / 2) &&
                        moveEvent.clientY < addCategoryRect.top) {
                        lastCategory.after(placeholder);
                    }
                }
            };
    
            const handleMouseUp = () => {
                if (isDragging) {
                    if (draggedCategory && categoryPlaceholder) {
                        draggedCategory.removeAttribute('style');
                        categoryPlaceholder.parentNode.insertBefore(draggedCategory, categoryPlaceholder);
                        categoryPlaceholder.remove();
                        updateCategoryOrder();
                    }
                } else {
                    const categoryContainer = button.closest('.category-container');
                    const categoryId = categoryContainer.getAttribute('category-id');
                    const categoryName = categoryContainer.querySelector('#category_btn').textContent.trim();
                    const editCategoryInput = document.getElementById('edit-category-input');
    
                    editCategoryInput.value = categoryName;
                    editCategoryInput.setAttribute('data-category-id', categoryId);
                    editDeleteBackground.style.display = 'flex';
                    editCategoryInput.focus();
                    editCategoryInput.setSelectionRange(categoryName.length, categoryName.length);
                }
    
                isDragging = false;
                draggedCategory = null;
                categoryPlaceholder = null;
    
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', handleMouseUp);
            };
    
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
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

    if (editCategoryInput) {
        editCategoryInput.addEventListener('focus', function() {
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
          const qrSrc = this.classList.contains('chocolate') ? 'chocolate-QR.jpg' : 'pocari-QR.jpg';
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

    contents.addEventListener('mousedown', function(e) {
        const gripElement = e.target.closest('#grip');
        if (!gripElement) return;
    
        const todoItem = gripElement.closest('.todo-item');
        if (!todoItem) return;
    
        if (todoItem.classList.contains('fixed')) {
            e.preventDefault();
            todoItem.classList.add('shake');
            todoItem.addEventListener('animationend', function() {
                todoItem.classList.remove('shake');
            }, { once: true });
            return;
        }
    
        e.preventDefault();
        draggedItem = todoItem;
        const rect = todoItem.getBoundingClientRect();
        dragOffsetY = e.clientY - rect.top;
        startY = e.clientY;
        startScrollY = window.scrollY;
        isDragging = true;
        document.body.classList.add('dragging');

        placeholder = document.createElement('div');
        placeholder.className = 'todo-item-placeholder';
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.marginBottom = window.getComputedStyle(todoItem).marginBottom;
        placeholder.style.border = '2px dashed #ccc';
        placeholder.style.backgroundColor = '#f0f0f0';
        todoItem.parentNode.insertBefore(placeholder, todoItem.nextSibling);

        const computedStyle = window.getComputedStyle(todoItem);

        Object.assign(todoItem.style, {
            position: 'fixed',
            zIndex: '1000',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            backgroundColor: computedStyle.backgroundColor,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            transition: 'none',
            opacity: '0.9',
            padding: computedStyle.padding,
            boxSizing: 'border-box'
        });

        document.body.appendChild(todoItem);
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDraggingCategory) return;
        e.preventDefault();

        const scrollDiff = window.scrollY - startScrollY;
        const draggedTop = e.clientY - categoryDragOffsetY + scrollDiff;
        draggedCategory.style.top = `${draggedTop}px`;

        const currentPosition = getCategoryPlaceholderPosition(categoryContainer, e.clientY);
        if (currentPosition.element && currentPosition.element !== categoryPlaceholder) {
            if (currentPosition.beforeElement) {
                categoryContainer.insertBefore(categoryPlaceholder, currentPosition.element);
            } else {
                categoryContainer.insertBefore(categoryPlaceholder, currentPosition.element.nextElementSibling);
            }
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDraggingCategory) return;
        e.preventDefault();
    
        const dragElement = document.getElementById('dragging-category');
        if (dragElement) {
            const scrollDiff = window.scrollY - startScrollY;
            const draggedTop = e.clientY - categoryDragOffsetY + scrollDiff;
            dragElement.style.top = `${draggedTop}px`;
    
            const currentPosition = getCategoryPlaceholderPosition(draggedCategory.parentNode, e.clientY);
            if (currentPosition.element && currentPosition.element !== categoryPlaceholder) {
                if (currentPosition.beforeElement) {
                    currentPosition.element.parentNode.insertBefore(draggedCategory, currentPosition.element);
                    currentPosition.element.parentNode.insertBefore(categoryPlaceholder, currentPosition.element);
                } else {
                    currentPosition.element.parentNode.insertBefore(draggedCategory, currentPosition.element.nextSibling);
                    currentPosition.element.parentNode.insertBefore(categoryPlaceholder, currentPosition.element.nextSibling);
                }
            }
        }
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('dragging');

        placeholder.parentNode.insertBefore(draggedItem, placeholder);
        placeholder.parentNode.removeChild(placeholder);
        draggedItem.removeAttribute('style');
        updateTodoOrder();
        draggedItem = null;
        placeholder = null;
    });

    document.addEventListener('mouseup', function() {
        if (!isDraggingCategory) return;
        isDraggingCategory = false;
        document.body.classList.remove('dragging');

        categoryPlaceholder.parentNode.insertBefore(draggedCategory, categoryPlaceholder);
        categoryPlaceholder.parentNode.removeChild(categoryPlaceholder);
        draggedCategory.removeAttribute('style');
        updateCategoryOrder();
        draggedCategory = null;
        categoryPlaceholder = null;
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
                            console.log('Updating info container');
                            infoContainer.innerHTML = `
                                <p>생성일: ${data.created_at}</p>
                                <p>수정일: ${data.updated_at}</p>
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

    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const title = titleInput ? titleInput.value : '';
            const detail = detailInput ? detailInput.value : '';
            const categoryIdElement = document.getElementById('category-id');
            const categoryId = categoryIdElement ? categoryIdElement.value : null;
            
            if (!title.trim()) {
                setupErrorMessage(titleInput, '할 일을 입력해주세요');
                return;
            }
    
            fetch('/add_todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    detail: detail,
                    category_id: categoryId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (addmodalBackground) addmodalBackground.style.display = 'none';
                    const currentCategoryId = document.getElementById('category-id') ? document.getElementById('category-id').value : null;
                    if ((!currentCategoryId && !data.todo.category_id) || (currentCategoryId && data.todo.category_id == currentCategoryId)) {
                        addTodoToDOM(data.todo);
                    }
                    checkEmptyMain();
                    if (titleInput) titleInput.value = '';
                    if (detailInput) detailInput.value = '';
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

function getCategoryPlaceholderPosition(container, y) {
    const draggableElements = [...container.querySelectorAll('.category-container, .category-container-placeholder')];
    
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

function updateCategoryOrder() {
    const categoryContainer = document.querySelector('.other_categories');
    const categories = Array.from(categoryContainer.querySelectorAll('.category-container'));
    const newOrder = categories.map((category, index) => ({
        id: category.getAttribute('category-id'),
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