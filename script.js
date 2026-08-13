// ========================================================
// SABARIMALA TEMPLE HUBBALLI TMS — SCRIPT (EXACT DHAM ADMIN)
// ========================================================

// --- GOOGLE SPREADSHEET CONFIGURATION ---
// Set your Google Apps Script Web App URL here after deploying the script.
const API_URL = "https://script.google.com/macros/s/AKfycbwrxqufBYldX0D_evvfynkZLNs2sqUScyD2i9zCQS9tJE7A_a5_cb0KNkTD_U_2JUj7Bg/exec";

// Official 25 Seva List (From Reference Image 1000053592.jpg)
const PREDEFINED_SEVAS = [
    { id: 1, name: "Daily Pooja", defaultPrice: 101 },
    { id: 2, name: "Daily Pooja & Bhajan", defaultPrice: 251 },
    { id: 3, name: "Special Pooja & Bhajan", defaultPrice: 501 },
    { id: 4, name: "Maha Annadanam", defaultPrice: 5001 },
    { id: 5, name: "Annadanam", defaultPrice: 1001 },
    { id: 6, name: "Hundi collection", defaultPrice: 500 },
    { id: 7, name: "Resale Amount", defaultPrice: 250 },
    { id: 8, name: "Misc", defaultPrice: 100 },
    { id: 9, name: "Second Saturday Pooja", defaultPrice: 501 },
    { id: 10, name: "Donation for Building development Fund", defaultPrice: 1001 },
    { id: 11, name: "Donation for Devi Temple", defaultPrice: 501 },
    { id: 12, name: "Ganapathi Homam", defaultPrice: 351 },
    { id: 13, name: "Rudrabhishekam (11 items)", defaultPrice: 1001 },
    { id: 14, name: "Laksharchana", defaultPrice: 1001 },
    { id: 15, name: "Kumkumarchana", defaultPrice: 151 },
    { id: 16, name: "Annadanam (Janatha)", defaultPrice: 501 },
    { id: 17, name: "Annadanam Special", defaultPrice: 2001 },
    { id: 18, name: "Maladharanam", defaultPrice: 101 },
    { id: 19, name: "Irumudinira", defaultPrice: 501 },
    { id: 20, name: "Ayyappaswamy Sahasranama Recital", defaultPrice: 251 },
    { id: 21, name: "Ayyappaswamy Ashtotharam Recital", defaultPrice: 151 },
    { id: 22, name: "Lalitha Sahasranama Recital", defaultPrice: 251 },
    { id: 23, name: "Devi Ashtotharam Recital", defaultPrice: 151 },
    { id: 24, name: "Abhishekam (Special)", defaultPrice: 501 },
    { id: 25, name: "Abhishekam (One item)", defaultPrice: 101 },
    { id: 99, name: "Custom Seva / Other Purpose", defaultPrice: 0 }
];

const EXPENSE_NAMES = {
    "1": "Printing, Stationery & Xerox",
    "2": "CA Fees",
    "3": "AGB/EGB Expense",
    "4": "Pooja Expense",
    "5": "Mahaannadhanam Expense",
    "6": "Maha Prasadam",
    "7": "Deputy Register Expense",
    "8": "Labour",
    "9": "Electricity Charges",
    "10": "Temple Property Tax",
    "11": "Temple Construction Charges",
    "12": "Staff Salary (Priest)",
    "13": "Staff Salary (Cleaning Labour)",
    "14": "Miscellaneous",
    "15": "Internet Charges"
};

// Initial Sample Receipts
const INITIAL_RECEIPTS = [
    {
        id: "001",
        date: "2026-08-01",
        time: "10:15 AM",
        devoteeName: "Priyanshu Sharma",
        mobile: "7014311772",
        sevaName: "Daily Pooja & Bhajan",
        amount: 251,
        paymentMode: "Cash",
        status: "COMPLETED",
        createdAt: new Date("2026-08-01T10:15:00").getTime()
    },
    {
        id: "002",
        date: "2026-08-01",
        time: "09:30 AM",
        devoteeName: "Manoj Kumar Sharma",
        mobile: "8561805504",
        sevaName: "Special Pooja & Bhajan",
        amount: 501,
        paymentMode: "UPI",
        status: "COMPLETED",
        createdAt: new Date("2026-08-01T09:30:00").getTime()
    },
    {
        id: "003",
        date: "2026-08-01",
        time: "08:45 AM",
        devoteeName: "Suresh Patel",
        mobile: "9845012345",
        sevaName: "Maha Annadanam",
        amount: 5001,
        paymentMode: "Cash",
        status: "COMPLETED",
        createdAt: new Date("2026-08-01T08:45:00").getTime()
    }
];

// LocalStorage State
let receiptsData = JSON.parse(localStorage.getItem("sabari_receipts")) || INITIAL_RECEIPTS;

function saveReceipts() {
    localStorage.setItem("sabari_receipts", JSON.stringify(receiptsData));
}

// DATE FORMATTER: YYYY-MM-DD to DD-MM-YYYY
function formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// NUMBER TO WORDS (Indian System)
function numberToWords(num) {
    if (isNaN(num) || num === 0) return "Rupees Zero Only";
    
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    }

    return "Rupees " + inWords(Math.floor(num)) + " Only";
}

function generateReceiptNo() {
    let maxCount = 0;
    receiptsData.forEach(r => {
        if (r.id) {
            const match = r.id.match(/\d+$/);
            if (match) {
                const countNum = parseInt(match[0], 10);
                if (!isNaN(countNum) && countNum > maxCount) {
                    maxCount = countNum;
                }
            }
        }
    });
    
    const nextCount = maxCount + 1;
    return String(nextCount).padStart(3, '0');
}

function generateVoucherNo() {
    return generateReceiptNo();
}

// AUTHENTICATION SECURITY LOCK
function checkAuth() {
    const isLoggedIn = localStorage.getItem("sabari_logged_in") === "true";
    const loginScreen = document.getElementById("loginScreen");
    const protectedContent = document.getElementById("protectedContent");

    if (isLoggedIn) {
        if (loginScreen) loginScreen.style.display = "none";
        if (protectedContent) protectedContent.style.display = "flex";
    } else {
        if (loginScreen) loginScreen.style.display = "flex";
        if (protectedContent) protectedContent.style.display = "none";
    }
}

window.lockSession = function() {
    localStorage.removeItem("sabari_logged_in");
    checkAuth();
};

// INITIALIZE DOM
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication status first
    checkAuth();
    
    const authForm = document.getElementById("authForm");
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("authEmail").value.trim();
            const password = document.getElementById("authPassword").value.trim();
            const errMsg = document.getElementById("authErrorMessage");

            // Credentials check: kushsharma.cor@gmail.com / 123456
            if (email === "kushsharma.cor@gmail.com" && password === "123456") {
                localStorage.setItem("sabari_logged_in", "true");
                if (errMsg) errMsg.style.display = "none";
                checkAuth();
                
                // Refresh views and fetch from sheets when unlocking
                renderAllViews();
                syncWithGoogleSheets();
            } else {
                if (errMsg) errMsg.style.display = "block";
            }
        });
    }

    initNavigation();
    initSevaSelectOptions();
    initFormHandling();
    initFiltersAndSearch();
    renderAllViews();
    
    // Sync with Google Sheets on load
    syncWithGoogleSheets();

    if (window.lucide) {
        lucide.createIcons();
    }

    const sevaDateInput = document.getElementById("sevaDate");
    if (sevaDateInput) sevaDateInput.value = new Date().toISOString().split('T')[0];
});

// SYSTEM INFO MODAL (EXACT DHAM ADMIN IMPLEMENTATION)
function openSystemInfoModal() {
    const modal = document.getElementById('systemInfoModal');
    const iconBox = document.getElementById('sysIconBox');
    const icon = document.getElementById('sysIcon');
    const title = document.getElementById('sysTitle');
    const subtitle = document.getElementById('sysSubtitle');
    const badge = document.getElementById('sysStatusBadge');
    const label = document.getElementById('sysStatusLabel');

    if (!modal) return;

    if (navigator.onLine) {
        if (badge) badge.className = 'status-badge online';
        if (label) label.innerText = 'System Live';
        if (iconBox) {
            iconBox.style.background = '#dcfce7';
            iconBox.style.color = '#10b981';
            iconBox.className = 'is-online';
        }
        if (icon) icon.setAttribute('data-lucide', 'check-circle');
        if (title) {
            title.innerText = 'System Running Smoothly';
            title.style.color = '#0f172a';
        }
        if (subtitle) subtitle.innerText = 'Internet Connected. All services are operational.';
    } else {
        if (badge) badge.className = 'status-badge offline';
        if (label) label.innerText = 'System Offline';
        if (iconBox) {
            iconBox.style.background = '#fee2e2';
            iconBox.style.color = '#dc2626';
            iconBox.className = 'is-offline';
        }
        if (icon) icon.setAttribute('data-lucide', 'wifi-off');
        if (title) {
            title.innerText = 'System Offline';
            title.style.color = '#dc2626';
        }
        if (subtitle) subtitle.innerText = 'No internet connection. Waiting for reconnect...';
    }

    modal.style.display = 'flex';
    if (window.lucide) {
        lucide.createIcons();
    }
}

