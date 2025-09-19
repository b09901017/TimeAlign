document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATA & CONSTANTS (New Sweet Macaron Palette) ---
    const teamMates = [
        { name: '肇云', color: '#ffc2d1' }, // Strawberry Pink
        { name: '庭瑜', color: '#d7c7f4' }, // Taro Purple
        { name: '棨理', color: '#ffdcb3' }, // Peach Orange
        { name: '旭辰', color: '#c8e7e7ff' }, // Mint Green
    ];
    let filteredMember = null; // State for filtering

    const schedules = {
        '肇云': { 'Monday': { '2': '會計專業入門', '3': '會計專業入門', '4': '會計專業入門', '7': '創創東東', '8': '創創東東', '9': '創創東東', '10': '創創東東', 'A': '創創東東', 'B': '創創東東' }, 'Tuesday': { '7': '稅務法規', '8': '稅務法規', '9': '稅務法規' }, 'Wednesday': { '2': '中級會計專題', '3': '中級會計專題', '4': '中級會計專題', '8': '桌球初級', '9': '桌球初級' }, 'Thursday': { '7': '組織心理學', '8': '組織心理學', '9': '組織心理學', '10': '組織心理學' }, 'Friday': { '10': '企業併購', 'A': '企業併購', 'B': '企業併購' } },
        '庭瑜': { 'Monday': { '2': 'Python設計', '3': 'Python設計', '4': 'Python設計', '7': '創創東東', '8': '創創東東', '9': '創創東東', '10': '創創東東', 'A': '創創東東', 'B': '創創東東' }, 'Tuesday': { '2': '統計學實習', '3': '統計學實習', '4': '統計學實習', '7': '電子電路', '8': '電子電路' }, 'Wednesday': { '3': '普化丙', '4': '普化丙', '6': '工海海工概論', '7': '普物乙', '8': '普物乙', '9': '普物乙', '10': '社課', 'A': '社課', 'B': '社課' }, 'Thursday': { '3': '電子電路', '4': '電子電路', '6': '工程力學', '7': '工程力學', '8': '統計學實習', '9': '統計學實習' }, 'Friday': { '3': '普化丙', '4': '普化丙', '6': '貨幣銀行學', '7': '貨幣銀行學', '8': '貨幣銀行學' } },
        '棨理': { 'Monday': { '5': '實驗', '6': '實驗', '7': '創創東東', '8': '創創東東', '9': '創創東東', '10': '創創東東', 'A': '創創東東', 'B': '創創東東' }, 'Tuesday': { '3': '羽球', '4': '羽球' }, 'Wednesday': { '3': '工讀', '4': '工讀', '5': '工讀', '6': '工讀', '7': '演算法', '8': '演算法', '9': '演算法', '10': '社課', 'A': '社課', 'B': '社課' }, 'Thursday': { '3': '工讀', '4': '工讀', '5': '工讀', '6': '工讀', '7': '田園生活', '8': '田園生活', '9': '田園生活', '10': '社課', 'A': '社課', 'B': '社課' }, 'Friday': { '7': '國文', '8': '國文', '9': '國文' } },
        '旭辰': { 'Monday': { '3': { name: '隔周實驗室組meeting', type: 'odd_week' },'4': { name: '隔周實驗室組meeting', type: 'odd_week' },'7': '創創東東', '8': '創創東東', '9': '創創東東', '10': '創創東東', 'A': '創創東東', 'B': '創創東東' }, 'Thursday': { '3': '實驗室大團meeting', '4': '實驗室大團meeting', '5': '實驗室大團meeting' } },
    };
    const timeSections = { '上午': ['0', '1', '2', '3', '4'], '中午': ['5'], '下午': ['6', '7', '8', '9'], '晚上': ['10', 'A', 'B'] };
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayMap = { 'Monday': '週一', 'Tuesday': '週二', 'Wednesday': '週三', 'Thursday': '週四', 'Friday': '週五', 'Saturday': '週六', 'Sunday': '週日' };

    const grid = document.getElementById('heatmap-grid');
    const personLegend = document.getElementById('person-legend');
    const statusLegend = document.getElementById('status-legend');
    const themeToggle = document.getElementById('theme-toggle');
    const nowTooltip = document.getElementById('now-tooltip');

    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    const currentWeekType = (getWeekNumber(new Date()) % 2 === 0) ? 'even_week' : 'odd_week';

    function getActivity(personName, day, slotKey) {
        const event = schedules[personName]?.[day]?.[slotKey];
        if (!event) return null;
        if (typeof event === 'string') return event;
        if (event.type === currentWeekType || !event.type) return event.name;
        return null;
    }
    
    function render() {
        grid.innerHTML = '';

        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const membersToDisplay = filteredMember ? teamMates.filter(p => p.name === filteredMember) : teamMates;

        days.forEach((day, index) => {
            const column = document.createElement('div');
            column.className = 'day-column';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = dayMap[day];
            const dateLabel = document.createElement('div');
            dateLabel.className = 'date-label';
            const currentDate = new Date(monday);
            currentDate.setDate( monday.getDate() + index);
            dateLabel.textContent = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
            dayHeader.appendChild(dayName);
            dayHeader.appendChild(dateLabel);
            column.appendChild(dayHeader);

            Object.values(timeSections).forEach(slots => {
                const section = document.createElement('div');
                section.className = 'day-section';
                slots.forEach(slotKey => {
                    const slot = document.createElement('div');
                    slot.className = 'time-slot';
                    slot.dataset.day = day;
                    slot.dataset.slotKey = slotKey;
                    
                    const busyMembers = membersToDisplay
                        .map(p => ({ ...p, activity: getActivity(p.name, day, slotKey) }))
                        .filter(p => p.activity);
                    
                    const timeLabel = document.createElement('span');
                    timeLabel.className = 'time-slot-key';
                    timeLabel.textContent = slotKey;
                    
                    if (busyMembers.length === 0) {
                        slot.classList.add('all-free');
                    } else {
                        let tooltipContent = '';
                        busyMembers.forEach(p => {
                            const bar = document.createElement('div');
                            bar.className = 'slot-person-bar';
                            bar.style.backgroundColor = p.color;
                            slot.appendChild(bar);
                            tooltipContent += `${p.name}: ${p.activity}\n`;
                        });
                        const tooltip = document.createElement('div');
                        tooltip.className = 'tooltip';
                        tooltip.innerText = tooltipContent.trim();
                        slot.appendChild(tooltip);
                    }
                    slot.appendChild(timeLabel);
                    section.appendChild(slot);
                });
                column.appendChild(section);
            });
            grid.appendChild(column);
        });
    }
    
    function renderLegend() {
        if (!personLegend || !statusLegend) return;
        personLegend.innerHTML = '';

        teamMates.forEach(p => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `<div class="avatar" style="background-color: ${p.color};">${p.name.charAt(0)}</div><span>${p.name}</span>`;

            if (filteredMember) {
                if (p.name === filteredMember) {
                    item.classList.add('is-active');
                } else {
                    item.classList.add('is-inactive');
                }
            }

            item.addEventListener('click', () => {
                if (filteredMember === p.name) {
                    filteredMember = null;
                } else {
                    filteredMember = p.name;
                }
                render();
                renderLegend();
            });

            personLegend.appendChild(item);
        });

        const conflictExample = statusLegend.querySelector('.conflict-example');
        if (conflictExample) {
            conflictExample.innerHTML = '';
            teamMates.slice(0, 4).forEach(p => {
                const bar = document.createElement('div');
                bar.style.backgroundColor = p.color;
                conflictExample.appendChild(bar);
            });
        }
    }

    function updateNowIndicator() {
        const timeSlotDetails = {
            '0': { start: [7, 0], end: [8, 0] }, '1': { start: [8, 10], end: [9, 0] },
            '2': { start: [9, 10], end: [10, 0] }, '3': { start: [10, 20], end: [11, 10] },
            '4': { start: [11, 20], end: [12, 10] }, '5': { start: [12, 20], end: [13, 10] },
            '6': { start: [13, 20], end: [14, 10] }, '7': { start: [14, 20], end: [15, 10] },
            '8': { start: [15, 30], end: [16, 20] }, '9': { start: [16, 30], end: [17, 20] },
            '10': { start: [17, 30], end: [18, 20] }, 'A': { start: [18, 30], end: [19, 20] },
            'B': { start: [19, 25], end: [20, 15] }
        };

        const now = new Date();
        const currentDayName = days[(now.getDay() + 6) % 7];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const indicator = document.getElementById('now-indicator');

        if (!indicator || !grid) return;

        let activeSlotKey = null;
        let slotInfo = null;

        for (const key in timeSlotDetails) {
            const slot = timeSlotDetails[key];
            const startTime = slot.start[0] * 60 + slot.start[1];
            const endTime = slot.end[0] * 60 + slot.end[1];
            if (currentMinutes >= startTime && currentMinutes < endTime) {
                activeSlotKey = key;
                slotInfo = slot;
                break;
            }
        }
        
        if (!activeSlotKey) {
            indicator.style.display = 'none';
            return;
        }

        const targetSlotElement = grid.querySelector(`.time-slot[data-day='${currentDayName}'][data-slot-key='${activeSlotKey}']`);
        
        if (!targetSlotElement) {
            indicator.style.display = 'none';
            return;
        }

        const startTime = slotInfo.start[0] * 60 + slotInfo.start[1];
        const endTime = slotInfo.end[0] * 60 + slotInfo.end[1];
        const slotDuration = endTime - startTime;
        const minutesIntoSlot = currentMinutes - startTime;
        const progress = minutesIntoSlot / slotDuration;

        const container = document.getElementById('heatmap-container');
        const containerRect = container.getBoundingClientRect();
        const slotRect = targetSlotElement.getBoundingClientRect();
        
        // --- MODIFIED: Make the indicator protrude ---
        const protrusion = 10; // How many pixels to extend up and down
        const top = (slotRect.top - containerRect.top) - protrusion;
        const left = slotRect.left - containerRect.left + (slotRect.width * progress);
        const height = slotRect.height + (protrusion * 2);

        indicator.style.top = `${top}px`;
        indicator.style.left = `${left}px`;
        indicator.style.height = `${height}px`;
        indicator.style.display = 'block';
    }

    function updateTooltipTime() {
        if (!nowTooltip) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        nowTooltip.innerText = `${hours}:${minutes}:${seconds}`;
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboardTheme', theme);
        const iconHTML = theme === 'light' 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        if(themeToggle) themeToggle.innerHTML = iconHTML;
    }

    const preferredTheme = localStorage.getItem('dashboardTheme') || 'light';
    setTheme(preferredTheme);
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
    
    render();
    renderLegend();
    updateNowIndicator();
    updateTooltipTime();
    
    setInterval(updateNowIndicator, 60000);
    setInterval(updateTooltipTime, 1000);
});