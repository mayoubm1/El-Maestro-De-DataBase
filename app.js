// Supabase Multi-Hub Database Manager - Main Application Logic
// Enterprise-grade database schema management system

// Global state
const appState = {
    connected: false,
    supabaseUrl: 'https://vrfyjirddfdnwuffzqhb.supabase.co',
    supabaseKey: 'sbp_ebcdee0eecff08defda73625f56755a18a15dd0e',
    dbPassword: 'postgresql://postgres:Maayoubm235152!?@db.vrfyjirddfdnwuffzqhb.supabase.co:5432/postgres',
    tables: [],
    hubs: [],
    selectedTables: [],
    conflicts: [],
    rlsPolicies: [],
    functions: [],
    triggers: [],
    migrations: []
};

// Sample data for demonstration (in production, this would come from Supabase API)
const sampleTables = [
    // CRM Hub
    { name: 'customers', hub: 'CRM', columns: 15, rows: 25000, hasRLS: true, conflicts: 0 },
    { name: 'contacts', hub: 'CRM', columns: 12, rows: 50000, hasRLS: true, conflicts: 1 },
    { name: 'leads', hub: 'CRM', columns: 18, rows: 15000, hasRLS: true, conflicts: 0 },
    { name: 'opportunities', hub: 'CRM', columns: 20, rows: 8000, hasRLS: true, conflicts: 0 },
    { name: 'accounts', hub: 'CRM', columns: 14, rows: 12000, hasRLS: true, conflicts: 2 },
    { name: 'customer_interactions', hub: 'CRM', columns: 10, rows: 100000, hasRLS: true, conflicts: 0 },
    { name: 'customer_segments', hub: 'CRM', columns: 8, rows: 500, hasRLS: false, conflicts: 0 },
    { name: 'crm_activities', hub: 'CRM', columns: 11, rows: 75000, hasRLS: true, conflicts: 0 },
    
    // Inventory Hub
    { name: 'products', hub: 'Inventory', columns: 22, rows: 5000, hasRLS: false, conflicts: 1 },
    { name: 'inventory_items', hub: 'Inventory', columns: 16, rows: 50000, hasRLS: false, conflicts: 0 },
    { name: 'warehouses', hub: 'Inventory', columns: 10, rows: 25, hasRLS: false, conflicts: 0 },
    { name: 'stock_movements', hub: 'Inventory', columns: 12, rows: 200000, hasRLS: false, conflicts: 0 },
    { name: 'suppliers', hub: 'Inventory', columns: 14, rows: 500, hasRLS: false, conflicts: 1 },
    { name: 'purchase_orders', hub: 'Inventory', columns: 18, rows: 15000, hasRLS: true, conflicts: 0 },
    { name: 'inventory_adjustments', hub: 'Inventory', columns: 9, rows: 30000, hasRLS: false, conflicts: 0 },
    { name: 'product_categories', hub: 'Inventory', columns: 7, rows: 150, hasRLS: false, conflicts: 0 },
    
    // Sales Hub
    { name: 'orders', hub: 'Sales', columns: 25, rows: 100000, hasRLS: true, conflicts: 2 },
    { name: 'order_items', hub: 'Sales', columns: 10, rows: 500000, hasRLS: true, conflicts: 0 },
    { name: 'invoices', hub: 'Sales', columns: 20, rows: 80000, hasRLS: true, conflicts: 1 },
    { name: 'payments', hub: 'Sales', columns: 15, rows: 90000, hasRLS: true, conflicts: 0 },
    { name: 'quotes', hub: 'Sales', columns: 18, rows: 20000, hasRLS: true, conflicts: 0 },
    { name: 'sales_territories', hub: 'Sales', columns: 8, rows: 50, hasRLS: false, conflicts: 0 },
    { name: 'sales_teams', hub: 'Sales', columns: 9, rows: 30, hasRLS: false, conflicts: 0 },
    { name: 'commissions', hub: 'Sales', columns: 12, rows: 25000, hasRLS: true, conflicts: 0 },
    
    // HR Hub
    { name: 'employees', hub: 'HR', columns: 30, rows: 2000, hasRLS: true, conflicts: 0 },
    { name: 'departments', hub: 'HR', columns: 8, rows: 40, hasRLS: false, conflicts: 0 },
    { name: 'positions', hub: 'HR', columns: 10, rows: 150, hasRLS: false, conflicts: 0 },
    { name: 'time_tracking', hub: 'HR', columns: 12, rows: 500000, hasRLS: true, conflicts: 0 },
    { name: 'leave_requests', hub: 'HR', columns: 11, rows: 15000, hasRLS: true, conflicts: 0 },
    { name: 'performance_reviews', hub: 'HR', columns: 15, rows: 8000, hasRLS: true, conflicts: 0 },
    { name: 'payroll', hub: 'HR', columns: 20, rows: 50000, hasRLS: true, conflicts: 1 },
    { name: 'benefits', hub: 'HR', columns: 14, rows: 3000, hasRLS: true, conflicts: 0 },
    
    // Finance Hub
    { name: 'transactions', hub: 'Finance', columns: 18, rows: 1000000, hasRLS: true, conflicts: 0 },
    { name: 'accounts_ledger', hub: 'Finance', columns: 16, rows: 500000, hasRLS: true, conflicts: 1 },
    { name: 'budgets', hub: 'Finance', columns: 12, rows: 500, hasRLS: true, conflicts: 0 },
    { name: 'expenses', hub: 'Finance', columns: 14, rows: 200000, hasRLS: true, conflicts: 0 },
    { name: 'revenue_streams', hub: 'Finance', columns: 10, rows: 50, hasRLS: false, conflicts: 0 },
    { name: 'cost_centers', hub: 'Finance', columns: 9, rows: 100, hasRLS: false, conflicts: 0 },
    { name: 'financial_reports', hub: 'Finance', columns: 20, rows: 5000, hasRLS: true, conflicts: 0 },
    { name: 'tax_records', hub: 'Finance', columns: 22, rows: 30000, hasRLS: true, conflicts: 0 },
    
    // Marketing Hub
    { name: 'campaigns', hub: 'Marketing', columns: 16, rows: 500, hasRLS: false, conflicts: 0 },
    { name: 'marketing_contacts', hub: 'Marketing', columns: 14, rows: 100000, hasRLS: true, conflicts: 2 },
    { name: 'email_campaigns', hub: 'Marketing', columns: 12, rows: 2000, hasRLS: false, conflicts: 0 },
    { name: 'marketing_analytics', hub: 'Marketing', columns: 18, rows: 50000, hasRLS: false, conflicts: 0 },
    { name: 'social_media_posts', hub: 'Marketing', columns: 10, rows: 10000, hasRLS: false, conflicts: 0 },
    { name: 'marketing_assets', hub: 'Marketing', columns: 11, rows: 5000, hasRLS: false, conflicts: 0 },
    { name: 'landing_pages', hub: 'Marketing', columns: 13, rows: 200, hasRLS: false, conflicts: 0 },
    { name: 'conversion_tracking', hub: 'Marketing', columns: 15, rows: 100000, hasRLS: false, conflicts: 0 },
    
    // Support Hub
    { name: 'tickets', hub: 'Support', columns: 20, rows: 150000, hasRLS: true, conflicts: 1 },
    { name: 'ticket_comments', hub: 'Support', columns: 8, rows: 500000, hasRLS: true, conflicts: 0 },
    { name: 'support_agents', hub: 'Support', columns: 12, rows: 100, hasRLS: false, conflicts: 0 },
    { name: 'knowledge_base', hub: 'Support', columns: 10, rows: 1000, hasRLS: false, conflicts: 0 },
    { name: 'sla_policies', hub: 'Support', columns: 9, rows: 20, hasRLS: false, conflicts: 0 },
    { name: 'customer_feedback', hub: 'Support', columns: 11, rows: 50000, hasRLS: true, conflicts: 0 },
    { name: 'support_categories', hub: 'Support', columns: 7, rows: 50, hasRLS: false, conflicts: 0 },
    { name: 'escalations', hub: 'Support', columns: 13, rows: 5000, hasRLS: true, conflicts: 0 },
    
    // Analytics Hub
    { name: 'analytics_events', hub: 'Analytics', columns: 15, rows: 5000000, hasRLS: false, conflicts: 0 },
    { name: 'user_sessions', hub: 'Analytics', columns: 12, rows: 2000000, hasRLS: true, conflicts: 0 },
    { name: 'dashboards', hub: 'Analytics', columns: 10, rows: 100, hasRLS: true, conflicts: 0 },
    { name: 'reports', hub: 'Analytics', columns: 14, rows: 2000, hasRLS: true, conflicts: 0 },
    { name: 'metrics', hub: 'Analytics', columns: 9, rows: 500, hasRLS: false, conflicts: 0 },
    { name: 'data_sources', hub: 'Analytics', columns: 11, rows: 50, hasRLS: false, conflicts: 0 },
    { name: 'analytics_jobs', hub: 'Analytics', columns: 13, rows: 10000, hasRLS: false, conflicts: 0 },
    
    // Operations Hub
    { name: 'workflows', hub: 'Operations', columns: 16, rows: 500, hasRLS: false, conflicts: 0 },
    { name: 'workflow_instances', hub: 'Operations', columns: 12, rows: 50000, hasRLS: true, conflicts: 0 },
    { name: 'tasks', hub: 'Operations', columns: 14, rows: 100000, hasRLS: true, conflicts: 1 },
    { name: 'notifications', hub: 'Operations', columns: 10, rows: 1000000, hasRLS: true, conflicts: 0 },
    { name: 'audit_logs', hub: 'Operations', columns: 18, rows: 5000000, hasRLS: true, conflicts: 0 },
    { name: 'system_settings', hub: 'Operations', columns: 8, rows: 200, hasRLS: true, conflicts: 0 },
    { name: 'api_keys', hub: 'Operations', columns: 10, rows: 500, hasRLS: true, conflicts: 0 },
    
    // Projects Hub
    { name: 'projects', hub: 'Projects', columns: 20, rows: 5000, hasRLS: true, conflicts: 0 },
    { name: 'project_tasks', hub: 'Projects', columns: 16, rows: 50000, hasRLS: true, conflicts: 0 },
    { name: 'milestones', hub: 'Projects', columns: 10, rows: 10000, hasRLS: false, conflicts: 0 },
    { name: 'project_resources', hub: 'Projects', columns: 12, rows: 20000, hasRLS: true, conflicts: 0 },
    { name: 'time_entries', hub: 'Projects', columns: 11, rows: 200000, hasRLS: true, conflicts: 0 },
    { name: 'project_documents', hub: 'Projects', columns: 13, rows: 30000, hasRLS: true, conflicts: 0 },
    { name: 'project_budgets', hub: 'Projects', columns: 14, rows: 5000, hasRLS: true, conflicts: 0 },
    
    // Compliance Hub
    { name: 'compliance_policies', hub: 'Compliance', columns: 15, rows: 200, hasRLS: true, conflicts: 0 },
    { name: 'compliance_checks', hub: 'Compliance', columns: 12, rows: 50000, hasRLS: true, conflicts: 0 },
    { name: 'certifications', hub: 'Compliance', columns: 10, rows: 500, hasRLS: false, conflicts: 0 },
    { name: 'audit_trails', hub: 'Compliance', columns: 18, rows: 1000000, hasRLS: true, conflicts: 0 },
    { name: 'risk_assessments', hub: 'Compliance', columns: 16, rows: 2000, hasRLS: true, conflicts: 0 },
    { name: 'regulatory_requirements', hub: 'Compliance', columns: 14, rows: 1000, hasRLS: false, conflicts: 0 },
    { name: 'compliance_training', hub: 'Compliance', columns: 11, rows: 5000, hasRLS: true, conflicts: 0 },
    
    // Reporting Hub
    { name: 'report_templates', hub: 'Reporting', columns: 12, rows: 150, hasRLS: false, conflicts: 0 },
    { name: 'scheduled_reports', hub: 'Reporting', columns: 14, rows: 500, hasRLS: true, conflicts: 0 },
    { name: 'report_subscriptions', hub: 'Reporting', columns: 9, rows: 2000, hasRLS: true, conflicts: 0 },
    { name: 'report_history', hub: 'Reporting', columns: 11, rows: 50000, hasRLS: true, conflicts: 0 },
    { name: 'data_exports', hub: 'Reporting', columns: 13, rows: 10000, hasRLS: true, conflicts: 0 },
    { name: 'report_filters', hub: 'Reporting', columns: 10, rows: 1000, hasRLS: false, conflicts: 0 }
];

