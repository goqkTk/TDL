document.addEventListener('DOMContentLoaded', function() {
    const idInput = document.getElementById('id');
    const idCheckButton = document.getElementById('id-check');
    const passwordInputField = document.getElementById('pw');
    const passwordCheckField = document.getElementById('pw_c');
    const emailNameInput = document.getElementById('email-name');
    const emailDomainInput = document.getElementById('email-domain');
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submit');
    const verifyButton = document.getElementById('verify');

    function handleCapsLock(e, inputField) {
        const capsLockOn = e.getModifierState('CapsLock');
        if (capsLockOn && document.activeElement === inputField) {
            setupErrorMessage(inputField.id, 'CapsLock이 켜져있습니다');
            inputField.style.borderBottom = '1px solid red';
        } else {
            if (inputField === passwordInputField) {
                checkPassword();
            } else {
                checkPasswordMatch();
            }
        }
    }
    passwordInputField.addEventListener('keyup', (e) => handleCapsLock(e, passwordInputField));
    passwordCheckField.addEventListener('keyup', (e) => handleCapsLock(e, passwordCheckField));
    
    passwordInputField.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid gray';
        }
        checkPassword();
    });

    passwordCheckField.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid gray';
        }
        checkPasswordMatch();
    });

    verifyButton.addEventListener('click', function() {
        const emailName = document.getElementById('email-name').value;
        const emailDomain = document.getElementById('email-domain').value;
        const fullEmail = `${emailName}@${emailDomain}`;
    
        verifyButton.disabled = true;
        verifyButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
        fetch('/send_register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(fullEmail)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideErrorMessage('email-name');
                setupSuccessMessage('email-name', data.message);
            } else {
                setupErrorMessage('email-name', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setupErrorMessage('email-name', '서버 오류가 발생했습니다');
        })
        .finally(() => {
            verifyButton.disabled = false;
            verifyButton.innerHTML = '확인';
        });
    });
    
    function setupSuccessMessage(inputId, messageText) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        let successMessage = inputGroup.querySelector('.success-message');
        
        if (!successMessage) {
            successMessage = document.createElement('span');
            successMessage.className = 'success-message';
            inputGroup.appendChild(successMessage);
        }
        
        successMessage.textContent = messageText;
        successMessage.style.display = 'block';
        inputGroup.querySelector('input').classList.add('success');
    }

    function hideSuccessMessage(inputId) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        const successMessage = inputGroup.querySelector('.success-message');
        
        if (successMessage) {
            successMessage.style.display = 'none';
        }
        inputGroup.querySelector('input').classList.remove('success');
    }

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        const inputs = form.querySelectorAll('input');
        let hasError = false;
        let emptyFields = [];
        let idChecked = false;
    
        inputs.forEach(input => {
            if (input.classList.contains('error')) {
                hasError = true;
            }
            if (input.value.trim() === '') {
                emptyFields.push(input);
            }
        });
        
        const idCheckButton = document.getElementById('id-check');
        idChecked = idCheckButton.classList.contains('checked');
    
        if (emptyFields.length > 0) {
            emptyFields.forEach(field => {
                field.style.borderBottom = '1px solid red';
                field.classList.add('error');
                setupErrorMessage(field.id, '필수 항목입니다');
            });
            return;
        }
        
        if (!idChecked) {
            setupErrorMessage('id', '아이디 중복 확인을 해주세요');
            document.getElementById('id').style.borderBottom = '1px solid red';
            document.getElementById('id').classList.add('error');
            return;
        }
        
        const emailName = document.getElementById('email-name').value;
        const emailDomain = document.getElementById('email-domain').value;
        const fullEmail = `${emailName}@${emailDomain}`;

        fetch('/check_email_verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: fullEmail})
        })
        .then(response => response.json())
        .then(data => {
            if (data.verified) {
                submitRegistration();
            } else {
                hideSuccessMessage('email-name');
                setupErrorMessage('email-name', '이메일 인증을 완료해주세요');
                document.getElementById('email-name').style.borderBottom = '1px solid red';
                document.getElementById('email-domain').style.borderBottom = '1px solid red';
                document.getElementById('email-name').classList.add('error');
                document.getElementById('email-domain').classList.add('error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            hideSuccessMessage('email-name');
            setupErrorMessage('email-name', '이메일 인증 확인 중 오류가 발생했습니다');
            document.getElementById('email-name').classList.add('error');
            document.getElementById('email-domain').classList.add('error');
        });
    });

    function submitRegistration() {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.textContent = '회원가입 중...';

        const formData = new FormData(form);
        
        fetch('/register', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.href = '/login';
            } else {
                alert(data.message);
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.textContent = '회원가입';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('회원가입 중 오류가 발생했습니다');
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.textContent = '회원가입';
        });
    }

    function setupErrorMessage(inputId, messageText) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        let errorMessage = inputGroup.querySelector('.error-message');
        
        if (!errorMessage) {
            errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            inputGroup.appendChild(errorMessage);
        }
        
        errorMessage.textContent = messageText;
        errorMessage.style.display = 'block';
        inputGroup.querySelector('input').classList.add('error');
    }
    
    function hideErrorMessage(inputId) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        const errorMessage = inputGroup.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        inputGroup.querySelector('input').classList.remove('error');
    }

    function validateEmail() {
        const emailName = emailNameInput.value.trim();
        const emailDomain = emailDomainInput.value.trim();
        
        if (emailName === '' && emailDomain === '') {
            hideErrorMessage('email-name');
            hideSuccessMessage('email-name');
            emailNameInput.classList.remove('error');
            emailDomainInput.classList.remove('error');
            updateEmailFieldStyle(emailNameInput);
            updateEmailFieldStyle(emailDomainInput);
            return;
        }
        
        const fullEmail = `${emailName}@${emailDomain}`;

        fetch('/check_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(fullEmail)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                hideErrorMessage('email-name');
                hideSuccessMessage('email-name');
                emailNameInput.classList.remove('error');
                emailDomainInput.classList.remove('error');
            } else {
                hideSuccessMessage('email-name');
                setupErrorMessage('email-name', data.message);
                emailNameInput.classList.add('error');
                emailDomainInput.classList.add('error');
            }
            updateEmailFieldStyle(emailNameInput);
            updateEmailFieldStyle(emailDomainInput);
        })
        .catch(error => {
            console.error('Error:', error);
            hideSuccessMessage('email-name');
            setupErrorMessage('email-name', '서버 오류가 발생했습니다');
            emailNameInput.classList.add('error');
            emailDomainInput.classList.add('error');
            updateEmailFieldStyle(emailNameInput);
            updateEmailFieldStyle(emailDomainInput);
        });
    }

    function updateEmailFieldStyle(inputField) {
        if (inputField.value.trim() === '') {
            inputField.classList.remove('error');
            if (document.activeElement === inputField) {
                inputField.style.borderBottom = '1px solid #03A9F4';
            } else {
                inputField.style.borderBottom = '1px solid gray';
            }
        } else if (inputField.classList.contains('error')) {
            inputField.style.borderBottom = '1px solid red';
        } else if (document.activeElement === inputField) {
            inputField.style.borderBottom = '1px solid #03A9F4';
        } else {
            inputField.style.borderBottom = '1px solid gray';
        }
    }

    function validateId() {
        const id = idInput.value.trim();
        
        if (id === '') {
            hideErrorMessage('id');
            updateIdFieldStyle();
            return;
        }

        if (id.includes(' ')) {
            setupErrorMessage('id', '아이디에 공백은 사용할 수 없습니다');
            updateIdFieldStyle();
            idCheckButton.classList.remove('checked');
            return;
        }

        hideErrorMessage('id');
        updateIdFieldStyle();
    }

    function updateIdFieldStyle() {
        const errorMessage = idInput.closest('#group').querySelector('.error-message');
        if (errorMessage && errorMessage.style.display !== 'none') {
            idInput.style.borderBottom = '1px solid red';
        } else if (document.activeElement === idInput) {
            idInput.style.borderBottom = '1px solid #03A9F4';
        } else {
            idInput.style.borderBottom = '1px solid gray';
        }
    }

    idInput.addEventListener('input', validateId);
    idInput.addEventListener('focus', updateIdFieldStyle);
    idInput.addEventListener('blur', updateIdFieldStyle);

    idCheckButton.onclick = function() {
        if (this.classList.contains('checked')) {
            return;
        }
    
        const id = idInput.value.trim();
        
        if (id === '') {
            setupErrorMessage('id', '아이디를 입력해주세요');
            idInput.style.borderBottom = '1px solid red';
            return;
        }

        if (id.includes(' ')) {
            setupErrorMessage('id', '아이디에 공백은 사용할 수 없습니다');
            idInput.style.borderBottom = '1px solid red';
            return;
        }
    
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        this.readOnly = true;
    
        fetch('/check_id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${encodeURIComponent(id)}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            if (data.is_unique) {
                hideErrorMessage('id');
                idInput.style.borderBottom = '1px solid gray';
                this.innerHTML = '<i class="fa-solid fa-check"></i>';
                this.classList.add('checked');
                idInput.readOnly = true;
                idChecked = true;
            } else {
                setupErrorMessage('id', '이미 존재하는 아이디입니다');
                idInput.style.borderBottom = '1px solid red';
                this.innerHTML = '중복확인';
                this.classList.remove('checked');
                idChecked = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setupErrorMessage('id', '다시 시도해주세요');
            idInput.style.borderBottom = '1px solid red';
            this.innerHTML = '중복확인';
            idChecked = false;
        })
        .finally(() => {
            this.readOnly = false;
        });
    };

    emailNameInput.addEventListener('input', function() {
        validateEmail();
        hideSuccessMessage('email-name');
        hideErrorMessage('email-name');
    });
    emailDomainInput.addEventListener('input', function() {
        validateEmail();
        hideSuccessMessage('email-name');
        hideErrorMessage('email-name');
    });

    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    function checkPassword() {
        const password = passwordInputField.value;
        const isValid = validatePassword(password);
        const isFocused = passwordInputField === document.activeElement;
    
        if (password.trim() === '') {
            hideErrorMessage('pw');
            passwordInputField.style.borderBottom = isFocused ? '1px solid #03A9F4' : '1px solid gray';
        } else if (!isValid) {
            setupErrorMessage('pw', '8자 이상이며 대소문자와 숫자를 포함해야 합니다');
            passwordInputField.style.borderBottom = '1px solid red';
        } else {
            hideErrorMessage('pw');
            passwordInputField.style.borderBottom = isFocused ? '1px solid #03A9F4' : '1px solid gray';
        }
    
        checkPasswordMatch();
    }

    function checkPasswordMatch() {
        const password = passwordInputField.value;
        const passwordCheck = passwordCheckField.value;
        const isFocused = passwordCheckField === document.activeElement;
        if (passwordCheck.trim() === '') {
            hideErrorMessage('pw_c');
            passwordCheckField.style.borderBottom = isFocused ? '1px solid #03A9F4' : '1px solid gray';
        } else if (password !== passwordCheck) {
            setupErrorMessage('pw_c', '비밀번호가 일치하지 않습니다');
            passwordCheckField.style.borderBottom = '1px solid red';
        } else {
            hideErrorMessage('pw_c');
            passwordCheckField.style.borderBottom = isFocused ? '1px solid #03A9F4' : '1px solid gray';
        }
    }

    passwordInputField.addEventListener('input', checkPassword);
    passwordCheckField.addEventListener('input', checkPasswordMatch);

    passwordInputField.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid #03A9F4';
        }
    });

    passwordInputField.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid gray';
        }
        checkPassword();
    });

    passwordCheckField.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid #03A9F4';
        }
    });

    passwordCheckField.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderBottom = '1px solid gray';
        }
        checkPasswordMatch();
    });

    emailNameInput.addEventListener('input', validateEmail);
    emailDomainInput.addEventListener('input', validateEmail);
    emailNameInput.addEventListener('focus', function() { updateEmailFieldStyle(this); });
    emailNameInput.addEventListener('blur', function() { updateEmailFieldStyle(this); });
    emailDomainInput.addEventListener('focus', function() { updateEmailFieldStyle(this); });
    emailDomainInput.addEventListener('blur', function() { updateEmailFieldStyle(this); });

    function togglePasswordVisibility(fieldId, btnId) {
        const field = document.getElementById(fieldId);
        const btn = document.getElementById(btnId);
        
        field.type = field.type === 'password' ? 'text' : 'password';
        btn.innerHTML = `<i class="fa-solid fa-eye${field.type === 'password' ? '-slash' : ''}"></i>`;
    }

    document.getElementById('pw-see').onclick = () => togglePasswordVisibility('pw', 'pw-see');
    document.getElementById('pw_c-see').onclick = () => togglePasswordVisibility('pw_c', 'pw_c-see');

    const domainToggleBtn = document.querySelector('.email-domain button');
    const domainList = document.getElementById('domain-list');
    const domainInput = document.getElementById('email-domain');

    domainToggleBtn.onclick = () => {
        domainList.style.display = domainList.style.display === 'none' ? 'block' : 'none';
        domainToggleBtn.querySelector('i').style.transform = domainList.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
    };
    
    document.addEventListener('click', (event) => {
        if (!domainToggleBtn.contains(event.target) && !domainList.contains(event.target)) {
            domainList.style.display = 'none';
            domainToggleBtn.querySelector('i').style.transform = 'rotate(0deg)';
        }
    });    

    domainList.querySelectorAll('li').forEach(item => {
        item.onclick = () => {
            if (item.textContent === '직접입력') {
                domainInput.value = '';
                domainInput.focus();
            } else {
                domainInput.value = item.textContent;
            }
            domainList.style.display = 'none';
            domainToggleBtn.querySelector('i').style.transform = 'rotate(0deg)';
            validateEmail();
        };
    });
});