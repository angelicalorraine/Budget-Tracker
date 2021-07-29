let dbBudgetDB;


// create a new db request for a "BudgetDB" database.
const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
    // create object store called "BudgetStore" and set autoIncrement to true
    const db = event.target.result;
    const BudgetStore = db.createObjectStore("PendingDB", { autoIncrement: true });


};

request.onsuccess = function (event) {
    db = event.target.result;


    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    // log error here
};

function saveRecord(record) {
    const transaction = db.transaction(["PendingDB"], "readwrite");
    const BudgetStore = transaction.objectStore("PendingDB")
    BudgetStore.add(record);
    console.log(record);

}

function checkDatabase() {

    const transaction = db.transaction(["PendingDB"], "readwrite");
    const BudgetStore = transaction.objectStore("PendingDB")
    const getAll = BudgetStore.getAll();
    // open a transaction on your pending db
    // access your pending object store
    // get all records from store and set to a variable

    getAll.onsuccess = function () {
        console.log(getAll.result)
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["PendingDB"], "readwrite");
                    const BudgetStore = transaction.objectStore("PendingDB")
                    BudgetStore.clear();
                    // if successful, open a transaction on your pending db
                    // access your pending object store
                    // clear all items in your store
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