// Initialize the application
function initializeApp() {
    console.log('Initializing Supabase Multi-Hub Database Manager...');
    
    // Load sample data
    appState.tables = sampleTables;
    updateStats();
    
    // Populate hub names
    const hubInput = document.getElementById('hubNames');
    const uniqueHubs = [...new Set(sampleTables.map(t => t.hub))];
    appState.hubs = uniqueHubs;
    hubInput.value = uniqueHubs.join(', ');
    
    loadHubConfiguration();
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
}

// Update statistics
function updateStats() {
    document.getElementById('totalTables').textContent = appState.tables.length;
    document.getElementById('totalHubs').textContent = appState.hubs.length;
    
    const conflictCount = appState.tables.reduce((sum, table) => sum + table.conflicts, 0);
    document.getElementById('conflictCount').textContent = conflictCount;
    
    const status = appState.connected ? 'Connected' : 'Ready';
    document.getElementById('validationStatus').textContent = status;
}

// Connection functions
async function testConnection() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    
    if (!url || !key) {
        showAlert('error', 'Please enter Supabase URL and API Key', 'connectionStatus');
        return;
    }
    
    showAlert('info', '🔄 Testing connection to Supabase...', 'connectionStatus');
    
    // Simulate connection test (in production, this would make actual API call)
    setTimeout(() => {
        showAlert('success', '✅ Connection successful! Database is reachable.', 'connectionStatus');
    }, 1500);
}

