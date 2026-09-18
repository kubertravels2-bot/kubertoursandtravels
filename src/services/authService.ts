import { User } from '../types';
import { securityService } from './security';

export const authService = {
  /**
   * Get currently logged in user from session
   */
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('kuber_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem('kuber_current_user', JSON.stringify(user));
      if (user.role === 'admin') {
        securityService.setAdminSession(user.email || user.name, 'super_admin');
      }
    } else {
      localStorage.removeItem('kuber_current_user');
      securityService.clearAdminSession();
    }
  },

  logout() {
    this.setCurrentUser(null);
  }
};
