// Generated by CoffeeScript 1.6.3
(function() {
  var commonDB;

  commonDB = require('./commonDatabaseFiles');

  module.exports = function(client, request, connection) {
    var SteamInfo, addSteamIdToGame, doesUserHaveGame, getGameInfo, getGameWithSteamId, getGiantBombVersionOfGames, getSteamAccountInfo, giantbombInfo, isSteamAccountLinked, xbox;
    giantbombInfo = {};
    giantbombInfo.apikey = 'api_key=059d37ad5ca7f47e566180366eab2190e8c6da30';
    giantbombInfo.baseurl = 'http://www.giantbomb.com/api/';
    giantbombInfo.fiedList = '&field_list=name,image,id,deck,original_release_date,platforms,genres&resources=game&format=jsonp&json_callback=JSON_CALLBACK';
    giantbombInfo.searchPath = 'search/?';
    giantbombInfo.gamePath = 'game/';
    client.on('findGamesInWiki', function(game) {
      return getGameInfo(game, function(data) {
        return client.emit('listOfGamesFromWiki', data);
      });
    });
    client.on('getGameInfoFromWiki', function(gameid) {
      var GameSearchURL;
      GameSearchURL = giantbombInfo.baseurl + giantbombInfo.gamePath + gameid + '/?' + giantbombInfo.apikey + giantbombInfo.fiedList;
      return request(GameSearchURL, function(error, response, body) {
        var data, endPos, jsonString, startPos;
        if (!error && response.statusCode === 200) {
          startPos = body.indexOf('({');
          endPos = body.indexOf('})');
          jsonString = body.substring(startPos + 1, endPos + 1);
          data = JSON.parse(jsonString);
          return client.emit('gameInfoForGameFromWiki', data);
        } else {
          return console.log(error);
        }
      });
    });
    getGameInfo = function(game, callback) {
      var GameSearchURL;
      GameSearchURL = giantbombInfo.baseurl + giantbombInfo.searchPath + giantbombInfo.apikey + '&query=' + game + giantbombInfo.fiedList;
      return request(GameSearchURL, function(error, response, body) {
        var data, endPos, jsonString, startPos;
        data = '';
        if (!error && response.statusCode === 200) {
          startPos = body.indexOf('({');
          endPos = body.indexOf('})');
          jsonString = body.substring(startPos + 1, endPos + 1);
          data = JSON.parse(jsonString);
          return callback(data);
        } else {
          return console.log(error);
        }
      });
    };
    /* Steam*/

    SteamInfo = {
      key: 'key=33701385AB8FAE0087AD343546590367',
      baseurl: 'http://api.steampowered.com',
      ownedPath: "/IPlayerService/GetOwnedGames/v0001/?",
      vanityPath: "/ISteamUser/ResolveVanityURL/v0001/?",
      gameIncludes: "&include_appinfo=1",
      format: "&format=json"
    };
    isSteamAccountLinked = function(callback) {
      var sql;
      sql = 'Select Count(*) as userCount , steamID from user where steamID != 0 and steamID != -1  and id = ' + client.userid;
      return connection.query(sql, function(err, result) {
        if (result[0].userCount === 0) {
          return callback(false);
        } else {
          return callback(result[0].steamID);
        }
      });
    };
    getSteamAccountInfo = function(vanityName, callback) {
      return isSteamAccountLinked(function(returnedid) {
        var getSteamIdURL, steamid, vanity;
        steamid = returnedid;
        if (steamid === false) {
          vanity = '&vanityurl=' + vanityName;
          getSteamIdURL = SteamInfo.baseurl + SteamInfo.vanityPath + SteamInfo.key + vanity;
          console.log(getSteamIdURL);
          return request(getSteamIdURL, function(error, response, body) {
            var data;
            if (!error && response.statusCode === 200) {
              data = JSON.parse(body);
              console.log(data);
              if (data.response.success === 1) {
                return callback(data.response.steamid);
              } else {
                return callback(false);
              }
            } else {
              return callback(false);
            }
          });
        } else {
          return callback(steamid);
        }
      });
    };
    addSteamIdToGame = function(gameid, steamid) {
      var sql;
      sql = 'update games set steam_id =' + steamid + ' where id =' + gameid;
      return connection.query(sql, function(err, results) {});
    };
    getGameWithSteamId = function(steamid, callback) {
      var sql;
      sql = 'select count(*) as count ,id  from games g where g.steam_id = ' + steamid;
      return connection.query(sql, function(err, results) {
        if (results[0].count === 0) {
          return callback(false);
        } else {
          return callback(results[0].id);
        }
      });
    };
    doesUserHaveGame = function(gameid, callback) {
      var sql;
      sql = 'Select count(*) as count from library l, games g where l.user_id =' + client.userid + ' and g.giantBomb_id =' + gameid + ' and g.id = l.game_id';
      console.log(sql);
      return connection.query(sql, function(err, results) {
        return callback(results[0].count);
      });
    };
    getGiantBombVersionOfGames = function(games, index, length, callback) {
      if (index === length) {
        return callback(games);
      } else {
        if (games[index].playtime_forever > 20) {
          return getGameWithSteamId(games[index].appid, function(steamToGameid) {
            var newgame;
            newgame = {};
            newgame.userInfo = {};
            newgame.userInfo.rating = -1;
            newgame.userInfo.enjoyment = 3;
            newgame.userInfo.length = 3;
            newgame.userInfo.unenjoyment = 3;
            newgame.userInfo.difficulty = 3;
            newgame.userInfo.user_id = client.userid;
            if (steamToGameid === false) {
              return getGameInfo(games[index].name, function(gamelist) {
                var game;
                game = gamelist.results[0];
                console.log(gamelist);
                console.log(game);
                newgame.giantBombinfo = {};
                newgame.giantBombinfo.giantBomb_id = game.id;
                newgame.giantBombinfo.game_name = game.name;
                newgame.giantBombinfo.game_picture = game.image.medium_url;
                newgame.giantBombinfo.description = game.deck;
                newgame.giantBombinfo.releasedate = game.original_release_date;
                commonDB.connection = connection;
                return doesUserHaveGame(game.id, function(count) {
                  if (count === 0) {
                    return getGiantBombVersionOfGames(games, index + 1, length, callback);
                  } else {
                    return commonDB.getOrCreateGame(newgame.giantBombinfo, game.platforms, function(gameid) {
                      var sql;
                      newgame.userInfo.game_id = gameid;
                      addSteamIdToGame(gameid, games[index].appid);
                      sql = 'Insert into library Set ?';
                      return connection.query(sql, newgame.userInfo, function(err, results) {
                        return getGiantBombVersionOfGames(games, index + 1, length, callback);
                      });
                    });
                  }
                });
              });
            } else {
              return doesUserHaveGame(steamToGameid, function(count) {
                var sql;
                if (count === 0) {
                  return getGiantBombVersionOfGames(games, index + 1, length, callback);
                } else {
                  newgame.userInfo.game_id = steamToGameid;
                  sql = 'Insert into library Set ?';
                  return connection.query(sql, newgame.userInfo, function(err, results) {
                    return getGiantBombVersionOfGames(games, index + 1, length, callback);
                  });
                }
              });
            }
          });
        } else {
          return getGiantBombVersionOfGames(games, index + 1, length, callback);
        }
      }
    };
    client.on('importGamesFromSteam', function(data) {
      return getSteamAccountInfo(data.name, function(returnedID) {
        var steamImportUrl, steamid;
        steamid = '&steamid=' + returnedID;
        if (returnedID === false) {
          console.log('not found');
          return client.emit('vanityNameNotFound');
        } else {
          steamImportUrl = SteamInfo.baseurl + SteamInfo.ownedPath + SteamInfo.key + steamid + SteamInfo.gameIncludes + SteamInfo.format;
          console.log(steamImportUrl);
          return request(steamImportUrl, function(error, response, body) {
            if (!error && response.statusCode === 200) {
              data = JSON.parse(body);
              commonDB.connection = connection;
              return getGiantBombVersionOfGames(data.response.games, 0, data.response.games.length, function(games) {
                return client.emit('steamGamesToAdd', games);
              });
            } else {
              return client.emit('steamImportError', error);
            }
          });
        }
      });
    });
    /* XBOX*/

    return xbox = {
      key: 'b5cfd5d7019993e435b7b125c4276bfb4f0a8c62',
      profileID: '2533274828210569'
    };
  };

}).call(this);
