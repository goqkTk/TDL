document.addEventListener('DOMContentLoaded', function() {
    const editIdBtn = document.getElementById('EditIdBtn');
    const editPwBtn = document.getElementById('EditPwBtn');
    const editIdModalBackground = document.querySelector('.edit_id_modal_background');
    const idInput = document.getElementById('edit-id-input');
    const confirmEditIdBtn = document.getElementById('confirm-edit-id');
    const deleteBtn = document.querySelector('.delete-btn');
    const deleteAccountModalBackground = document.querySelector('.delete_account_modal_background');
    const cancelDeleteAccountBtn = document.getElementById('cancel-delete-account');
    const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account');
    const deleteModalTitle = document.querySelector('.delete_account_modal p:first-of-type');
    let deleteConfirmationStep = 1;
    const editPwModalBackground = document.querySelector('.edit_pw_modal_background');
    const currentPwInput = document.getElementById('current-pw-input');
    const newPwInput = document.getElementById('new-pw-input');
    const confirmPwInput = document.getElementById('confirm-pw-input');
    const confirmEditPwBtn = document.getElementById('confirm-edit-pw');

    editPwBtn.addEventListener('click', function() {
        editPwModalBackground.style.display = 'flex';
        clearPasswordInputs();
        if (currentPwInput) currentPwInput.focus();
    });
    
    editPwModalBackground.addEventListener('click', function(e) {
        if (e.target === editPwModalBackground) {
            editPwModalBackground.style.display = 'none';
            clearPasswordInputs();
        }
    });
    
    [currentPwInput, newPwInput, confirmPwInput].forEach(input => {
        if (input) {
            input.addEventListener('focus', function() {
                clearErrorMessage(this);
            });
    
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    confirmEditPwBtn.click();
                }
            });
        }
    });
    
    confirmEditPwBtn.addEventListener('click', function() {
        const currentPw = currentPwInput.value;
        const newPw = newPwInput.value;
        const confirmPw = confirmPwInput.value;
    
        if (!currentPw) {
            setupErrorMessage(currentPwInput, '현재 비밀번호를 입력해주세요');
            return;
        }
    
        if (!newPw) {
            setupErrorMessage(newPwInput, '새 비밀번호를 입력해주세요');
            return;
        }
    
        if (newPw.length < 8) {
            setupErrorMessage(newPwInput, '비밀번호는 8자 이상이어야 합니다');
            return;
        }
    
        if (newPw !== confirmPw) {
            setupErrorMessage(confirmPwInput, '비밀번호가 일치하지 않습니다');
            return;
        }
    
        fetch('/update_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPw,
                new_password: newPw
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('비밀번호가 변경되었습니다.');
                editPwModalBackground.style.display = 'none';
                clearPasswordInputs();
            } else {
                setupErrorMessage(currentPwInput, data.message || '현재 비밀번호가 일치하지 않습니다');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setupErrorMessage(currentPwInput, '서버 오류가 발생했습니다');
        });
    });
    
    function clearPasswordInputs() {
        currentPwInput.value = '';
        newPwInput.value = '';
        confirmPwInput.value = '';
        clearErrorMessage(currentPwInput);
        clearErrorMessage(newPwInput);
        clearErrorMessage(confirmPwInput);
    }

    deleteBtn.addEventListener('click', function() {
        deleteConfirmationStep = 1;
        updateDeleteModal();
        deleteAccountModalBackground.style.display = 'flex';
    });

    deleteAccountModalBackground.addEventListener('click', function(e) {
        if (e.target === deleteAccountModalBackground) {
            resetDeleteModal();
        }
    });

    cancelDeleteAccountBtn.addEventListener('click', function() {
        resetDeleteModal();
    });

    confirmDeleteAccountBtn.addEventListener('click', function() {
        switch(deleteConfirmationStep) {
            case 1:
                deleteConfirmationStep = 2;
                updateDeleteModal();
                break;
            case 2:
                deleteConfirmationStep = 3;
                updateDeleteModal();
                break;
            case 3:
                performAccountDeletion();
                break;
        }
    });

    function updateDeleteModal() {
        const stepIndicator = document.querySelector('.step-indicator');
        
        switch(deleteConfirmationStep) {
            case 1:
                deleteModalTitle.textContent = '정말 계정을 삭제하시겠습니까?';
                stepIndicator.textContent = '( 1/3 )';
                break;
            case 2:
                deleteModalTitle.textContent = '지우면 되돌릴 수 없습니다';
                stepIndicator.textContent = '( 2/3 )';
                break;
            case 3:
                deleteModalTitle.textContent = '마지막 기회입니다\n정말 삭제하시겠습니까?';
                stepIndicator.textContent = '( 3/3 )';
                break;
        }
    }

    function resetDeleteModal() {
        deleteAccountModalBackground.style.display = 'none';
        deleteConfirmationStep = 1;
        setTimeout(() => {
            updateDeleteModal();
        }, 200);
    }

    function performAccountDeletion() {
        fetch('/delete_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/login';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버 오류가 발생했습니다.');
        });
    }

    editIdBtn.addEventListener('click', function() {
        editIdModalBackground.style.display = 'flex';
        if (idInput) {
            idInput.value = '';
            clearErrorMessage(idInput);
            idInput.focus();
        }
    });

    editIdModalBackground.addEventListener('click', function(e) {
        if (e.target === editIdModalBackground) {
            editIdModalBackground.style.display = 'none';
            if (idInput) {
                idInput.value = '';
                clearErrorMessage(idInput);
            }
        }
    });

    confirmEditIdBtn.addEventListener('click', function() {
        const newId = idInput.value.trim();

        if (!newId) {
            setupErrorMessage(idInput, '아이디를 입력해주세요');
            return;
        }

        fetch('/update_id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_id: newId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                setupErrorMessage(idInput, data.message || '아이디 변경에 실패했습니다');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setupErrorMessage(idInput, '서버 오류가 발생했습니다');
        });
    });

    idInput.addEventListener('focus', function() {
        clearErrorMessage(this);
    });

    idInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmEditIdBtn.click();
        }
    });
});

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