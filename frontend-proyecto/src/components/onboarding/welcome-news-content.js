export const getWelcomeNewsTitle = (tenantName) =>
  `¡Bienvenidos a ${tenantName}!`;

export const getWelcomeNewsGreeting = (tenantName) =>
  `Nos alegra tenerte en nuestra comunidad. Desde acá vas a poder mantenerte al día con las novedades, las actividades y toda la información importante de ${tenantName}.`;

export const getWelcomeNewsContent = (tenantName) =>
  `${getWelcomeNewsGreeting(tenantName)} ¡Esperamos acompañarte en este camino!`;
