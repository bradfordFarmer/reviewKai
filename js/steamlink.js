// Generated by CoffeeScript 1.9.3
(function() {
  module.exports = function(client, connection, request) {
    var SteamInfo, getSteamAccountInfo, isSteamAccountLinked;
    SteamInfo = {
      key: 'key=33701385AB8FAE0087AD343546590367',
      baseurl: 'http://api.steampowered.com',
      ownedPath: "/IPlayerService/GetOwnedGames/v0001/?",
      vanityPath: "/ISteamUser/ResolveVanityURL/v0001/?",
      gameIncludes: "&include_appinfo=1",
      format: "&format=json"
    };
    isSteamAccountLinked = function() {
      var sql;
      sql = 'Select Count(*) as userCount , steamID from user where steamID != null id = ' + client.userid;
      return connection.query(sql, function(err, result) {
        if (result[0].userCount === 0) {
          return false;
        } else {
          return result[0].steamID;
        }
      });
    };
    getSteamAccountInfo = function(vanityName, callback) {
      var getSteamIdURL, steamid, vanity;
      steamid = isSteamAccountLinked();
      if (!steamid) {
        vanity = '&vanityurl=' + vanityName;
        getSteamIdURL = SteamInfo.baseurl + SteamInfo.vanityPath + SteamInfo.key + vanity;
        return request(getSteamIdURL, function(error, response, body) {
          var data;
          if (!error && response.statusCode === 200) {
            data = JSON.parse(jsonString);
            return callback(data.response.steamid);
          }
        });
      } else {
        return callback(steamid);
      }
    };
    return client.on('importGamesFromSteam', function(data) {
      return getSteamAccountInfo(data.name, function(returnedID) {
        var steamImportUrl, steamid;
        steamid = '&steamid=' + returnedID;
        steamImportUrl = SteamInfo.baseurl + SteamInfo.ownedPath + SteamInfo.key + steamid + SteamInfo.gamesInclues(+SteamInfo.format);
        return request(steamImportUrl, function(error, response, body) {
          var game, i, len, ref;
          if (!error && response.statusCode === 200) {
            data = JSON.parse(jsonString);
            ref = data.response.games;
            for (i = 0, len = ref.length; i < len; i++) {
              game = ref[i];
              if (game.playtime_forever > 10) {

                /*add game to user library */
              }
            }
            return client.emit('steamGamesToAdd', data);
          } else {
            return client.emit('steamImportError', error);
          }
        });
      });
    });
  };

}).call(this);
