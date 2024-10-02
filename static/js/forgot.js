document.addEventListener('DOMContentLoaded', function() {
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

    function setupsuccessMessage(inputId, messageText) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        let successmessage = inputGroup.querySelector('.successmessage');
        
        if (!successmessage) {
            successmessage = document.createElement('span');
            successmessage.className = 'successmessage';
            inputGroup.appendChild(successmessage);
        }
        
        successmessage.textContent = messageText;
        successmessage.style.display = 'block';
        inputGroup.querySelector('input').classList.add('success');
    }
    
    function hidesuccessMessage(inputId) {
        const inputGroup = document.getElementById(inputId).closest('#group');
        const successmessage = inputGroup.querySelector('.successmessage');
        
        if (successmessage) {
            successmessage.style.display = 'none';
        }
        inputGroup.querySelector('input').classList.remove('success');
    }

    function togglePasswordVisibility(fieldId, btnId) {
        const field = document.getElementById(fieldId);
        const btn = document.getElementById(btnId);
    
        field.type = field.type === 'password' ? 'text' : 'password';
        btn.innerHTML = `<i class="fa-solid fa-eye${field.type === 'password' ? '-slash' : ''}"></i>`;
    }

    document.getElementById('pw-see').onclick = () => togglePasswordVisibility('pw', 'pw-see');
    document.getElementById('pw_c-see').onclick = () => togglePasswordVisibility('pw_c', 'pw_c-see');

    let userEmail = '';
    
    document.getElementById('id-check').addEventListener('click', function() {
        const identifier = document.getElementById('id').value.trim();
        const idInput = document.getElementById('id');
        const idCheckBtn = document.getElementById('id-check');
        const codeInput = document.getElementById('code');

        if(identifier === '') {
            hideErrorMessage('id');
            setupErrorMessage('id', '아이디를 입력해주세요');
            idInput.style.borderBottom = '1px solid red';
            return;
        }

        idCheckBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        idCheckBtn.disabled = true;

        fetch('/check_id_or_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier: identifier }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                userEmail = data.email;
                hideErrorMessage('id');
                setupsuccessMessage('id', '이메일로 인증코드가 전송됐습니다');
                idInput.style.borderBottom = '1px solid #03A9F4';
                document.querySelector('.code').style.display = 'block';
                
                idInput.disabled = true;
                idCheckBtn.disabled = true;
                idCheckBtn.style.pointerEvents = 'none';
                
                return fetch('/send_verification_code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail }),
                });
            } else {
                throw new Error('User not found');
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('이메일로 인증 코드가 전송되었습니다');
                idCheckBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                idCheckBtn.classList.add('checked');
                idInput.style.borderBottom = '1px solid gray';
                idInput.blur();
                codeInput.focus();
            } else {
                throw new Error('Failed to send verification code');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            hidesuccessMessage('id');
            if (error.message === 'User not found') {
                setupErrorMessage('id', '사용자를 찾을 수 없습니다');
            } else {
                setupErrorMessage('id', '오류가 발생했습니다. 다시 시도해주세요');
            }
            idInput.style.borderBottom = '1px solid red';
            idCheckBtn.innerHTML = '확인';
            idCheckBtn.disabled = false;
            idCheckBtn.style.pointerEvents = 'auto';
            idInput.disabled = false;
            idCheckBtn.classList.remove('checked');
        });
    });

    document.getElementById('code-check').addEventListener('click', function() {
        const code = document.getElementById('code').value.trim();
        const codeInput = document.getElementById('code');
        const codeCheckBtn = document.getElementById('code-check');
        const pwInput = document.getElementById('pw');

        if(code === '') {
            hideErrorMessage('code');
            setupErrorMessage('code', '인증코드를 입력해주세요');
            codeInput.style.borderBottom = '1px solid red';
            return;
        }

        codeCheckBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        codeCheckBtn.disabled = true;

        fetch('/verify_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, code: code }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideErrorMessage('code');
                codeCheckBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                document.querySelector('.pw_group').style.display = 'block';
                codeInput.style.borderBottom = '1px solid gray';
                codeInput.blur();
                pwInput.focus();
                codeInput.disabled = true;
                codeCheckBtn.disabled = true;
                codeCheckBtn.style.pointerEvents = 'none';
                codeCheckBtn.classList.add('checked');
            } else {
                throw new Error('Invalid or expired verification code');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            hidesuccessMessage('code');
            setupErrorMessage('code', '잘못된 인증 코드이거나 만료되었습니다');
            codeInput.style.borderBottom = '1px solid red';
            codeCheckBtn.innerHTML = '확인';
            codeInput.disabled = false;
            codeCheckBtn.disabled = false;
            codeCheckBtn.style.pointerEvents = 'auto';
            codeCheckBtn.classList.remove('checked');
        });
    });

    const pwInput = document.getElementById('pw');
    pwInput.addEventListener('input', validatePassword);
    pwInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.style.borderBottom = '1px solid #03A9F4';
        }
    });
    pwInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.style.borderBottom = '1px solid gray';
            hideErrorMessage('pw');
        } else {
            validatePassword.call(this);
        }
    });

    function validatePassword() {
        const password = this.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        
        if (password === '') {
            hideErrorMessage('pw');
            this.style.borderBottom = '1px solid #03A9F4';
        } else if (!passwordRegex.test(password)) {
            setupErrorMessage('pw', "8자 이상이며 대소문자와 숫자를 포함해야 합니다");
            this.style.borderBottom = '1px solid red';
        } else {
            hideErrorMessage('pw');
            this.style.borderBottom = '1px solid #03A9F4';
        }
    }

    const pwcInput = document.getElementById('pw_c');
    pwcInput.addEventListener('input', validateConfirmPassword);
    pwcInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.style.borderBottom = '1px solid #03A9F4';
        }
    });
    pwcInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.style.borderBottom = '1px solid gray';
            hideErrorMessage('pw_c');
        } else {
            validateConfirmPassword.call(this);
        }
    });

    function validateConfirmPassword() {
        const password = pwInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword === '') {
            hideErrorMessage('pw_c');
            this.style.borderBottom = '1px solid #03A9F4';
        } else if (password !== confirmPassword) {
            setupErrorMessage('pw_c', "비밀번호가 일치하지 않습니다");
            this.style.borderBottom = '1px solid red';
        } else {
            hideErrorMessage('pw_c');
            this.style.borderBottom = '1px solid #03A9F4';
        }
    }

    document.getElementById('submit').addEventListener('click', function() {
        const password = pwInput.value;
        const confirmPassword = pwcInput.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (password === '') {
            setupErrorMessage('pw', "비밀번호를 입력해주세요");
            return;
        }

        if (!passwordRegex.test(password)) {
            setupErrorMessage('pw', "8자 이상이며 대소문자와 숫자를 포함해야 합니다");
            return;
        }

        if (confirmPassword === '') {
            setupErrorMessage('pw_c', "비밀번호 확인을 입력해주세요");
            return;
        }

        if (password !== confirmPassword) {
            setupErrorMessage('pw_c', "비밀번호가 일치하지 않습니다");
            return;
        }

        this.disabled = true;
        this.style.opacity = '0.5';
        this.textContent = '비밀번호 변경 중...';

        fetch('/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier: userEmail, new_password: password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.href = '/login';
            } else {
                alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
                this.disabled = false;
                this.style.opacity = '1';
                this.textContent = '변경하기';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            this.disabled = false;
            this.style.opacity = '1';
            this.textContent = '변경하기';
        });
    });
});