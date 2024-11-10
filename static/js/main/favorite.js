document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const actionBtns = document.querySelectorAll('#success, #delete');
    const otherBtns = document.querySelectorAll('#other');
    const contents = document.querySelector('.contents');
    const editmodalBackground = document.querySelector('.edit-modal-background');
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
    const modalBackgrounds = document.querySelectorAll('.add-modal-background, .edit-modal-background, .confirm-modal-background, .donate-modal-background, .add-category-modal-background, .search-modal-background, .edit-delete-modal-background');
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

    const modals = document.querySelectorAll('.edit-modal, .confirm-modal, .donate-modal');
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