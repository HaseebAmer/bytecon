  export const Tags = {
    ARTIFICIAL_INTELLIGENCE: 'ARTIFICIAL_INTELLIGENCE',
    WEB_APPS: 'WEB_APPS',
    CRYPTOGRAPHY: 'CRYPTOGRAPHY',
    ROBOTICS: 'ROBOTICS',
    COMPETITIVE_PROGRAMMING: 'COMPETITIVE_PROGRAMMING',
    EMBEDDED_SYSTEMS: 'EMBEDDED_SYSTEMS',
    UX_DESIGN: 'UX_DESIGN',
    NETWORKS: 'NETWORKS',
    DATABASES: 'DATABASES',
    SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  };

  export function changeFormat(interest) {
    const words = interest.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    return words.join(' ');
  }
  