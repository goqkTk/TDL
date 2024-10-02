document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const actionBtns = document.querySelectorAll('#success, #delete');
    const addBtn = document.getElementById('add');
    const detailInput = document.getElementById('detail');
    const addclose = document.getElementById('add-close');
    const editclose = document.getElementById('edit-close');
    const addmodalBackground = document.querySelector('.add-modal-background');
    const editmodalBackground = document.querySelector('.edit-modal-background');
    const addContentBtn = document.getElementById('add-content');
    const editContentBtn = document.querySelector('.edit-group');
    const otherBtns = document.querySelectorAll('#other');
    const contents = document.querySelector('.contents');
    const confirmModalBackground = document.querySelector('.confirm-modal-background');
    const yesBtn = document.getElementById('yes');
    const noBtn = document.getElementById('no');
    const fixButtons = document.querySelectorAll('#fix');
    const detailButtons = document.querySelectorAll('.detail-group');

    let todoToRemove = null;

    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let originalRect;
    let dragOffsetY;

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
            paddingLeft: '50px',
            paddingTop: '15px'
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

    const editCloseBtn = document.getElementById('edit-close');
    if (editCloseBtn) {
        editCloseBtn.addEventListener('click', function() {
            editmodalBackground.style.display = 'none';
        });
    }
    
    editmodalBackground.addEventListener('click', function(event) {
        if (event.target === editmodalBackground) {
            editmodalBackground.style.display = 'none';
        }
    });

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
            .then(response => response.json())
            .then(data => {
                if (data.success && data.todo) {
                    editmodalBackground.style.display = 'none';
                    const todoItem = document.querySelector(`.todo-item[todo-id="${todoId}"]`);
                    if (todoItem) {
                        todoItem.querySelector('.title').textContent = data.todo.title;
                        todoItem.querySelector('.detail').textContent = data.todo.detail;
                        const infoContainer = todoItem.querySelector('.info-container');
                        if (infoContainer) {
                            infoContainer.innerHTML = `
                                <p>생성일: ${data.todo.day || '정보 없음'}</p>
                                <p>수정일: ${data.todo.edit_day || '수정되지 않음'}</p>
                            `;
                        }
                        console.log('Todo updated:', data.todo);
                    }
                } else {
                    console.error('할 일 수정 실패');
                }
            })
            .catch(error => {
                console.error('Error:', error);
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

    if (addclose) {
        addclose.addEventListener('click', function() {
            addmodalBackground.style.display = 'none';
        });
    }

    if (editclose) {
        editclose.addEventListener('click', function() {
            editmodalBackground.style.display = 'none';
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const title = titleInput ? titleInput.value : '';
            const detail = detailInput ? detailInput.value : '';
            
            if (!title.trim()) {
                setupErrorMessage('title', '할 일을 입력해주세요');
                return;
            }

            fetch('/add_todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    detail: detail
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (addmodalBackground) addmodalBackground.style.display = 'none';
                    location.reload();
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
    const draggableElements = [...container.querySelectorAll('.todo-item, .todo-item-placeholder')];
    const fixedItems = draggableElements.filter(item => item.classList.contains('fixed'));
    const lastFixedItem = fixedItems[fixedItems.length - 1];
    
    // If there are fixed items, ensure the placeholder is always after them
    if (lastFixedItem) {
        const lastFixedItemRect = lastFixedItem.getBoundingClientRect();
        if (y < lastFixedItemRect.bottom) {
            return { element: lastFixedItem, beforeElement: false };
        }
    }
    
    for (let i = fixedItems.length; i < draggableElements.length; i++) {
        const box = draggableElements[i].getBoundingClientRect();
        const boxCenter = box.top + box.height / 2;
        
        if (y < boxCenter) {
            return { element: draggableElements[i], beforeElement: true };
        }
    }
    
    if (draggableElements.length > fixedItems.length) {
        return { element: draggableElements[draggableElements.length - 1], beforeElement: false };
    }
    
    return { element: lastFixedItem || null, beforeElement: false };
}

function updateTodoOrder() {
    const todoContainer = document.querySelector('.contents');
    const todoItems = Array.from(todoContainer.querySelectorAll('.todo-item'));
    const fixedItems = todoItems.filter(item => item.classList.contains('fixed'));
    const unfixedItems = todoItems.filter(item => !item.classList.contains('fixed'));

    // Keep fixed items at their current positions
    fixedItems.sort((a, b) => parseInt(a.getAttribute('data-order')) - parseInt(b.getAttribute('data-order')));

    // Reorder unfixed items
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