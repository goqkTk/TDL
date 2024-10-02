document.addEventListener('DOMContentLoaded', function() {
    const typeInput = document.getElementById('type-input');
    const typeList = document.getElementById('list');
    const contentInput = document.getElementById('content');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageUploadContainer = document.getElementById('image-upload-container');

    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

    function isAllowedFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return ALLOWED_EXTENSIONS.includes(extension);
    }

    function showErrorMessage(inputId, message) {
        const input = document.getElementById(inputId);
        const inputGroup = input.closest('.type, .content, .image');
        let errorMessage = inputGroup.querySelector('.error-message');

        if (!errorMessage) {
            errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            inputGroup.appendChild(errorMessage);
        }

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
            input.classList.add('error');
        }
    }

    function hideErrorMessage(inputId) {
        const input = document.getElementById(inputId);
        const inputGroup = input.closest('.type, .content, .image');
        const errorMessage = inputGroup.querySelector('.error-message');

        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
            input.classList.remove('error');
        }
    }

    typeList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const selectedText = item.textContent.replace(item.querySelector('.tag').textContent, '').trim();
            typeInput.value = selectedText;
            typeList.style.display = 'none';
            hideErrorMessage('type-input');
        });
    });

    contentInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            hideErrorMessage('content');
        }
    });

    document.getElementById('submit').addEventListener('click', function(e) {
        e.preventDefault();
        const type = typeInput.value;
        const content = contentInput.value;

        let isValid = true;

        if (type.trim() === '') {
            showErrorMessage('type-input', '문의 유형을 선택해주세요');
            isValid = false;
        } else {
            hideErrorMessage('type-input');
        }

        if (content.trim() === '') {
            showErrorMessage('content', '문의 내용을 입력해주세요');
            isValid = false;
        } else {
            hideErrorMessage('content');
        }

        if (!isValid) {
            return;
        }

        const formData = new FormData();
        formData.append('type', type);
        formData.append('content', content);

        const imageFiles = document.querySelectorAll('.image-preview');
        for (let i = 0; i < imageFiles.length; i++) {
            const img = imageFiles[i];
            if (img.file) {
                formData.append('images', img.file, img.file.name);
            }
        }

        this.disabled = true;
        this.style.opacity = '0.5';
        this.textContent = '문의 등록 중...';

        fetch('/send_help', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                document.getElementById('type-input').value = '';
                document.getElementById('content').value = '';
                imagePreviewContainer.innerHTML = '';
                updateUploadButtonVisibility();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage('submit', '문의를 등록하지 못했습니다. 다시 시도해주세요');
        })
        .finally(() => {
            this.disabled = false;
            this.style.opacity = '1';
            this.textContent = '제출';
        });
    });

    typeInput.addEventListener('click', function() {
        typeList.style.display = typeList.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(e) {
        if (!typeInput.contains(e.target) && !typeList.contains(e.target)) {
            typeList.style.display = 'none';
        }
    });

    function updateUploadButtonVisibility() {
        const imageCount = imagePreviewContainer.querySelectorAll('.image-preview-container').length;
        if (imageCount >= 5) {
            uploadButton.style.display = 'none';
        } else {
            uploadButton.style.display = 'flex';
        }
        imageUploadContainer.appendChild(uploadButton);
    }

    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const imageCount = imagePreviewContainer.querySelectorAll('.image-preview-container').length;
        if (imageCount >= 5) {
            showErrorMessage('image-upload-container', '최대 5장까지만 업로드할 수 있습니다');
            return;
        }
        fileInput.click();
    });

    function handleFiles(files) {
        const imageCount = imagePreviewContainer.querySelectorAll('.image-preview-container').length;
        const remainingSlots = 5 - imageCount;
        const filesToProcess = Math.min(files.length, remainingSlots);

        let errorMessage = '';

        if (files.length > remainingSlots) {
            errorMessage = '최대 5장까지만 업로드할 수 있습니다';
        }

        let invalidFileFound = false;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!isAllowedFile(file)) {
                invalidFileFound = true;
                break;
            }
        }

        if (invalidFileFound) {
            errorMessage = 'png, jpg, jpeg, gif 확장자만 업로드할 수 있습니다';
        }

        if (errorMessage) {
            showErrorMessage('image-upload-container', errorMessage);
        } else {
            hideErrorMessage('image-upload-container');
        }

        for (let i = 0; i < filesToProcess; i++) {
            const file = files[i];
            if (isAllowedFile(file) && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-preview-container';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'image-preview';
                    img.file = file;
                    
                    const deleteIcon = document.createElement('i');
                    deleteIcon.className = 'fa-regular fa-circle-xmark delete-icon';
                    deleteIcon.addEventListener('click', function() {
                        imgContainer.remove();
                        updateUploadButtonVisibility();
                    });
                    
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(deleteIcon);
                    imagePreviewContainer.appendChild(imgContainer);
                    updateUploadButtonVisibility();
                };
                reader.readAsDataURL(file);
            }
        }
        updateUploadButtonVisibility();
    }

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    imageUploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadContainer.classList.add('drag-over');
    });

    imageUploadContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageUploadContainer.classList.remove('drag-over');
    });

    imageUploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadContainer.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    imageUploadContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        hideErrorMessage('image-upload-container');
    });
});