export function getCurrentUserId() {
  const directId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  if (directId && directId.trim()) return directId.trim();

  const authUserRaw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
  if (authUserRaw) {
    try {
      const parsed = JSON.parse(authUserRaw);
      if (parsed?.id) return String(parsed.id).trim();
      if (parsed?.userId) return String(parsed.userId).trim();
      if (parsed?.username) return String(parsed.username).trim();
      if (parsed?.email) return String(parsed.email).trim();
    } catch (_e) {
      // Ignore invalid JSON and fall through to default value.
    }
  }

  return 'CURRENT_USER';
}