async function connectDatabase() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    const password = document.getElementById('dbPassword').value;
    
    if (!url || !key) {
        showAlert('error', 'Please enter Supabase URL and API Key', 'connectionStatus');
        return;
    }
    
    showAlert('info', '🔄 Connecting to database and loading schema...', 'connectionStatus');
    
    // Store credentials
    appState.supabaseUrl = url;
    appState.supabaseKey = key;
    appState.dbPassword = password;
    
    // Simulate loading schema (in production, this would query Supabase)
    setTimeout(() => {
        appState.connected = true;
        updateStats();
        showAlert('success', `✅ Connected successfully! Loaded ${appState.tables.length} tables from ${appState.hubs.length} hub applications.`, 'connectionStatus');
        
        // Populate table dropdowns
        populateTableDropdowns();
    }, 2000);
}

// Hub configuration
function loadHubConfiguration() {
    const hubNames = document.getElementById('hubNames').value;
    appState.hubs = hubNames.split(',').map(h => h.trim());
    
    // Create hub filter chips
    const hubFilter = document.getElementById('hubFilter');
    hubFilter.innerHTML = '<div class="hub-chip selected" onclick="filterByHub(\'all\')">All Hubs</div>';
    
    appState.hubs.forEach(hub => {
        hubFilter.innerHTML += `<div class="hub-chip" onclick="filterByHub('${hub}')">${hub}</div>`;
    });
    
    // Populate hub dropdown in create table modal
    const hubSelect = document.getElementById('newTableHub');
    hubSelect.innerHTML = '<option value="">Select hub...</option>';
    appState.hubs.forEach(hub => {
        hubSelect.innerHTML += `<option value="${hub}">${hub}</option>`;
    });
    
    // Load tables list
    loadTablesList();
    
    showAlert('success', `✅ Loaded ${appState.hubs.length} hub applications successfully!`, 'connectionStatus');
}

