// Academic Accreditation Contracts Management System - Version 3.0 (Accurate University Data)
// تاريخ التحديث: 2024-11-30

// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadExpiryAnalysis();
    loadUniversitiesAnalysis();
    loadDepartmentsAnalysis();
    loadSpecializationsAnalysis();
});

// تحميل الإحصائيات العامة
function loadStatistics() {
    const statsContainer = document.getElementById('generalStats');
    
    // حساب إحصائيات حقيقية من البيانات
    const totalContracts = contractsData.length;
    const activeContracts = contractsData.filter(c => c.status === 'ساري').length;
    const expiredContracts = contractsData.filter(c => c.status === 'منتهي').length;
    const pendingContracts = contractsData.filter(c => c.status === 'معلق').length;
    
    // عدد الجامعات الفريدة
    const universities = [...new Set(contractsData.map(c => c.university))];
    
    // عدد الإدارات الفريدة
    const departments = [...new Set(contractsData.map(c => c.department))];
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>إجمالي العقود</h3>
            <p class="stat-number">${totalContracts}</p>
        </div>
        <div class="stat-card">
            <h3>عقود سارية</h3>
            <p class="stat-number">${activeContracts}</p>
        </div>
        <div class="stat-card">
            <h3>عقود منتهية</h3>
            <p class="stat-number">${expiredContracts}</p>
        </div>
        <div class="stat-card">
            <h3>عقود معلقة</h3>
            <p class="stat-number">${pendingContracts}</p>
        </div>
        <div class="stat-card">
            <h3>عدد الجامعات</h3>
            <p class="stat-number">${universities.length}</p>
        </div>
        <div class="stat-card">
            <h3>عدد الإدارات</h3>
            <p class="stat-number">${departments.length}</p>
        </div>
    `;
}

// تحليل العقود حسب تاريخ الانتهاء
function loadExpiryAnalysis() {
    const container = document.getElementById('expiryContracts');
    
    // تصنيف العقود حسب تاريخ الانتهاء
    const today = new Date();
    const endOf2024 = new Date('2024-12-31');
    const endOfH1_2025 = new Date('2025-06-30');
    const endOfH2_2025 = new Date('2025-12-31');
    
    const categories = {
        'before2025': { title: 'قبل نهاية 2024', contracts: [], color: '#e74c3c' },
        'h1_2025': { title: 'النصف الأول 2025', contracts: [], color: '#e67e22' },
        'h2_2025': { title: 'النصف الثاني 2025', contracts: [], color: '#f39c12' },
        'after2025': { title: '2026 وما بعد', contracts: [], color: '#27ae60' }
    };
    
    contractsData.forEach(contract => {
        const endDate = parseDate(contract.contractEnd);
        
        if (endDate <= endOf2024) {
            categories['before2025'].contracts.push(contract);
        } else if (endDate <= endOfH1_2025) {
            categories['h1_2025'].contracts.push(contract);
        } else if (endDate <= endOfH2_2025) {
            categories['h2_2025'].contracts.push(contract);
        } else {
            categories['after2025'].contracts.push(contract);
        }
    });
    
    // عرض التصنيفات
    let html = '';
    Object.keys(categories).forEach(key => {
        const cat = categories[key];
        html += `
            <div class="expiry-section">
                <div class="expiry-header" style="background: ${cat.color}">
                    <h3>${cat.title}</h3>
                    <span class="badge">${cat.contracts.length} عقد</span>
                </div>
                <div class="contracts-grid">
                    ${cat.contracts.map(contract => createContractCard(contract)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// تحليل العقود حسب الجامعات - محسّن ودقيق
function loadUniversitiesAnalysis() {
    const container = document.getElementById('universitiesContracts');
    
    // جمع كل العقود حسب الجامعة
    const universitiesData = {};
    
    contractsData.forEach(contract => {
        const uni = contract.university;
        if (!universitiesData[uni]) {
            universitiesData[uni] = [];
        }
        universitiesData[uni].push(contract);
    });
    
    // تحويل إلى مصفوفة وترتيب حسب عدد العقود
    const universitiesArray = Object.keys(universitiesData).map(uni => ({
        name: uni,
        contracts: universitiesData[uni],
        count: universitiesData[uni].length
    })).sort((a, b) => b.count - a.count);
    
    // إنشاء قائمة الفلتر
    let filterHTML = `
        <div class="university-filter">
            <label for="universitySelect">فلترة حسب الجامعة:</label>
            <select id="universitySelect" onchange="filterByUniversity(this.value)">
                <option value="all">جميع الجامعات (${universitiesArray.length} جامعة)</option>
                ${universitiesArray.map(uni => 
                    `<option value="${uni.name}">${uni.name} (${uni.count} عقد)</option>`
                ).join('')}
            </select>
        </div>
        <div class="university-search">
            <input type="text" id="universitySearch" placeholder="بحث عن جامعة..." 
                   onkeyup="searchUniversity(this.value)">
        </div>
    `;
    
    // إنشاء بطاقات الجامعات
    let universitiesHTML = '<div id="universitiesList">';
    universitiesArray.forEach(uni => {
        universitiesHTML += `
            <div class="university-card" data-university="${uni.name}">
                <div class="university-header">
                    <h3>${uni.name}</h3>
                    <span class="badge">${uni.count} عقد</span>
                </div>
                <div class="university-body">
                    <button class="btn-expand" onclick="toggleUniversityContracts('${uni.name}')">
                        عرض العقود
                    </button>
                    <div class="university-contracts" id="uni-${uni.name.replace(/\s+/g, '-')}" style="display:none;">
                        <div class="contracts-grid">
                            ${uni.contracts.map(contract => createContractCard(contract)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    universitiesHTML += '</div>';
    
    container.innerHTML = filterHTML + universitiesHTML;
}

// فلترة حسب الجامعة
function filterByUniversity(universityName) {
    const allCards = document.querySelectorAll('.university-card');
    
    if (universityName === 'all') {
        allCards.forEach(card => card.style.display = 'block');
    } else {
        allCards.forEach(card => {
            if (card.getAttribute('data-university') === universityName) {
                card.style.display = 'block';
                // فتح العقود تلقائياً عند الفلترة
                const uniId = 'uni-' + universityName.replace(/\s+/g, '-');
                document.getElementById(uniId).style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// بحث في الجامعات
function searchUniversity(searchText) {
    const allCards = document.querySelectorAll('.university-card');
    const searchLower = searchText.toLowerCase();
    
    allCards.forEach(card => {
        const uniName = card.getAttribute('data-university').toLowerCase();
        if (uniName.includes(searchLower)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// تبديل عرض عقود الجامعة
function toggleUniversityContracts(universityName) {
    const uniId = 'uni-' + universityName.replace(/\s+/g, '-');
    const contractsDiv = document.getElementById(uniId);
    
    if (contractsDiv.style.display === 'none') {
        contractsDiv.style.display = 'block';
    } else {
        contractsDiv.style.display = 'none';
    }
}

// تحليل العقود حسب الإدارات
function loadDepartmentsAnalysis() {
    const container = document.getElementById('departmentsContracts');
    
    // جمع العقود حسب الإدارة
    const departmentsData = {};
    
    contractsData.forEach(contract => {
        const dept = contract.department;
        if (!departmentsData[dept]) {
            departmentsData[dept] = [];
        }
        departmentsData[dept].push(contract);
    });
    
    // تحويل إلى مصفوفة
    const departmentsArray = Object.keys(departmentsData).map(dept => ({
        name: dept,
        contracts: departmentsData[dept],
        count: departmentsData[dept].length
    }));
    
    // عرض الإدارات
    let html = '';
    departmentsArray.forEach(dept => {
        html += `
            <div class="department-section">
                <div class="department-header">
                    <h3>${dept.name}</h3>
                    <span class="badge">${dept.count} عقد</span>
                </div>
                <div class="contracts-grid">
                    ${dept.contracts.map(contract => createContractCard(contract)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// تحليل العقود حسب التخصصات
function loadSpecializationsAnalysis() {
    const container = document.getElementById('specializationsContracts');
    
    // جمع العقود حسب التخصص
    const specsData = {};
    
    contractsData.forEach(contract => {
        const spec = contract.program;
        if (!specsData[spec]) {
            specsData[spec] = [];
        }
        specsData[spec].push(contract);
    });
    
    // تحويل إلى مصفوفة وترتيب
    const specsArray = Object.keys(specsData).map(spec => ({
        name: spec,
        contracts: specsData[spec],
        count: specsData[spec].length
    })).sort((a, b) => b.count - a.count);
    
    // عرض التخصصات
    let html = '<div class="specializations-grid">';
    specsArray.forEach(spec => {
        html += `
            <div class="spec-card" onclick="showSpecContracts('${spec.name}')">
                <h4>${spec.name}</h4>
                <span class="badge">${spec.count} عقد</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // حفظ بيانات التخصصات للاستخدام لاحقاً
    window.specializationsData = specsData;
}

// عرض عقود تخصص معين
function showSpecContracts(specName) {
    const contracts = window.specializationsData[specName];
    
    let html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>عقود تخصص: ${specName}</h2>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <p>عدد العقود: ${contracts.length}</p>
                    <div class="contracts-grid">
                        ${contracts.map(contract => createContractCard(contract)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// إنشاء بطاقة عقد
function createContractCard(contract) {
    const urgencyClass = getUrgencyClass(contract.contractEnd);
    
    return `
        <div class="contract-card ${urgencyClass}" onclick="showContractDetails(${contract.id})">
            <h4>${contract.university}</h4>
            <p><strong>البرنامج:</strong> ${contract.program}</p>
            <p><strong>الدرجة:</strong> ${contract.degree}</p>
            <p><strong>الحالة:</strong> ${contract.status}</p>
            <p><strong>تاريخ الانتهاء:</strong> ${contract.contractEnd}</p>
            <p><strong>نسبة الإنجاز:</strong> ${contract.progress}</p>
        </div>
    `;
}

// تحديد درجة الأولوية حسب تاريخ الانتهاء
function getUrgencyClass(endDateStr) {
    const endDate = parseDate(endDateStr);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'critical';
    if (diffDays <= 180) return 'warning';
    if (diffDays <= 365) return 'notice';
    return 'normal';
}

// تحويل التاريخ من نص إلى كائن Date
function parseDate(dateStr) {
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// عرض تفاصيل العقد
function showContractDetails(contractId) {
    const contract = contractsData.find(c => c.id === contractId);
    
    if (!contract) return;
    
    const html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content contract-details" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>تفاصيل العقد</h2>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>الجامعة:</strong>
                            <span>${contract.university}</span>
                        </div>
                        <div class="detail-item">
                            <strong>البرنامج:</strong>
                            <span>${contract.program}</span>
                        </div>
                        <div class="detail-item">
                            <strong>الدرجة العلمية:</strong>
                            <span>${contract.degree}</span>
                        </div>
                        <div class="detail-item">
                            <strong>الإدارة المختصة:</strong>
                            <span>${contract.department}</span>
                        </div>
                        <div class="detail-item">
                            <strong>حالة العقد:</strong>
                            <span class="status-badge status-${contract.status}">${contract.status}</span>
                        </div>
                        <div class="detail-item">
                            <strong>تاريخ بداية العقد:</strong>
                            <span>${contract.contractStart}</span>
                        </div>
                        <div class="detail-item">
                            <strong>تاريخ انتهاء العقد:</strong>
                            <span>${contract.contractEnd}</span>
                        </div>
                        <div class="detail-item">
                            <strong>نسبة الإنجاز:</strong>
                            <span>${contract.progress}</span>
                        </div>
                        <div class="detail-item">
                            <strong>تاريخ استلام الوثائق:</strong>
                            <span>${contract.docsReceived}</span>
                        </div>
                        <div class="detail-item">
                            <strong>حالة اتباع شروط استلام الوثائق:</strong>
                            <span class="status-badge">${contract.docsComplianceStatus}</span>
                        </div>
                        <div class="detail-item">
                            <strong>تاريخ تحديث الوثائق:</strong>
                            <span>${contract.docsUpdated}</span>
                        </div>
                        <div class="detail-item">
                            <strong>حالة تحديث الوثائق:</strong>
                            <span class="status-badge">${contract.docsUpdatedStatus}</span>
                        </div>
                        <div class="detail-item">
                            <strong>تاريخ جدولة الزيارة:</strong>
                            <span>${contract.visitScheduled}</span>
                        </div>
                        <div class="detail-item">
                            <strong>حالة اتباع شروط جدولة الزيارة:</strong>
                            <span class="status-badge">${contract.visitComplianceStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

// التنقل بين الأقسام
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // إخفاء جميع أزرار التبويب النشطة
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    document.getElementById(sectionId).classList.add('active');
    
    // تفعيل زر التبويب
    event.target.classList.add('active');
}
