(function() {
  module.exports = function(client, ss, connection, fs) {
    var deleteOldPicture, getCurrentPicture, updatePicture;
    getCurrentPicture = function(callback) {
      var sql;
      sql = 'select picture from user where user.id = ' + client.userid;
      return connection.query(sql, function(err, result) {
        return callback(result[0].picture);
      });
    };
    updatePicture = function(name, callback) {
      var sql;
      sql = 'update user set picure ="' + name + '" where userid = ' + client.userid;
      return connection.query(sql, function(err, result) {
        return callback('updated');
      });
    };
    deleteOldPicture = function(pathToPic) {
      return fs.unlinkSync(pathToPic);
    };
    return ss(client).on('newProfileImage', function(stream, data) {
      var baseFilename, baseUploadPath, newFilename;
      baseUploadPath = './../images/userimages/';
      baseFilename = client.username + '_' + data.name;
      newFilename = baseUploadPath + baseFilename;
      console.log(newFilename);
      stream.pipe(fs.createWriteStream(newFilename));
      return getCurrentPicture(function(pic) {
        if (pic !== 'rkdefault.png') {
          deleteOldPicture(baseUploadPath + pic);
        }
        return updatePicture(baseFilename, function() {
          return client.emit('pictureUpdated', baseFilename);
        });
      });
    });
  };

}).call(this);
