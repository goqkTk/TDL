document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const actionBtns = document.querySelectorAll('#success, #delete');
    const otherBtns = document.querySelectorAll('#other');
    const contents = document.querySelector('.contents');
    const editmodalBackground = document.querySelector('.edit-modal-background');
    const confirmModalBackground = document.querySelector('.confirm-modal-background');
    const yesBtn = document.getElementById('yes');
    const noBtn = document.getElementById('no');
    const detailButtons = document.querySelectorAll('.detail-group');

    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let originalRect;
    let dragOffsetY;

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

    favoriteBtns.forEach(btn => {
        const starIcon = btn.querySelector('i');
        const todoDiv = btn.closest('.todo-item');
        updateFavoriteUI(starIcon, todoDiv);

        btn.addEventListener('click', handleFavoriteClick);
    });
    setupActionButtons();
    checkEmptyFavorites();

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
                todoDiv.remove();
                checkEmptyFavorites();
            } else {
                console.error('즐겨찾기 업데이트 실패');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
                checkEmptyFavorites();
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
            checkEmptyFavorites();
        } else {
            console.error('할 일 삭제 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
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

    fetch('/update_favorite_order', {
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

function checkEmptyFavorites() {
    const favoriteItems = document.querySelectorAll('.contents .todo-item');
    const existingMessage = document.querySelector('.no-favorites-message');
    
    if (favoriteItems.length === 0 && !existingMessage) {
        const noFavoritesMessage = document.createElement('div');
        noFavoritesMessage.className = 'no-favorites-message';
        noFavoritesMessage.innerHTML = `
            <p>즐겨찾기한 항목이 없습니다</p>
            <p>메인 페이지에서 별 모양 아이콘을 클릭하여 항목을 즐겨찾기에 추가할 수 있습니다</p>
        `;
        document.querySelector('.contents').appendChild(noFavoritesMessage);
    } else if (favoriteItems.length > 0 && existingMessage) {
        existingMessage.remove();
    }
}