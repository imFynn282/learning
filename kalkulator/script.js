class Calculator {
    constructor(historyElement, displayElement, historyListElement) {
        this.historyElement = historyElement;
        this.displayElement = displayElement;
        this.historyListElement = historyListElement;
        this.clickSound = document.getElementById('click-sound');
        this.clear();
    }

    playSound() {
        this.clickSound.currentTime = 0;
        this.clickSound.play().catch(e => console.log('Sound blocked by browser policy'));
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.shouldResetScreen) return;
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    handlePercent() {
        if (this.currentOperand === '') return;
        
        const current = parseFloat(this.currentOperand);
        
        // Logika: 200 + 10% -> 220
        if (this.previousOperand !== '' && (this.operation === '+' || this.operation === '-')) {
            const prev = parseFloat(this.previousOperand);
            const percentValue = (prev * current) / 100;
            this.currentOperand = percentValue.toString();
        } else {
            // Logika: 50% -> 0.5
            this.currentOperand = (current / 100).toString();
        }
        
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Tidak bisa dibagi 0';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.shouldResetScreen = true;
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            case '**':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        const historyItem = `${prev} ${this.getDisplayOperator(this.operation)} ${current} = ${computation}`;
        this.addHistoryLog(historyItem);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    getDisplayOperator(op) {
        if (op === '*') return '×';
        if (op === '/') return '÷';
        if (op === '**') return '^';
        return op;
    }

    addHistoryLog(text) {
        const li = document.createElement('li');
        li.innerText = text;
        this.historyListElement.prepend(li);
    }

    updateDisplay() {
        this.displayElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.historyElement.innerText = `${this.previousOperand} ${this.getDisplayOperator(this.operation)}`;
        } else {
            this.historyElement.innerText = '';
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const historyElement = document.getElementById('history');
    const displayElement = document.getElementById('display');
    const historyListElement = document.getElementById('history-list');
    const themeBtn = document.getElementById('theme-btn');
    
    const calculator = new Calculator(historyElement, displayElement, historyListElement);

    // Number Buttons
    document.querySelectorAll('[data-number]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.playSound();
            calculator.appendNumber(button.innerText);
        });
    });

    // Operator Buttons
    document.querySelectorAll('[data-operator]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.playSound();
            calculator.chooseOperation(button.getAttribute('data-operator'));
        });
    });

    // Action Buttons
    document.querySelector('[data-action="calculate"]').addEventListener('click', () => {
        calculator.playSound();
        calculator.compute();
    });

    document.querySelector('[data-action="all-clear"]').addEventListener('click', () => {
        calculator.playSound();
        calculator.clear();
    });

    document.querySelector('[data-action="delete"]').addEventListener('click', () => {
        calculator.playSound();
        calculator.delete();
    });

    document.querySelector('[data-action="percent"]').addEventListener('click', () => {
        calculator.playSound();
        calculator.handlePercent();
    });

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeBtn.querySelector('.icon').innerText = isDark ? '🌙' : '☀️';
    });
});
