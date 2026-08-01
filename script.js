// ========================================================
// SABARIMALA TEMPLE HUBBALLI HMS — SCRIPT (EXACT DHAM ADMIN)
// ========================================================

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

// Initial Sample Receipts
const INITIAL_RECEIPTS = [
    {
        id: "STH-2026-0001",
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
        id: "STH-2026-0002",
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
        id: "STH-2026-0003",
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
    const year = new Date().getFullYear();
    const count = receiptsData.length + 1;
    return `STH-${year}-${String(count).padStart(4, '0')}`;
}

// INITIALIZE DOM
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSevaSelectOptions();
    initFormHandling();
    initFiltersAndSearch();
    renderAllViews();

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
window.addEventListener('online', openSystemInfoModal);

// NAVIGATION
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const pageTitle = document.getElementById("pageTitle");
    const pageSub = document.getElementById("pageSub");

    const titlesMap = {
        "custom-bill": { title: "Create Invoice", sub: "Counter Billing & Official Paper Receipt Generator" },
        "registry": { title: "Donation Registry", sub: "Sabarimala Sri Ayyappaswamy Temple — Management Dashboard" },
        "about-temple": { title: "About Sabarimala Temple", sub: "Hubballi Charitable Society & Official Seva Directory" }
    };

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetTab = link.getAttribute("data-tab");
            
            navLinks.forEach(nl => nl.classList.remove("active"));
            tabPanes.forEach(tp => {
                tp.style.display = "none";
                tp.classList.remove("active");
            });

            link.classList.add("active");
            const activePane = document.getElementById(`tab-${targetTab}`);
            if (activePane) {
                activePane.style.display = "block";
                activePane.classList.add("active");
            }

            if (titlesMap[targetTab]) {
                pageTitle.textContent = titlesMap[targetTab].title;
                pageSub.textContent = titlesMap[targetTab].sub;
            }

            renderAllViews();
            if (window.lucide) lucide.createIcons();
        });
    });
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
            opt.textContent = `${seva.id < 99 ? seva.id + '. ' : ''}${seva.name} ${seva.defaultPrice > 0 ? '(₹' + seva.defaultPrice + ')' : ''}`;
            sevaSelect.appendChild(opt);
        });
    }

    if (aboutSevasList) {
        aboutSevasList.innerHTML = PREDEFINED_SEVAS.filter(s => s.id < 99).map(s => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
                <span>${s.name}</span>
                <span style="font-size: 0.72rem; color: #d97706; font-weight: 800;">#${s.id}</span>
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
                amountInput.value = "";
            } else {
                customSevaRow.style.display = "none";
                const found = PREDEFINED_SEVAS.find(s => s.id === val);
                if (found) amountInput.value = found.defaultPrice;
            }
            updateAmountInWords();
            updateVoucherPreview();
        });
    }

    [amountInput, devoteeNameInput, sevaDateInput, customSevaName, paymentMode, paymentRefInput].forEach(input => {
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
                id: generateReceiptNo(),
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

            openVoucherPrintModal(newRec);

            invoiceForm.reset();
            handlePaymentModeChange();
            if (receiptNoInput) receiptNoInput.value = generateReceiptNo();
            updateAmountInWords();
            renderAllViews();
        });
    }

    updateVoucherPreview();
}

function updateVoucherPreview() {
    const previewBox = document.getElementById("voucherPreviewBox");
    if (!previewBox) return;

    const devoteeInput = document.getElementById("devoteeName");
    const devotee = devoteeInput && devoteeInput.value.trim() ? devoteeInput.value.trim() : "_______________________";
    
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

    let seva = "_______________________";
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

    previewBox.innerHTML = renderVoucherHTML(rNo, dateVal, devotee, amt, amtWords, mode, seva);
}

