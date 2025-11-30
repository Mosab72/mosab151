// script_full.js - نظام إدارة عقود الاعتماد الأكاديمي (محدث)

// ========== Initialize ========== 
document.addEventListener('DOMContentLoaded', () => {
    console.log('تحميل النظام المحدث...');
    console.log('عدد العقود:', allContracts.length);
    
    initializeApp();
});

function initializeApp() {
    // Update header statistics
    updateHeaderStats();
    
    // Initialize overview section
    initOverviewSection();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize expiry section
    initExpirySection();
    
    // Initialize universities section
    initUniversitiesSection();
    
    // Initialize departments section
    initDepartmentsSection();
    
    // Initialize programs section
    initProgramsSection();
    
    // Update last update time
    document.getElementById('lastUpdate').textContent = statistics.generatedAt;
    
    console.log('✅ تم تحميل النظام بنجاح');
}

// ========== Header Statistics ==========
function updateHeaderStats() {
    document.getElementById('totalContracts').textContent = statistics.totalContracts;
    document.getElementById('totalUniversities').textContent = statistics.totalUniversities;
}

// ========== Navigation ==========
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// ========== Overview Section ==========
function initOverviewSection() {
    // Update expiry counts
    document.getElementById('before2024').textContent = expiryAnalysis.before2024;
    document.getElementById('h1_2025').textContent = expiryAnalysis.h1_2025;
    document.getElementById('h2_2025').textContent = expiryAnalysis.h2_2025;
    document.getElementById('y2026Plus').textContent = expiryAnalysis.year2026Plus;
    
    // Render departments summary
    renderDepartmentsSummary();
    
    // Render top universities
    renderTopUniversities();
}

function renderDepartmentsSummary() {
    const container = document.getElementById('deptSummary');
    container.innerHTML = '';
    
    Object.entries(departmentAnalysis).forEach(([dept, contracts]) => {
        const item = document.createElement('div');
        item.className = 'dept-item';
        item.innerHTML = `
            <span class="dept-name">${dept}</span>
            <span class="dept-count">${contracts.length}</span>
        `;
        container.appendChild(item);
    });
}

function renderTopUniversities() {
    const container = document.getElementById('topUniversities');
    container.innerHTML = '';
    
    const maxCount = Math.max(...Object.values(universityAnalysis).map(c => c.length));
    
    Object.entries(universityAnalysis).slice(0, 10).forEach(([uni, contracts], index) => {
        const percentage = (contracts.length / maxCount) * 100;
        
        const item = document.createElement('div');
        item.className = 'uni-rank-item';
        item.innerHTML = `
            <div class="uni-rank">${index + 1}</div>
            <div class="uni-rank-info">
                <div class="uni-rank-name">${uni}</div>
                <div class="uni-rank-count">${contracts.length} عقد</div>
            </div>
            <div class="uni-rank-bar">
                <div class="uni-rank-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            showUniversityContracts(uni, contracts);
        });
        
        container.appendChild(item);
    });
}

// ========== Expiry Section ==========
function initExpirySection() {
    const tabBtns = document.querySelectorAll('#expiry .tab-btn');
    
    // Show all contracts by default
    renderExpiryContracts('all');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            
            // Render contracts for selected period
            const period = btn.getAttribute('data-period');
            renderExpiryContracts(period);
        });
    });
}

function renderExpiryContracts(period) {
    const container = document.getElementById('expiryContracts');
    container.innerHTML = '';
    
    let contractsToShow = [];
    
    if (period === 'all') {
        contractsToShow = allContracts;
    } else if (period === 'before2024') {
        contractsToShow = expiryAnalysis.data['قبل نهاية 2024'];
    } else if (period === 'h1_2025') {
        contractsToShow = expiryAnalysis.data['النصف الأول 2025'];
    } else if (period === 'h2_2025') {
        contractsToShow = expiryAnalysis.data['النصف الثاني 2025'];
    } else if (period === 'y2026Plus') {
        contractsToShow = expiryAnalysis.data['2026 وما بعد'];
    }
    
    if (contractsToShow.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد عقود في هذه الفترة</p>';
        return;
    }
    
    contractsToShow.forEach(contract => {
        const card = createContractCard(contract);
        container.appendChild(card);
    });
}

function createContractCard(contract) {
    const card = document.createElement('div');
    
    // Determine urgency class
    const endDate = parseDate(contract.contractEnd);
    const now = new Date();
    const daysUntilExpiry = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
    
    let urgencyClass = 'safe';
    if (daysUntilExpiry < 0) {
        urgencyClass = 'urgent';
    } else if (daysUntilExpiry < 180) {
        urgencyClass = 'warning';
    } else if (daysUntilExpiry < 365) {
        urgencyClass = 'attention';
    }
    
    card.className = `contract-card ${urgencyClass}`;
    card.innerHTML = `
        <div class="contract-header">
            <div class="contract-id">عقد #${contract.id}</div>
            <div class="contract-university">${contract.university}</div>
            <div class="contract-program">${contract.program}</div>
        </div>
        <div class="contract-body">
            <div class="contract-info">
                <span class="info-label">الدرجة العلمية:</span>
                <span class="info-value">${contract.degree}</span>
            </div>
            <div class="contract-info">
                <span class="info-label">الإدارة المختصة:</span>
                <span class="info-value">${contract.department}</span>
            </div>
            <div class="contract-info">
                <span class="info-label">بداية العقد:</span>
                <span class="info-value">${contract.contractStart}</span>
            </div>
            <div class="contract-info">
                <span class="info-label">انتهاء العقد:</span>
                <span class="info-value">${contract.contractEnd}</span>
            </div>
            <div class="contract-info">
                <span class="info-label">نسبة الإنجاز:</span>
                <span class="info-value">${contract.progress}</span>
            </div>
            <div class="contract-info">
                <span class="info-label">الحالة:</span>
                <span class="info-value">
                    <span class="contract-badge ${getStatusClass(contract.status)}">${contract.status}</span>
                </span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showContractDetail(contract);
    });
    
    return card;
}

