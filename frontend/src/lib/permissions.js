/**
 * src/lib/permissions.js
 *
 * Centralised RBAC permission helper.
 * All role-based decisions in the app should go through this module
 * so policy is defined in one place and easy to audit.
 */

// ─── Role constants ──────────────────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TIMETABLE_SETTER: "TIMETABLE_SETTER",
  CLASS_TEACHER: "CLASS_TEACHER",
  NORMAL_TEACHER: "NORMAL_TEACHER",
  STUDENT: "STUDENT",
};

// ─── Role groupings ──────────────────────────────────────────────────────────

/** Every non-student staff role that gets the admin-area interface */
export const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.TIMETABLE_SETTER,
  ROLES.CLASS_TEACHER,
  ROLES.NORMAL_TEACHER,
];

/** Roles that are allowed to CREATE / UPDATE / DELETE lab allocations */
export const SCHEDULE_WRITE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.TIMETABLE_SETTER,
];

/** Roles that can manage user accounts & roles (assign/revoke roles, toggle CR) */
export const USER_MANAGEMENT_ROLES = [ROLES.SUPER_ADMIN];

// ─── Permission predicates ───────────────────────────────────────────────────

/**
 * Returns true if the role belongs to the admin-area interface.
 * @param {string} role
 */
export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}

/**
 * Returns true if the role can write (create/update/delete) lab allocations.
 * @param {string} role
 */
export function canWriteSchedule(role) {
  return SCHEDULE_WRITE_ROLES.includes(role);
}

/**
 * Returns true if the role can manage user roles and the CR flag.
 * @param {string} role
 */
export function canManageUsers(role) {
  return USER_MANAGEMENT_ROLES.includes(role);
}

/**
 * Returns a human-readable label for a role value.
 * @param {string} role
 */
export function getRoleLabel(role) {
  const labels = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    TIMETABLE_SETTER: "Timetable Setter",
    CLASS_TEACHER: "Class Teacher",
    NORMAL_TEACHER: "Teacher",
    STUDENT: "Student",
  };
  return labels[role] ?? role;
}