// VOUCHER HTML TEMPLATE — Bilingual: English + Kannada (Karnataka clients)
function renderVoucherHTML(recNo, dateStr, devoteeName, amountVal, amountWords, modeStr, sevaPurpose) {
    return `
        <div style="font-family: 'Inter', 'Noto Sans Kannada', sans-serif;">

        <!-- HEADER -->
        <div class="pv-header" style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 4px;">
                <img src="./Images/1000053595.jpg" style="width: 42px; height: 42px; border-radius: 50%; object-fit: contain;">
                <div>
                    <div style="font-size: 0.82rem; font-weight: 900; text-transform: uppercase;">SABARIMALA SRI AYYAPPASWAMY BHAJAN MANDALI (R) HUBBALLI</div>
                    <div style="font-size: 0.72rem; font-weight: 800; font-family: 'Noto Sans Kannada', sans-serif; color: #333;">ಸಬರಿಮಲ ಶ್ರೀ ಅಯ್ಯಪ್ಪಸ್ವಾಮಿ ಭಜನ ಮಂಡಳಿ (ರಿ) ಹುಬ್ಬಳ್ಳಿ</div>
                    <div style="font-size: 0.68rem; font-weight: 800;">CHARITABLE SOCIETY'S / <span style="font-family: 'Noto Sans Kannada', sans-serif;">ಸೇವಾ ಸಂಸ್ಥೆ</span></div>
                </div>
            </div>
            <div style="font-size: 0.8rem; font-weight: 900;">SABARIMALA SRI AYYAPPASWAMY TEMPLE &amp; SRI DURGA DEVI TEMPLE</div>
            <div style="font-size: 0.72rem; font-weight: 700; font-family: 'Noto Sans Kannada', sans-serif; color: #333; margin-top: 2px;">ಸಬರಿಮಲ ಶ್ರೀ ಅಯ್ಯಪ್ಪಸ್ವಾಮಿ ದೇವಸ್ಥಾನ &amp; ಶ್ರೀ ದುರ್ಗಾದೇವಿ ದೇವಸ್ಥಾನ</div>
            <div style="font-size: 0.68rem; font-weight: 700; margin-top: 2px;">NO.428/90, ADARSH LAYOUT, BEHIND HESCOM, HUBBALLI-580020.</div>
            <div style="font-size: 0.65rem; font-family: 'Noto Sans Kannada', sans-serif; color: #555;">ನಂ.428/90, ಆದರ್ಶ ಲೇಔಟ್, ಹೆಸ್ಕಾಮ್ ಹಿಂದೆ, ಹುಬ್ಬಳ್ಳಿ-580020.</div>
            <div style="font-size: 0.7rem; font-weight: 800; margin-top: 2px;">Reg No: HUB/S-428/90-91</div>
        </div>

        <!-- RECEIPT NUMBER & DATE -->
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 800; margin-bottom: 10px;">
            <span>No: <strong>${recNo}</strong></span>
            <span>Date / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.75rem;">ದಿನಾಂಕ</span>: <strong>${dateStr}</strong></span>
        </div>

        <!-- RECEIPT TITLE -->
        <div style="text-align: center; font-size: 1rem; font-weight: 900; letter-spacing: 2px; margin: 10px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0;">
            RECEIPT &nbsp;/&nbsp; <span style="font-family: 'Noto Sans Kannada', sans-serif; letter-spacing: 0px;">ರಶೀದಿ</span>
        </div>

        <!-- AMOUNT IN WORDS -->
        <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: baseline;">
            <span style="white-space: nowrap; margin-right: 6px; font-weight: 800;">
                Received Rs / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.78rem; font-weight:800;">ರೂ. ಸ್ವೀಕರಿಸಿದೆ</span>:
            </span>
            <span style="flex-grow: 1; border-bottom: 1px solid #000; font-weight: 900; padding-left: 4px;">${amountWords}</span>
        </div>

        <!-- FROM (DEVOTEE NAME) -->
        <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: baseline;">
            <span style="white-space: nowrap; margin-right: 6px; font-weight: 800;">
                From Sri/Smt / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.78rem;">ಶ್ರೀ/ಶ್ರೀಮತಿ</span>:
            </span>
            <span style="flex-grow: 1; border-bottom: 1px solid #000; font-weight: 900; padding-left: 4px;">${devoteeName}</span>
        </div>

        <!-- PAYMENT MODE -->
        <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: baseline;">
            <span style="white-space: nowrap; margin-right: 6px; font-weight: 800;">
                Cash/Cheque/UPI / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.78rem;">ನಗದು/ಚೆಕ್/UPI</span>:
            </span>
            <span style="flex-grow: 1; border-bottom: 1px solid #000; font-weight: 900; padding-left: 4px;">${modeStr}</span>
        </div>

        <!-- SEVA / PURPOSE -->
        <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: baseline;">
            <span style="white-space: nowrap; margin-right: 6px; font-weight: 800;">
                On account of / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.78rem;">ಸೇವೆ/ಉದ್ದೇಶ</span>:
            </span>
            <span style="flex-grow: 1; border-bottom: 1px solid #000; font-weight: 900; padding-left: 4px;">${sevaPurpose}</span>
        </div>

        <!-- DATE -->
        <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: baseline;">
            <span style="white-space: nowrap; margin-right: 6px; font-weight: 800;">
                On / <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.78rem;">ದಿನಾಂಕ</span>:
            </span>
            <span style="flex-grow: 1; border-bottom: 1px solid #000; font-weight: 900; padding-left: 4px;">${dateStr}</span>
        </div>

        <!-- AMOUNT BOX -->
        <div style="display: inline-block; border: 2px solid #000; padding: 6px 16px; font-size: 1.1rem; font-weight: 900; margin-top: 10px; background: #f8fafc;">
            Rs. ₹${amountVal.toLocaleString('en-IN')}/-
        </div>

        <!-- SIGNATURES -->
        <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 800; text-align: center;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span>President</span>
                <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.65rem; font-weight:600;">ಅಧ್ಯಕ್ಷರು</span>
                <span style="font-size: 0.65rem; color: #475569;">9448394878</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span>Treasurer</span>
                <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.65rem; font-weight:600;">ಖಜಾಂಚಿ</span>
                <span style="font-size: 0.65rem; color: #475569;">9731605779</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span>Secretary</span>
                <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.65rem; font-weight:600;">ಕಾರ್ಯದರ್ಶಿ</span>
                <span style="font-size: 0.65rem; color: #475569;">9448543913</span>
            </div>
            <div style="display: flex; flex-direction: column; border-top: 1px dashed #000; padding-top: 4px; width: 90px;">
                <span>Signature</span>
                <span style="font-family:'Noto Sans Kannada',sans-serif; font-size:0.65rem; font-weight:600;">ಸಹಿ</span>
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
        if (filterType === "cash") return r.paymentMode === "Cash";
        if (filterType === "upi") return r.paymentMode === "UPI";
        return true;
    });

    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td>
                <div style="font-weight: 800; color: #0f172a;">${r.devoteeName}</div>
                <div style="font-size: 0.72rem; color: #64748b;">Ref: ${r.id}</div>
            </td>
            <td>
                <div style="font-weight: 700;">${r.sevaName}</div>
            </td>
            <td>
                <div style="font-size: 0.85rem; font-weight: 600;">${r.mobile}</div>
                <div style="font-size: 0.72rem; color: #64748b;">${r.date} ${r.time}</div>
            </td>
            <td>
                <div style="font-weight: 900; color: #10b981;">₹${r.amount.toLocaleString('en-IN')}</div>
                <span class="status-tag ${r.paymentMode === 'Cash' ? 'tag-booked' : 'tag-pending'}">${r.paymentMode}</span>
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
    `).join('');

    const showingText = document.getElementById("showingCountText");
    if (showingText) showingText.textContent = `SHOWING ${filtered.length} OF ${receiptsData.length} DONATION RECORDS`;

    if (window.lucide) lucide.createIcons();
}

