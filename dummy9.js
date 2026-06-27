// 1. உங்களுடைய புதிய Google Apps Script URL-ஐ இங்கே பேஸ்ட் செய்யவும் தலை
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrKd4W0X5zkDP5Afn9Z5RaHO9RvqzO149NQ-XMcd712V4r6I8ie-1MJ8ZnouMyOm726A/exec';

const productGrid = document.getElementById('product-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const productForm = document.getElementById('product-form');
const resultsCount = document.getElementById('results-count');

const successModal = document.getElementById('success-modal');
const successOkBtn = document.getElementById('success-ok-btn');

// --- டிப்ஸ் மோடல் எலிமெண்ட்டுகள் ---
const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsAmountInput = document.getElementById('tips-amount');
const payerNameInput = document.getElementById('payer-name');
const upiPayLink = document.getElementById('upi-pay-link');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const productFilter = document.getElementById('product-filter');
const chips = document.querySelectorAll('.chip');

// உங்களது UPI விபரங்கள்
const MY_UPI_ID = "8939717405@ybl";
const MERCHANT_NAME = "Pasumai Santhai"; 



let shopList = [];

// --- 2. Google Sheet-ல இருந்து கடை விபரங்களை எடுக்கும் பங்க்ஷன் ---
async function loadShopsFromSheet() {
    productGrid.innerHTML = `
        <div style="text-align:center; padding:40px; grid-column: 1/-1; color:#10B981;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; margin-bottom:10px;"></i>
            <p>பசுமைச் சந்தை கடைகள் லோடு ஆகிறது...</p>
        </div>`;
        
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET", redirect: "follow" });
        shopList = await response.json();
        
        if (shopList.error) {
            console.error("Apps Script Error:", shopList.error);
            productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script பிழை ஏற்பட்டுள்ளது!</p></div>';
        } else {
            handleSearch(); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

// --- 3. கடைகளை ஸ்கிரீனில் காட்டும் ரெண்டர் பங்க்ஷன் ---
function renderShops(dataToRender = shopList) {
    productGrid.innerHTML = '';
    if (!Array.isArray(dataToRender)) return;
    
    resultsCount.textContent = `${dataToRender.length} கடைகள் உள்ளன`;

    if(dataToRender.length === 0) {
        productGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#4B5563; grid-column: 1/-1;">
                <i class="fa-solid fa-basket-shopping" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>இந்த ஏரியாவில் கடைகள் எதுவும் இல்லை! முதல் ஆளாக உங்கள் கடையைப் பதியவும்.</p>
            </div>`;
        return;
    }

    dataToRender.forEach(shop => {
        const card = document.createElement('div');
        card.className = 'expert-card';

        let iconHtml = '<i class="fa-solid fa-carrot"></i>'; 
        let typeBadge = 'காயறிகள்';
        
        if(shop.type === 'greens') { iconHtml = '<i class="fa-solid fa-seedling"></i>'; typeBadge = 'கீரை'; }
        if(shop.type === 'milk') { iconHtml = '<i class="fa-solid fa-cow"></i>'; typeBadge = 'பால் & நெய்'; }
        if(shop.type === 'coconut') { iconHtml = '<i class="fa-solid fa-tree"></i>'; typeBadge = 'தேங்காய்'; }

        card.innerHTML = `
            <div class="card-left">
                <div class="avatar-container">
                    ${iconHtml}
                </div>
                <div class="expert-info">
                    <h4>${shop.name} <span class="badge">${typeBadge}</span></h4>
                    <p class="shop-title">${shop.shopName || 'உள்ளூர் விவசாயி'}</p>
                    <p class="delivery-tag">${shop.delivery || 'நேரடி விற்பனை'}</p>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${shop.location}</p>
                </div>
            </div>
            <div class="card-right-actions">
                <a href="tel:${shop.phone}" class="call-btn-link"><i class="fa-solid fa-phone"></i></a>
                <a href="https://wa.me/91${shop.phone}?text=வணக்கம், பசுமை சந்தை மூலமாக உங்களைத் தொடர்பு கொள்கிறேன்." target="_blank" class="wa-btn-link"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// --- 4. தேடல் மற்றும் ஃபில்டர் லாஜிக் ---
function handleSearch() {
    if (!Array.isArray(shopList)) return;
    
    const searchText = areaSearch.value.toLowerCase().trim();
    const selectedType = productFilter.value;

    const filtered = shopList.filter(shop => {
        const matchesArea = shop.location ? shop.location.toLowerCase().includes(searchText) : false;
        const matchesType = (selectedType === 'all' || shop.type === selectedType);
        return matchesArea && matchesType;
    });

    renderShops(filtered);
}

searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('input', handleSearch);
productFilter.addEventListener('change', handleSearch);

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        productFilter.value = chip.getAttribute('data-filter');
        handleSearch();
    });
});

// மோடல் திறப்பது/மூடுவது
openFormBtn.addEventListener('click', () => registerModal.style.display = 'flex');
closeRegBtn.addEventListener('click', () => registerModal.style.display = 'none');

// --- டிப்ஸ் மோடல் இயக்கங்கள் ---
if(tipsBtn && tipsModal) {
    tipsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        tipsModal.style.display = 'flex';
        updateUPILink();
    });
}

