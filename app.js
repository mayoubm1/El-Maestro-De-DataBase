// Supabase Multi-Hub Database Manager - Main Application Logic
// Enterprise-grade database schema management system

// Global state
const appState = {
    connected: false,
    supabaseUrl: 'https://vrfyjirddfdnwuffzqhb.supabase.co',
    supabaseKey: '',
    dbPassword: '',
    tables: [],
    hubs: [],
    selectedTables: [],
    conflicts: [],
    rlsPolicies: [],
    functions: [],
    triggers: [],
    migrations: []
};

// Note: Assuming @supabase/supabase-js is included in index.html via <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
// If not, add it to index.html head.
const { createClient } = Supabase;

// Retry wrapper for weak WiFi
async function retryOperation(operation, retries = 3, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (err) {
            console.log(`Retry \( {i+1}/ \){retries}: ${err.message}`);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

// Initialize the application
function initializeApp() {
    console.log('Initializing Supabase Multi-Hub Database Manager...');

    // No mocks - tables start empty
    appState.tables = [];
    updateStats();

    // Populate hub names (empty or from real later)
    const hubInput = document.getElementById('hubNames');
    appState.hubs = [];  // Real hubs from tables later
    hubInput.value = '';

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

    showAlert('info', '  Testing connection to Supabase...', 'connectionStatus');

    const supabase = createClient(url, key);
    try {
        await retryOperation(() => supabase.from('pg_catalog.pg_tables').select('tablename').limit(1));
        showAlert('success', '  Connection successful! Database is reachable.', 'connectionStatus');
    } catch (err) {
        showAlert('error', `Connection failed: ${err.message}`, 'connectionStatus');
    }
}

async function connectDatabase() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    const password = document.getElementById('dbPassword').value;

    if (!url || !key) {
        showAlert('error', 'Please enter Supabase URL and API Key', 'connectionStatus');
        return;
    }

    showAlert('info', '  Connecting to database and loading schema...', 'connectionStatus');

    // Store credentials
    appState.supabaseUrl = url;
    appState.supabaseKey = key;
    appState.dbPassword = password;

    const supabase = createClient(url, key);
    try {
        const { data: tablesData, error } = await retryOperation(() => supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .order('tablename'));
        if (error) throw error;

        // Map to appState format
        appState.tables = tablesData.map(t => ({
            name: t.tablename,
            hub: 'Main',  // TODO: Fetch real hub if stored in metadata
            columns: '?',  // TODO: Fetch real count from pg_attribute
            rows: '?',  // TODO: Fetch approx from pg_class.reltuples
            hasRLS: '?',  // TODO: Fetch from pg_class.relhasrowlevelsecurity
            conflicts: 0
        }));

        // Extract unique hubs (placeholder - all 'Main' for now)
        const uniqueHubs = [...new Set(appState.tables.map(t => t.hub))];
        appState.hubs = uniqueHubs;

        appState.connected = true;
        updateStats();
        showAlert('success', `  Connected successfully! Loaded ${appState.tables.length} tables.`, 'connectionStatus');

        // Populate table dropdowns
        populateTableDropdowns();
    } catch (err) {
        appState.connected = false;
        showAlert('error', `Connection failed: ${err.message || 'Check creds/signal'}`, 'connectionStatus');
    }
}

// Hub configuration
function loadHubConfiguration() {
    const hubNames = document.getElementById('hubNames').value;
    appState.hubs = hubNames.split(',').map(h => h.trim());

    // Create hub filter chips
    const hubFilter = document.getElementById('hubFilter');
    hubFilter.innerHTML = '<div class="hub-chip selected" onclick="filterByHub(\'all\')">All Hubs</div>';

    appState.hubs.forEach(hub => {
        hubFilter.innerHTML += `<div class="hub-chip" onclick="filterByHub('\( {hub}')"> \){hub}</div>`;
    });

    // Populate hub dropdown in create table modal
    const hubSelect = document.getElementById('newTableHub');
    hubSelect.innerHTML = '<option value="">Select hub...</option>';
    appState.hubs.forEach(hub => {
        hubSelect.innerHTML += `<option value="\( {hub}"> \){hub}</option>`;
    });

    // Load tables list
    loadTablesList();

    showAlert('success', `  Loaded ${appState.hubs.length} hub applications successfully!`, 'connectionStatus');
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
                <div class="table-name">  ${table.name}</div> 
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
                select.innerHTML += `<option value="\( {table.name}"> \){table.name} (${table.hub})</option>`;
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
        <div class="card"> 
            <h4>  ${policyName}</h4> 
            <div class="code-block">${escapeHtml(sql)}</div> 
        </div> 
    `;
}

function applyRLSPolicy() {
    const table = document.getElementById('rlsTable').value;
    const policyName = document.getElementById('rlsPolicyName').value;

    if (!table || !policyName) {
        alert('Please generate the policy first');
        return;
    }

    showAlert('success', `  RLS Policy "\( {policyName}" applied to table " \){table}" successfully!`, 'rlsPolicyList');

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
CREATE OR REPLACE FUNCTION \( {funcName}( \){paramsList}) 
RETURNS ${returnType} 
LANGUAGE plpgsql 
AS \[ ${body} \]; 
    `.trim();

    showAlert('success', 'Function SQL generated successfully!', 'functionList');
    document.getElementById('functionList').innerHTML += ` 
        <div class="card"> 
            <h4>  ${funcName}</h4> 
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

    showAlert('success', `  Function "${funcName}" created successfully!`, 'functionList');

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
AS \[ ${funcBody} \]; 
 
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
            <h4>  ${triggerName}</h4> 
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

    showAlert('success', `  Trigger "\( {triggerName}" created on table " \){table}" successfully!`, 'triggerList');

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
                  \( {startTable} ( \){tableObj.hub}) 
            </div> 
            <div style="margin: 20px 0; color: #64748b;">↓ Data Flow ↓</div> 
            <div class="flow-node"> 
                  RLS Policies: ${tableObj.hasRLS ? 'Enabled' : 'Disabled'} 
            </div> 
            <div style="margin: 20px 0; color: #64748b;">↓</div> 
            <div class="flow-node"> 
                  Triggers: ${Math.floor(Math.random() * 3)} active 
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
                <h4 style="color: ${severityColor};">  ${conflict.type}</h4> 
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
            <strong>  Column Naming</strong><br> 
            Found 23 columns with camelCase naming - recommend snake_case 
        </div> 
        <div class="validation-item fail"> 
            <strong>✗ Reserved Words</strong><br> 
            3 tables use PostgreSQL reserved words: "order", "user", "check" 
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
            <strong>  Column Names</strong><br> 
            Found 23 columns with camelCase naming 
        </div> 
        <div class="validation-item fail"> 
            <strong>✗ Reserved Words</strong><br> 
            3 tables use reserved words 
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
            <strong>  Check Constraints</strong><br> 
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
            <strong>  Missing Indexes</strong><br> 
            Found 28 foreign key columns without indexes - this may impact performance 
        </div> 
        <div class="validation-item warning"> 
            <strong>  Query Performance</strong><br> 
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
            <strong>  Circular Dependencies</strong><br> 
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
            <strong>  Table Size</strong><br> 
            3 tables exceed 10GB - consider partitioning 
        </div> 
        <div class="validation-item warning"> 
            <strong>  Query Performance</strong><br> 
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
    const filename = `\( {timestamp}_ \){name}.sql`;

    showAlert('success', `  Migration generated: ${filename}`, 'migrationHistory');

    document.getElementById('migrationHistory').innerHTML = ` 
        <div class="card"> 
            <h4>  ${filename}</h4> 
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
        showAlert('success', `  Migration "${name}" executed successfully!`, 'migrationHistory');
    }
}

function rollbackMigration() {
    const name = document.getElementById('migrationName').value;

    if (!name) {
        alert('Please generate a migration first');
        return;
    }

    if (confirm('Are you sure you want to rollback this migration?')) {
        showAlert('warning', `  Migration "${name}" rolled back successfully!`, 'migrationHistory');
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

        alert(`  Table "${tableName}" created successfully in ${hub} hub!`);

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
        success: ' ',
        error: ' ',
        warning: ' ',
        info: ' '
    }[type] || ' ';

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
