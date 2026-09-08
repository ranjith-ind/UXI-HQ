const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const servicesDir = path.join(rootDir, 'services');

console.log('================================================================');
console.log('       UXI-HQ PRODUCTION HARDENING & DEMO FALLBACK PURGE       ');
console.log('================================================================\n');

function updateFile(filePath, description, transformFn) {
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] File not found: ${path.relative(rootDir, filePath)}`);
    return false;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = transformFn(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`[HARDENED] ${description}`);
    return true;
  } else {
    console.log(`[CLEAN]    ${description} already compliant.`);
    return false;
  }
}

// -------------------------------------------------------------
// 1. SERVICES/PROJECT.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'project.service.ts'),
  'services/project.service.ts: enforce Supabase-only, remove INITIAL_PROJECTS fallback',
  (code) => {
    // Disable localStorage check at start of getProjects
    code = code.replace(
      /const\s+localProjects\s*=\s*this\.getLocalProjects\(\);[\s\S]*?if\s*\(localProjects\.length\s*>\s*0\)\s*return\s+localProjects;/g,
      '// LocalStorage demo fallback disabled for production Supabase'
    );
    // Replace fallback to getLocalProjects when data is empty
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalProjects\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase project query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+this\.getLocalProjects\(\);?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_PROJECTS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    // Prevent getLocalProjects from seeding INITIAL_PROJECTS
    code = code.replace(
      /if\s*\(!stored\s*\|\|\s*stored\s*===\s*['"]\[\]['"]\)\s*\{[\s\S]*?return\s+INITIAL_PROJECTS;?[\s\S]*?\}/g,
      'return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 2. SERVICES/CLIENT.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'client.service.ts'),
  'services/client.service.ts: enforce Supabase-only, remove INITIAL_CLIENTS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalClients\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase client query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+this\.getLocalClients\(\);?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_CLIENTS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!stored\s*\|\|\s*stored\s*===\s*['"]\[\]['"]\)\s*\{[\s\S]*?return\s+INITIAL_CLIENTS;?[\s\S]*?\}/g,
      'return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 3. SERVICES/TASK.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'task.service.ts'),
  'services/task.service.ts: enforce Supabase-only, remove INITIAL_TASKS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalTasks\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase task query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+this\.getLocalTasks\(\);?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_TASKS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!stored\s*\|\|\s*stored\s*===\s*['"]\[\]['"]\)\s*\{[\s\S]*?return\s+INITIAL_TASKS;?[\s\S]*?\}/g,
      'return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 4. SERVICES/EXPENSE.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'expense.service.ts'),
  'services/expense.service.ts: enforce Supabase-only, remove INITIAL_EXPENSES fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalExpenses\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase expense query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+this\.getLocalExpenses\(\);?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_EXPENSES;?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!stored\s*\|\|\s*stored\s*===\s*['"]\[\]['"]\)\s*\{[\s\S]*?return\s+INITIAL_EXPENSES;?[\s\S]*?\}/g,
      'return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 5. SERVICES/INVOICE.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'invoice.service.ts'),
  'services/invoice.service.ts: enforce Supabase-only, remove INITIAL_INVOICES fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalInvoices\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase invoice query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+this\.getLocalInvoices\(\);?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_INVOICES;?/g,
      'if (!data || data.length === 0) return [];'
    );
    code = code.replace(
      /if\s*\(!stored\s*\|\|\s*stored\s*===\s*['"]\[\]['"]\)\s*\{[\s\S]*?return\s+INITIAL_INVOICES;?[\s\S]*?\}/g,
      'return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 6. SERVICES/PAYMENT.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'payment.service.ts'),
  'services/payment.service.ts: enforce Supabase-only, remove INITIAL_PAYMENTS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalPayments\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase payment query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_PAYMENTS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 7. SERVICES/LEAD.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'lead.service.ts'),
  'services/lead.service.ts: enforce Supabase-only, remove INITIAL_LEADS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalLeads\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase lead query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_LEADS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 8. SERVICES/SPRINT.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'sprint.service.ts'),
  'services/sprint.service.ts: enforce Supabase-only, remove INITIAL_SPRINTS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+this\.getLocalSprints\(\);?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase sprint query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_SPRINTS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 9. SERVICES/TEAM.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'team.service.ts'),
  'services/team.service.ts: enforce Supabase-only, remove INITIAL_FULL_TEAM_MEMBERS fallback',
  (code) => {
    code = code.replace(
      /if\s*\(\s*(!data\s*\|\|\s*data\.length\s*===\s*0|error)\s*\)\s*\{[\s\S]*?return\s+INITIAL_FULL_TEAM_MEMBERS;?[\s\S]*?\}/g,
      'if (error) { console.error("Supabase team query error:", error); return []; } return data || [];'
    );
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+INITIAL_FULL_TEAM_MEMBERS;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 10. SERVICES/ACTIVITY.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'activity.service.ts'),
  'services/activity.service.ts: remove mockActivities fallback',
  (code) => {
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+mockActivities;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 11. SERVICES/ALERT.SERVICE.TS & NOTIFICATION.SERVICE.TS
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'alert.service.ts'),
  'services/alert.service.ts: remove mockAlerts fallback',
  (code) => {
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+mockAlerts;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

updateFile(
  path.join(servicesDir, 'notification.service.ts'),
  'services/notification.service.ts: remove mockNotifications fallback',
  (code) => {
    code = code.replace(
      /if\s*\(!data\s*\|\|\s*data\.length\s*===\s*0\)\s*return\s+mockNotifications;?/g,
      'if (!data || data.length === 0) return [];'
    );
    return code;
  }
);

// -------------------------------------------------------------
// 12. SERVICES/AUTH.SERVICE.TS (DISALLOW DEMO AUTH BYPASS)
// -------------------------------------------------------------
updateFile(
  path.join(servicesDir, 'auth.service.ts'),
  'services/auth.service.ts: remove fake demo-admin-id bypass',
  (code) => {
    code = code.replace(/['"]demo-admin-id['"]/g, 'null');
    return code;
  }
);

// -------------------------------------------------------------
// 13. CLIENT BROWSER STORAGE PURGE COMPONENT
// -------------------------------------------------------------
const cacheCleanerPath = path.join(rootDir, 'components', 'providers', 'client-cache-cleaner.tsx');
const cacheCleanerDir = path.dirname(cacheCleanerPath);
if (!fs.existsSync(cacheCleanerDir)) {
  fs.mkdirSync(cacheCleanerDir, { recursive: true });
}

fs.writeFileSync(
  cacheCleanerPath,
  `"use client";