window.addEventListener('offline', openSystemInfoModal);
window.addEventListener('online', () => {
    openSystemInfoModal();
    syncWithGoogleSheets();
});

// NAVIGATION
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const pageTitle = document.getElementById("pageTitle");
    const pageSub = document.getElementById("pageSub");

    const titlesMap = {
        "custom-bill": { title: "Create Inward Invoice", sub: "ChittorTech TMS — Inward Receipts & Billing" },
        "outward-bill": { title: "Create Outward Invoice", sub: "ChittorTech TMS — Outward Expense & Vouchers" },
        "registry": { title: "Donation Registry", sub: "Sabarimala Sri Ayyappaswamy Temple — Management Dashboard" },
        "how-to-use": { title: "How To Use", sub: "Complete User Manual & System Operating Guide" }
    };

    function switchTab(targetTab) {
        navLinks.forEach(nl => {
            if (nl.getAttribute("data-tab") === targetTab) {
                nl.classList.add("active");
            } else {
                nl.classList.remove("active");
            }
        });

        tabPanes.forEach(tp => {
            if (tp.id === `tab-${targetTab}`) {
                tp.style.display = "block";
                tp.classList.add("active");
            } else {
                tp.style.display = "none";
                tp.classList.remove("active");
            }
        });

        if (titlesMap[targetTab]) {
            if (pageTitle) pageTitle.textContent = titlesMap[targetTab].title;
            if (pageSub) pageSub.textContent = titlesMap[targetTab].sub;
        }

        localStorage.setItem("sabari_active_tab", targetTab);
        renderAllViews();
        if (window.lucide) lucide.createIcons();
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetTab = link.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Restore persisted tab or default to custom-bill
    const savedTab = localStorage.getItem("sabari_active_tab") || "custom-bill";
    switchTab(savedTab);
}

// POPULATE SEVA OPTIONS
function initSevaSelectOptions() {
    const sevaSelect = document.getElementById("sevaSelect");
    const aboutSevasList = document.getElementById("aboutSevasList");

    if (sevaSelect) {
        sevaSelect.innerHTML = `<option value="">-- Choose Seva (25 Predefined Options) --</option>`;
        PREDEFINED_SEVAS.forEach(seva => {
            const opt = document.createElement("option");
            opt.value = seva.id;
            opt.textContent = `${seva.id < 99 ? seva.id + '. ' : ''}${seva.name}`;
            sevaSelect.appendChild(opt);
        });
    }

    if (aboutSevasList) {
        aboutSevasList.innerHTML = PREDEFINED_SEVAS.filter(s => s.id < 99).map(s => `
            <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; color: #7c2d12; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;" class="seva-pill">
                <span>${s.name}</span>
                <span style="font-size: 0.62rem; background: #ea580c; color: #ffffff; padding: 1px 6px; border-radius: 100px; font-weight: 900;">#${s.id}</span>
            </div>
        `).join('');
    }
}

