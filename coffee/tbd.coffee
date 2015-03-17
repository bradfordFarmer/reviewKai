app = angular.module 'reviewApp',['ngAnimate', 'ngRoute','ngResource','ngSanitize', 'ionic'],
 ($routeProvider, $locationProvider)->
            $routeProvider.when '/library', {
                templateUrl: 'views/library.html'
                controller: 'libraryController'
            }
            $routeProvider.when '/guru', {
                templateUrl: 'views/library.html'
                controller: 'guruController'
            }
            
            $routeProvider.when '/home', {
                templateUrl: 'views/home.html'
                controller: 'homeController'
            }
            $routeProvider.when '/faqs', {
                templateUrl: 'views/faqs.html'
               
            }
            $routeProvider.when '/contact', {
                templateUrl: 'views/contact.html'
               
            }
            $routeProvider.when '/peer', {
                templateUrl: 'views/library.html'
                controller: 'peerController'
            }

            $routeProvider.when '/dashboard', {
                templateUrl: 'views/dashboard.html'
                controller: 'dashboardController'
            }
    
            $routeProvider.when '/settings', {
                templateUrl: 'views/settings.html'
                controller: 'settingsController'
            }

            $routeProvider.when '/search', {
                templateUrl: 'views/search.html'
                controller: 'searchController'
            }
            $routeProvider.when '/pros', {
                templateUrl: 'views/Pros.html'
                controller: 'proController'
            }
            $routeProvider.when '/prosLibrary', {
                templateUrl: 'views/ProReviewerLibrary.html'
                controller: 'proLibraryController'
            }
        
            $routeProvider.otherwise {
                templateUrl: 'views/home.html'
                controller: 'homeController'
            }
app.config ($httpProvider) -> 
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    
app.service 'socket',($rootScope) ->
    socket = io.connect 'http://166.78.129.57:8080'
    {
        on: (eventname, callback) -> 
            socket.on eventname, ->
                args=arguments
                $rootScope.$apply ->
                    callback.apply socket,args
        emit:  (eventName, data, callback) ->
            socket.emit eventName, data, ->
                args = arguments
                $rootScope.$apply ->
                     if callback
                            callback.apply socket, args
    }
  
   
### move this to the server ###
app.factory 'InfoRequestService', ['$http', ($http) -> 
   class InfoRequest
     
        searchForAGame: (game, callback)->
            request= {api_key:'059d37ad5ca7f47e566180366eab2190e8c6da30', query:game, format:"jsonp", field_list : "name, image, site_detail_url"}
            GamesSearchUrl = 'http://www.giantbomb.com/api/search/?api_key=059d37ad5ca7f47e566180366eab2190e8c6da30&query='+game+'&field_list=name,image,id,description,original_release_date,genres&resources=game&format=jsonp&json_callback=JSON_CALLBACK';
            $http.jsonp(GamesSearchUrl).success (data)->
                callback data

        
            
    new InfoRequest()
]

app.filter('myLimitTo', [->
     (obj, limit,offset)->
        keys = Object.keys(obj);
        if(keys.length < 1)
            return [];
        ret = new Object
        count = 0
        startingpoint=0
        angular.forEach keys, (key, arrayIndex)->
           if(count >= limit)
                return false;
            if startingpoint>=offset
                ret[key] = obj[key];
                count++;
            else 
                startingpoint>=offset++
        
        return ret;
    
])

isloggedin = (socket , location )-> 
    if window.localStorage.sessionkey
        socket.emit 'isUserLoggedin' , {key:window.localStorage.sessionkey, location:location}
    else 
        window.location='#/home'
    socket.on 'failedToLogin', (data)->
        window.location='#/home'
        
