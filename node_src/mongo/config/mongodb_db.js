mongodb_db = {
    url: "mongodb://mongodb:27017",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        username: "root",
        password: "password"
      }
    },
    db_name: "pds"
  };

module.exports = mongodb_db;