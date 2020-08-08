//https://scotch.io/tutorials/single-page-apps-with-angularjs-routing-and-templating

var app = angular.module('myApp', ['ngRoute', 'ngMessages']);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

//the following contains "routes" or the web pages injected into the template page
//template defines the template the page is injected into
//controller defines what the rules and data available for the page are
app.config(function($routeProvider, $httpProvider){
    $routeProvider
    
    //route for the landing page
    
    .when('/', {
        templateUrl: 'ticketlist.html',
        controller: 'data_get'
    })
    
    //routes for links    
    .when('/Home', {
        templateUrl: 'ticketlist.html', 
        controller: 'data_get'
    })
    
    //defines the issues pages for returning tickets
    .when('/central', {
        templateUrl: 'ticketlist.html',
        controller: 'data_Central'
    })
    
    //various branches
    .when('/north', {
        templateUrl: 'ticketlist.html',
        controller: 'data_North'
    })
    
    .when('/south', {
        templateUrl: 'ticketlist.html',
        controller: 'data_South'
    })
    
    .when('/wr', {
        templateUrl: 'ticketlist.html',
        controller: 'data_WR'
    })
    
    .when('/keystone', {
        templateUrl: 'ticketlist.html',
        controller: 'data_Keystone'
    })
    
    .when('/bookmobile', {
        templateUrl: 'ticketlist.html',
        controller: 'data_Bookmobile'
    })
    
    //defines personal project page
    .when('/mp', {
        templateUrl: 'ticketlist.html', 
        controller: 'data_MP'
    })
    
    //defines specific ticket information
     .when('/ITTicket', {
        templateUrl: 'ticketInput.html',
        controller: 'data_ticketTwo'
    })
    
    //defines specific ticket information
     .when('/ticket/:id', {
        templateUrl: 'ticket.html',
        controller: 'data_ticket'
    })
    
    //page seen by users when ticket sent
    .when('/messageSent', {
        templateUrl: 'MS.html', 
        controller: 'data_get'
    })
    
    
    //backup of the new ticket page
    .when('/new', {
        templateUrl: 'newticket.html', 
        controller: 'data_get'
    })
    
    //set default page or 404    
    .otherwise('/');
          });

//used for datepicker and date inserting
app.directive('datepickerPopup', function (dateFilter, $parse){
    return {
        restrict: 'EAC',
        require: '?ngModel',
        link: function(scope, element, attr, ngModel,ctrl) {
            ngModel.$parsers.push(function(viewValue){
                return dateFilter(viewValue, 'yyyy-MM-dd');
    });
    }
  }
});


//defines the rules and data available to the web page
//more efficient use of the server
app.controller('data_get', function($scope, $http, socket){
$scope.LoggedIn = "Logout";
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};
$scope.redirect = function(){window.location = "/MS.html";};    
$http.get('/DB/').success(function(data){$scope.data=data; $scope.data.LoggedIn = "Logout";});
})

app.controller('data_Central', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/Central/').success(function(data){$scope.data=data;});
})

app.controller('data_North', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/North/').success(function(data){$scope.data=data;});
})

app.controller('data_South', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/South/').success(function(data){$scope.data=data;});
})

app.controller('data_WR', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/WR/').success(function(data){$scope.data=data;});
})

app.controller('data_Keystone', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/Keystone/').success(function(data){$scope.data=data;});
})

app.controller('data_Bookmobile', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/Bookmobile/').success(function(data){$scope.data=data;});
})

app.controller('data_MP', function($scope, $http, socket){
$scope.addTicket = function(ticket){socket.emit('add_ticket', ticket)};    
$http.get('/MP/').success(function(data){$scope.data=data;});
})

app.controller('data_ticketTwo', function($scope, $http, socket){
$scope.newTicket = function(ticket){socket.emit('add_ticket_Internal', ticket)};    
})

app.controller('data_ticket', function($scope, $http, socket, $routeParams){  
$scope.updticket = function(ticket){socket.emit('update_ticket', ticket)};
    $scope.redirect = function(){location.reload();};    
$http.get('/ticket/'+$routeParams.id).success(function(data){$scope.x=data;$scope.ticket.fIsResolved = data.isResolved; $scope.ticket.fSolution = data.Resolution; $scope.ticket.fDateComplete = new Date(data.Date_Complete);});
$scope.fTicketId = $routeParams.id;
$scope.fTicketSo = $http.get('/ticket/'+$routeParams.id).success(function(data){$scope.s=data;});
$scope.fInventory = 0;
       
});

app.controller('data_set', function($scope, $http){
 //$http.post('/db/'), 
})


//needed for the datepicker functions
app.controller('Datepicker', function ($scope) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = new Date();
  };
  $scope.toggleMin();
  $scope.maxDate = new Date(2070, 5, 22);

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };
});


    
