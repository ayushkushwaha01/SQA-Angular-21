import { Menu } from '../models/menu.model';

export const verticalMenuItems = [
    new Menu(1, 'Dashboard', '/internal-portal/dashboard', null, 'dashboard', null, false, 0),
    new Menu(2, 'Process Audits', '/internal-portal/process', null, 'assignment_turned_in', null, false, 0),
    new Menu(3, 'Parts Audits', '/internal-portal/parts', null, 'handyman', null, false, 0),
    new Menu(4, 'Inspection', '/internal-portal/inspection', null, 'fact_check', null, false, 0),
    new Menu(5, 'Setup', '/internal-portal/process/setup/process-cat', null, 'build', null, false, 0),
    new Menu(6, 'Admin', null, null, 'supervisor_account', null, true, 0),
    new Menu(601, 'Roles & Users', '/manage-users/users', null, 'group_add', null, false, 6),
    new Menu(602, 'Departments', '/manage-users/departments', null, 'apartment', null, false, 6),
    new Menu(603, 'Lookup Options', '/manage-users/lookup-options', null, 'search', null, false, 6),
    new Menu(604, 'Preferences', '/manage-users/preferences', null, 'settings', null, false, 6),
    new Menu(605, 'Event Log', '/manage-users/event-log', null, 'manage_accounts', null, false, 6),
    new Menu(606, 'Escalation Matrix', '/manage-users/escalation-matrix', null, 'email', null, false, 6),
];

export const horizontalMenuItems = [
    new Menu(1, 'Dashboard', '/internal-portal/dashboard', null, 'dashboard', null, false, 0),
    new Menu(2, 'Process Audits', '/internal-portal/process', null, 'assignment_turned_in', null, false, 0),
    new Menu(3, 'Parts Audits', '/internal-portal/parts', null, 'handyman', null, false, 0),
    new Menu(4, 'Inspection', '/internal-portal/inspection', null, 'fact_check', null, false, 0),
    new Menu(5, 'Setup', '/internal-portal/process/setup/process-cat', null, 'build', null, false, 0),
    new Menu(6, 'Admin', null, null, 'supervisor_account', null, true, 0),
    new Menu(601, 'Roles & Users', '/manage-users/users', null, 'group_add', null, false, 6),
    new Menu(602, 'Departments', '/manage-users/departments', null, 'apartment', null, false, 6),
    new Menu(603, 'Lookup Options', '/manage-users/lookup-options', null, 'search', null, false, 6),
    new Menu(604, 'Preferences', '/manage-users/preferences', null, 'settings', null, false, 6),
    new Menu(605, 'Event Log', '/manage-users/event-log', null, 'manage_accounts', null, false, 6),
    new Menu(606, 'Escalation Matrix', '/manage-users/escalation-matrix', null, 'email', null, false, 6),
];


export const supplierMenuItems = [
    new Menu(
        1, "Dashboard", "/app/supplier-login/dashboard", null, "dashboard", null, false, 0,),
    new Menu(
        2,
        "Process Audits", // Fixed the typo here
        "/app/supplier-login/process-audits", // Updated to the process-audits route
        null,
        "assignment_turned_in",
        null,
        false,
        0,
    ),
    new Menu(
        3,
        "Parts Audits",
        "/app/supplier-login/parts-audits", // Updated from /app/sqm/parts
        null,
        "handyman",
        null,
        false,
        0,
    ),
    new Menu(
        4,
        "Inspection",
        "/app/supplier-login/inspection", // Updated from /app/sqm/inspection
        null,
        "fact_check",
        null,
        false,
        0,
    ),
];
