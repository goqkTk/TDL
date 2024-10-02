document.addEventListener('DOMContentLoaded', function() {
    const idInput = document.getElementById('id');
    const pwInput = document.getElementById('pw');
    const submitButton = document.getElementById('submit');
    const autoLoginCheckbox = document.getElementById('autologin');

    function togglePasswordVisibility(fieldId, btnId) {
        const field = document.getElementById(fieldId);
        const btn = document.getElementById(btnId);
        
        field.type = field.type === 'password' ? 'text' : 'password';
        btn.innerHTML = `<i class="fa-solid fa-eye${field.type === 'password' ? '-slash' : ''}"></i>`;
    }

    document.getElementById('pw-see').onclick = () => togglePasswordVisibility('pw', 'pw-see');

    function setErrorStyle(input, message) {
        input.style.borderBottomColor = 'red';
        let errorMessage = input.parentElement.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            input.parentElement.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function clearErrorStyle(input) {
        input.style.borderBottomColor = '';
        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    function validateId() {
        const id = idInput.value.trim();
        if (id !== '') {
            fetch('/check_id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${encodeURIComponent(id)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.is_unique) {
                    setErrorStyle(idInput, '사용자를 찾을 수 없습니다');
                } else {
                    clearErrorStyle(idInput);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setErrorStyle(idInput, '서버 오류가 발생했습니다');
            });
        } else {
            clearErrorStyle(idInput);
        }
    }

    idInput.addEventListener('input', validateId);

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();

        const id = idInput.value.trim();
        const password = pwInput.value.trim();
        const autologin = autoLoginCheckbox.checked;

        let isValid = true;

        if (id === '') {
            setErrorStyle(idInput, '아이디를 입력해주세요');
            isValid = false;
        } else {
            clearErrorStyle(idInput);
        }

        if (password === '') {
            setErrorStyle(pwInput, '비밀번호를 입력해주세요');
            isValid = false;
        } else {
            clearErrorStyle(pwInput);
        }

        if (isValid && !document.querySelector('input[style*="border-bottom-color: red"]')) {
            submitButton.disabled = true;
            submitButton.style.opacity = '0.5';
            submitButton.textContent = '로그인 중...';

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${encodeURIComponent(id)}&pw=${encodeURIComponent(password)}&autologin=${autologin ? 'on' : 'off'}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';
                } else {
                    setErrorStyle(pwInput, '비밀번호가 일치하지 않습니다');
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.textContent = '로그인';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setErrorStyle(pwInput, '서버 오류가 발생했습니다');
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.textContent = '로그인';
            });
        }
    });
});