// FORM HANDLING
function initFormHandling() {
    const sevaSelect = document.getElementById("sevaSelect");
    const customSevaRow = document.getElementById("customSevaRow");
    const customSevaName = document.getElementById("customSevaName");
    const amountInput = document.getElementById("amount");
    const receiptNoInput = document.getElementById("receiptNo");
    const amountInWordsDiv = document.getElementById("amountInWords");
    const paymentMode = document.getElementById("paymentMode");
    const paymentRefRow = document.getElementById("paymentRefRow");
    const paymentRefLabel = document.getElementById("paymentRefLabel");
    const paymentRefInput = document.getElementById("paymentRefInput");
    const devoteeNameInput = document.getElementById("devoteeName");
    const sevaDateInput = document.getElementById("sevaDate");
    const invoiceForm = document.getElementById("invoiceForm");

    if (receiptNoInput) receiptNoInput.value = generateReceiptNo();

    function handlePaymentModeChange() {
        if (!paymentMode) return;
        const val = paymentMode.value;
        if (val === "UPI") {
            if (paymentRefRow) paymentRefRow.style.display = "block";
            if (paymentRefLabel) paymentRefLabel.textContent = "TRANSACTION / UPI ID *";
            if (paymentRefInput) {
                paymentRefInput.placeholder = "e.g. 423981726354";
                paymentRefInput.required = true;
            }
        } else if (val === "Cheque") {
            if (paymentRefRow) paymentRefRow.style.display = "block";
            if (paymentRefLabel) paymentRefLabel.textContent = "CHEQUE NUMBER *";
            if (paymentRefInput) {
                paymentRefInput.placeholder = "e.g. CHQ-882910";
                paymentRefInput.required = true;
            }
        } else {
            if (paymentRefRow) paymentRefRow.style.display = "none";
            if (paymentRefInput) {
                paymentRefInput.value = "";
                paymentRefInput.required = false;
            }
        }
        updateVoucherPreview();
    }

    if (paymentMode) {
        paymentMode.addEventListener("change", handlePaymentModeChange);
    }

    if (sevaSelect) {
        sevaSelect.addEventListener("change", () => {
            const val = parseInt(sevaSelect.value);
            if (val === 99) {
                customSevaRow.style.display = "block";
            } else {
                customSevaRow.style.display = "none";
            }
            updateAmountInWords();
            updateVoucherPreview();
        });
    }

    [amountInput, devoteeNameInput, sevaDateInput, customSevaName, paymentMode, paymentRefInput, receiptNoInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                updateAmountInWords();
                updateVoucherPreview();
            });
            input.addEventListener("change", () => {
                updateAmountInWords();
                updateVoucherPreview();
            });
        }
    });

    function updateAmountInWords() {
        const amt = parseFloat(amountInput.value) || 0;
        if (amountInWordsDiv) amountInWordsDiv.textContent = numberToWords(amt);
    }

    if (invoiceForm) {
        invoiceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const amt = parseFloat(amountInput.value);
            if (!amt || amt <= 0) {
                alert("Please enter a valid amount!");
                return;
            }

            let sevaText = "";
            const selectedVal = parseInt(sevaSelect.value);
            if (selectedVal === 99) {
                sevaText = customSevaName.value.trim() || "Custom Temple Seva";
            } else {
                const found = PREDEFINED_SEVAS.find(s => s.id === selectedVal);
                sevaText = found ? found.name : "Temple Donation";
            }

            let modeVal = paymentMode.value;
            const refVal = paymentRefInput ? paymentRefInput.value.trim() : "";
            if (modeVal === "UPI" && refVal) {
                modeVal = `UPI (${refVal})`;
            } else if (modeVal === "Cheque" && refVal) {
                modeVal = `Cheque (${refVal})`;
            }

            const newRec = {
                id: (receiptNoInput ? receiptNoInput.value.trim() : "") || generateReceiptNo(),
                date: sevaDateInput.value || new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                devoteeName: devoteeNameInput.value.trim(),
                mobile: document.getElementById("devoteeMobile").value.trim() || "N/A",
                sevaName: sevaText,
                amount: amt,
                paymentMode: modeVal,
                status: "COMPLETED",
                createdAt: Date.now()
            };

            receiptsData.unshift(newRec);
            saveReceipts();

            // Sync with Google Sheets
            postReceiptToGoogleSheets(newRec);

            openVoucherPrintModal(newRec);

            invoiceForm.reset();
            handlePaymentModeChange();
            if (receiptNoInput) receiptNoInput.value = generateReceiptNo();
            updateAmountInWords();
            renderAllViews();
        });
    }

    updateVoucherPreview();

    // Outward Form elements
    const outwardForm = document.getElementById("outwardForm");
    const payeeName = document.getElementById("payeeName");
    const payeeMobile = document.getElementById("payeeMobile");
    const expenseSelect = document.getElementById("expenseSelect");
    const customExpenseRow = document.getElementById("customExpenseRow");
    const customExpenseName = document.getElementById("customExpenseName");
    const expenseDate = document.getElementById("expenseDate");
    const paymentModeOutward = document.getElementById("paymentModeOutward");
    const paymentRefRowOutward = document.getElementById("paymentRefRowOutward");
    const paymentRefLabelOutward = document.getElementById("paymentRefLabelOutward");
    const paymentRefInputOutward = document.getElementById("paymentRefInputOutward");
    const amountOutward = document.getElementById("amountOutward");
    const voucherNo = document.getElementById("voucherNo");
    const amountInWordsOutward = document.getElementById("amountInWordsOutward");

    if (voucherNo) voucherNo.value = generateReceiptNo();
    if (expenseDate) expenseDate.value = new Date().toISOString().split('T')[0];

    // Custom select initialization
    const customContainer = document.getElementById("customExpenseContainer");
    const customTrigger = document.getElementById("customExpenseTrigger");
    const customVal = document.getElementById("customExpenseVal");
    const customOptionsContainer = document.getElementById("customExpenseOptions");
    const customOptions = customOptionsContainer ? customOptionsContainer.querySelectorAll(".custom-select-option") : [];

    if (customTrigger && customOptionsContainer) {
        customTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            customTrigger.classList.toggle("active");
            customOptionsContainer.classList.toggle("show");
        });

        // Close when clicking outside
        document.addEventListener("click", () => {
            customTrigger.classList.remove("active");
            customOptionsContainer.classList.remove("show");
        });

        customOptions.forEach(opt => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                const val = opt.getAttribute("data-value");
                const text = opt.textContent;

                // Update hidden select value
                if (expenseSelect) {
                    expenseSelect.value = val;
                    // Trigger the native change event so other listeners (e.g. showing custom details row) run
                    expenseSelect.dispatchEvent(new Event("change"));
                }

                // Update UI of custom select
                customVal.textContent = text;
                customOptions.forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");

                customTrigger.classList.remove("active");
                customOptionsContainer.classList.remove("show");
            });
        });
    }

    // Helper to reset custom select when form resets
    function resetCustomSelect() {
        if (customVal) customVal.textContent = "-- Choose Reason for Payment --";
        customOptions.forEach(o => {
            if (o.getAttribute("data-value") === "") {
                o.classList.add("selected");
            } else {
                o.classList.remove("selected");
            }
        });
    }

    function handlePaymentModeOutwardChange() {
        if (!paymentModeOutward) return;
        const val = paymentModeOutward.value;
        if (val === "UPI") {
            if (paymentRefRowOutward) paymentRefRowOutward.style.display = "block";
            if (paymentRefLabelOutward) paymentRefLabelOutward.textContent = "TRANSACTION / UPI ID *";
            if (paymentRefInputOutward) {
                paymentRefInputOutward.placeholder = "e.g. TXN998273";
                paymentRefInputOutward.required = true;
            }
        } else if (val === "Cheque") {
            if (paymentRefRowOutward) paymentRefRowOutward.style.display = "block";
            if (paymentRefLabelOutward) paymentRefLabelOutward.textContent = "CHEQUE NUMBER *";
            if (paymentRefInputOutward) {
                paymentRefInputOutward.placeholder = "e.g. CHQ-882910";
                paymentRefInputOutward.required = true;
            }
        } else if (val === "Bank Transfer") {
            if (paymentRefRowOutward) paymentRefRowOutward.style.display = "block";
            if (paymentRefLabelOutward) paymentRefLabelOutward.textContent = "TRANSACTION ID / REF NO *";
            if (paymentRefInputOutward) {
                paymentRefInputOutward.placeholder = "e.g. REF-1092837";
                paymentRefInputOutward.required = true;
            }
        } else {
            if (paymentRefRowOutward) paymentRefRowOutward.style.display = "none";
            if (paymentRefInputOutward) {
                paymentRefInputOutward.value = "";
                paymentRefInputOutward.required = false;
            }
        }
        updateVoucherPreview();
    }

    if (paymentModeOutward) {
        paymentModeOutward.addEventListener("change", handlePaymentModeOutwardChange);
    }

    if (expenseSelect) {
        expenseSelect.addEventListener("change", () => {
            const val = parseInt(expenseSelect.value);
            if (val === 99) {
                if (customExpenseRow) customExpenseRow.style.display = "block";
                if (customExpenseName) {
                    customExpenseName.required = true;
                    customExpenseName.value = "";
                }
            } else {
                if (customExpenseRow) customExpenseRow.style.display = "none";
                if (customExpenseName) {
                    customExpenseName.required = false;
                    customExpenseName.value = "";
                }
            }
            updateAmountInWordsOutward();
            updateVoucherPreview();
        });
    }

    [amountOutward, payeeName, payeeMobile, expenseDate, customExpenseName, paymentModeOutward, paymentRefInputOutward, voucherNo].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                updateAmountInWordsOutward();
                updateVoucherPreview();
            });
            input.addEventListener("change", () => {
                updateAmountInWordsOutward();
                updateVoucherPreview();
            });
        }
    });

    function updateAmountInWordsOutward() {
        if (!amountOutward) return;
        const amt = parseFloat(amountOutward.value) || 0;
        if (amountInWordsOutward) amountInWordsOutward.textContent = numberToWords(amt);
    }

    if (outwardForm) {
        outwardForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const amt = parseFloat(amountOutward.value);
            if (!amt || amt <= 0) {
                alert("Please enter a valid amount!");
                return;
            }

            let expenseText = "";
            const selectedVal = parseInt(expenseSelect.value);
            if (selectedVal === 99) {
                expenseText = customExpenseName.value.trim() || "Custom Expense";
            } else {
                expenseText = EXPENSE_NAMES[selectedVal] || "Temple Expense";
            }

            let modeVal = paymentModeOutward.value;
            const refVal = paymentRefInputOutward ? paymentRefInputOutward.value.trim() : "";
            if (modeVal !== "Cash" && refVal) {
                modeVal = `${modeVal} (${refVal})`;
            }

            const newRec = {
                id: (voucherNo ? voucherNo.value.trim() : "") || generateReceiptNo(),
                date: expenseDate.value || new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                devoteeName: payeeName.value.trim(),
                mobile: payeeMobile.value.trim() || "N/A",
                sevaName: expenseText,
                amount: amt,
                paymentMode: modeVal,
                status: "COMPLETED",
                type: "OUTWARD",
                createdAt: Date.now()
            };

            receiptsData.unshift(newRec);
            saveReceipts();

            // Sync with Google Sheets
            postReceiptToGoogleSheets(newRec);

            openVoucherPrintModal(newRec);

            outwardForm.reset();
            resetCustomSelect();
            handlePaymentModeOutwardChange();
            if (voucherNo) voucherNo.value = generateReceiptNo();
            if (expenseDate) expenseDate.value = new Date().toISOString().split('T')[0];
            updateAmountInWordsOutward();
            renderAllViews();
            
            // Also refresh inward form receipt number if it exists
            const inwardReceiptNo = document.getElementById("receiptNo");
            if (inwardReceiptNo) inwardReceiptNo.value = generateReceiptNo();
        });
    }
}

let currentVoucherLang = 'english';
let activeModalReceipt = null;
window.setVoucherLanguage = function(lang) {
    currentVoucherLang = lang;
    
    // Update active button styling in Inward Live Preview
    const btnEng = document.getElementById("btnLangEnglish");
    const btnKan = document.getElementById("btnLangKannada");
    if (btnEng && btnKan) {
        if (lang === 'english') {
            btnEng.classList.add("active");
            btnKan.classList.remove("active");
        } else {
            btnKan.classList.add("active");
            btnEng.classList.remove("active");
        }
    }

    // Update active button styling in Outward Live Preview
    const btnEngOut = document.getElementById("btnLangEnglishOutward");
    const btnKanOut = document.getElementById("btnLangKannadaOutward");
    if (btnEngOut && btnKanOut) {
        if (lang === 'english') {
            btnEngOut.classList.add("active");
            btnKanOut.classList.remove("active");
        } else {
            btnKanOut.classList.add("active");
            btnEngOut.classList.remove("active");
        }
    }

    // Update active button styling in Modal Preview
    const mEng = document.getElementById("modalBtnLangEnglish");
    const mKan = document.getElementById("modalBtnLangKannada");
    if (mEng && mKan) {
        if (lang === 'english') {
            mEng.classList.add("active");
            mKan.classList.remove("active");
        } else {
            mKan.classList.add("active");
            mEng.classList.remove("active");
        }
    }
    
    updateVoucherPreview();

    if (activeModalReceipt) {
        renderModalVoucherContent(activeModalReceipt);
    }
};