import { useEffect } from "react";

/**
 * Automatically purges obsolete demo localStorage caches from previous development runs
 * while preserving legitimate UI state (theme, sidebar).
 */
export function ClientCacheCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const obsoleteKeys = [
      "uxi_projects_store",
      "uxi_tasks_store",
      "uxi_clients_store",
      "uxi_invoices_store",
      "uxi_expenses_store",
      "uxi_leads_store",
      "uxi_sprints_store",
      "uxi_demo_initialized",
    ];
    obsoleteKeys.forEach((key) => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore localStorage access errors
      }
    });
  }, []);

  return null;
}
`,
  'utf8'
);
console.log('[CREATED]  components/providers/client-cache-cleaner.tsx');

// Mount ClientCacheCleaner in app/layout.tsx
updateFile(
  path.join(rootDir, 'app', 'layout.tsx'),
  'app/layout.tsx: mount ClientCacheCleaner',
  (code) => {
    if (!code.includes('ClientCacheCleaner')) {
      code = code.replace(
        /import\s+.*?\s+from\s+['"]next\/font\/google['"];?/,
        (match) => `${match}\nimport { ClientCacheCleaner } from "@/components/providers/client-cache-cleaner";`
      );
      code = code.replace(
        /<body([^>]*)>/,
        (match) => `${match}\n        <ClientCacheCleaner />`
      );
    }
    return code;
  }
);

console.log('\n================================================================');
console.log('            HARDENING SCRIPT COMPLETED SUCCESSFULLY            ');
console.log('================================================================');