createGameDetailViewer= ( $ionicModal, $scope, socket) ->
            if $scope.myLibrary
                $scope.itemsPerPage = 8;
            else 
                $scope.itemsPerPage = 9;
                
            $scope.currentPage = 0;
            $scope.offset = 0;
            $scope.getCurrentGameList =->
                $scope.games[$scope.offset...$scope.offset+$scope.itemsPerPage]
            $scope.range= ->
                [0...pageCount()]
            pageCount= ->
                if not $scope.games
                    return 0 
                pagecount = Math.ceil($scope.games.length/$scope.itemsPerPage);
            $scope.setPage = (num)->
                if num>=0 and num<pageCount()
                    $scope.currentPage=num
                    $scope.offset= $scope.currentPage*$scope.itemsPerPage
            $scope.gameDetails={}
            $scope.sort = '-releasedate'
            $scope.convertMyRating= (score)->
                 if score >10
                    score =score/20
                 if score >5
                    score =score/2
                 saying = switch
                    when score is 1 then 'This game is  unplayable'
                    when score is 2 then 'Bad but playable in a pinch'
                    when score is 3 then 'A fairly average game'
                    when score is 4 then 'Good game with some minor flaws'
                    else 'A nearly flawless gameplay experience'
            $scope.convertRating= (score)-> 
                saying = switch
                    when score < 1.5 then 'You should avoid this game at all costs!'
                    when score < 2.5 then 'Do not waste your time on this one.'
                    when score < 3.5 then 'There are games you will like more.'
                    when score < 4 then 'You will find this game to be ok.'
                    when score < 4.5 then 'You should play this one!'
                    else 'You will love this game!'
                        
            $scope.colorForScore = (score)->
            	if score >= 3.5
            		return {'color': 'green', 'font-size':'20px'}
            	else if score >2.5
            		return {'color': '#E6C805', 'font-size':'18px'}
            	{'color': 'red', 'font-size':'16px'}
            
            $ionicModal.fromTemplateUrl('views/detailsGuruModal.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.guruModal = modal
                $scope.modalGame = {}
            $scope.getGuruDetails = (id)->
                $scope.guruModal.show()
                
                socket.emit 'getGuruDetails' , {gameid: id} 
                $scope.guruInfoLoading = true
                socket.on 'guruDetailsFound' , (data)->
                    $scope.gameDetails= data
                    $scope.guruInfoLoading = false
            $scope.closeGuru = ()->
                $scope.guruModal.hide()
        
            $scope.closePeer = ()->
                $scope.peerModal.hide()
                    
            $scope.getPeerDetails = (id)->
                $scope.peerModal.show()
                
                socket.emit 'getPeerDetails' , {gameid: id} 
                $scope.peerInfoLoading = true
                socket.on 'peerDetailsFound' , (data)->
                    
                    $scope.gameDetails= data 
                    $scope.peerInfoLoading = false
                    
            $ionicModal.fromTemplateUrl('views/detailsPeerModal.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.peerModal = modal
                $scope.modalGame = {}
        
signInSetup = ($scope, $ionicModal, socket)-> 
   $ionicModal.fromTemplateUrl('views/signupSignInModal.html' ,  {
        scope: $scope,
        animation: 'slide-in-up'
    }).then (modal) -> 
        $scope.modal = modal
        $scope.logdata = {}
    $scope.errormessage = false

    $scope.closeModal  = ->
        $scope.logdata = {}
        $scope.modal.hide()
    $scope.signUpModal = ->
        $scope.modal.show()
        $scope.signUp =true
    $scope.signInModal = ->
        $scope.modal.show()
        $scope.signUp =false
    $scope.signInNow = ->
        logdata = {}
        logdata.username = $scope.logdata.username
        logdata.password = $scope.logdata.temppassword 
        socket.emit 'Login', logdata
    $scope.signUpNow = ->
        $scope.logdata.password ={}
        logdata ={}

        password ={}
        if $scope.logdata.temppassword is $scope.logdata.repeat
            logdata.username = $scope.logdata.username
            logdata.password = $scope.logdata.temppassword
            logdata.name= $scope.logdata.name
            socket.emit 'SignUpUser', logdata
        else 
            $scope.errormessage ='Passwords do not match'
    socket.on 'UserEmailAlreadyExists' , ->
        $scope.errormessage ='The user already exits'
    socket.on 'UserEmailNotFound' , ->
        $scope.errormessage ='Email not valid'
    socket.on 'failureMessage', (message) ->
        $scope.errormessage = message
    socket.on 'userLoggedin', ->
        $scope.closeModal()
app.controller 'reviewController', 
    class reviewController
        @$inject : ['$scope', 'InfoRequestService', '$location', 'socket', '$ionicModal']
        constructor : (@$scope, @InfoRequestService, @$location, @socket,  $ionicModal ) ->  
            if $location.path() isnt '/home' && $location.path() isnt '/'
                isloggedin(socket,  $location.path())
            $scope.loggedin=true
            signInSetup $scope,$ionicModal,socket
            socket.on 'userLoggedin', (data)->
                $scope.accessList= data.accessList
                localStorage.setItem "sessionkey", data.sessionKey
            @$scope.homeSelected = 'button-stable'
            @$scope.logout= -> 
                localStorage.removeItem("sessionkey")
                window.location='#/home'
                $scope.accessList=false  
            @$scope.librarySelected = 'button-stable'
            @$scope.recomendationSeleted = 'button-stable'
            @$scope.isActive = (path)->
                path= '/'+path
                if path is  nextPath = $location.path()
                    return 'pure-menu-selected'
                else 
                    return ''

app.controller 'homeController', 
	class homeController
        @$inject: ['$scope', '$ionicModal', 'socket']
        constructor: (@$scope,  $ionicModal, @socket) ->
            $scope.loggedin=false
            
            if window.localStorage.sessionkey
                socket.emit 'isUserLoggedin' , {key:window.localStorage.sessionkey , location:'/home'}
            signInSetup $scope,$ionicModal,socket
            socket.on 'userLoggedin', (data)->
                if data.location is '/home'
                   
                    $scope.loggedin=true
                    window.location = '#/dashboard'
     
app.controller 'searchController', 
	class searchController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket', '$location']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket, @$location) ->
           
            $scope.myLibrary=false
            $scope.isLoading =true
            $scope.scoreName='peerscore'
            $scope.loggedin=true
            socket.on 'userLoggedin',(data) ->
            createGameDetailViewer $ionicModal, $scope, socket
            searchObject = $location.search();
            InfoRequestService.searchForAGame searchObject.game, (data)->
                $scope.gamesfound=[]
                if data.results.length > 15
                    $scope.gamesfound=data.results[0..14]
                else 
                    $scope.gamesfound=data.results
                socket.emit 'searchForGames' , {list: $scope.gamesfound}
                socket.on 'searchfinished' , (data)->
                    $scope.searchResults= data
                    $scope.isLoading = false

app.controller 'dashboardController',
	class dashboardController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket) ->
            $scope.scoreName='peerscore'

            socket.emit 'GetRecentGames'
            @socket.on 'recentReleases', (data)->
                $scope.recentGames = data
            createGameDetailViewer $ionicModal, $scope, socket                    

app.controller 'peerController',
	class peerController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket) ->

            $scope.myLibrary=false
            $scope.scoreName='peerscore'

            socket.emit 'GetPeerLibrary'
            @socket.on 'peerLibraryFound', (data)->
                $scope.games = data
            createGameDetailViewer $ionicModal, $scope, socket
            