function updateVoucherPreview() {
    const previewBox = document.getElementById("voucherPreviewBox");
    const previewBoxOutward = document.getElementById("voucherPreviewBoxOutward");

    // Inward Preview
    if (previewBox) {
        const devoteeInput = document.getElementById("devoteeName");
        const devotee = devoteeInput && devoteeInput.value.trim() ? devoteeInput.value.trim() : "";
        
        const amtInput = document.getElementById("amount");
        const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
        const amtWords = numberToWords(amt);
        
        const modeInput = document.getElementById("paymentMode");
        const refInput = document.getElementById("paymentRefInput");
        let mode = modeInput ? modeInput.value : "Cash";
        if (modeInput && modeInput.value !== "Cash" && refInput && refInput.value.trim()) {
            const ref = refInput.value.trim();
            if (modeInput.value === "UPI") mode = `UPI (${ref})`;
            else if (modeInput.value === "Cheque") mode = `Cheque (${ref})`;
        }

        let seva = "";
        const sevaSel = document.getElementById("sevaSelect");
        if (sevaSel && sevaSel.value) {
            const selectedVal = parseInt(sevaSel.value);
            if (selectedVal === 99) {
                const cInput = document.getElementById("customSevaName");
                seva = cInput && cInput.value.trim() ? cInput.value.trim() : "Custom Purpose";
            } else {
                const found = PREDEFINED_SEVAS.find(s => s.id === selectedVal);
                if (found) seva = found.name;
            }
        }

        const rNoInput = document.getElementById("receiptNo");
        const rNo = rNoInput ? rNoInput.value || generateReceiptNo() : generateReceiptNo();
        
        const dInput = document.getElementById("sevaDate");
        const dateVal = dInput && dInput.value ? dInput.value : new Date().toISOString().split('T')[0];

        previewBox.innerHTML = renderVoucherHTML(rNo, dateVal, devotee, amt, amtWords, mode, seva, currentVoucherLang, "INWARD");
    }

    // Outward Preview
    if (previewBoxOutward) {
        const payeeInput = document.getElementById("payeeName");
        const payee = payeeInput && payeeInput.value.trim() ? payeeInput.value.trim() : "";
        
        const amtInput = document.getElementById("amountOutward");
        const amt = amtInput ? parseFloat(amtInput.value) || 0 : 0;
        const amtWords = numberToWords(amt);
        
        const modeInput = document.getElementById("paymentModeOutward");
        const refInput = document.getElementById("paymentRefInputOutward");
        let mode = modeInput ? modeInput.value : "Cash";
        if (modeInput && modeInput.value !== "Cash" && refInput && refInput.value.trim()) {
            const ref = refInput.value.trim();
            mode = `${modeInput.value} (${ref})`;
        }

        let expense = "";
        const expenseSel = document.getElementById("expenseSelect");
        if (expenseSel && expenseSel.value) {
            const selectedVal = parseInt(expenseSel.value);
            if (selectedVal === 99) {
                const cInput = document.getElementById("customExpenseName");
                expense = cInput && cInput.value.trim() ? cInput.value.trim() : "Custom Expense";
            } else {
                expense = EXPENSE_NAMES[expenseSel.value] || "Temple Expense";
            }
        }

        const vNoInput = document.getElementById("voucherNo");
        const vNo = vNoInput ? vNoInput.value || generateVoucherNo() : generateVoucherNo();
        
        const dInput = document.getElementById("expenseDate");
        const dateVal = dInput && dInput.value ? dInput.value : new Date().toISOString().split('T')[0];

        previewBoxOutward.innerHTML = renderVoucherHTML(vNo, dateVal, payee, amt, amtWords, mode, expense, currentVoucherLang, "OUTWARD");
    }
}

function splitAmountWords(words, maxLength = 35) {
    if (!words) return { part1: "", part2: "" };
    if (words.length <= maxLength) {
        return { part1: words, part2: "" };
    }
    const lastSpace = words.substring(0, maxLength).lastIndexOf(" ");
    if (lastSpace === -1) {
        return { part1: words.substring(0, maxLength), part2: words.substring(maxLength) };
    }
    return {
        part1: words.substring(0, lastSpace).trim(),
        part2: words.substring(lastSpace).trim()
    };
}

