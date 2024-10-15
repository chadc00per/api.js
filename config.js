const config = {
    url: process.env.ENVIRONMENT === 'development' ? process.env.LOCAL_DOMAIN : process.env.ENVIRONMENT === 'production' ? process.env.REMOTE_DOMAIN : null,
  };
  
  export { config };
