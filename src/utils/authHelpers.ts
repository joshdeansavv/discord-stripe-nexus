/**
 * Clean up authentication tokens from localStorage
 */
export const cleanupAuthTokens = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Auth tokens cleaned up');
  } catch (error) {
    console.log('⚠️ Error cleaning localStorage:', error);
  }
};