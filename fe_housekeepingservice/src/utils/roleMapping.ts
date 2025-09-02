// Role ID mapping based on database schema
export const ROLE_ID_MAP: { [key: string]: number } = {
  'CUSTOMER': 1,
  'EMPLOYEE': 2,
  'ADMIN': 3
};

// Helper function to get roleId from role name
export const getRoleId = (roleName: string): number | null => {
  return ROLE_ID_MAP[roleName] || null;
};

// Helper function to get role name from roleId
export const getRoleName = (roleId: number): string | null => {
  const entry = Object.entries(ROLE_ID_MAP).find(([, id]) => id === roleId);
  return entry ? entry[0] : null;
};