app.controller 'guruController',
	class guruController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket) ->
           
            $scope.myLibrary=false
            $scope.scoreName='guruscore'

            socket.emit 'GetGuruLibrary'
            
            @socket.on 'guruLibraryFound', (data)->
                $scope.games = data
            createGameDetailViewer $ionicModal, $scope, socket
            
app.controller 'libraryController',
    class libraryController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket) ->
         
            $scope.loggedin=true
            $scope.myLibrary=true
            $scope.scoreName='rating'
            $scope.gameSelected=false

            socket.emit 'GetLibrary'
            @$scope.aquiredGameList = ->     
            
            @socket.on 'init', (data) -> 
            
            @socket.on 'gameLibraryFound', (data)->
                $scope.games = data
                
            $ionicModal.fromTemplateUrl('views/addGameModal.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.modal = modal
                $scope.modalGame = {}
            $scope.searchForAGame = (game)->
                $scope.isLoading = true
                InfoRequestService.searchForAGame game, (data)->
                    $scope.gamesfound=data.results
                    $scope.isLoading = false
            
            	
            $scope.addNewGame = ->       
                $scope.modal.show()
                $scope.gameSelected=false
            $scope.editUserResponse = (index) ->
                
            $scope.closeModal  = ->
                $scope.newgame={}
                $scope.gamesfound={}
                $scope.modal.hide()
            $scope.addGameToLibrary = (game)->
                $scope.newgame = {}
                $scope.newgame.userInfo={}
                $scope.newgame.giantBombinfo={}
                $scope.newgame.giantBombinfo.giantBomb_id= game.id
                $scope.newgame.giantBombinfo.game_name= game.name
                $scope.newgame.giantBombinfo.game_picture= game.image.medium_url
                $scope.newgame.giantBombinfo.description= game.deck 
                $scope.newgame.userInfo.rating=3
                $scope.newgame.userInfo.enjoyment=3
                $scope.newgame.userInfo.length=3
                $scope.newgame.userInfo.unenjoyment=3
                $scope.newgame.userInfo.difficulty=3
                $scope.gameSelected=true
            $scope.goback = ->
                $scope.gameSelected=false
            $scope.saveGame = ()->
                socket.emit 'AddNewGameToLibrary', $scope.newgame
                $scope.closeModal()
                
            $ionicModal.fromTemplateUrl('views/editScoreModal.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.editModal = modal
                $scope.edit = {}
            $scope.closeEdit  = ()->
                $scope.editModal.hide()
                $scope.edit = {}
            $scope.showEdit = (index)->
                $scope.edit=$scope.games[index]
                $scope.editModal.show()
            $scope.updateGame = ->
                socket.emit 'updateGame', $scope.edit
                $scope.editModal.hide()
            createGameDetailViewer $ionicModal, $scope, socket
####Everything under here will be removed from the live version ###            
app.controller 'proController',
    class proController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket) ->

            $scope.myLibrary=true
            $scope.scoreName='rating'

            socket.emit 'GetProreviewers', 'all'

            socket.on 'ProreviewersFound', (data)-> 
                $scope.reviewers = data
            
            $ionicModal.fromTemplateUrl('views/addPro.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.proModal = modal
                $scope.pros = {}
            
            $scope.closeProModal = ->
                 $scope.proModal.hide()
                    
            $scope.openProModal =(id)-> 
                $scope.proModal.show()
                if id 
                    $scope.mode = true
                    $scope.newPro.id= id
                else 
                    $scope.mode = false
                $scope.newPro= {}
            $scope.editPro =->  
                socket.emit 'editPro', $scope.newPro
                $scope.closeProModal() 
            $scope.savePro = ->
                socket.emit 'addPro',  $scope.newPro
                $scope.closeProModal()
            
 

app.controller 'proLibraryController',
    class proLibraryController
        @$inject: ['$scope', 'InfoRequestService', '$ionicModal', 'socket', '$location']
        constructor: (@$scope, @InfoRequestService, $ionicModal, @socket, @$location) ->
            $scope.myLibrary=true
            $scope.scoreName='rating'
            $scope.gameSelected=false
            searchObject = $location.search();

            socket.emit 'GetProreviewerLibrary', {id:searchObject.reviewerid}
            socket.on 'ProLibrarysFound' ,(data)->
                $scope.games =data
                
            $ionicModal.fromTemplateUrl('views/addProGame.html' ,  {
                scope: $scope,
                animation: 'slide-in-up'
            }).then (modal) -> 
                $scope.modal = modal
                $scope.modalGame = {}
            $scope.searchForAGame = (game)->
                $scope.isLoading = true
                InfoRequestService.searchForAGame game, (data)->
                    $scope.gamesfound=data.results
                    $scope.isLoading = false
                    
            $scope.addNewGame = ->       
                $scope.modal.show()
                $scope.gameSelected=false
            $scope.editUserResponse = (index) ->
                
            $scope.closeModal  = ->
                $scope.newgame={}
                $scope.gamesfound={}
                $scope.modal.hide()
            $scope.addGameToLibrary = (game)->
                $scope.newgame = {}
                $scope.newgame.userInfo={}
                $scope.newgame.userInfo.user_id= searchObject.reviewerid
                $scope.newgame.giantBombinfo={}
                $scope.newgame.giantBombinfo.giantBomb_id= game.id
                $scope.newgame.giantBombinfo.game_name= game.name
                $scope.newgame.giantBombinfo.game_picture= game.image.medium_url
                $scope.newgame.giantBombinfo.description= game.deck
                $scope.newgame.giantBombinfo.releasedate= game.original_release_date 
                $scope.gameSelected=true
            $scope.goback = ->
                $scope.gameSelected=false
            $scope.saveGame = ()->
                socket.emit 'AddNewProGameToLibrary', $scope.newgame
                $scope.closeModal()
app.controller 'dataparserController',
    class dataparserController
        @$inject: ['$scope', 'InfoRequestService',  'socket' ]
        constructor: (@$scope, @InfoRequestService,  @socket) ->
            addGameToLibrary = (index, length, gameData,  callback) ->
                if index is length
                    callback()
                if not gameData[index].game 
                    gameData[index].giantBombinfo = gameData[index-1].giantBombinfo
                    socket.emit 'AddGameandReviewerToLibrary', gameData[index]
                    addGameToLibrary(index+1, length,gameData,  callback)
                else
                    InfoRequestService.searchForAGame gameData[index].game, (data)->
                        if data.results.length is 0
                             addGameToLibrary(index+1, length,gameData,  callback)
                        game= data.results[0]
                        gameData[index].giantBombinfo={}

                        gameData[index].giantBombinfo.giantBomb_id= game.id
                        gameData[index].giantBombinfo.game_name= game.name
                        if game.image
                            gameData[index].giantBombinfo.game_picture= game.image.medium_url
                        else 
                             gameData[index].giantBombinfo.game_picture=''
                        gameData[index].giantBombinfo.description= game.deck
                        gameData[index].giantBombinfo.releasedate= game.original_release_date
                        socket.emit 'AddGameandReviewerToLibrary', gameData[index]
                        addGameToLibrary(index+1, length,gameData,  callback)
                    
            $scope.uploadImage = (files)->
                file = files[0]
                reader = new FileReader();
                reader.readAsText(file);
                reader.onload = (event)->
                    csv= event.target.result
                    data = $.csv.toObjects(csv)
                    OrganizedData=[]
                    length =0
                    for gamedata in data 
                        length++
                        organized={}
                        organized.pro={}
                        organized.pro.name=gamedata.name
                        organized.pro.site_address= gamedata.Site_address
                        
                        organized.userInfo={}
                        organized.game= gamedata.game
                        organized.userInfo.review_link= gamedata.review_link
                        organized.userInfo.true_score= gamedata.true_score
                        if gamedata.true_score > 10
                            organized.userInfo.true_score_max =100
                            organized.userInfo.rating = gamedata.true_score /20
                        else if gamedata.true_score > 5
                            organized.userInfo.true_score_max =10
                            organized.userInfo.rating = gamedata.true_score /2
                        else
                            organized.userInfo.true_score_max =5
                            organized.userInfo.rating = gamedata.true_score  
                        OrganizedData.push organized
                    addGameToLibrary 0,length,OrganizedData,->
                        alert('finished')