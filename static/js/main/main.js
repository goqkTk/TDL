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
    const modalBackgrounds = document.querySelectorAll('.add-modal-background, .edit-modal-background, .confirm-modal-background, .donate-modal-background, .add-category-modal-background');
    const loginRequiredModal = document.querySelector('.login-required-modal-background');
    const goToLoginBtn = document.getElementById('go-to-login');
    const addCategoryBtn = document.getElementById('add-category');
    const addCategoryBackground = document.querySelector('.add-category-modal-background');
    const addCategoryInput = document.getElementById('add-category-input');
    const confirmCategoryBtn = document.getElementById('confirm-category');

    let todoToRemove = null;

    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let dragOffsetY;

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
                        if (addmodalBackground) {
                            addmodalBackground.style.display = 'none';
                        }
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
            addCategoryBackground.style.display = 'flex';
            if (addCategoryInput) {
                addCategoryInput.value = '';
            }
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
                    // 페이지 새로고침
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
    
    function addCategoryToSidebar(categoryId, categoryName) {
        console.log('Adding category to sidebar:', categoryId, categoryName);
        const otherCategories = document.querySelector('.other_categories');
        const addCategoryBtn = document.getElementById('add-category');
        
        if (!otherCategories || !addCategoryBtn) {
            console.error('Required elements not found');
            return;
        }
    
        const newCategory = document.createElement('button');
        newCategory.id = 'category_btn';
        newCategory.setAttribute('data-category-id', categoryId);
        newCategory.textContent = categoryName;
        
        // 'Add Category' 버튼이 .other_categories 내부에 있는지 확인
        if (otherCategories.contains(addCategoryBtn)) {
            // 새 카테고리를 'Add Category' 버튼 바로 앞에 삽입
            otherCategories.insertBefore(newCategory, addCategoryBtn);
        } else {
            // 'Add Category' 버튼이 .other_categories 내부에 없으면 맨 뒤에 추가
            otherCategories.appendChild(newCategory);
        }
    
        // 'Add Category' 버튼을 .other_categories의 마지막 자식으로 이동
        otherCategories.appendChild(addCategoryBtn);
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
                if (addCategoryInput) {
                    addCategoryInput.value = '';
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
        const isFixed = item.getAttribute('data-fixed') === 'true';
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
            setTimeout(() => {
                todoItem.classList.remove('shake');
            }, 500);
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
        document.body.classList.remove('dragging');

        placeholder.parentNode.insertBefore(draggedItem, placeholder);
        placeholder.parentNode.removeChild(placeholder);
        draggedItem.removeAttribute('style');
        updateTodoOrder();
        draggedItem = null;
        placeholder = null;
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
        const contents = document.querySelector('.contents');
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
                <div class="edit-group">수정</div>
                <div class="remove-group">삭제</div>
                <div class="detail-group">상세 정보</div>
            </div>
            <div class="info-container" style="display: none;">
                <p>생성일: ${createdDate.toLocaleString()}</p>
                <p>수정일: ${editedDate ? editedDate.toLocaleString() : '수정되지 않음'}</p>
            </div>
        `;
    
        const noMainMessage = contents.querySelector('.no-main-message');
        if (noMainMessage) {
            contents.removeChild(noMainMessage);
        }
    
        contents.insertBefore(todoDiv, contents.firstChild);
        
        setupNewTodoEventListeners(todoDiv);
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
                setupErrorMessage('title', '할 일을 입력해주세요');
                return;
            }

            if (data.success) {
                if (addmodalBackground) addmodalBackground.style.display = 'none';
                const currentCategoryId = document.getElementById('category-id').value;
                if (currentCategoryId && data.todo.category_id == currentCategoryId) {
                    addTodoToDOM(data.todo);
                }
                checkEmptyMain();
                if (titleInput) titleInput.value = '';
                if (detailInput) detailInput.value = '';
            } else {
                setupErrorMessage('title', data.message || '할 일 추가에 실패했습니다.');
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
                    addTodoToDOM(data.todo);
                    checkEmptyMain();
                    if (titleInput) titleInput.value = '';
                    if (detailInput) detailInput.value = '';
                } else {
                    setupErrorMessage('title', data.message || '할 일 추가에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setupErrorMessage('title', '오류가 발생했습니다.');
            });
        });
    }

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

    checkEmptyMain();

    document.querySelectorAll('#fix').forEach(btn => {
        btn.addEventListener('click', function() {
            const todoItem = this.closest('.todo-item');
            const todoId = todoItem.getAttribute('todo-id');
            const isFixed = !todoItem.classList.contains('fixed');
            updateFixStatus(todoId, isFixed);
        });
    });
    updateTodoOrder();
});

function updateFixItemUI(item, isFixed) {
    item.classList.toggle('fixed', isFixed);
    item.setAttribute('data-fixed', isFixed);
    const fixButton = item.querySelector('#fix');
    if (fixButton) {
        const img = fixButton.querySelector('img');
        img.src = '/static/img/pin-' + (isFixed ? 'on' : 'off') + '.png';
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
            location.reload();
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
    const fixedItems = todoItems.filter(item => item.classList.contains('fixed'));
    const unfixedItems = todoItems.filter(item => !item.classList.contains('fixed'));

    fixedItems.sort((a, b) => parseInt(a.getAttribute('data-order')) - parseInt(b.getAttribute('data-order')));
    todoContainer.innerHTML = '';
    fixedItems.forEach(item => todoContainer.appendChild(item));
    unfixedItems.forEach(item => todoContainer.appendChild(item));

    const newOrder = todoItems.map((item, index) => ({
        id: item.getAttribute('todo-id'),
        order: item.classList.contains('fixed') ? null : index
    }));

    fetch('/update_todo_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({order: newOrder})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            todoItems.forEach((item, index) => {
                if (!item.classList.contains('fixed')) {
                    item.setAttribute('data-order', index);
                }
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
            checkEmptyMain();
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
        starIcon.classList.replace('fa-regular', 'fa-solid');
        starIcon.style.color = '#FFD43B';
        todoDiv.classList.add('active');
        todoDiv.style.backgroundColor = '#fff9db';
    } else {
        starIcon.classList.replace('fa-solid', 'fa-regular');
        starIcon.style.color = '';
        todoDiv.classList.remove('active');
        todoDiv.style.backgroundColor = '';
    }
}

function setupErrorMessage(inputId, messageText) {
    const inputElement = document.getElementById(inputId);
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

function checkEmptyMain() {
    const mainItems = document.querySelectorAll('.contents .todo-item');
    const existingMessage = document.querySelector('.no-main-message');
    
    if (mainItems.length === 0 && !existingMessage) {
        const noMainMessage = document.createElement('div');
        noMainMessage.className = 'no-main-message';
        noMainMessage.innerHTML = `
            <p>할 일 목록이 비어있습니다</p>
            <p>새로운 할 일을 추가해보세요!</p>
        `;
        document.querySelector('.contents').appendChild(noMainMessage);
    } else if (mainItems.length > 0 && existingMessage) {
        existingMessage.remove();
    }
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