// VOUCHER HTML TEMPLATE — Single Language Render: English OR Kannada
function renderVoucherHTML(recNo, dateStr, devoteeName, amountVal, amountWords, modeStr, sevaPurpose, lang = currentVoucherLang, type = "INWARD") {
    const displayDate = formatDateToDDMMYYYY(dateStr);
    
    const { part1, part2 } = splitAmountWords(amountWords, 35);

    let nameFontSize = "1.05rem";
    if (devoteeName && devoteeName.length > 0) {
        nameFontSize = Math.max(0.68, Math.min(1.05, 23 / devoteeName.length)) + "rem";
    }
    
    let wordsFontSize = "0.92rem";
    if (part1 && part1.length > 0) {
        wordsFontSize = Math.max(0.72, Math.min(0.92, 28 / part1.length)) + "rem";
    }
    
    if (type === "OUTWARD") {
        if (lang === 'kannada') {
            return `
            <div style="font-family: 'Noto Sans Kannada', 'Inter', sans-serif; max-width: 540px; width: 100%; box-sizing: border-box; margin: 0 auto;">

            <!-- HEADER (KANNADA OUTWARD VOUCHER) -->
            <div style="display: flex; border-bottom: 2px solid #000; margin-bottom: 12px; padding-bottom: 8px;">
                <!-- Left Side: Logo & Temple Info -->
                <div style="width: 70%; display: flex; align-items: center; padding: 6px 10px 10px 0;">
                    <img src="./Images/1000053595.jpg" style="width: 60px; height: 60px; border-radius: 50%; object-fit: contain; margin-right: 12px;">
                    <div style="text-align: left;">
                        <div style="font-size: 0.95rem; font-weight: 900; color: #111; line-height: 1.3;">
                            ಸಬರಿಮಲ ಶ್ರೀ ಅಯ್ಯಪ್ಪಸ್ವಾಮಿ<br>ಭಜನ ಮಂಡಳಿ (ರಿ) ಹುಬ್ಬಳ್ಳಿ
                        </div>
                        <div style="font-size: 0.72rem; font-weight: 800; color: #333; margin-top: 3px;">
                            # ೯೦, ಆದರ್ಶ ಲೇಔಟ್, ಕುಸುಗಲ್ ರಸ್ತೆ, ಹುಬ್ಬಳ್ಳಿ ೫೮೦ ೦೨೦.
                        </div>
                    </div>
                </div>
                
                <!-- Right Side: Voucher Box -->
                <div style="width: 30%; border-left: 2px solid #000; display: flex; flex-direction: column;">
                    <div style="text-align: center; font-size: 1.05rem; font-weight: 900; letter-spacing: 1px; border-bottom: 2px solid #000; padding: 4px 0; background: #f8fafc;">
                        ಪಾವತಿ ಚೀಟಿ
                    </div>
                    <div style="padding: 5px 8px; font-size: 0.82rem; font-weight: 800; border-bottom: 2px solid #000; text-align: left;">
                        ಸಂಖ್ಯೆ: <span style="font-family: 'Courier New', Courier, monospace; font-size: 1rem; font-weight: 900; margin-left: 6px;">${recNo}</span>
                    </div>
                    <div style="padding: 5px 8px; font-size: 0.82rem; font-weight: 800; text-align: left;">
                        ದಿನಾಂಕ: <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.92rem; font-weight: 900; margin-left: 4px;">${displayDate}</span>
                    </div>
                </div>
            </div>

            <!-- BODY (KANNADA OUTWARD VOUCHER) -->
            <div style="font-size: 0.92rem; line-height: 1.85; margin-top: 10px; margin-bottom: 15px; text-align: left;">
                <!-- Paid To -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; white-space: nowrap; margin-right: 10px; min-width: 120px;">ಪಾವತಿಸಿದ್ದು ಇವರಿಗೆ:</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: ${nameFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                        ${devoteeName || "&nbsp;"}
                    </span>
                </div>

                <!-- Rs. & In Words (Kannada) -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; white-space: nowrap; margin-right: 10px; min-width: 120px;">ಮೊತ್ತ:</span>
                    <span style="border-bottom: 1px solid #000; padding: 0 10px; font-weight: 900; font-size: 1.15rem; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap; margin-right: 15px;">
                        ₹${amountVal.toLocaleString('en-IN')}/-
                    </span>
                    <span style="font-weight: 800; white-space: nowrap; margin-right: 10px; font-size: 0.82rem; color: #444;">(ಅಕ್ಷರಗಳಲ್ಲಿ)</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                        ${amountWords || "&nbsp;"}
                    </span>
                </div>

                <!-- Towards -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; white-space: nowrap; margin-right: 10px; min-width: 120px;">ಉದ್ದೇಶ:</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: 1rem; font-family: 'Courier New', Courier, monospace;">
                        ${sevaPurpose || "&nbsp;"}
                    </span>
                </div>
                
                <!-- Extra details / mode line -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; white-space: nowrap; margin-right: 10px; min-width: 120px;">ಪಾವತಿ ವಿಧಾನ:</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: 0.95rem; font-family: 'Courier New', Courier, monospace;">
                        ${modeStr || "&nbsp;"}
                    </span>
                </div>
            </div>

            <!-- SIGNATURES (KANNADA OUTWARD VOUCHER) -->
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 800; text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; width: 35%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">ಅಧ್ಯಕ್ಷರು / ಕಾರ್ಯದರ್ಶಿ</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">ಖಜಾಂಚಿ</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; width: 30%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">ಸ್ವೀಕೃತದಾರರ ಸಹಿ</div>
                </div>
            </div>

            </div>
            `;
        } else {
            return `
            <div style="font-family: 'Inter', sans-serif; max-width: 540px; width: 100%; box-sizing: border-box; margin: 0 auto;">

            <!-- HEADER (ENGLISH OUTWARD VOUCHER) -->
            <div style="display: flex; border-bottom: 2px solid #000; margin-bottom: 12px; padding-bottom: 8px;">
                <!-- Left Side: Logo & Temple Info -->
                <div style="width: 70%; display: flex; align-items: center; padding: 6px 10px 10px 0;">
                    <img src="./Images/1000053595.jpg" style="width: 60px; height: 60px; border-radius: 50%; object-fit: contain; margin-right: 12px;">
                    <div style="text-align: left;">
                        <div style="font-size: 1.05rem; font-weight: 800; color: #000; font-family: 'Georgia', serif; line-height: 1.25;">
                            Sabarimala Sri Ayyappa Swamy<br>Bhajan Mandali (R)
                        </div>
                        <div style="font-size: 0.72rem; font-weight: 700; color: #333; margin-top: 3px; font-family: 'Inter', sans-serif;">
                            # 90, Adarsh Layout, Kusugal Road, HUBLI 580 020.
                        </div>
                    </div>
                </div>
                
                <!-- Right Side: Voucher Box -->
                <div style="width: 30%; border-left: 2px solid #000; display: flex; flex-direction: column;">
                    <div style="text-align: center; font-size: 1.05rem; font-weight: 900; font-family: 'Georgia', serif; letter-spacing: 1.5px; border-bottom: 2px solid #000; padding: 4px 0; background: #f8fafc;">
                        VOUCHER
                    </div>
                    <div style="padding: 5px 8px; font-size: 0.82rem; font-weight: 700; border-bottom: 2px solid #000; font-family: 'Georgia', serif; text-align: left;">
                        No. <span style="font-family: 'Courier New', Courier, monospace; font-size: 1rem; font-weight: 800; margin-left: 6px;">${recNo}</span>
                    </div>
                    <div style="padding: 5px 8px; font-size: 0.82rem; font-weight: 700; font-family: 'Georgia', serif; text-align: left;">
                        Date : <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.92rem; font-weight: 800; margin-left: 4px;">${displayDate}</span>
                    </div>
                </div>
            </div>

            <!-- BODY (ENGLISH OUTWARD VOUCHER) -->
            <div style="font-size: 0.92rem; line-height: 1.85; margin-top: 10px; margin-bottom: 15px; font-family: 'Inter', sans-serif; text-align: left;">
                <!-- Paid To -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif; min-width: 65px;">Paid To</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: ${nameFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                        ${devoteeName || "&nbsp;"}
                    </span>
                </div>

                <!-- Rs. & In Words -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif; min-width: 65px;">Rs.</span>
                    <span style="border-bottom: 1px solid #000; padding: 0 10px; font-weight: 800; font-size: 1.15rem; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap; margin-right: 15px;">
                        ₹${amountVal.toLocaleString('en-IN')}/-
                    </span>
                    <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif; font-size: 0.82rem; color: #444;">(in words)</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                        ${amountWords || "&nbsp;"}
                    </span>
                </div>

                <!-- Towards -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif; min-width: 65px;">Towards</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: 1rem; font-family: 'Courier New', Courier, monospace;">
                        ${sevaPurpose || "&nbsp;"}
                    </span>
                </div>
                
                <!-- Extra payment details / payment mode details line -->
                <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif; font-size: 0.8rem; color: #444; min-width: 65px;">Payment Mode</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: 0.95rem; font-family: 'Courier New', Courier, monospace;">
                        ${modeStr || "&nbsp;"}
                    </span>
                </div>
            </div>

            <!-- SIGNATURES (ENGLISH OUTWARD VOUCHER) -->
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 800; text-align: center; font-family: 'Georgia', serif;">
                <div style="display: flex; flex-direction: column; align-items: center; width: 35%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">President / Secretary</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">Treasurer</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; width: 30%;">
                    <div style="height: 35px;"></div>
                    <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">Receiver's Signature</div>
                </div>
            </div>

            </div>
            `;
        }
    }

    if (lang === 'kannada') {
        return `
        <div style="font-family: 'Noto Sans Kannada', 'Inter', sans-serif; max-width: 540px; width: 100%; box-sizing: border-box; margin: 0 auto;">

        <!-- HEADER (KANNADA ONLY) -->
        <div style="display: flex; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; align-items: center;">
            <img src="./Images/1000053595.jpg" style="width: 65px; height: 65px; border-radius: 50%; object-fit: contain; margin-right: 15px;">
            <div style="flex-grow: 1; text-align: center;">
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; font-size: 0.65rem; font-weight: 800; color: #333; margin-bottom: 2px; width: 100%; white-space: nowrap; align-items: center;">
                    <div></div>
                    <div style="text-align: center;">|| ಓಂ ಸ್ವಾಮಿಯೇ ಶರಣಮಯ್ಯಪ್ಪ ||</div>
                    <div style="text-align: right;">(ನೋಂದಣಿ ಸಂಖ್ಯೆ: ೪೧೦/೨೦೦೬-೦೭)</div>
                </div>
                <div style="font-size: 0.95rem; font-weight: 900; color: #111; line-height: 1.3; margin-bottom: 2px;">
                    ಸಬರಿಮಲ ಶ್ರೀ ಅಯ್ಯಪ್ಪಸ್ವಾಮಿ ಭಜನ ಮಂಡಳಿ (ರಿ), ಹುಬ್ಬಳ್ಳಿ.
                </div>
                <div style="font-size: 0.75rem; font-weight: 800; color: #333; font-style: italic; margin-bottom: 2px;">
                    ಧರ್ಮದತ್ತಿ ಸಂಸ್ಥೆ
                </div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #444;">
                    ನಂ. ೪೨೮/೯೦, ಆದರ್ಶ ಲೇಔಟ್, ಹೆಸ್ಕಾಮ್ ಹಿಂದೆ, ಕುಸುಗಲ್ ರಸ್ತೆ, ಹುಬ್ಬಳ್ಳಿ - ೫೮೦ ೦೨೦.
                </div>
            </div>
        </div>

        <!-- RECEIPT NUMBER & DATE -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 0.9rem; font-weight: 800;">
            <div style="width: 30%; text-align: left;">
                ಸಂಖ್ಯೆ: <span style="font-family: 'Courier New', Courier, monospace; font-size: 1.05rem; font-weight: 900; margin-left: 6px; color: #e11d48;">${recNo}</span>
            </div>
            <div style="width: 40%; text-align: center;">
                <span style="font-size: 1.15rem; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 2px; letter-spacing: 1.5px;">ರಶೀದಿ</span>
            </div>
            <div style="width: 30%; text-align: right;">
                ದಿನಾಂಕ: <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.95rem; font-weight: 900; margin-left: 4px;">${displayDate}</span>
            </div>
        </div>

        <!-- BODY (KANNADA RECEIPT) -->
        <div style="font-size: 0.92rem; line-height: 1.85; margin-top: 10px; margin-bottom: 12px; text-align: left;">
            <!-- Received with thanks from Smt./Sri -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 800; white-space: nowrap; margin-right: 10px;">ಶ್ರೀ/ಶ್ರೀಮತಿ ಇವರಿಂದ ಸ್ವೀಕರಿಸಲಾಗಿದೆ:</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: ${nameFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${devoteeName || "&nbsp;"}
                </span>
            </div>

            <!-- Blank Line with "the sum of Rupees (in words)" in Kannada -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="width: 30%; border-bottom: 1px solid #000;">&nbsp;</span>
                <span style="font-weight: 800; white-space: nowrap; margin-left: 10px; margin-right: 10px; font-size: 0.82rem; color: #444;">ಮೊತ್ತ ಅಕ್ಷರಗಳಲ್ಲಿ (ರೂಪಾಯಿಗಳು)</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${part1 || "&nbsp;"}
                </span>
            </div>

            <!-- Third Blank Line -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                ${part2 ? `
                <span style="border-bottom: 1px solid #000; padding: 0 10px; font-weight: 900; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${part2}
                </span>
                ` : '&nbsp;'}
            </div>

            <!-- On account of -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 800; white-space: nowrap; margin-right: 10px;">ಸೇವೆ/ಉದ್ದೇಶಕ್ಕಾಗಿ:</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 900; font-size: 1rem; font-family: 'Courier New', Courier, monospace;">
                    ${sevaPurpose || "&nbsp;"}
                </span>
            </div>
        </div>

        <!-- BOTTOM SECTION -->
        <div style="margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.85rem; font-weight: 800; text-align: center;">
            <!-- Amount Box Container -->
            <div style="display: flex; flex-direction: column; align-items: flex-start; width: 35%;">
                <div style="border: 2px solid #000; padding: 6px 16px; font-size: 1.15rem; font-weight: 900; background: #f8fafc; font-family: 'Courier New', Courier, monospace; text-align: center;">
                    ರೂ. ₹ ${amountVal.toLocaleString('en-IN')}/-
                </div>
                ${modeStr && !modeStr.startsWith('Cash') ? `
                <div style="font-size: 0.68rem; font-weight: 800; font-family: 'Inter', sans-serif; margin-top: 5px; color: #111; text-align: left; white-space: nowrap;">
                    ಪಾವತಿ ವಿವರ: ${modeStr}
                </div>
                ` : ''}
            </div>
            
            <!-- President Signature -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                <div style="height: 35px;"></div>
                <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">ಅಧ್ಯಕ್ಷರು</div>
            </div>
            
            <!-- Treasurer Signature -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                <div style="height: 35px;"></div>
                <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">ಖಜಾಂಚಿ</div>
            </div>
        </div>

        </div>
        `;
    }

    // DEFAULT: ENGLISH ONLY
    return `
        <div style="font-family: 'Inter', sans-serif; max-width: 540px; width: 100%; box-sizing: border-box; margin: 0 auto;">

        <!-- HEADER (ENGLISH ONLY) -->
        <div style="display: flex; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; align-items: center;">
            <img src="./Images/1000053595.jpg" style="width: 65px; height: 65px; border-radius: 50%; object-fit: contain; margin-right: 15px;">
            <div style="flex-grow: 1; text-align: center;">
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; font-size: 0.65rem; font-weight: 800; color: #333; margin-bottom: 2px; width: 100%; white-space: nowrap; align-items: center;">
                    <div></div>
                    <div style="text-align: center;">|| Om Swamiye Saranamayyappa ||</div>
                    <div style="text-align: right;">(Reg.No. 410/2006-07)</div>
                </div>
                <div style="font-size: 1.05rem; font-weight: 900; color: #000; font-family: 'Georgia', serif; line-height: 1.2; margin-bottom: 2px;">
                    Sabarimala Sri Ayyappaswamy Bhajan Mandali (R), Hubli.
                </div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #333; font-style: italic; margin-bottom: 2px;">
                    Charitable Society
                </div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #444;">
                    No. 428/90, Adarsh Layout, Behind HESCOM, Kusugal Road, HUBLI - 580 020.
                </div>
            </div>
        </div>

        <!-- RECEIPT NUMBER & DATE -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 0.9rem; font-weight: 800;">
            <div style="width: 30%; text-align: left;">
                No. <span style="font-family: 'Courier New', Courier, monospace; font-size: 1.05rem; font-weight: 900; margin-left: 6px; color: #e11d48;">${recNo}</span>
            </div>
            <div style="width: 40%; text-align: center;">
                <span style="font-size: 1.15rem; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 2px; letter-spacing: 1.5px; font-family: 'Georgia', serif;">RECEIPT</span>
            </div>
            <div style="width: 30%; text-align: right;">
                Date: <span style="font-family: 'Courier New', Courier, monospace; font-size: 0.95rem; font-weight: 900; margin-left: 4px;">${displayDate}</span>
            </div>
        </div>

        <!-- BODY (ENGLISH RECEIPT) -->
        <div style="font-size: 0.92rem; line-height: 1.85; margin-top: 10px; margin-bottom: 12px; text-align: left; font-family: 'Inter', sans-serif;">
            <!-- Received with thanks from Smt./Sri -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif;">Received with thanks from Smt./Sri</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: ${nameFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${devoteeName || "&nbsp;"}
                </span>
            </div>

            <!-- Blank Line with "the sum of Rupees (in words)" -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="width: 30%; border-bottom: 1px solid #000;">&nbsp;</span>
                <span style="font-weight: 700; white-space: nowrap; margin-left: 10px; margin-right: 10px; font-family: 'Georgia', serif; font-size: 0.82rem; color: #444;">the sum of Rupees (in words)</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${part1 || "&nbsp;"}
                </span>
            </div>

            <!-- Third Blank Line -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                ${part2 ? `
                <span style="border-bottom: 1px solid #000; padding: 0 10px; font-weight: 700; font-size: ${wordsFontSize}; font-family: 'Courier New', Courier, monospace; color: #000; white-space: nowrap;">
                    ${part2}
                </span>
                ` : '&nbsp;'}
            </div>

            <!-- On account of -->
            <div style="display: flex; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 700; white-space: nowrap; margin-right: 10px; font-family: 'Georgia', serif;">On account of</span>
                <span style="flex-grow: 1; border-bottom: 1px solid #000; padding-left: 10px; font-weight: 700; font-size: 1rem; font-family: 'Courier New', Courier, monospace;">
                    ${sevaPurpose || "&nbsp;"}
                </span>
            </div>
        </div>

        <!-- BOTTOM SECTION -->
        <div style="margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.85rem; font-weight: 800; text-align: center; font-family: 'Georgia', serif;">
            <!-- Amount Box Container -->
            <div style="display: flex; flex-direction: column; align-items: flex-start; width: 35%;">
                <div style="border: 2px solid #000; padding: 6px 16px; font-size: 1.15rem; font-weight: 900; background: #f8fafc; font-family: 'Courier New', Courier, monospace; text-align: center;">
                    ₹ ${amountVal.toLocaleString('en-IN')}/-
                </div>
                ${modeStr && !modeStr.startsWith('Cash') ? `
                <div style="font-size: 0.68rem; font-weight: 800; font-family: 'Inter', sans-serif; margin-top: 5px; color: #111; text-align: left; white-space: nowrap;">
                    Payment Ref: ${modeStr}
                </div>
                ` : ''}
            </div>
            
            <!-- President Signature -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                <div style="height: 35px;"></div>
                <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">President</div>
            </div>
            
            <!-- Treasurer Signature -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 25%;">
                <div style="height: 35px;"></div>
                <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">Treasurer</div>
            </div>
        </div>

        </div>
        `;
}