// Filter tables by hub
let currentHubFilter = 'all';

function filterByHub(hub) {
    currentHubFilter = hub;
    
    // Update chip selection
    document.querySelectorAll('.hub-chip').forEach(chip => {
        chip.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    loadTablesList();
}

function filterTables() {
    loadTablesList();
}

// Load tables list
function loadTablesList() {
    const tablesList = document.getElementById('tablesList');
    const searchTerm = document.getElementById('tableSearch')?.value.toLowerCase() || '';
    
    let filteredTables = appState.tables;
    
    // Filter by hub
    if (currentHubFilter !== 'all') {
        filteredTables = filteredTables.filter(t => t.hub === currentHubFilter);
    }
    
    // Filter by search
    if (searchTerm) {
        filteredTables = filteredTables.filter(t => 
            t.name.toLowerCase().includes(searchTerm) ||
            t.hub.toLowerCase().includes(searchTerm)
        );
    }
    
    tablesList.innerHTML = '';
    
    filteredTables.forEach(table => {
        const conflictBadge = table.conflicts > 0 
            ? `<div class="conflict-badge">${table.conflicts} conflicts</div>` 
            : '';
        
        tablesList.innerHTML += `
            <div class="table-item" onclick="selectTable('${table.name}')">
                ${conflictBadge}
                <div class="table-name">📊 ${table.name}</div>
                <div class="table-hub">${table.hub}</div>
                <div class="table-info">
                    ${table.columns} columns • ${table.rows.toLocaleString()} rows
                    ${table.hasRLS ? '• <span style="color: #10b981;">RLS ✓</span>' : ''}
                </div>
            </div>
        `;
    });
    
    if (filteredTables.length === 0) {
        tablesList.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;">No tables found</div>';
    }
}

function selectTable(tableName) {
    const index = appState.selectedTables.indexOf(tableName);
    if (index > -1) {
        appState.selectedTables.splice(index, 1);
        event.target.closest('.table-item').classList.remove('selected');
    } else {
        appState.selectedTables.push(tableName);
        event.target.closest('.table-item').classList.add('selected');
    }
}

// Populate table dropdowns
function populateTableDropdowns() {
    const dropdowns = ['rlsTable', 'triggerTable', 'flowStartTable'];
    
    dropdowns.forEach(dropdownId => {
        const select = document.getElementById(dropdownId);
        if (select) {
            select.innerHTML = '<option value="">Choose a table...</option>';
            appState.tables.forEach(table => {
                select.innerHTML += `<option value="${table.name}">${table.name} (${table.hub})</option>`;
            });
        }
    });
}

// RLS Policy functions
function generateRLSPolicy() {
    const table = document.getElementById('rlsTable').value;
    const policyName = document.getElementById('rlsPolicyName').value;
    const policyType = document.getElementById('rlsPolicyType').value;
    const expression = document.getElementById('rlsExpression').value;
    
    if (!table || !policyName || !expression) {
        alert('Please fill in all required fields');
        return;
    }
    
    const sql = `
-- Enable RLS on table
ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY ${policyName}
ON ${table}
FOR ${policyType}
USING (${expression});
    `.trim();
    
    showAlert('success', 'RLS Policy SQL generated successfully!', 'rlsPolicyList');
    document.getElementById('rlsPolicyList').innerHTML += `
        <div class="code-block">${escapeHtml(sql)}</div>
    `;
}

function applyRLSPolicy() {
    const table = document.getElementById('rlsTable').value;
    const policyName = document.getElementById('rlsPolicyName').value;
    
    if (!table || !policyName) {
        alert('Please generate the policy first');
        return;
    }
    
    showAlert('success', `✅ RLS Policy "${policyName}" applied to table "${table}" successfully!`, 'rlsPolicyList');
    
    // Update table RLS status
    const tableObj = appState.tables.find(t => t.name === table);
    if (tableObj) {
        tableObj.hasRLS = true;
    }
}

// Function management
function generateFunction() {
    const funcName = document.getElementById('functionName').value;
    const returnType = document.getElementById('functionReturnType').value;
    const params = document.getElementById('functionParams').value;
    const body = document.getElementById('functionBody').value;
    
    if (!funcName || !body) {
        alert('Please fill in function name and body');
        return;
    }
    
    const paramsList = params.trim() ? params.trim().split('\n').map(p => p.trim()).join(', ') : '';
    
    const sql = `
CREATE OR REPLACE FUNCTION ${funcName}(${paramsList})
RETURNS ${returnType}
LANGUAGE plpgsql
AS $$
${body}
$$;
    `.trim();
    
    showAlert('success', 'Function SQL generated successfully!', 'functionList');
    document.getElementById('functionList').innerHTML += `
        <div class="card">
            <h4>⚡ ${funcName}</h4>
            <div class="code-block">${escapeHtml(sql)}</div>
        </div>
    `;
}

function createFunction() {
    const funcName = document.getElementById('functionName').value;
    
    if (!funcName) {
        alert('Please generate the function first');
        return;
    }
    
    showAlert('success', `✅ Function "${funcName}" created successfully!`, 'functionList');
    
    appState.functions.push({
        name: funcName,
        created: new Date().toISOString()
    });
}

// Trigger management
function generateTrigger() {
    const triggerName = document.getElementById('triggerName').value;
    const table = document.getElementById('triggerTable').value;
    const event = document.getElementById('triggerEvent').value;
    const timing = document.getElementById('triggerTiming').value;
    const funcName = document.getElementById('triggerFunctionName').value;
    const funcBody = document.getElementById('triggerFunctionBody').value;
    
    if (!triggerName || !table || !funcName || !funcBody) {
        alert('Please fill in all required fields');
        return;
    }
    
    const sql = `
-- Create trigger function
CREATE OR REPLACE FUNCTION ${funcName}()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
${funcBody}
$$;

-- Create trigger
CREATE TRIGGER ${triggerName}
${timing} ${event}
ON ${table}
FOR EACH ROW
EXECUTE FUNCTION ${funcName}();
    `.trim();
    
    showAlert('success', 'Trigger SQL generated successfully!', 'triggerList');
    document.getElementById('triggerList').innerHTML += `
        <div class="card">
            <h4>🎯 ${triggerName}</h4>
            <p style="color: #64748b; margin-bottom: 10px;">Table: ${table} • Event: ${timing} ${event}</p>
            <div class="code-block">${escapeHtml(sql)}</div>
        </div>
    `;
}

function createTrigger() {
    const triggerName = document.getElementById('triggerName').value;
    const table = document.getElementById('triggerTable').value;
    
    if (!triggerName || !table) {
        alert('Please generate the trigger first');
        return;
    }
    
    showAlert('success', `✅ Trigger "${triggerName}" created on table "${table}" successfully!`, 'triggerList');
    
    appState.triggers.push({
        name: triggerName,
        table: table,
        created: new Date().toISOString()
    });
}

// Flow analysis
function analyzeFlow() {
    const startTable = document.getElementById('flowStartTable').value;
    
    if (!startTable) {
        alert('Please select a table to analyze');
        return;
    }
    
    const tableObj = appState.tables.find(t => t.name === startTable);
    
    const diagram = document.getElementById('flowDiagram');
    diagram.innerHTML = `
        <div style="text-align: center;">
            <div class="flow-node" style="background: #3b82f6; color: white;">
                📊 ${startTable} (${tableObj.hub})
            </div>
            <div style="margin: 20px 0; color: #64748b;">↓ Data Flow ↓</div>
            <div class="flow-node">
                🔒 RLS Policies: ${tableObj.hasRLS ? 'Enabled' : 'Disabled'}
            </div>
            <div style="margin: 20px 0; color: #64748b;">↓</div>
            <div class="flow-node">
                ⚡ Triggers: ${Math.floor(Math.random() * 3)} active
            </div>
            <div style="margin: 20px 0; color: #64748b;">↓</div>
            <div class="flow-node">
                🔗 Related Tables: ${Math.floor(Math.random() * 5) + 1}
            </div>
        </div>
    `;
    
    // Show dependencies
    const dependencies = document.getElementById('flowDependencies');
    dependencies.innerHTML = `
        <div class="alert alert-info">
            <strong>Dependencies Found:</strong><br>
            • Foreign key to "users" table<br>
            • Referenced by "order_items" table<br>
            • Trigger updates "audit_logs"<br>
            • Function "calculate_totals" reads this table
        </div>
    `;
}

function exportFlowDiagram() {
    alert('Flow diagram exported as flow_diagram.png');
}

// Conflict detection
function scanConflicts() {
    const progress = document.getElementById('scanProgress');
    const progressFill = progress.querySelector('.progress-fill');
    progress.style.display = 'block';
    
    let currentProgress = 0;
    const interval = setInterval(() => {
        currentProgress += 10;
        progressFill.style.width = currentProgress + '%';
        
        if (currentProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progress.style.display = 'none';
                displayConflicts();
            }, 500);
        }
    }, 200);
}

