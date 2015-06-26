// Generated by CoffeeScript 1.6.3
(function() {
  var commonDB;

  commonDB = require('./commonDatabaseFiles');

  module.exports = function(client, connection) {
    /* helper functions start*/

    var addGameScore, calculateAllReviewForGame, calculateNewPeers, calculateNewPros, calculateProReviewForGame, caluclatePeerReviewsForGame, getGamesForUser, getGamesForUserOnPlatform, getGurusGameForUser, getOrCreateProReviewer, getPeersGameForUser, getProLibrary, getPros, getRecentReleases, getReviewLinksForProReviewers, updateGameList;
    calculateNewPros = function(userId) {
      var sql;
      sql = 'call calculateNewPros(' + userId + ')';
      return connection.query(sql, userId, function(err, results) {});
    };
    calculateNewPeers = function(userId) {
      var sql;
      sql = 'call calculateNewPeers(' + userId + ')';
      return connection.query(sql, function(err, results) {});
    };
    calculateProReviewForGame = function(gameid, userid, callback) {
      var sql;
      sql = 'Select avg(rating) as rating , avg(enjoyment) as enjoyment ,  avg(unenjoyment) as unenjoyment , avg(difficulty) as difficulty, avg(length) as length  from ProReviewerLibrary prl ,userToProreviewer utp  where prl.id = utp.reviewer_id and utp.user_id=' + userid + ' and prl.game_id = ' + gameid;
      return connection.query(sql, [data.id], function(err, result) {
        return callback(result[0]);
      });
    };
    caluclatePeerReviewsForGame = function(gameid, userid, callback) {
      var sql;
      sql = 'Select avg(rating) as rating , avg(enjoyment) as enjoyment ,  avg(unenjoyment) as unenjoyment , avg(difficulty) as difficulty ,  avg(length) as length  from library prl , userToReviewers utp  where prl.id = utp.reviewer_id and utp.user_id=' + userid + ' and prl.game_id = ' + gameid;
      return connection.query(sql, [data.id], function(err, result) {
        return callback(result[0]);
      });
    };
    calculateAllReviewForGame = function(gameid, callback) {
      var sql;
      sql = 'Select avg(rating) as rating , avg(enjoyment) as enjoyment ,  avg(unenjoyment) as unenjoyment , avg(difficulty) as difficulty ,  avg(length) as length  from library l where l.game_id = ' + gameid;
      return connection.query(sql, [data.id], function(err, result) {
        return callback(result[0]);
      });
    };
    getReviewLinksForProReviewers = function(gameid, callback) {
      var sql;
      sql = 'Select review_link from ProReviewerLibrary prl ,userToProreviewer utp  where prl.id = utp.reviewer_id and utp.user_id=' + userid + ' and prl.game_id = ' + gameid;
      return connection.query(sql, [data.id], function(err, result) {
        return callback(result);
      });
    };
    getOrCreateProReviewer = function(data, callback) {
      var sql;
      sql = 'Select count(*) as reviewerCount ,id from ProReviewers where name = "' + data.name + '"';
      return connection.query(sql, function(err, result) {
        var firstresult;
        firstresult = result[0];
        if (firstresult.reviewerCount > 0) {
          return callback(firstresult.id);
        } else {
          sql = 'Insert into ProReviewers Set ?';
          return connection.query(sql, data, function(err, result) {
            var gameid;
            gameid = result.insertId;
            return callback(gameid);
          });
        }
      });
    };
    getRecentReleases = function(userid, client) {
      var sql;
      sql = 'select  count(*) as count from  userToReviewers  where user_id=' + userid;
      return connection.query(sql, function(err, result) {
        if (result[0].count > 0) {
          sql = 'Select * from ';
          sql += '(select  g.game_name , g.game_picture, g.id, g.giantBomb_id,g.releasedate  from  games g order by releasedate desc) t1  ';
          sql += ' join (Select avg (peer.rating) as peerscore, peer.game_id from library peer, userToReviewers utr where  utr.reviewer_id = peer.user_id and utr.user_id = ' + userid + ' group by peer.game_id ) t2 ';
          sql += 'on t1.id = t2.game_id left  join (Select avg (pro.rating) as guruscore, pro.game_id from ProReviewerLibrary pro, userToProreviewer utr where  utr.reviewer_id = pro.user_id and utr.user_id = ' + userid + ' group by pro.game_id  ) t3 ';
          sql += 'on t3.game_id = t1.id';
          console.log(sql);
          return connection.query(sql, function(err, result) {
            return client.emit('recentReleases', result);
          });
        } else {
          return client.emit('noGames');
        }
      });
    };
    getGurusGameForUser = function(userid, client, platform) {
      var sql;
      sql = 'call getGamesForUserOnplatform(' + userid + ',"' + platform + '" )';
      return connection.query(sql, function(err, result) {
        return client.emit('guruLibraryFound', result);
      });
    };
    getPeersGameForUser = function(userid, client, platform) {
      var sql;
      sql = 'call getGamesForUserOnplatform(' + userid + ',"' + platform + '" )';
      return connection.query(sql, function(err, result) {
        return client.emit('peerLibraryFound', result);
      });
    };
    getGamesForUserOnPlatform = function(userid, client, platform) {};
    getGamesForUser = function(username, localuserid, client) {
      var library, sql;
      library = {};
      sql = 'Select id,name,site,stream from user where name = "' + username + '"';
      return connection.query(sql, function(err, result) {
        var user, userid;
        if (result.length <= 0) {
          return client.emit('noLibraryFound');
        } else {
          userid = result[0].id;
          user = result;
          library.myLibrary = userid === localuserid;
          sql = 'Select * from ';
          sql += '(select l.rating,l.added, g.id, l.description, g.giantBomb_id,g.releasedate   , g.game_name , g.game_picture from library l, games g where l.game_id = g.id and l.user_id =' + userid + ' order by g.releasedate desc ) t1 ';
          sql += 'left join (Select avg (peer.rating) as peerscore, peer.game_id from library peer, userToReviewers utr where  utr.reviewer_id = peer.user_id and utr.user_id = ' + userid + ' group by peer.game_id ) t2 ';
          sql += 'on t1.id = t2.game_id left join (Select avg (pro.rating) as guruscore, pro.game_id from ProReviewerLibrary pro, userToProreviewer utr where  utr.reviewer_id = pro.user_id and utr.user_id = ' + userid + ' group by pro.game_id ) t3 ';
          sql += 'on t3.game_id = t1.id';
          console.log(userid);
          return connection.query(sql, function(err, result) {
            library.games = result;
            library.user = user;
            return client.emit('gameLibraryFound', library);
          });
        }
      });
    };
    addGameScore = function(userid, gameid, bombid, callback) {
      var sql;
      sql = 'Select * from ';
      sql += '(select g.id, g.giantBomb_id,g.releasedate   from  games g where g.giantBomb_id  = ' + bombid + ') t1 ';
      sql += 'left join (Select avg (peer.rating) as peerscore, peer.game_id from library peer, userToReviewers utr where  utr.reviewer_id = peer.user_id and utr.user_id = ' + userid + '  and peer.game_id =' + gameid + ' ) t2 ';
      sql += 'on t1.id = t2.game_id left join (Select avg (pro.rating) as guruscore, pro.game_id from ProReviewerLibrary pro, userToProreviewer utr where  utr.reviewer_id = pro.user_id and utr.user_id = ' + userid + ' and pro.game_id =' + gameid + ' ) t3 ';
      sql += 'on t3.game_id = t1.id';
      return connection.query(sql, function(err, result) {
        console.log(result);
        return callback(result);
      });
    };
    updateGameList = function(userid, gamelist, index, callback) {
      var game, length, sql;
      length = gamelist.length;
      if (index < length) {
        game = gamelist[index];
        sql = 'select g.id, count(*) as count from  games g where g.giantBomb_id  =' + game.id;
        return connection.query(sql, function(err, result) {
          if (result[0].count === 0) {
            return updateGameList(userid, gamelist, index + 1, callback);
          } else {
            return addGameScore(userid, result[0].id, game.id, function(results) {
              if (results) {
                game.details = results[0];
                gamelist[index] = game;
              }
              return updateGameList(userid, gamelist, index + 1, callback);
            });
          }
        });
      } else {
        return callback(gamelist);
      }
    };
    /*helper functions end*/

    client.on('GetLibrary', function(username) {
      return getGamesForUser(username, client.userid, client);
    });
    client.on('updateGameInLibrary', function(data) {
      var sql;
      sql = ' Update library Set ? where id =' + data.id;
      return connection.query(sql, data, function(err, result) {
        console.log('game updated');
        return getGamesForUser(client.username, client.userid, client);
      });
    });
    client.on('GetGuruLibrary', function(platform) {
      return getGurusGameForUser(client.userid, client, platform);
    });
    client.on('GetPeerLibrary', function(platform) {
      return getPeersGameForUser(client.userid, client, platform);
    });
    client.on('AddNewGameToLibrary', function(data) {
      commonDB.connection = connection;
      return commonDB.getOrCreateGame(data.giantBombinfo, data.platforms, function(gameid) {
        var sql;
        data.userInfo.game_id = gameid;
        data.userInfo.user_id = client.userid;
        sql = 'Insert into library Set ?';
        return connection.query(sql, data.userInfo, function(err, results) {
          calculateNewPeers(data.userInfo.user_id);
          calculateNewPros(data.userInfo.user_id);
          return getGamesForUser(client.username, client.userid, client);
        });
      });
    });
    client.on('GetNewGameReviews', function() {
      var sql;
      sql = 'Select * from games where 1 sort by added Desc limit 10';
      return connection.query(sql, function(err, result) {
        var gameid, games, res, _i, _len;
        games = [];
        for (_i = 0, _len = result.length; _i < _len; _i++) {
          res = result[_i];
          gameid = res['id'];
          res['peerReview'] = caluclatePeerReviewsForGame(gameid);
          res['proReview'] = calculateProReviewForGame(gameid);
          games.push(res);
        }
        return client.emit('recentGames', games);
      });
    });
    client.on('GetReviewForGame', function(gameid) {
      var sql;
      sql = 'Select * from games where id = ? ';
      return connection.query(sql, [gameid], function(err, result) {
        result['peerReview'] = caluclatePeerReviewsForGame(gameid);
        result['proReview'] = calculateProReviewForGame(gameid);
        return client.emit('gameReview', result);
      });
    });
    client.on('updateGame', function(game) {
      var sql;
      sql = 'Update library set rating =' + game.rating + ', description = "' + game.description + '" where id =' + game.game_id;
      console.log(sql);
      return connection.query(sql, [gameid], function(err, result) {
        return getGamesForUser(client.username, client.userid, client);
      });
    });
    client.on('searchForGames', function(games) {
      return updateGameList(client.userid, games.list, 0, function(newlist) {
        return client.emit('searchfinished', newlist);
      });
    });
    client.on('getGuruDetails', function(gameid) {
      var sql;
      sql = 'Select g.game_name as name, pr.name as reviewerName, prl.true_score as score, prl.true_score_max as scoremax, prl.review_link as reviewlink from userToProreviewer utp, ProReviewerLibrary prl ,games g , ProReviewers pr where utp.user_id =' + client.userid + ' and utp.reviewer_id = pr.id and g.id =' + gameid.gameid + ' and prl.user_id = utp.reviewer_id and g.id = prl.game_id';
      return connection.query(sql, function(err, result) {
        return client.emit('guruDetailsFound', result);
      });
    });
    client.on('getPeerDetails', function(gameid) {
      var sql;
      sql = 'Select g.game_name as name, pr.name as reviewerName, prl.rating as score, prl.description as details from userToReviewers utp, library prl, games g , user pr where utp.user_id =' + client.userid + ' and utp.reviewer_id = pr.id and g.id =' + gameid.gameid + ' and prl.user_id = utp.reviewer_id and g.id = prl.game_id';
      return connection.query(sql, function(err, result) {
        console.log(result);
        return client.emit('peerDetailsFound', result);
      });
    });
    getPros = function() {
      var sql;
      sql = 'Select * from ProReviewers  where active = 1';
      return connection.query(sql, function(err, result) {
        console.log(result);
        return client.emit('ProreviewersFound', result);
      });
    };
    client.on('GetRecentGames', function() {
      return getRecentReleases(client.userid, client);
    });
    client.on('GetProreviewers', function(data) {
      return getPros();
    });
    client.on('addPro', function(data) {
      var sql;
      sql = 'Insert into ProReviewers Set ?';
      return connection.query(sql, data, function(err, result) {
        return getPros();
      });
    });
    client.on('ProReviewers', function(data) {
      var sql;
      sql = 'Update library set site_address =' + data.site_address + ', name = "' + data.name + '" where id =' + data.id;
      return connection.query(sql, [gameid], function(err, result) {
        return getPros();
      });
    });
    getProLibrary = function(id) {
      var sql;
      sql = 'Select * from  ProReviewerLibrary pr, games g where g.id=pr.game_id and pr.user_id =' + id;
      console.log(sql);
      return connection.query(sql, function(err, result) {
        return client.emit('ProLibrarysFound', result);
      });
    };
    client.on('GetListOfPlatforms', function(data) {
      var sql;
      sql = 'Select display_name from platforms where active =1 group by display_name order by relevanceRanking';
      return connection.query(sql, function(err, result) {
        return client.emit('platformsFound', result);
      });
    });
    client.on('UpdateUserLibraryInfo', function(data) {
      var sql;
      sql = "Update user set site ='" + data.site + "', stream='" + data.stream + "' where id =" + client.userid;
      return connection.query(sql, function(err, result) {});
    });
    client.on('GetProreviewerLibrary', function(data) {
      return getProLibrary(data.id);
    });
    client.on('AddNewProGameToLibrary', function(data) {
      commonDB.connection = connection;
      return commonDB.getOrCreateGame(data.giantBombinfo, data.platforms, function(gameid) {
        var sql;
        data.userInfo.game_id = gameid;
        sql = 'Insert into ProReviewerLibrary  Set ?';
        return connection.query(sql, data.userInfo, function(err, results) {
          return getProLibrary(data.userInfo.user_id);
        });
      });
    });
    client.on('updateGamePlatforms', function(data) {
      var platform, _i, _len, _ref, _results;
      commonDB.connection = connection;
      _ref = data.platforms;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        platform = _ref[_i];
        _results.push(commonDB.getOrCreatePlatform(platform.abbreviation, data.id));
      }
      return _results;
    });
    return client.on('AddGameandReviewerToLibrary', function(data) {
      commonDB.connection = connection;
      return commonDB.getOrCreateGame(data.giantBombinfo, data.platforms, function(gameid) {
        return getOrCreateProReviewer(data.pro, function(newuserid) {
          var sql;
          data.userInfo.game_id = gameid;
          data.userInfo.user_id = newuserid;
          sql = 'Select count(*) as gamecount from ProReviewerLibrary where game_id = ' + gameid + ' and user_id=' + newuserid;
          return connection.query(sql, [data.giantBomb_id], function(err, result) {
            var firstresult;
            client.emit('finishedInsert');
            firstresult = result[0];
            if (firstresult.gamecount === 0) {
              sql = 'Insert into ProReviewerLibrary  Set ?';
              return connection.query(sql, data.userInfo, function(err, results) {
                gameid = result.insertId;
                sql = 'call updateFakeUsers (' + gameid + ',' + gameid + ')';
                return connection.query(sql, data.userInfo, function(err, results) {});
              });
            }
          });
        });
      });
    });
  };

}).call(this);