function renderTotalDonationsTable() {
    const tbody = document.getElementById("totalDonationBody");
    if (!tbody) return;

    tbody.innerHTML = receiptsData.map(r => `
        <tr>
            <td style="font-weight: 800;">${r.id}</td>
            <td style="font-size: 0.82rem; color: #64748b;">${r.date} ${r.time}</td>
            <td style="font-weight: 700;">${r.devoteeName}</td>
            <td>${r.sevaName}</td>
            <td><span class="status-tag tag-pending">${r.paymentMode}</span></td>
            <td style="font-weight: 900; color: #d97706;">₹${r.amount.toLocaleString('en-IN')}</td>
            <td>
                <button class="btn-allot" style="padding: 6px 12px; font-size: 0.72rem;" onclick="printVoucherById('${r.id}')">
                    <i data-lucide="printer" style="width: 14px; height: 14px; margin-right: 4px;"></i> Receipt
                </button>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayTotal = 0;
    let cashTotal = 0;

    receiptsData.forEach(r => {
        if (r.date === todayStr) todayTotal += r.amount;
        if (r.paymentMode === "Cash") cashTotal += r.amount;
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

function openVoucherPrintModal(rec) {
    const modal = document.getElementById("printVoucherModal");
    const container = document.getElementById("printableVoucherContent");
    
    if (modal && container) {
        const amtWords = numberToWords(rec.amount);
        container.innerHTML = `
            <div style="margin: 0 auto; border: 2px solid #000; padding: 20px; background: white;">
                ${renderVoucherHTML(rec.id, rec.date, rec.devoteeName, rec.amount, amtWords, rec.paymentMode, rec.sevaName)}
            </div>
        `;
        modal.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    }
}

window.closeVoucherModal = function() {
    const modal = document.getElementById("printVoucherModal");
    if (modal) modal.style.display = 'none';
};