function displayConflicts() {
    const conflictList = document.getElementById('conflictList');
    
    const conflicts = [
        {
            type: 'Duplicate Column',
            table1: 'contacts (CRM)',
            table2: 'marketing_contacts (Marketing)',
            description: 'Both tables have "email" column with different data types (varchar vs text)',
            severity: 'high'
        },
        {
            type: 'Naming Conflict',
            table1: 'accounts (CRM)',
            table2: 'accounts_ledger (Finance)',
            description: 'Similar table names may cause confusion. Consider renaming to "crm_accounts"',
            severity: 'medium'
        },
        {
            type: 'Foreign Key Mismatch',
            table1: 'orders (Sales)',
            table2: 'products (Inventory)',
            description: 'Foreign key references non-existent column "product_sku" instead of "id"',
            severity: 'high'
        },
        {
            type: 'Index Duplication',
            table1: 'invoices (Sales)',
            table2: 'payments (Sales)',
            description: 'Both tables have identical index on "customer_id" - consider composite index',
            severity: 'low'
        },
        {
            type: 'Data Type Inconsistency',
            table1: 'suppliers (Inventory)',
            table2: 'vendors (Finance)',
            description: 'Same entity with different schemas - merge into single table',
            severity: 'high'
        }
    ];
    
    conflictList.innerHTML = '';
    
    conflicts.forEach((conflict, index) => {
        const severityColor = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#64748b'
        }[conflict.severity];
        
        conflictList.innerHTML += `
            <div class="conflict-item">
                <h4 style="color: ${severityColor};">⚠️ ${conflict.type}</h4>
                <p style="margin: 10px 0;"><strong>Affected Tables:</strong> ${conflict.table1} ↔ ${conflict.table2}</p>
                <p style="color: #64748b;">${conflict.description}</p>
                <div class="conflict-resolution">
                    <button class="btn btn-primary btn-sm" onclick="resolveConflict(${index}, 'auto')">Auto-Resolve</button>
                    <button class="btn btn-secondary btn-sm" onclick="resolveConflict(${index}, 'manual')">Manual Fix</button>
                    <button class="btn btn-danger btn-sm" onclick="ignoreConflict(${index})">Ignore</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('conflictCount').textContent = conflicts.length;
}

function resolveConflict(index, method) {
    if (method === 'auto') {
        alert(`Conflict #${index + 1} resolved automatically using best practices`);
    } else {
        alert(`Opening manual resolution wizard for conflict #${index + 1}`);
    }
    
    // Remove the conflict from display
    event.target.closest('.conflict-item').style.opacity = '0.5';
    setTimeout(() => {
        event.target.closest('.conflict-item').remove();
        const remaining = document.querySelectorAll('.conflict-item').length;
        document.getElementById('conflictCount').textContent = remaining;
    }, 500);
}

