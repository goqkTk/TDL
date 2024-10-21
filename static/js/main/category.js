document.addEventListener('DOMContentLoaded', function() {
    const favoriteBtns = document.querySelectorAll('.favorite-btn');

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
});