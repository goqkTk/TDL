document.addEventListener('DOMContentLoaded', function() {
    const editIdBtn = document.getElementById('EditIdBtn');
    const editPwBtn = document.getElementById('EditPwBtn');
    const editIdModalBackground = document.querySelector('.edit_id_modal_background');
    const idInput = document.querySelector('#edit_id_input');
    const confirmEditIdBtn = document.querySelector('#confirm_edit_id');
    const deleteBtn = document.querySelector('.delete-btn');

    editIdBtn.addEventListener('click', function() {
        editIdModalBackground.style.display = 'flex';
        if (idInput) {
            idInput.value = '';
            clearErrorMessage(idInput);
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
                alert('아이디가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
                window.location.href = '/logout';
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