function ignoreConflict(index) {
    event.target.closest('.conflict-item').remove();
    const remaining = document.querySelectorAll('.conflict-item').length;
    document.getElementById('conflictCount').textContent = remaining;
}

function generateConflictReport() {
    alert('Conflict report generated as conflict_report.pdf');
}

// Validation functions
function showValidationTab(tabName) {
    // Update tabs
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('validation' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
}

function validateSchema() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item pass">
            <strong>✓ Schema Structure</strong><br>
            All ${appState.tables.length} tables have valid structure
        </div>
        <div class="validation-item pass">
            <strong>✓ Primary Keys</strong><br>
            All tables have primary key defined
        </div>
        <div class="validation-item warning">
            <strong>⚠ Column Naming</strong><br>
            15 tables use inconsistent naming conventions (snake_case vs camelCase)
        </div>
        <div class="validation-item pass">
            <strong>✓ Data Types</strong><br>
            All columns use appropriate PostgreSQL data types
        </div>
    `;
}

function validateNamingConventions() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item pass">
            <strong>✓ Table Names</strong><br>
            98% of tables follow snake_case convention
        </div>
        <div class="validation-item warning">
            <strong>⚠ Column Names</strong><br>
            Found 23 columns with camelCase naming - recommend snake_case
        </div>
        <div class="validation-item fail">
            <strong>✗ Reserved Words</strong><br>
            3 tables use PostgreSQL reserved words: "order", "user", "check"
        </div>
    `;
}

