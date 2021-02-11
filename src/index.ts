interface Transaction {
  id: number,
  description: string,
  amount: number,
  type: string,
};

class BudgetTracker {
  constructor(
    private transactions = this.loadTransactions(),
    private form = document.getElementById("transaction-form") as HTMLFormElement,
    private transactionList = document.getElementById("transactionList") as HTMLElement,
    private balance = document.getElementById("balance") as HTMLElement
  ) {
    this.initEventListeners();
    this.renderTransactions();
    this.updateBalance();
  };

  loadTransactions() {
    return JSON.parse(localStorage.getItem("transactions") as string) || [];
  };

  saveTransactions(): void {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  };

  initEventListeners(): void {
    this.form.addEventListener("submit", (e: SubmitEvent) => {
      e.preventDefault();
      this.addTransaction();
    });
  };

  clearForm(): void {
    (<HTMLInputElement>document.getElementById("description")).value = "";
    (<HTMLInputElement>document.getElementById("amount")).value = "";
  };

  addTransaction(): void {
    const description: string = (<HTMLInputElement>document.getElementById("description")).value.trim();
    const amount: number = parseFloat((<HTMLInputElement>document.getElementById("amount")).value);
    const type: string = (<HTMLInputElement>document.getElementById("type")).value;

    if (!description || isNaN(amount)) {
      alert("Please provide a valid description and amount.");
      return;
    };

    const transaction: Transaction = {
      id: Date.now(),
      description,
      amount: type === "expense" ? -amount : amount,
      type,
    };

    this.transactions.push(transaction);
    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
    this.clearForm();
  };

  renderTransactions(): void {
    this.transactionList.innerHTML = "";
    this.transactions
      .slice()
      .sort((a: Transaction, b: Transaction) => b.id - a.id)
      .forEach((transaction: Transaction) => {
        const transactionDiv = document.createElement("div");
        transactionDiv.classList.add("transaction", transaction.type);
        transactionDiv.innerHTML = `
            <span>${transaction.description}</span>
            <span class="transaction-amount-container"
              >$${Math.abs(transaction.amount).toFixed(
                2
              )} <button class="delete-btn" data-id="${
          transaction.id
        }">Delete</button></span
            >
        `;
        this.transactionList.appendChild(transactionDiv);
      });
    this.attachDeleteEventListeners();
  };

  attachDeleteEventListeners() {
    this.transactionList.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        this.deleteTransaction(Number((<HTMLButtonElement>button).dataset.id));
      });
    });
  };

  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter(
      (transaction: Transaction) => transaction.id !== id
    );

    this.saveTransactions();
    this.renderTransactions();
    this.updateBalance();
  };

  updateBalance() {
    const balance = this.transactions.reduce(
      (total: number, transaction: Transaction) => total + transaction.amount,
      0
    );

    this.balance.textContent = `Balance: $${balance.toFixed(2)}`;
    this.balance.style.color = balance >= 0 ? "#2ecc71" : "#e74c3c";
  };
};

const budgetTracker = new BudgetTracker();