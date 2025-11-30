

const account1 = {
  owner: "Harsh Gangwani",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,
};

const account2 = {
  owner: "Aryan Gupta",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const accounts = [account1, account2];

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn");
const btnLoan = document.querySelector(".form--loan .form__btn");
const btnClose = document.querySelector(".form--close .form__btn");
const btnSort = document.querySelector(".btn--sort");
const themeToggle = document.querySelector("#theme-toggle");

const inputLoginUser = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUser = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");


const formatCurrency = (value) =>
  `${Math.abs(value).toFixed(2)}€`;

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = (acc) => {
  const incomes = acc.movements.filter(m => m > 0).reduce((a, b) => a + b, 0);
  const out = acc.movements.filter(m => m < 0).reduce((a, b) => a + b, 0);
  const interest = acc.movements
    .filter(m => m > 0)
    .map(d => (d * acc.interestRate) / 100)
    .filter(i => i >= 1)
    .reduce((a, b) => a + b, 0);

  labelSumIn.textContent = `${incomes.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// Generate usernames automatically
const createUsernames = (accs) => {
  accs.forEach(acc => {
    acc.username = acc.owner.toLowerCase().split(" ").map(n => n[0]).join("");
  });
};
createUsernames(accounts);

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row slide-up">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>
        <div class="movements__date">${i === 0 ? "Today" : `${i} days ago`}</div>
        <div class="movements__value">${formatCurrency(mov)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("beforeend", html);
  });
};

let timer;
const startLogoutTimer = () => {
  let time = 300;

  const tick = () => {
    let min = String(Math.trunc(time / 60)).padStart(2, "0");
    let sec = String(time % 60).padStart(2, "0");
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      logout();
    }

    time--;
  };

  clearInterval(timer);
  tick();
  timer = setInterval(tick, 1000);
};

const updateUI = (acc) => {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};


let currentAccount;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  const user = inputLoginUser.value.toLowerCase();
  const pin = Number(inputLoginPin.value);

  currentAccount = accounts.find(acc => acc.username === user);

  if (currentAccount?.pin === pin) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}!`;

    labelDate.textContent = new Date().toLocaleDateString();

    updateUI(currentAccount);
    containerApp.style.opacity = 1;

    startLogoutTimer();
  } else {
    alert("Wrong username or PIN!");
  }

  inputLoginUser.value = inputLoginPin.value = "";
});


document.querySelector(".form--transfer").addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);

  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiver &&
    currentAccount.balance >= amount &&
    receiver?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    updateUI(currentAccount);
    startLogoutTimer();
  }
});

document.querySelector(".form--loan").addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some(mov => mov >= amount * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      updateUI(currentAccount);
      startLogoutTimer();
      alert("Loan Approved!");
    }, 700);
  } else {
    alert("Loan Denied!");
  }

  inputLoanAmount.value = "";
});

document.querySelector(".form--close").addEventListener("submit", function (e) {
  e.preventDefault();

  if (
    inputCloseUser.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(index, 1);

    logout();
    alert("Account Closed");
  } else {
    alert("Wrong Credentials!");
  }

  inputCloseUser.value = inputClosePin.value = "";
});


let sorted = false;
btnSort.addEventListener("click", () => {
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});


function logout() {
  currentAccount = null;
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Log in to get started";
  clearInterval(timer);
  labelTimer.textContent = "00:00";
}

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "bankist-theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

if (localStorage.getItem("bankist-theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}
