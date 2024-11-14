document.addEventListener('DOMContentLoaded', function() {
    const weekBtn = document.querySelector('.week-selector-btn');
    const weekDropdown = document.querySelector('.week-dropdown');
    const weekDropdownItems = document.querySelectorAll('.week-dropdown-item');
    const container = document.querySelector('.container');
    
    function initializeWeek() {
        const savedWeek = localStorage.getItem('week') || 'sunday';
        container.setAttribute('data-week', savedWeek);
        updateSelectedWeek(savedWeek === 'sunday' ? '일요일' : '월요일');
    }

    function updateSelectedWeek(weekName) {
        weekBtn.textContent = weekName;
        weekDropdownItems.forEach(item => {
            item.classList.toggle('selected', item.textContent === weekName);
        });
    }

    weekBtn.addEventListener('click', () => {
        weekBtn.classList.toggle('active');
        weekDropdown.classList.toggle('show');
    });

    weekDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const weekName = item.textContent;
            const week = weekName === '일요일' ? 'sunday' : 'monday';
            
            container.setAttribute('data-week', week);
            localStorage.setItem('week', week);
            
            updateSelectedWeek(weekName);
            weekBtn.classList.remove('active');
            weekDropdown.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.week-selector')) {
            weekBtn.classList.remove('active');
            weekDropdown.classList.remove('show');
        }
    });
    initializeWeek();
});