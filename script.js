document.addEventListener('DOMContentLoaded', () => {
    let totalIncome = 0;
    let totalSpent = 0;
    let inHandAmount = 0;
    let incomeHistory = []; // Store all income entries with timestamps
    let expenseHistory = []; // Store all expense entries with timestamps

    // DOM Elements
    const incomeInput = document.getElementById('income-input');
    const totalIncomeDisplay = document.getElementById('total-income');
    const inHandAmountDisplay = document.getElementById('in-hand-amount');
    const expenseForm = document.getElementById('expense-form');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseCategory = document.getElementById('expense-category');
    const expenseDescription = document.getElementById('expense-description');
    const totalSpentDisplay = document.getElementById('total-spent');
    const todaySummary = document.getElementById('today-summary');
    const weekSummary = document.getElementById('week-summary');
    const monthSummary = document.getElementById('month-summary');

    // Income Input - Add with Enter key
    incomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && incomeInput.value !== '') {
            addIncome(parseFloat(incomeInput.value));
            incomeInput.value = '';
        }
    });

    // Add Income
    function addIncome(amount) {
        const timestamp = new Date(); // Store the timestamp
        totalIncome += amount;
        inHandAmount += amount;
        incomeHistory.push({ amount, timestamp }); // Track income history with date
        updateIncomeDisplay();
        updateSummary(); // Update income and expense in Today, Week, Month summaries
    }

    // Update Income & In-Hand Amount Display
    function updateIncomeDisplay() {
        totalIncomeDisplay.textContent = `₹${totalIncome.toFixed(2)}`;
        inHandAmountDisplay.textContent = `₹${inHandAmount.toFixed(2)}`;
    }

    // Expense Form Submission
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const expense = {
            amount: parseFloat(expenseAmount.value),
            category: expenseCategory.value,
            description: expenseDescription.value,
            date: new Date()
        };

        if (expense.amount > 0 && expense.category) {
            addExpense(expense);
        }

        expenseAmount.value = '';
        expenseCategory.value = '';
        expenseDescription.value = '';
    });

    // Add Expense
    function addExpense(expense) {
        totalSpent += expense.amount;
        inHandAmount -= expense.amount;
        expenseHistory.push({ amount: expense.amount, category: expense.category, date: expense.date });
        updateIncomeDisplay();
        totalSpentDisplay.textContent = `₹${totalSpent.toFixed(2)}`;
        addExpenseToSummary(expense);
        updateSummary(); // Update income and expense in Today, Week, Month summaries
    }

    // Add Expense to Summary (Today, Week, Month) with Edit/Delete Option on Right Click / Long Press
    function addExpenseToSummary(expense) {
        const li = document.createElement('li');
        li.innerHTML = `${expense.category}: ₹${expense.amount.toFixed(2)} - ${expense.date.toLocaleDateString()} <span class="options">•••</span>`;
        todaySummary.appendChild(li);

        // Add right-click or long-press event for edit/delete options
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showEditDeleteOptions(e, expense, li);
        });

        // Add long-press event for mobile
        let timeout;
        li.addEventListener('touchstart', () => {
            timeout = setTimeout(() => {
                showEditDeleteOptions(null, expense, li);
            }, 800); // 800ms for long press
        });
        li.addEventListener('touchend', () => clearTimeout(timeout));
    }

    // Show Edit/Delete Options
    function showEditDeleteOptions(event, expense, li) {
        const menu = document.createElement('div');
        menu.classList.add('edit-delete-menu');
        menu.innerHTML = `
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;

        // Position the menu near the cursor or on top of the element
        if (event) {
            menu.style.top = `${event.clientY}px`;
            menu.style.left = `${event.clientX}px`;
        } else {
            li.appendChild(menu); // For mobile, append it below the item
        }

        document.body.appendChild(menu);

        // Handle Edit
        menu.querySelector('.edit-btn').addEventListener('click', () => {
            editExpense(expense, li);
            document.body.removeChild(menu);
        });

        // Handle Delete
        menu.querySelector('.delete-btn').addEventListener('click', () => {
            removeExpense(expense, li);
            document.body.removeChild(menu);
        });

        // Remove menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
            }
        }, { once: true });
    }

    // Edit Expense Function
    function editExpense(expense, li) {
        const newAmount = prompt('Edit amount:', expense.amount);
        const newCategory = prompt('Edit category:', expense.category);

        if (newAmount && newCategory) {
            // Update expense object
            totalSpent -= expense.amount;
            inHandAmount += expense.amount;

            expense.amount = parseFloat(newAmount);
            expense.category = newCategory;

            totalSpent += expense.amount;
            inHandAmount -= expense.amount;

            // Update display
            li.innerHTML = `${expense.category}: ₹${expense.amount.toFixed(2)} - ${expense.date.toLocaleDateString()} <span class="options">•••</span>`;
            updateIncomeDisplay();
            totalSpentDisplay.textContent = `₹${totalSpent.toFixed(2)}`;
            updateSummary();
        }
    }

    // Remove Expense Function
    function removeExpense(expense, li) {
        // Remove expense from DOM
        li.remove();

        // Update totals and display
        totalSpent -= expense.amount;
        inHandAmount += expense.amount;
        updateIncomeDisplay();
        totalSpentDisplay.textContent = `₹${totalSpent.toFixed(2)}`;

        // Remove from expense history
        expenseHistory = expenseHistory.filter(e => e.amount !== expense.amount || e.date.getTime() !== expense.date.getTime());

        // Update the week and month summaries after removing the expense
        updateSummary();
    }

    // Update Summary for Today, Week, and Month
    function updateSummary() {
        const todayIncome = calculateTodayIncome();
        const todaySpent = calculateTodaySpent();
        const weeklyIncome = calculateWeeklyIncome();
        const weeklySpent = calculateWeeklySpent();
        const monthlyIncome = calculateMonthlyIncome();
        const monthlySpent = calculateMonthlySpent();

        // Generate detailed expense list for today, week, and month
        todaySummary.innerHTML = `
            <li><strong>Today's Income: </strong>₹${todayIncome.toFixed(2)}</li>
            <li><strong>Today's Spent: </strong>₹${todaySpent.toFixed(2)}</li>
            ${generateExpenseList('today')}
        `;
        weekSummary.innerHTML = `
            <li><strong>Weekly Income: </strong>₹${weeklyIncome.toFixed(2)}</li>
            <li><strong>Weekly Spent: </strong>₹${weeklySpent.toFixed(2)}</li>
            ${generateExpenseList('week')}
        `;
        monthSummary.innerHTML = `
            <li><strong>Monthly Income: </strong>₹${monthlyIncome.toFixed(2)}</li>
            <li><strong>Monthly Spent: </strong>₹${monthlySpent.toFixed(2)}</li>
            ${generateExpenseList('month')}
        `;
    }

    // Generate Expense List for Today, Week, or Month
    function generateExpenseList(period) {
        let filteredExpenses = [];

        if (period === 'today') {
            filteredExpenses = expenseHistory.filter(expense => isToday(expense.date));
            if (filteredExpenses.length === 0) return `<li>No expenses for today.</li>`;
            return filteredExpenses.map(expense => `
                <li>${expense.category}: ₹${expense.amount.toFixed(2)} - ${expense.date.toLocaleDateString()}</li>
            `).join('');
        }

        if (period === 'week') {
            return generateWeeklyExpenseList();
        }

        if (period === 'month') {
            return generateMonthlyExpenseList();
        }

        return `<li>No expenses for this period.</li>`;
    }

    // Generate Weekly Expense List (Grouped by Days)
    function generateWeeklyExpenseList() {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const expensesByDay = {};

        // Initialize each day of the week
        daysOfWeek.forEach(day => {
            expensesByDay[day] = 0;
        });

        // Group expenses by day of the week
        expenseHistory.filter(expense => isThisWeek(expense.date)).forEach(expense => {
            const dayName = daysOfWeek[expense.date.getDay()];
            expensesByDay[dayName] += expense.amount;
        });

        // Generate HTML list of daily expenses
        return Object.entries(expensesByDay).map(([day, amount]) => `
            <li>${day}: ₹${amount.toFixed(2)}</li>
        `).join('');
    }

    // Generate Monthly Expense List (Grouped by Weeks)
    function generateMonthlyExpenseList() {
        const weeksOfMonth = {
            'Week 1': 0,
            'Week 2': 0,
            'Week 3': 0,
            'Week 4': 0,
            'Week 5': 0
        };

        expenseHistory.filter(expense => isThisMonth(expense.date)).forEach(expense => {
            const weekNumber = getWeekOfMonth(expense.date);
            weeksOfMonth[`Week ${weekNumber}`] += expense.amount;
        });

        return Object.entries(weeksOfMonth).map(([week, amount]) => `
            <li>${week}: ₹${amount.toFixed(2)}</li>
        `).join('');
    }

    // Utility Functions for Date Comparisons
    function isToday(date) {
        const today = new Date();
        return today.toDateString() === date.toDateString();
    }

    function isThisWeek(date) {
        const today = new Date();
        const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
        return date >= oneWeekAgo && date <= new Date();
    }

    function isThisMonth(date) {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    function getWeekOfMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return Math.ceil((date.getDate() + firstDayOfMonth) / 7);
    }

    function calculateTodayIncome() {
        return incomeHistory.filter(income => isToday(income.timestamp)).reduce((sum, income) => sum + income.amount, 0);
    }

    function calculateTodaySpent() {
        return expenseHistory.filter(expense => isToday(expense.date)).reduce((sum, expense) => sum + expense.amount, 0);
    }

    function calculateWeeklyIncome() {
        return incomeHistory.filter(income => isThisWeek(income.timestamp)).reduce((sum, income) => sum + income.amount, 0);
    }

    function calculateWeeklySpent() {
        return expenseHistory.filter(expense => isThisWeek(expense.date)).reduce((sum, expense) => sum + expense.amount, 0);
    }

    function calculateMonthlyIncome() {
        return incomeHistory.filter(income => isThisMonth(income.timestamp)).reduce((sum, income) => sum + income.amount, 0);
    }

    function calculateMonthlySpent() {
        return expenseHistory.filter(expense => isThisMonth(expense.date)).reduce((sum, expense) => sum + expense.amount, 0);
    }
});
