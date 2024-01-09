const environment = {
  // port configuration should be the same as dockerfile
  port: 3000,
  //Public URL of the project ex : https://google.com
  url: '',
  //Password to access swagger configuration
  password: '',
  //Update with SMTP Configuration
  smtp: {
    // SMTP configuration for development
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: '',
      pass: '',
    },
    service: 'gmail'
  },
  //ISTEX API retrieve file URL
  retrieveUrl: 'https://data-computer.services.istex.fr/v1/retrieve',
  fileFolder: 'uploads/',
  dumpFile: 'dump.tar.gz',
  finalFile: 'final.tar.gz',
  cron: {
    schedule: '0 0 * * *',
    //In Day
    deleteFileOlderThan: 7
  }
};

export default environment;