// FILTERS & SEARCH
function initFiltersAndSearch() {
    const searchInput = document.getElementById("registrySearch");
    if (searchInput) {
        searchInput.addEventListener("input", renderRegistryTable);
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderRegistryTable();
        });
    });

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
            let csv = "Receipt No,Date,Devotee Name,Mobile,Seva Purpose,Amount,Payment Mode\n";
            receiptsData.forEach(r => {
                csv += `"${r.id}","${r.date}","${r.devoteeName}","${r.mobile}","${r.sevaName}",${r.amount},"${r.paymentMode}"\n`;
            });
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Sabarimala_Temple_Donations_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        });
    }
}

// RENDER ALL VIEWS
function renderAllViews() {
    renderRegistryTable();
    renderTotalDonationsTable();
    renderStats();
    if (window.lucide) lucide.createIcons();
}

function renderRegistryTable() {
    const tbody = document.getElementById("registryTableBody");
    if (!tbody) return;

    const searchTerm = (document.getElementById("registrySearch") ? document.getElementById("registrySearch").value : "").toLowerCase();
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const filterType = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = receiptsData.filter(r => {
        const matchesSearch = r.devoteeName.toLowerCase().includes(searchTerm) ||
                              r.id.toLowerCase().includes(searchTerm) ||
                              r.mobile.includes(searchTerm) ||
                              r.sevaName.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;

        if (filterType === "today") return r.date === todayStr;
        if (filterType === "cash") return r.paymentMode.includes("Cash");
        if (filterType === "upi") return r.paymentMode.includes("UPI") || r.paymentMode.includes("Online") || r.paymentMode.includes("Transfer");
        if (filterType === "inward") return (!r.type || r.type === "INWARD");
        if (filterType === "outward") return r.type === "OUTWARD";
        return true;
    });

    tbody.innerHTML = filtered.map(r => {
        const isOutward = r.type === "OUTWARD";
        const badge = isOutward 
            ? '<span style="font-size:0.6rem; padding: 2px 6px; background:#fee2e2; color:#ef4444; border-radius:4px; margin-left:8px; font-weight:800; vertical-align:middle; display:inline-block;">OUTWARD</span>'
            : '<span style="font-size:0.6rem; padding: 2px 6px; background:#dcfce7; color:#15803d; border-radius:4px; margin-left:8px; font-weight:800; vertical-align:middle; display:inline-block;">INWARD</span>';
        
        const amtColor = isOutward ? '#ef4444' : '#10b981';
        
        return `
        <tr>
            <td>
                <div style="font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 4px;">
                    ${r.devoteeName} ${badge}
                </div>
                <div style="font-size: 0.72rem; color: #64748b;">Ref: ${r.id}</div>
            </td>
            <td>
                <div style="font-weight: 700;">${r.sevaName}</div>
            </td>
            <td>
                <div style="font-size: 0.85rem; font-weight: 600;">${r.mobile}</div>
                <div style="font-size: 0.72rem; color: #64748b;">${formatDateToDDMMYYYY(r.date)} ${r.time}</div>
            </td>
            <td>
                <div style="font-weight: 900; color: ${amtColor};">₹${r.amount.toLocaleString('en-IN')}</div>
                <span class="status-tag ${r.paymentMode.startsWith('Cash') ? 'tag-booked' : 'tag-pending'}">${r.paymentMode}</span>
            </td>
            <td>
                <span class="status-tag tag-booked" style="background: #dcfce7; color: #15803d;">
                    ${r.status}
                </span>
            </td>
            <td>
                <button class="btn-allot" style="padding: 6px 12px; font-size: 0.72rem;" onclick="printVoucherById('${r.id}')">
                    <i data-lucide="printer" style="width: 14px; height: 14px; margin-right: 4px;"></i> Print
                </button>
            </td>
        </tr>
        `;
    }).join('');

    const showingText = document.getElementById("showingCountText");
    if (showingText) showingText.textContent = `SHOWING ${filtered.length} OF ${receiptsData.length} INVOICES`;

    if (window.lucide) lucide.createIcons();
}