if(closeTipsBtn) {
    closeTipsBtn.addEventListener('click', () => {
        tipsModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === tipsModal) tipsModal.style.display = 'none';
});

// --- UPI லிங்க் ஜெனரேட் செய்யும் லாஜிக் ---
function updateUPILink() {
    const amount = tipsAmountInput.value || "100"; 
    const payerName = payerNameInput.value.trim() || "Farmer Support";
    
    const upiUrl = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Tips from " + payerName)}`;
    upiPayLink.setAttribute('href', upiUrl);
}

if(tipsAmountInput && payerNameInput) {
    tipsAmountInput.addEventListener('input', updateUPILink);
    payerNameInput.addEventListener('input', updateUPILink);
}

if(upiPayLink) {
    upiPayLink.addEventListener('click', function(e) {
        if(!tipsAmountInput.value || tipsAmountInput.value <= 0) {
            e.preventDefault();
            alert('தயவுசெய்து சரியான தொகையை உள்ளிடவும்!');
        }
    });
}

// 'சரி' பட்டன் கிளிக் செய்யும்போது பாப்-அப்பை மறைக்க
if (successOkBtn) {
    successOkBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
}

// வெளியில் கிளிக் செய்யும் போது மூடுவதற்கான விண்டோ லிசனர் அப்டேட்
window.addEventListener('click', (e) => {
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === tipsModal) tipsModal.style.display = 'none';
    if (e.target === successModal) successModal.style.display = 'none'; // இதையும் சேர்க்கவும்
});


// --- 5. புதுக் கடையை Google Sheet-க்கு சேமிக்கும் POST லாஜிக் ---
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = productForm.querySelector('.submit-btn');
    submitBtn.textContent = 'பதிவாகிறது... வெயிட் பண்ணுங்க தலை...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('name', document.getElementById('owner-name').value);
    formData.append('shopName', document.getElementById('shop-name').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('type', document.getElementById('prod-type').value);
    formData.append('delivery', document.getElementById('delivery-info').value);
    formData.append('location', document.getElementById('location').value);

        try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            productForm.reset();
            registerModal.style.display = 'none'; // ரெஜிஸ்டர் படிவத்தை மூடுகிறது
            successModal.style.display = 'flex';  // புதிய வெற்றி பாப்-அப்பை காட்டுகிறது
            loadShopsFromSheet(); 
        } else {
            alert('பிழை: ' + result.error);
        }
    } catch (error) {
        console.error('Error uploading data:', error);
        alert('நெட்வொர்க் பிழை! கூகுள் ஷீட்டுடன் கனெக்ட் செய்ய முடியவில்லை.');
    } finally {
        submitBtn.textContent = 'விபரங்களைச் சமர்ப்பிக்க';
        submitBtn.disabled = false;
    }

});



document.addEventListener('DOMContentLoaded', loadShopsFromSheet);


