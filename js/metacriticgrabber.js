// Generated by CoffeeScript 1.6.3
(function() {
  var app, createGameDetailViewer, dashboardController, dataparserController, guruController, homeController, isloggedin, libraryController, peerController, proController, proLibraryController, reviewController, searchController, signInSetup;

  app = angular.module('reviewApp', ['ngAnimate', 'ngRoute', 'ngResource', 'ngSanitize', 'ionic'], function($routeProvider, $locationProvider) {
    $routeProvider.when('/library', {
      templateUrl: 'views/library.html',
      controller: 'libraryController'
    });
    $routeProvider.when('/guru', {
      templateUrl: 'views/library.html',
      controller: 'guruController'
    });
    $routeProvider.when('/home', {
      templateUrl: 'views/home.html',
      controller: 'homeController'
    });
    $routeProvider.when('/faqs', {
      templateUrl: 'views/faqs.html'
    });
    $routeProvider.when('/contact', {
      templateUrl: 'views/contact.html'
    });
    $routeProvider.when('/peer', {
      templateUrl: 'views/library.html',
      controller: 'peerController'
    });
    $routeProvider.when('/dashboard', {
      templateUrl: 'views/dashboard.html',
      controller: 'dashboardController'
    });
    $routeProvider.when('/settings', {
      templateUrl: 'views/settings.html',
      controller: 'settingsController'
    });
    $routeProvider.when('/search', {
      templateUrl: 'views/search.html',
      controller: 'searchController'
    });
    $routeProvider.when('/pros', {
      templateUrl: 'views/Pros.html',
      controller: 'proController'
    });
    $routeProvider.when('/prosLibrary', {
      templateUrl: 'views/ProReviewerLibrary.html',
      controller: 'proLibraryController'
    });
    return $routeProvider.otherwise({
      templateUrl: 'views/home.html',
      controller: 'homeController'
    });
  });

  app.directive('card', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/card.html'
    };
  });

  app.directive('librarycard', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/librarycard.html'
    };
  });

  app.directive('searchcard', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/searchcard.html'
    };
  });

  app.config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    return delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });

  app.service('socket', function($rootScope) {
    var socket;
    socket = io.connect('http://166.78.129.57:8080');
    return {
      on: function(eventname, callback) {
        return socket.on(eventname, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            if (callback) {
              return callback.apply(socket, args);
            }
          });
        });
      }
    };
  });

  /* move this to the server*/


  app.factory('InfoRequestService', [
    '$http', function($http) {
      var InfoRequest;
      InfoRequest = (function() {
        function InfoRequest() {}

        InfoRequest.prototype.searchForAGame = function(game, callback) {
          var GamesSearchUrl;
          GamesSearchUrl = 'http://www.giantbomb.com/api/search/?api_key=059d37ad5ca7f47e566180366eab2190e8c6da30&query=' + game + '&field_list=name,image,id,deck,original_release_date,platforms,genres&resources=game&format=jsonp&json_callback=JSON_CALLBACK';
          return $http.jsonp(GamesSearchUrl).success(function(data) {
            return callback(data);
          });
        };

        InfoRequest.prototype.getDeckForGame = function(gameid, callback) {
          var GamesSearchUrl;
          GamesSearchUrl = 'http://www.giantbomb.com/api/game/' + gameid + '/?api_key=059d37ad5ca7f47e566180366eab2190e8c6da30&field_list=platforms,deck,genres,videos,original_release_date&format=jsonp&json_callback=JSON_CALLBACK';
          return $http.jsonp(GamesSearchUrl).success(function(data) {
            return callback(data);
          });
        };

        InfoRequest.prototype.getMetaData = function(link, callback) {
          return $http.get(link).success(function(data) {
            return callback(data);
          });
        };

        return InfoRequest;

      })();
      return new InfoRequest();
    }
  ]);

  app.filter('myLimitTo', [
    function() {
      return function(obj, limit, offset) {
        var count, keys, ret, startingpoint;
        keys = Object.keys(obj);
        if (keys.length < 1) {
          return [];
        }
        ret = new Object;
        count = 0;
        startingpoint = 0;
        angular.forEach(keys, function(key, arrayIndex) {
          if (count >= limit) {
            return false;
          }
          if (startingpoint >= offset) {
            ret[key] = obj[key];
            return count++;
          } else {
            return startingpoint >= offset++;
          }
        });
        return ret;
      };
    }
  ]);

  isloggedin = function(socket, location) {
    if (window.localStorage.sessionkey) {
      socket.emit('isUserLoggedin', {
        key: window.localStorage.sessionkey,
        location: location
      });
    } else {
      window.location = '#/home';
    }
    return socket.on('failedToLogin', function(data) {
      return window.location = '#/home';
    });
  };

  createGameDetailViewer = function($ionicModal, $scope, socket, InfoRequestService) {
    var createNumberList;
    $scope.newOffset = 0;
    if ($scope.myLibrary) {
      $scope.itemsPerPage = 11;
    } else {
      $scope.itemsPerPage = 12;
    }
    $scope.currentPage = 0;
    $scope.onCurrentPage = function(num) {
      if (num === $scope.currentPage) {
        return 'button-balanced';
      }
      return 'button-stable';
    };
    $scope.setUpPages = function() {
      var pagecount;
      pagecount = Math.ceil($scope.games.length / $scope.itemsPerPage);
      $scope.maxPages = pagecount;
      $scope.pages = [];
      return createNumberList();
    };
    createNumberList = function() {
      var firstPage, hasElispes, i, lastPage, length, _i;
      lastPage = $scope.maxPages;
      firstPage = 0;
      $scope.pages = [];
      length = 9;
      hasElispes = false;
      if ($scope.maxPages > 10 && $scope.currentPage + 4 >= $scope.maxPages - 1) {
        firstPage = $scope.maxPages - length;
        lastPage = $scope.maxPages;
      } else if ($scope.maxPages > 10 && $scope.currentPage >= length - 1) {
        firstPage = $scope.currentPage - 4;
        lastPage = $scope.currentPage + 4;
      } else if ($scope.maxPages > 10) {
        lastPage = length;
      }
      if (firstPage > 0) {
        $scope.pages.push({
          number: 0,
          startingPoint: 0
        });
        $scope.pages.push({
          elispe: true,
          number: false
        });
      }
      for (i = _i = firstPage; firstPage <= lastPage ? _i < lastPage : _i > lastPage; i = firstPage <= lastPage ? ++_i : --_i) {
        $scope.pages.push({
          number: i,
          startingPoint: i * $scope.itemsPerPage
        });
      }
      if (lastPage < $scope.maxPages - 1) {
        $scope.pages.push({
          elispe: true,
          number: false
        });
        return $scope.pages.push({
          number: $scope.maxPages - 1,
          startingPoint: ($scope.maxPages - 1) * $scope.itemsPerPage
        });
      }
    };
    $scope.setPage = function(num) {
      if (num >= 0 && num < $scope.maxPages) {
        $scope.currentPage = num;
        $scope.newOffset = $scope.currentPage * $scope.itemsPerPage;
        return createNumberList();
      }
    };
    $scope.gameDetails = {};
    $scope.sort = '-releasedate';
    $scope.convertMyRating = function(score) {
      var saying;
      if (score > 10) {
        score = score / 20;
      }
      if (score > 5) {
        score = score / 2;
      }
      return saying = (function() {
        switch (false) {
          case score !== 1:
            return 'This game is  unplayable';
          case score !== 2:
            return 'Bad but playable in a pinch';
          case score !== 3:
            return 'A fairly average game';
          case score !== 4:
            return 'Good game with some minor flaws';
          default:
            return 'A nearly flawless gameplay experience';
        }
      })();
    };
    $scope.convertAverageLibraryClass = function(score1, score2, rating, islibrary) {
      if (!islibrary) {
        return $scope.convertAverageClass(score1, score2);
      } else {
        return $scope.convertAverageClass(rating, rating);
      }
    };
    $scope.convertAverageClass = function(score1, score2) {
      var saying, score;
      score = 0;
      if (score1 && score2) {
        score = (score1 * 1.25 + score2 * .75) / 2;
      } else if (score1) {
        score = score1;
      } else if (score2) {
        score = score2;
      } else {
        return 'unknown';
      }
      return saying = (function() {
        switch (false) {
          case !(score < 1.5):
            return 'negative';
          case !(score < 2.5):
            return 'negative';
          case !(score < 3.5):
            return 'ok';
          case !(score < 4):
            return 'ok';
          case !(score < 4.5):
            return 'postive';
          default:
            return 'postive';
        }
      })();
    };
    $scope.convertRating = function(score) {
      var saying;
      return saying = (function() {
        switch (false) {
          case !(score < 1.5):
            return 'You should avoid this game!';
          case !(score < 2.5):
            return 'Do not waste your time.';
          case !(score < 3.5):
            return 'This game is below average.';
          case !(score < 4):
            return 'You will find this game to be ok.';
          case !(score < 4.5):
            return 'You should play this one!';
          default:
            return 'You will love this game!';
        }
      })();
    };
    $scope.getGameStyle = function(gameUrl) {
      return {
        'background': 'url("' + gameUrl + '")',
        'background-size': '100% 150%',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
      };
    };
    $scope.colorForScore = function(score) {
      var saying;
      return saying = (function() {
        switch (false) {
          case !(score < 1.5):
            return {
              'color': 'red',
              'font-size': '12px'
            };
          case !(score < 2.5):
            return {
              'color': 'red',
              'font-size': '12px'
            };
          case !(score < 3.5):
            return {
              'color': '#E6C805',
              'font-size': '12px'
            };
          case !(score < 4):
            return {
              'color': '#E6C805',
              'font-size': '12px'
            };
          case !(score < 4.5):
            return {
              'color': 'green',
              'font-size': '12px'
            };
          default:
            return {
              'color': 'green',
              'font-size': '12px'
            };
        }
      })();
    };
    $ionicModal.fromTemplateUrl('views/gameDetailsModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      return $scope.gameDetailsModal = modal;
    });
    $scope.showGameDescription = function(id, gameToShownName, image) {
      $scope.gameDetailsModal.show();
      $scope.gamedetails = {};
      return InfoRequestService.getDeckForGame(id, function(data) {
        $scope.gamedetails = data.results;
        $scope.gamedetails.name = gameToShownName;
        return $scope.gamedetails.image = image;
      });
    };
    $scope.closeGameDes = function() {
      return $scope.gameDetailsModal.hide();
    };
    $ionicModal.fromTemplateUrl('views/detailsGuruModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.guruModal = modal;
      return $scope.modalGame = {};
    });
    $scope.getGuruDetails = function(id) {
      $scope.guruModal.show();
      socket.emit('getGuruDetails', {
        gameid: id
      });
      $scope.guruInfoLoading = true;
      return socket.on('guruDetailsFound', function(data) {
        $scope.gameDetails = data;
        return $scope.guruInfoLoading = false;
      });
    };
    $scope.closeGuru = function() {
      return $scope.guruModal.hide();
    };
    $scope.closePeer = function() {
      return $scope.peerModal.hide();
    };
    $scope.getPeerDetails = function(id) {
      $scope.peerModal.show();
      socket.emit('getPeerDetails', {
        gameid: id
      });
      $scope.peerInfoLoading = true;
      return socket.on('peerDetailsFound', function(data) {
        $scope.gameDetails = data;
        return $scope.peerInfoLoading = false;
      });
    };
    return $ionicModal.fromTemplateUrl('views/detailsPeerModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.peerModal = modal;
      return $scope.modalGame = {};
    });
  };

  signInSetup = function($scope, $ionicModal, socket) {
    $ionicModal.fromTemplateUrl('views/signupSignInModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      return $scope.logdata = {};
    });
    $scope.errormessage = false;
    $scope.closeModal = function() {
      $scope.logdata = {};
      return $scope.modal.hide();
    };
    $scope.signUpModal = function() {
      $scope.modal.show();
      return $scope.signUp = true;
    };
    $scope.signInModal = function() {
      $scope.modal.show();
      return $scope.signUp = false;
    };
    $scope.signInNow = function() {
      var logdata;
      logdata = {};
      logdata.username = $scope.logdata.username;
      logdata.password = $scope.logdata.temppassword;
      return socket.emit('Login', logdata);
    };
    $scope.signUpNow = function() {
      var logdata, password;
      $scope.logdata.password = {};
      logdata = {};
      password = {};
      if ($scope.logdata.temppassword === $scope.logdata.repeat) {
        logdata.username = $scope.logdata.username;
        logdata.password = $scope.logdata.temppassword;
        logdata.name = $scope.logdata.name;
        return socket.emit('SignUpUser', logdata);
      } else {
        return $scope.errormessage = 'Passwords do not match';
      }
    };
    socket.on('UserEmailAlreadyExists', function() {
      return $scope.errormessage = 'The user already exits';
    });
    socket.on('UserEmailNotFound', function() {
      return $scope.errormessage = 'Email not valid';
    });
    socket.on('failureMessage', function(message) {
      return $scope.errormessage = message;
    });
    return socket.on('userLoggedin', function() {
      return $scope.closeModal();
    });
  };

  app.controller('reviewController', reviewController = (function() {
    reviewController.$inject = ['$scope', 'InfoRequestService', '$location', 'socket', '$ionicModal'];

    function reviewController($scope, InfoRequestService, $location, socket, $ionicModal) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.$location = $location;
      this.socket = socket;
      if ($location.path() !== '/home' && $location.path() !== '/') {
        isloggedin(socket, $location.path());
      }
      $scope.loggedin = true;
      signInSetup($scope, $ionicModal, socket);
      socket.on('userLoggedin', function(data) {
        $scope.accessList = data.accessList;
        localStorage.setItem("sessionkey", data.sessionKey);
        return window.location = '#/dashboard';
      });
      this.$scope.homeSelected = 'button-stable';
      this.$scope.logout = function() {
        localStorage.removeItem("sessionkey");
        window.location = '#/home';
        return $scope.accessList = false;
      };
      this.$scope.librarySelected = 'button-stable';
      this.$scope.recomendationSeleted = 'button-stable';
      this.$scope.isActive = function(path) {
        var nextPath;
        path = '/' + path;
        if (path === (nextPath = $location.path())) {
          return 'pure-menu-selected';
        } else {
          return '';
        }
      };
    }

    return reviewController;

  })());

  app.controller('homeController', homeController = (function() {
    homeController.$inject = ['$scope', '$ionicModal', 'socket'];

    function homeController($scope, $ionicModal, socket) {
      this.$scope = $scope;
      this.socket = socket;
      $scope.loggedin = false;
      if (window.localStorage.sessionkey) {
        socket.emit('isUserLoggedin', {
          key: window.localStorage.sessionkey,
          location: '/home'
        });
      }
      signInSetup($scope, $ionicModal, socket);
      socket.on('userLoggedin', function(data) {
        if (data.location === '/home') {
          $scope.loggedin = true;
          return window.location = '#/dashboard';
        }
      });
    }

    return homeController;

  })());

  app.controller('searchController', searchController = (function() {
    searchController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket', '$location'];

    function searchController($scope, InfoRequestService, $ionicModal, socket, $location) {
      var searchObject;
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      this.$location = $location;
      $scope.myLibrary = false;
      $scope.isLoading = true;
      $scope.scoreName = 'peerscore';
      $scope.loggedin = true;
      socket.on('userLoggedin', function(data) {});
      createGameDetailViewer($ionicModal, $scope, socket, InfoRequestService);
      searchObject = $location.search();
      InfoRequestService.searchForAGame(searchObject.game, function(data) {
        $scope.gamesfound = [];
        if (data.results.length > 15) {
          $scope.gamesfound = data.results.slice(0, 15);
        } else {
          $scope.gamesfound = data.results;
        }
        socket.emit('searchForGames', {
          list: $scope.gamesfound
        });
        return socket.on('searchfinished', function(data) {
          $scope.games = data;
          $scope.setUpPages();
          return $scope.isLoading = false;
        });
      });
    }

    return searchController;

  })());

  app.controller('dashboardController', dashboardController = (function() {
    dashboardController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket'];

    function dashboardController($scope, InfoRequestService, $ionicModal, socket) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.scoreName = 'peerscore';
      socket.emit('GetRecentGames');
      this.socket.on('recentReleases', function(data) {
        return $scope.recentGames = data;
      });
      createGameDetailViewer($ionicModal, $scope, socket, InfoRequestService);
    }

    return dashboardController;

  })());

  app.controller('peerController', peerController = (function() {
    peerController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket'];

    function peerController($scope, InfoRequestService, $ionicModal, socket) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.myLibrary = false;
      $scope.scoreName = 'peerscore';
      socket.emit('GetPeerLibrary');
      this.socket.on('peerLibraryFound', function(data) {
        $scope.games = data;
        return $scope.setUpPages();
      });
      createGameDetailViewer($ionicModal, $scope, socket, InfoRequestService);
    }

    return peerController;

  })());

  app.controller('guruController', guruController = (function() {
    guruController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket'];

    function guruController($scope, InfoRequestService, $ionicModal, socket) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.myLibrary = false;
      $scope.scoreName = 'guruscore';
      socket.emit('GetGuruLibrary');
      this.socket.on('guruLibraryFound', function(data) {
        $scope.games = data;
        return $scope.setUpPages();
      });
      createGameDetailViewer($ionicModal, $scope, socket, InfoRequestService);
    }

    return guruController;

  })());

  app.controller('libraryController', libraryController = (function() {
    libraryController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket'];

    function libraryController($scope, InfoRequestService, $ionicModal, socket) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.loggedin = true;
      $scope.myLibrary = true;
      $scope.scoreName = 'rating';
      $scope.gameSelected = false;
      socket.emit('GetLibrary');
      this.$scope.aquiredGameList = function() {};
      this.socket.on('init', function(data) {});
      this.socket.on('gameLibraryFound', function(data) {
        $scope.games = data;
        return $scope.setUpPages();
      });
      $ionicModal.fromTemplateUrl('views/addGameModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        return $scope.modalGame = {};
      });
      $scope.searchForAGame = function(game) {
        $scope.isLoading = true;
        return InfoRequestService.searchForAGame(game, function(data) {
          $scope.gamesfound = data.results;
          return $scope.isLoading = false;
        });
      };
      $scope.addNewGame = function() {
        $scope.modal.show();
        return $scope.gameSelected = false;
      };
      $scope.editUserResponse = function(index) {};
      $scope.closeModal = function() {
        $scope.newgame = {};
        $scope.gamesfound = {};
        return $scope.modal.hide();
      };
      $scope.addGameToLibrary = function(game) {
        $scope.newgame = {};
        $scope.newgame.userInfo = {};
        $scope.newgame.giantBombinfo = {};
        $scope.newgame.giantBombinfo.giantBomb_id = game.id;
        $scope.newgame.giantBombinfo.game_name = game.name;
        $scope.newgame.giantBombinfo.game_picture = game.image.medium_url;
        $scope.newgame.giantBombinfo.description = game.deck;
        $scope.newgame.userInfo.rating = 3;
        $scope.newgame.userInfo.enjoyment = 3;
        $scope.newgame.userInfo.length = 3;
        $scope.newgame.userInfo.unenjoyment = 3;
        $scope.newgame.userInfo.difficulty = 3;
        return $scope.gameSelected = true;
      };
      $scope.goback = function() {
        return $scope.gameSelected = false;
      };
      $scope.saveGame = function() {
        socket.emit('AddNewGameToLibrary', $scope.newgame);
        return $scope.closeModal();
      };
      $ionicModal.fromTemplateUrl('views/editScoreModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.editModal = modal;
        return $scope.edit = {};
      });
      $scope.closeEdit = function() {
        $scope.editModal.hide();
        return $scope.edit = {};
      };
      $scope.showEdit = function(index) {
        $scope.edit = $scope.games[index];
        return $scope.editModal.show();
      };
      $scope.updateGame = function() {
        socket.emit('updateGame', $scope.edit);
        return $scope.editModal.hide();
      };
      createGameDetailViewer($ionicModal, $scope, socket, InfoRequestService);
    }

    return libraryController;

  })());

  app.controller('proController', proController = (function() {
    proController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket'];

    function proController($scope, InfoRequestService, $ionicModal, socket) {
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.myLibrary = true;
      $scope.scoreName = 'rating';
      socket.emit('GetProreviewers', 'all');
      socket.on('ProreviewersFound', function(data) {
        return $scope.reviewers = data;
      });
      $ionicModal.fromTemplateUrl('views/addPro.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.proModal = modal;
        return $scope.pros = {};
      });
      $scope.closeProModal = function() {
        return $scope.proModal.hide();
      };
      $scope.openProModal = function(id) {
        $scope.proModal.show();
        if (id) {
          $scope.mode = true;
          $scope.newPro.id = id;
        } else {
          $scope.mode = false;
        }
        return $scope.newPro = {};
      };
      $scope.editPro = function() {
        socket.emit('editPro', $scope.newPro);
        return $scope.closeProModal();
      };
      $scope.savePro = function() {
        socket.emit('addPro', $scope.newPro);
        return $scope.closeProModal();
      };
    }

    return proController;

  })());

  app.controller('proLibraryController', proLibraryController = (function() {
    proLibraryController.$inject = ['$scope', 'InfoRequestService', '$ionicModal', 'socket', '$location'];

    function proLibraryController($scope, InfoRequestService, $ionicModal, socket, $location) {
      var searchObject;
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      this.$location = $location;
      $scope.myLibrary = true;
      $scope.scoreName = 'rating';
      $scope.gameSelected = false;
      searchObject = $location.search();
      socket.emit('GetProreviewerLibrary', {
        id: searchObject.reviewerid
      });
      socket.on('ProLibrarysFound', function(data) {
        return $scope.games = data;
      });
      $ionicModal.fromTemplateUrl('views/addProGame.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        return $scope.modalGame = {};
      });
      $scope.searchForAGame = function(game) {
        $scope.isLoading = true;
        return InfoRequestService.searchForAGame(game, function(data) {
          $scope.gamesfound = data.results;
          return $scope.isLoading = false;
        });
      };
      $scope.addNewGame = function() {
        $scope.modal.show();
        return $scope.gameSelected = false;
      };
      $scope.editUserResponse = function(index) {};
      $scope.closeModal = function() {
        $scope.newgame = {};
        $scope.gamesfound = {};
        return $scope.modal.hide();
      };
      $scope.addGameToLibrary = function(game) {
        $scope.newgame = {};
        $scope.newgame.userInfo = {};
        $scope.newgame.userInfo.user_id = searchObject.reviewerid;
        $scope.newgame.giantBombinfo = {};
        if (game.image) {
          gameData[index].giantBombinfo.game_picture = game.image.medium_url;
        } else {
          gameData[index].giantBombinfo.game_picture = '';
        }
        $scope.newgame.giantBombinfo.giantBomb_id = game.id;
        $scope.newgame.giantBombinfo.game_name = game.name;
        $scope.newgame.giantBombinfo.description = game.deck;
        $scope.newgame.giantBombinfo.releasedate = game.original_release_date;
        $scope.newgame.platforms = game.platforms;
        return $scope.gameSelected = true;
      };
      $scope.goback = function() {
        return $scope.gameSelected = false;
      };
      $scope.saveGame = function() {
        socket.emit('AddNewProGameToLibrary', $scope.newgame);
        return $scope.closeModal();
      };
    }

    return proLibraryController;

  })());

  app.controller('dataparserController', dataparserController = (function() {
    dataparserController.$inject = ['$scope', 'InfoRequestService', 'socket'];

    function dataparserController($scope, InfoRequestService, socket) {
      var addGameToLibrary, addPlatforms;
      this.$scope = $scope;
      this.InfoRequestService = InfoRequestService;
      this.socket = socket;
      $scope.getMetaData = function() {
        return InfoRequestService.getMetaData($scope.metacriticlink, function(data) {
          var metacriticdata;
          return metacriticdata = data;
        });
      };
      addGameToLibrary = function(index, length, gameData, callback) {
        if (index === length) {
          callback();
        }
        if (!gameData[index].game) {
          gameData[index].giantBombinfo = gameData[index - 1].giantBombinfo;
          socket.emit('AddGameandReviewerToLibrary', gameData[index]);
          return addGameToLibrary(index + 1, length, gameData, callback);
        } else {
          return InfoRequestService.searchForAGame(gameData[index].game, function(data) {
            var game;
            if (data.results.length === 0) {
              addGameToLibrary(index + 1, length, gameData, callback);
            }
            game = data.results[0];
            gameData[index].giantBombinfo = {};
            gameData[index].giantBombinfo.giantBomb_id = game.id;
            gameData[index].giantBombinfo.game_name = game.name;
            gameData[index].platforms = game.platforms;
            if (game.image) {
              gameData[index].giantBombinfo.game_picture = game.image.medium_url;
            } else {
              gameData[index].giantBombinfo.game_picture = '';
            }
            gameData[index].giantBombinfo.description = game.deck;
            gameData[index].giantBombinfo.releasedate = game.original_release_date;
            socket.emit('AddGameandReviewerToLibrary', gameData[index]);
            return addGameToLibrary(index + 1, length, gameData, callback);
          });
        }
      };
      addPlatforms = function(games, index, length, callback) {
        if (index === length) {
          return callback(true);
        } else {
          return InfoRequestService.getDeckForGame(games[index].bombid, function(data) {
            var newdata;
            newdata = data.results;
            newdata.id = games[index].gameid;
            socket.emit('updateGamePlatforms', newdata);
            return addPlatforms(games, index + 1, length, callback);
          });
        }
      };
      $scope.updateGamePlatforms = function(files) {
        var file, reader;
        file = files[0];
        reader = new FileReader();
        reader.readAsText(file);
        return reader.onload = function(event) {
          var csv, curdata, length;
          csv = event.target.result;
          curdata = $.csv.toObjects(csv);
          length = curdata.length;
          return addPlatforms(curdata, 0, length, function() {
            return alert(finished);
          });
        };
      };
      $scope.uploadImage = function(files) {
        var file, reader;
        file = files[0];
        reader = new FileReader();
        reader.readAsText(file);
        return reader.onload = function(event) {
          var OrganizedData, csv, data, gamedata, length, organized, _i, _len;
          csv = event.target.result;
          data = $.csv.toObjects(csv);
          OrganizedData = [];
          length = 0;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            gamedata = data[_i];
            length++;
            organized = {};
            organized.pro = {};
            organized.pro.name = gamedata.name;
            organized.pro.site_address = gamedata.Site_address;
            organized.userInfo = {};
            organized.game = gamedata.game;
            organized.userInfo.review_link = gamedata.review_link;
            organized.userInfo.true_score = gamedata.true_score;
            if (gamedata.true_score > 10) {
              organized.userInfo.true_score_max = 100;
              organized.userInfo.rating = gamedata.true_score / 20;
            } else if (gamedata.true_score > 5) {
              organized.userInfo.true_score_max = 10;
              organized.userInfo.rating = gamedata.true_score / 2;
            } else {
              organized.userInfo.true_score_max = 5;
              organized.userInfo.rating = gamedata.true_score;
            }
            OrganizedData.push(organized);
          }
          return addGameToLibrary(0, length, OrganizedData, function() {
            return alert('finished');
          });
        };
      };
    }

    return dataparserController;

  })());

}).call(this);