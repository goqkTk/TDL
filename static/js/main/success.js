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
    const modalBackgrounds = document.querySelectorAll('.confirm-modal-background, .donate-modal-background, .search-modal-background');
    const searchBtn = document.querySelector('.search');
    const searchModalBackground = document.querySelector('.search-modal-background');
    const searchInput = document.getElementById('category-search-input');
    const searchResults = document.getElementById('category-search-results');

    let draggedItem = null;
    let placeholder = null;
    let isDragging = false;
    let startScrollY;
    let dragOffsetY;
    let originalRect;

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchModalBackground) {
                searchModalBackground.style.display = 'flex';
                if (searchInput) searchInput.focus();
            }
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
                data.categories.forEach(category => {
                    const categoryElement = document.createElement('div');
                    categoryElement.textContent = `카테고리: ${category.name}`;
                    categoryElement.addEventListener('click', function() {
                        window.location.href = `/category/${category.id}`;
                    });
                    searchResults.appendChild(categoryElement);
                });
                data.todos.forEach(todo => {
                    const todoElement = document.createElement('div');
                    todoElement.textContent = `할 일: ${todo.title}`;
                    todoElement.addEventListener('click', function() {
                        if (todo.category_id) {
                            window.location.href = `/category/${todo.category_id}?highlight=${todo.id}`;
                        } else {
                            window.location.href = `/?highlight=${todo.id}`;
                        }
                    });
                    searchResults.appendChild(todoElement);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            searchResults.innerHTML = '';
        }
    });

    modalBackgrounds.forEach(background => {
        background.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
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

function checkEmptySuccess() {
    const successItems = document.querySelectorAll('.contents > div');
    const existingMessage = document.querySelector('.no-success-message');
    
    if (successItems.length === 0 && !existingMessage) {
        const noSuccessMessage = document.createElement('div');
        noSuccessMessage.className = 'no-success-message';
        noSuccessMessage.innerHTML = `
            <p>완료된 항목이 없습니다</p>
            <p>메인 페이지에서 체크 아이콘을 클릭하여 항목을 완료 처리할 수 있습니다</p>
        `;
        document.querySelector('.contents').appendChild(noSuccessMessage);
    } else if (successItems.length > 0 && existingMessage) {
        existingMessage.remove();
    }
}