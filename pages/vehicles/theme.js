export const theme = {
  colors: {
    primary: '#0d9488', // Teal 600
    primaryLight: '#f0fdfa', // Teal 50
    primaryBorder: '#ccfbf1', // Teal 100
    secondary: '#64748b', // Slate 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    text: '#0f172a', // Slate 900
    textLight: '#475569', // Slate 600
    error: '#dc2626',
    errorLight: '#fef2f2',
    success: '#10b981',
    warning: '#f59e0b',
    border: '#e2e8f0',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  radius: {
    md: '10px',
    lg: '16px',
    xl: '20px',
  }
};

export const statusColors = {
  available: { bg: '#f0fdf4', text: '#10b981', border: '#bbf7d0' },
  in_use: { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
  maintenance: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  retired: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
};