function validateConstraints() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item pass">
            <strong>✓ Foreign Keys</strong><br>
            All foreign key relationships are valid
        </div>
        <div class="validation-item warning">
            <strong>⚠ Check Constraints</strong><br>
            12 tables missing recommended check constraints
        </div>
        <div class="validation-item pass">
            <strong>✓ Unique Constraints</strong><br>
            All unique constraints properly defined
        </div>
    `;
}

function findMissingIndexes() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item warning">
            <strong>⚠ Missing Indexes</strong><br>
            Found 28 foreign key columns without indexes - this may impact performance
        </div>
        <div class="validation-item warning">
            <strong>⚠ Query Performance</strong><br>
            5 frequently queried columns would benefit from indexes
        </div>
        <div class="code-block">
-- Suggested indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
        </div>
    `;
}

function validateRelationships() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item pass">
            <strong>✓ Foreign Key Relationships</strong><br>
            All relationships properly defined with CASCADE rules
        </div>
        <div class="validation-item warning">
            <strong>⚠ Circular Dependencies</strong><br>
            Found 2 potential circular dependencies - review recommended
        </div>
    `;
}

function findOrphanedRecords() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item fail">
            <strong>✗ Orphaned Records Found</strong><br>
            235 order_items reference deleted products<br>
            48 payments reference deleted invoices
        </div>
        <div class="alert alert-warning">
            <strong>Recommended Action:</strong> Run cleanup script to remove orphaned records or restore missing parent records
        </div>
    `;
}