function getStatusClass(status) {
    if (status === 'ساري') return 'badge-active';
    if (status === 'منتهي') return 'badge-expired';
    return 'badge-pending';
}

// ========== Universities Section ==========
function initUniversitiesSection() {
    renderUniversitiesList();
    
    // Search functionality
    const searchInput = document.getElementById('uniSearch');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        filterUniversities(query);
    });
}

function renderUniversitiesList() {
    const container = document.getElementById('universitiesList');
    container.innerHTML = '';
    
    Object.entries(universityAnalysis).forEach(([uni, contracts]) => {
        const item = document.createElement('div');
        item.className = 'university-item';
        item.setAttribute('data-university', uni);
        
        item.innerHTML = `
            <div class="university-header">
                <span class="university-name">${uni}</span>
                <span class="university-count">${contracts.length} عقد</span>
            </div>
            <div class="university-contracts" id="uni-${uni.replace(/\s+/g, '-')}">
                <!-- Contracts will be loaded on expand -->
            </div>
        `;
        
        const header = item.querySelector('.university-header');
        header.addEventListener('click', () => {
            toggleUniversityItem(item, uni, contracts);
        });
        
        container.appendChild(item);
    });
}

function toggleUniversityItem(item, uni, contracts) {
    const isExpanded = item.classList.contains('expanded');
    
    // Collapse all
    document.querySelectorAll('.university-item').forEach(u => {
        u.classList.remove('expanded');
    });
    
    if (!isExpanded) {
        item.classList.add('expanded');
        
        // Load contracts if not loaded
        const contractsContainer = item.querySelector('.university-contracts');
        if (contractsContainer.children.length === 0) {
            const grid = document.createElement('div');
            grid.className = 'contracts-grid';
            
            contracts.forEach(contract => {
                const card = createContractCard(contract);
                grid.appendChild(card);
            });
            
            contractsContainer.appendChild(grid);
        }
    }
}

function filterUniversities(query) {
    const items = document.querySelectorAll('.university-item');
    
    items.forEach(item => {
        const uni = item.getAttribute('data-university');
        if (query === '' || uni.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function showUniversityContracts(uni, contracts) {
    // Switch to universities section
    document.querySelector('[data-section="universities"]').click();
    
    // Find and expand the university
    setTimeout(() => {
        const items = document.querySelectorAll('.university-item');
        items.forEach(item => {
            if (item.getAttribute('data-university') === uni) {
                item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    item.querySelector('.university-header').click();
                }, 500);
            }
        });
    }, 100);
}

// ========== Departments Section ==========
function initDepartmentsSection() {
    renderDepartmentsList();
}

function renderDepartmentsList() {
    const container = document.getElementById('departmentsList');
    container.innerHTML = '';
    
    const departmentColors = {
        'العلوم الإنسانية والتربوية': 'linear-gradient(135deg, #3F51B5 0%, #5C6BC0 100%)',
        'العلوم الهندسية والحاسوبية': 'linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%)',
        'العلوم الصحية': 'linear-gradient(135deg, #D32F2F 0%, #E57373 100%)',
        'العلوم الإسلامية والعربية': 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
        'التخصصات العلمية': 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'
    };
    
    Object.entries(departmentAnalysis).forEach(([dept, contracts]) => {
        const card = document.createElement('div');
        card.className = 'department-card';
        
        const color = departmentColors[dept] || 'linear-gradient(135deg, #00695C 0%, #00897B 100%)';
        
        card.innerHTML = `
            <div class="department-header" style="background: ${color}">
                <div class="department-name">${dept}</div>
                <div class="department-count">${contracts.length} عقد</div>
            </div>
            <div class="department-contracts" id="dept-${dept.replace(/\s+/g, '-')}">
                <!-- Contracts will be loaded on expand -->
            </div>
        `;
        
        const header = card.querySelector('.department-header');
        header.addEventListener('click', () => {
            toggleDepartmentCard(card, dept, contracts);
        });
        
        container.appendChild(card);
    });
}

function toggleDepartmentCard(card, dept, contracts) {
    const isExpanded = card.classList.contains('expanded');
    
    if (isExpanded) {
        card.classList.remove('expanded');
    } else {
        card.classList.add('expanded');
        
        // Load contracts if not loaded
        const contractsContainer = card.querySelector('.department-contracts');
        if (contractsContainer.children.length === 0) {
            const grid = document.createElement('div');
            grid.className = 'contracts-grid';
            
            contracts.forEach(contract => {
                const card = createContractCard(contract);
                grid.appendChild(card);
            });
            
            contractsContainer.appendChild(grid);
        }
    }
}

// ========== Programs Section ==========
function initProgramsSection() {
    const tabBtns = document.querySelectorAll('#programs .tab-btn');
    
    // Show all programs by default
    renderProgramsList('all');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            
            // Render programs for selected department
            const dept = btn.getAttribute('data-dept');
            renderProgramsList(dept);
        });
    });
}