function renderTotalDonationsTable() {
    const tbody = document.getElementById("totalDonationBody");
    if (!tbody) return;

    tbody.innerHTML = receiptsData.map(r => {
        const isOutward = r.type === "OUTWARD";
        const amtColor = isOutward ? '#ef4444' : '#d97706';
        const typeLabel = isOutward ? ' (Outward)' : ' (Inward)';
        return `
        <tr>
            <td style="font-weight: 800;">${r.id}</td>
            <td style="font-size: 0.82rem; color: #64748b;">${formatDateToDDMMYYYY(r.date)} ${r.time}</td>
            <td style="font-weight: 700;">${r.devoteeName}${typeLabel}</td>
            <td>${r.sevaName}</td>
            <td><span class="status-tag tag-pending">${r.paymentMode}</span></td>
            <td style="font-weight: 900; color: ${amtColor};">₹${r.amount.toLocaleString('en-IN')}</td>
            <td>
                <button class="btn-allot" style="padding: 6px 12px; font-size: 0.72rem;" onclick="printVoucherById('${r.id}')">
                    <i data-lucide="printer" style="width: 14px; height: 14px; margin-right: 4px;"></i> Print
                </button>
            </td>
        </tr>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function renderStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayTotal = 0;
    let cashTotal = 0;

    receiptsData.forEach(r => {
        if (!r.type || r.type === "INWARD") {
            if (r.date === todayStr) todayTotal += r.amount;
            if (r.paymentMode.startsWith("Cash")) cashTotal += r.amount;
        }
    });

    if (document.getElementById("statTodayTotal")) document.getElementById("statTodayTotal").textContent = `₹${todayTotal.toLocaleString('en-IN')}`;
    if (document.getElementById("statTotalCount")) document.getElementById("statTotalCount").textContent = receiptsData.length;
    if (document.getElementById("statCashTotal")) document.getElementById("statCashTotal").textContent = `₹${cashTotal.toLocaleString('en-IN')}`;
}

window.printVoucherById = function(id) {
    const rec = receiptsData.find(r => r.id === id);
    if (rec) {
        openVoucherPrintModal(rec);
    }
};

function renderModalVoucherContent(rec) {
    const container = document.getElementById("printableVoucherContent");
    if (!container) return;
    const amtWords = numberToWords(rec.amount);
    
    const isOutward = rec.type === "OUTWARD";
    const label1 = isOutward ? "Office Copy" : "Devotee Copy";
    const label2 = isOutward ? "Receiver Copy" : "Office Copy";
    
    const htmlSingle = renderVoucherHTML(rec.id, rec.date, rec.devoteeName, rec.amount, amtWords, rec.paymentMode, rec.sevaName, currentVoucherLang, rec.type || "INWARD");
    
    container.innerHTML = `
        <div class="dual-print-container" style="max-width: 540px; margin: 0 auto; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box; background: white;">
            
            <!-- First Copy -->
            <div style="border: 2px solid #000; padding: 12px 20px 20px 20px; box-sizing: border-box; background: white;">
                <div style="text-align: center; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #555; border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 12px; font-family: sans-serif; letter-spacing: 1px;">
                    *** ${label1} ***
                </div>
                ${htmlSingle}
            </div>
            
            <!-- Perforation Line -->
            <div style="width: 100%; border-top: 1px dashed #000; margin: 5px 0; position: relative; text-align: center;">
                <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; font-size: 0.62rem; font-weight: 800; color: #555; font-family: sans-serif; letter-spacing: 1px; text-transform: uppercase;">✂ Fold &amp; Tear / ಕತ್ತರಿಸಿ</span>
            </div>
            
            <!-- Second Copy -->
            <div style="border: 2px solid #000; padding: 12px 20px 20px 20px; box-sizing: border-box; background: white;">
                <div style="text-align: center; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #555; border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 12px; font-family: sans-serif; letter-spacing: 1px;">
                    *** ${label2} ***
                </div>
                ${htmlSingle}
            </div>
            
        </div>
    `;
}

function openVoucherPrintModal(rec) {
    activeModalReceipt = rec;
    const modal = document.getElementById("printVoucherModal");
    if (modal) {
        renderModalVoucherContent(rec);
        modal.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    }
}

window.closeVoucherModal = function() {
    activeModalReceipt = null;
    const modal = document.getElementById("printVoucherModal");
    if (modal) modal.style.display = 'none';
};

// MOBILE NOTICE OVERLAY HANDLERS
let currentMobileNoticeLang = 'english';

window.switchMobileNoticeLang = function(lang) {
    currentMobileNoticeLang = lang;
    const btnEng = document.getElementById("mobileLangEng");
    const btnKan = document.getElementById("mobileLangKan");
    const content = document.getElementById("mobileNoticeContent");
    const copyText = document.getElementById("btnCopyText");

    if (btnEng && btnKan) {
        if (lang === 'english') {
            btnEng.classList.add("active");
            btnKan.classList.remove("active");
        } else {
            btnKan.classList.add("active");
            btnEng.classList.remove("active");
        }
    }

    if (!content) return;

    if (lang === 'kannada') {
        content.innerHTML = `
            <h2 style="font-size: 1.2rem; font-weight: 900; color: #f87171; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                🚫 ಡೆಸ್ಕ್‌ಟಾಪ್‌ನಲ್ಲಿ ಮಾತ್ರ ಲಭ್ಯವಿದೆ
            </h2>
            <p style="font-size: 0.86rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 14px;">
                ಈ ದೇವಸ್ಥಾನದ ಅಡ್ಮಿನ್ ಮತ್ತು ರಶೀದಿ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆಯನ್ನು <strong>ಡೆಸ್ಕ್‌ಟಾಪ್, ಲ್ಯಾಪ್‌ಟಾಪ್ ಮತ್ತು ಟ್ಯಾಬ್ಲೆಟ್ (Tablet)</strong> ಪರದೆಗಳಿಗಾಗಿ ಮಾತ್ರ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.
            </p>
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 12px; padding: 12px; font-size: 0.78rem; color: #fecaca; text-align: center; line-height: 1.4; font-weight: 600;">
                🔒 ಮೊಬೈಲ್ ಸಾಧನಗಳಲ್ಲಿ ಬಳಕೆಯನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಈ ಲಿಂಕ್ ಅನ್ನು ಕಂಪ್ಯೂಟರ್ ಅಥವಾ ಲ್ಯಾಪ್‌ಟಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ.
            </div>
        `;
        if (copyText) copyText.textContent = "ಪೋರ್ಟಲ್ ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ";
    } else {
        content.innerHTML = `
            <h2 style="font-size: 1.2rem; font-weight: 900; color: #f87171; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                🚫 Desktop / Laptop Required
            </h2>
            <p style="font-size: 0.86rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 14px;">
                This Admin & Invoice Management System is strictly engineered for <strong>Desktop, Laptop, and Tablet</strong> screens.
            </p>
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 12px; padding: 12px; font-size: 0.78rem; color: #fecaca; text-align: center; line-height: 1.4; font-weight: 600;">
                🔒 Mobile access is restricted. Please open this website link on a Desktop, Laptop, or Tablet computer.
            </div>
        `;
        if (copyText) copyText.textContent = "Copy Portal Link";
    }
};

window.copyWebsiteLink = function() {
    const link = "https://sabarimala-temple-system.web.app";
    navigator.clipboard.writeText(link).then(() => {
        alert("Portal Link copied! Open this link on your Laptop or Desktop.");
    }).catch(() => {
        prompt("Copy this link to open on Desktop/Laptop:", link);
    });
};

// HOW TO USE GUIDE LANGUAGE SWITCHER
window.switchGuideLang = function(lang) {
    const btnEng = document.getElementById("btnGuideEng");
    const btnKan = document.getElementById("btnGuideKan");
    const guideEng = document.getElementById("guideContentEng");
    const guideKan = document.getElementById("guideContentKan");

    if (btnEng && btnKan && guideEng && guideKan) {
        if (lang === 'kannada') {
            btnEng.classList.remove("active");
            btnKan.classList.add("active");
            guideEng.style.display = "none";
            guideKan.style.display = "block";
        } else {
            btnKan.classList.remove("active");
            btnEng.classList.add("active");
            guideKan.style.display = "none";
            guideEng.style.display = "block";
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    switchMobileNoticeLang('english');
});

// --- DATE & TIME PARSING HELPERS (IST Timezone) ---
function parseAndFormatDate(dateVal) {
    if (!dateVal) return "";
    
    // If it's already in YYYY-MM-DD format (without T), return it as is
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
        return dateVal.trim();
    }
    
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        
        // Extract components in Asia/Kolkata timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(d);
        const year = parts.find(p => p.type === 'year').value;
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error parsing date:", e);
        return dateVal;
    }
}

function parseAndFormatTime(timeVal) {
    if (!timeVal) return "";
    
    // If it's already in hh:mm AM/PM format, return it as is
    if (typeof timeVal === 'string' && /^(0?[1-9]|1[0-2]):[0-5]\d\s*(AM|PM|am|pm)$/i.test(timeVal.trim())) {
        return timeVal.trim().toUpperCase();
    }
    
    try {
        const d = new Date(timeVal);
        if (isNaN(d.getTime())) return timeVal;
        
        // Format to hh:mm AM/PM in Asia/Kolkata timezone
        return d.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        console.error("Error parsing time:", e);
        return timeVal;
    }
}

// --- GOOGLE SHEETS SYNC IMPLEMENTATION ---

async function syncWithGoogleSheets() {
    if (!API_URL) return;

    const statusLabel = document.getElementById("statusLabel");
    const statusContainer = statusLabel ? statusLabel.closest('.status-badge-container') : null;

    if (statusLabel) {
        statusLabel.innerText = "SYNCING...";
        if (statusContainer) {
            statusContainer.style.borderColor = "rgba(79, 70, 229, 0.4)";
            statusContainer.style.background = "rgba(79, 70, 229, 0.05)";
        }
    }

    try {
        console.log("[SYNC DEBUG] Fetching spreadsheet data from URL:", API_URL);
        const res = await fetch(`${API_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP network error! status: ${res.status}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            const formattedData = data.map((row, idx) => {
                const idVal = row.id || row.Id || row.ID || "";
                return {
                    id: idVal,
                    date: parseAndFormatDate(row.date || row.Date || ""),
                    time: parseAndFormatTime(row.time || row.Time || ""),
                    devoteeName: row.devoteeName || row["Devotee Name"] || row.name || "",
                    mobile: row.mobile || row.Mobile || row["Mobile Number"] || "",
                    sevaName: row.sevaName || row["Seva Name"] || "",
                    amount: parseFloat(row.amount || row.Amount || 0),
                    paymentMode: row.paymentMode || row["Payment Mode"] || "",
                    status: row.status || row.Status || "COMPLETED",
                    type: row.type || row.Type || (idVal && idVal.endsWith("-OUT") ? "OUTWARD" : "INWARD"),
                    createdAt: idx
                };
            });

            const validData = formattedData.filter(r => r.id);
            validData.sort((a, b) => b.createdAt - a.createdAt);
            
            receiptsData = validData;
            saveReceipts();
            renderAllViews();

            // Refresh the form receipt number to match the newly synced data
            const receiptNoInput = document.getElementById("receiptNo");
            if (receiptNoInput) receiptNoInput.value = generateReceiptNo();
        }

        if (statusLabel) {
            statusLabel.innerText = "SYSTEM LIVE";
            if (statusContainer) {
                statusContainer.style.borderColor = "rgba(16, 185, 129, 0.25)";
                statusContainer.style.background = "rgba(16, 185, 129, 0.05)";
            }
        }
    } catch (err) {
        console.error("====================================================");
        console.error("[SYNC ERROR] Failed to sync from Google Sheets!");
        console.error("Target URL:", API_URL);
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Full Error Stack Trace:", err.stack);
        console.error("====================================================");

        if (statusLabel) {
            statusLabel.innerText = "SYNC FAILED";
            if (statusContainer) {
                statusContainer.style.borderColor = "rgba(220, 38, 38, 0.25)";
                statusContainer.style.background = "rgba(220, 38, 38, 0.05)";
            }
        }
    }
}

async function postReceiptToGoogleSheets(rec) {
    if (!API_URL) return;

    const statusLabel = document.getElementById("statusLabel");
    const statusContainer = statusLabel ? statusLabel.closest('.status-badge-container') : null;

    if (statusLabel) {
        statusLabel.innerText = "SYNCING...";
        if (statusContainer) {
            statusContainer.style.borderColor = "rgba(79, 70, 229, 0.4)";
            statusContainer.style.background = "rgba(79, 70, 229, 0.05)";
        }
    }

    try {
        const payload = {
            action: "addReceipt",
            id: rec.id,
            date: rec.date,
            time: rec.time,
            devoteeName: rec.devoteeName,
            mobile: rec.mobile,
            sevaName: rec.sevaName,
            amount: rec.amount,
            paymentMode: rec.paymentMode,
            status: rec.status,
            type: rec.type || "INWARD"
        };

        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams(payload)
        });

        if (statusLabel) {
            statusLabel.innerText = "SYSTEM LIVE";
            if (statusContainer) {
                statusContainer.style.borderColor = "rgba(16, 185, 129, 0.25)";
                statusContainer.style.background = "rgba(16, 185, 129, 0.05)";
            }
        }
        
        setTimeout(syncWithGoogleSheets, 1500);

    } catch (err) {
        console.error("Failed to post receipt to Google Sheets:", err);
        if (statusLabel) {
            statusLabel.innerText = "SYNC FAILED";
            if (statusContainer) {
                statusContainer.style.borderColor = "rgba(220, 38, 38, 0.25)";
                statusContainer.style.background = "rgba(220, 38, 38, 0.05)";
            }
        }
    }
}