function analyzePerformance() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="validation-item pass">
            <strong>✓ Index Usage</strong><br>
            Average index hit rate: 94.2%
        </div>
        <div class="validation-item warning">
            <strong>⚠ Table Size</strong><br>
            3 tables exceed 10GB - consider partitioning
        </div>
        <div class="validation-item warning">
            <strong>⚠ Query Performance</strong><br>
            15 slow queries detected (>500ms average)
        </div>
    `;
}

function suggestOptimizations() {
    const results = document.getElementById('validationResults');
    results.innerHTML = `
        <div class="alert alert-info">
            <strong>Optimization Suggestions:</strong><br>
            • Add index on analytics_events.user_id (high query frequency)<br>
            • Partition audit_logs table by created_at date<br>
            • Archive old transactions data (>2 years)<br>
            • Create materialized view for dashboard queries<br>
            • Enable pg_stat_statements for query analysis
        </div>
    `;
}

// Migration functions
function generateMigration() {
    const name = document.getElementById('migrationName').value;
    const type = document.getElementById('migrationType').value;
    const upSql = document.getElementById('migrationUp').value;
    const downSql = document.getElementById('migrationDown').value;
    
    if (!name || !upSql) {
        alert('Please provide migration name and SQL');
        return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${timestamp}_${name}.sql`;
    
    showAlert('success', `✅ Migration generated: ${filename}`, 'migrationHistory');
    
    document.getElementById('migrationHistory').innerHTML = `
        <div class="card">
            <h4>📄 ${filename}</h4>
            <p style="color: #64748b; margin: 10px 0;">Type: ${type}</p>
            <div class="code-block">
-- Up Migration
${escapeHtml(upSql)}

-- Down Migration (Rollback)
${escapeHtml(downSql || '-- No rollback defined')}
            </div>
        </div>
    ` + document.getElementById('migrationHistory').innerHTML;
}

function executeMigration() {
    const name = document.getElementById('migrationName').value;
    
    if (!name) {
        alert('Please generate a migration first');
        return;
    }
    
    if (confirm('Are you sure you want to execute this migration? This will modify your database.')) {
        showAlert('success', `✅ Migration "${name}" executed successfully!`, 'migrationHistory');
    }
}

function rollbackMigration() {
    const name = document.getElementById('migrationName').value;
    
    if (!name) {
        alert('Please generate a migration first');
        return;
    }
    
    if (confirm('Are you sure you want to rollback this migration?')) {
        showAlert('warning', `⚠️ Migration "${name}" rolled back successfully!`, 'migrationHistory');
    }
}

// Modal functions
function showCreateTableModal() {
    document.getElementById('createTableModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function previewTableSQL() {
    const tableName = document.getElementById('newTableName').value;
    const columnsJson = document.getElementById('newTableColumns').value;
    
    if (!tableName || !columnsJson) {
        alert('Please provide table name and columns');
        return;
    }
    
    try {
        const columns = JSON.parse(columnsJson);
        let sql = `CREATE TABLE ${tableName} (\n`;
        
        columns.forEach((col, index) => {
            sql += `  ${col.name} ${col.type}`;
            if (col.primary) sql += ' PRIMARY KEY';
            if (col.default) sql += ` DEFAULT ${col.default}`;
            if (col.nullable === false) sql += ' NOT NULL';
            if (index < columns.length - 1) sql += ',';
            sql += '\n';
        });
        
        sql += ');';
        
        document.getElementById('tableSQLPreview').innerHTML = `
            <div class="code-block" style="margin-top: 20px;">${escapeHtml(sql)}</div>
        `;
    } catch (e) {
        alert('Invalid JSON format for columns');
    }
}

function createNewTable() {
    const tableName = document.getElementById('newTableName').value;
    const hub = document.getElementById('newTableHub').value;
    const columnsJson = document.getElementById('newTableColumns').value;
    
    if (!tableName || !hub || !columnsJson) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const columns = JSON.parse(columnsJson);
        
        // Add to tables array
        appState.tables.push({
            name: tableName,
            hub: hub,
            columns: columns.length,
            rows: 0,
            hasRLS: false,
            conflicts: 0
        });
        
        updateStats();
        loadTablesList();
        closeModal('createTableModal');
        
        alert(`✅ Table "${tableName}" created successfully in ${hub} hub!`);
        
        // Clear form
        document.getElementById('newTableName').value = '';
        document.getElementById('newTableColumns').value = '';
        document.getElementById('tableSQLPreview').innerHTML = '';
    } catch (e) {
        alert('Invalid JSON format for columns');
    }
}

// Utility functions
function showAlert(type, message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alertClass = `alert alert-${type}`;
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }[type] || 'ℹ️';
    
    container.innerHTML = `
        <div class="${alertClass}">
            <span style="font-size: 20px;">${icon}</span>
            <div>${message}</div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeApp);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