function renderProgramsList(dept) {
    const container = document.getElementById('programsList');
    container.innerHTML = '';
    
    // Group contracts by program
    const programsMap = {};
    
    allContracts.forEach(contract => {
        if (dept !== 'all' && contract.department !== dept) {
            return;
        }
        
        const key = `${contract.program}|${contract.department}`;
        if (!programsMap[key]) {
            programsMap[key] = [];
        }
        programsMap[key].push(contract);
    });
    
    // Sort by count
    const sortedPrograms = Object.entries(programsMap).sort((a, b) => b[1].length - a[1].length);
    
    sortedPrograms.forEach(([key, contracts]) => {
        const [program, department] = key.split('|');
        
        const card = document.createElement('div');
        card.className = 'program-card';
        card.innerHTML = `
            <div class="program-name">${program}</div>
            <div class="program-dept">${department}</div>
            <span class="program-count">${contracts.length} عقد</span>
        `;
        
        card.addEventListener('click', () => {
            showProgramContracts(program, contracts);
        });
        
        container.appendChild(card);
    });
}

function showProgramContracts(program, contracts) {
    const modal = document.getElementById('contractModal');
    const detail = document.getElementById('contractDetail');
    
    detail.innerHTML = `
        <h2 class="detail-title">${program}</h2>
        <p style="margin-bottom: 24px; color: #616161;">عدد العقود: ${contracts.length}</p>
        <div class="contracts-grid">
            ${contracts.map(c => createContractCard(c).outerHTML).join('')}
        </div>
    `;
    
    modal.classList.add('active');
    
    // Re-attach click events for contract cards
    detail.querySelectorAll('.contract-card').forEach((card, idx) => {
        card.addEventListener('click', () => {
            showContractDetail(contracts[idx]);
        });
    });
}

// ========== Contract Detail Modal ==========
function showContractDetail(contract) {
    const modal = document.getElementById('contractModal');
    const detail = document.getElementById('contractDetail');
    
    detail.innerHTML = `
        <h2 class="detail-title">تفاصيل العقد #${contract.id}</h2>
        
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">الجامعة / الكلية</span>
                <span class="detail-value">${contract.university}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">اسم البرنامج</span>
                <span class="detail-value">${contract.program}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">الدرجة العلمية</span>
                <span class="detail-value">${contract.degree}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">الإدارة المختصة</span>
                <span class="detail-value">${contract.department}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">حالة العقد</span>
                <span class="detail-value">
                    <span class="contract-badge ${getStatusClass(contract.status)}">${contract.status}</span>
                </span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">نسبة الإنجاز</span>
                <span class="detail-value">${contract.progress}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">بداية سريان العقد</span>
                <span class="detail-value">${contract.contractStart}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">انتهاء سريان العقد</span>
                <span class="detail-value">${contract.contractEnd}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">تاريخ استلام الوثائق</span>
                <span class="detail-value">${contract.docsReceived}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">اتباع شروط الاعتماد لتاريخ استلام الوثائق</span>
                <span class="detail-value">${contract.docsComplianceStatus}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">اتباع شروط استلام الوثائق المحدثة</span>
                <span class="detail-value">${contract.docsUpdatedStatus}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">تاريخ استلام الوثائق المحدثة</span>
                <span class="detail-value">${contract.docsUpdated}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">التاريخ المجدول لزيارة المراجعين</span>
                <span class="detail-value">${contract.visitScheduled}</span>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">اتباع شروط التاريخ المجدول لزيارة المراجعين</span>
                <span class="detail-value">${contract.visitComplianceStatus}</span>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close modal
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('contractModal').classList.remove('active');
});

document.getElementById('contractModal').addEventListener('click', (e) => {
    if (e.target.id === 'contractModal') {
        document.getElementById('contractModal').classList.remove('active');
    }
});

// ========== Utility Functions ==========
function parseDate(dateStr) {
    // Parse DD/MM/YYYY format
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// ========== Export for debugging ==========
window.appDebug = {
    allContracts,
    expiryAnalysis,
    universityAnalysis,
    departmentAnalysis,
    statistics
};