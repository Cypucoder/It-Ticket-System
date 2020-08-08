//* ~ console.log = something sent to the server for debugging purposes 

//used to set up dependencies for use on the server.
//Currently using:
//~ Express for changing "pages" and other real time things
//~ mysql for sql statements and reading/updating/inserting into database
//~ http for setting up the server/application
//~ io for setting up socket.io. Used to realtime update information and handle data importing/exporting to/from server
//~ bodyParser is used for handling data transfer via links and similar
//~ nodemailer is used for email

var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').createServer(app);
var io = require ('socket.io')(server);
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");

//Necessary for email
var smtpTransport = nodemailer.createTransport("SMTP",{
host: 'email.business.org',
port: 25,
domain:'domain.org',
tls: {ciphers:'SSLv3'}
});

// Keeps track of all the users online (mainly for use in chat systems, but could be useful for responding to [or commenting on] tickets)
var users = [];

//Links mySQL database to the Node server
var db = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: 'pass', 
    database: 'itrequest15'
    //port: 3000;
});

//sets up the socket variable
//The socket variable is used to pass and store data on the client side for use in data getting and setting on the server end.
//This will be mainly used for rememebering who's logged in. 
var socket;

//This connects to the service that sends and returns live data
io.on('connection', function(socket){
    //Lets the admin know when a user is connected. Only states when a connection is made to the login/landing page.
    console.log('A user connected');    
    
    socket.on('add_ticket', function(ticket){
        console.log(ticket.fEmail, ticket.fLocation , ticket.fDept, ticket.fIssueDesc , ticket.fPhone, ticket.fFirst, ticket.fLast);
        console.log("we got this far");
        io.emit('add_Ticket', {fEmail: ticket.fEmail, fLocation: ticket.fLocation , fDept: ticket.fDept , fIssueDesc: ticket.fIssueDesc , fPhone: ticket.fPhone, fFirst: ticket.fFirst, fLast: ticket.fLast});
        
        add_ticket(ticket.fEmail, ticket.fLocation, ticket.fDept, ticket.fIssueDesc, ticket.fInventory, ticket.fPhone, ticket.fFirst, ticket.fLast, ticket.fIsResolved, function(res){
        if(res){
            //io.emit('refresh feed', msg);
            //console.log('refresh feed, status ');
        } else {
            io.emit('error');
            console.log('there was an error under socket.on chat message');
        }
    });
    });
    
    socket.on('add_ticket_Internal', function(ticket){
        console.log(ticket);
        console.log(ticket.fEmail, ticket.fLocation , ticket.fDept, ticket.fIssueDesc, ticket.fIsResolved, ticket.fFirst, ticket.fLast, ticket.fSolution);
        console.log("we got this far");
        //io.emit('add_Ticket', {fEmail: ticket.fEmail, fLocation: ticket.fLocation , fDept: ticket.fDept , fIssueDesc: ticket.fIssueDesc , fPhone: ticket.fPhone, fFirst: ticket.fFirst, fLast: ticket.fLast});
        
        add_ticket_Internal(ticket.fEmail, ticket.fLocation, ticket.fDept, ticket.fIssueDesc, ticket.fInventory, ticket.fFirst, ticket.fLast, ticket.fIsResolved, ticket.fSolution, function(res){
        if(res){
            //io.emit('refresh feed', msg);
            //console.log('refresh feed, status ');
        } else {
            io.emit('error');
            console.log('there was an error under socket.on chat message');
        }
    });
    });
    
    //fSolution, fIsresolved, fDateComplete, fTicketId
    
    socket.on('update_ticket', function(ticket){
        console.log(ticket.fSolution, ticket.fIsResolved , ticket.fInventory, ticket.fDateComplete, ticket.fTicketId);
        console.log("we got this far");
        io.emit('update_ticket', {fSolution: ticket.fSolution, fIsResolved: ticket.fIsResolved, fDateComplete: ticket.fDateComplete, fTicketId: ticket.fTicketId, fInventory: ticket.fInventory,});
        
        update_ticket(ticket.fSolution, ticket.fIsResolved , ticket.fDateComplete, ticket.fTicketId, ticket.fInventory, function(res){
        if(res){
            //io.emit('refresh feed', msg);
            //console.log('refresh feed, status ');
        } else {
            io.emit('error');
            console.log('there was an error under socket.on chat message');
        }
    });
    });
    
    //disconnects link to server to prevent too many connections to the server
    socket.on('disconnect', function() {
     //Code inserted in here will run on user disconnect. 
     console.log('A user has disconnected');
        socket.disconnect();
        
    });
    
    

});
//used to start and run the server
server.listen(3001, function(){
    console.log("listening on *:3001");
});

app.use(express.static('files'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//app.get is used to return data based on what your url is. 
//in the case of '/DB' we are returning the database information
app.get('/DB', function(req, res){
    db.query('SELECT *, DATE_FORMAT(Date_Time, "%b/%d/%Y %I:%i %p") AS ReadTime FROM itrequest15.ticket ORDER BY idTicket DESC', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
        //using with express
        //check facebook
    });
});



app.get('/MP', function(req, res){
    db.query('SELECT *, DATE_FORMAT(Date_Time, "%b/%d/%Y %I:%i %p") AS ReadTime FROM itrequest15.ticket WHERE ticket.Building = "MP" AND isResolved = 0 ORDER BY idTicket DESC', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
        //using with express
        //check facebook
    });
});

app.get('/ticket/:id', function(req, res){
    db.query('SELECT *, DATE_FORMAT(Date_Time, "%b/%d/%Y") AS ReadTime, DATE_FORMAT(Date_Complete, "%b/%d/%Y") AS FinTime FROM itrequest15.ticket WHERE ticket.idTicket='+req.params.id+';', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows[0]));

    });
});


app.get('/notResolved', function(req, res){
    db.query('SELECT *, DATE_FORMAT(Date_Time, "%b/%d/%Y %I:%i %p") AS ReadTime  FROM itrequest15.ticket JOIN itrequest15.location ON ticket.Building = location.idLocation JOIN itrequest15.department ON ticket.Dept = department.idDepartment JOIN itrequest15.inventory ON ticket.Inventory = inventory.Tag JOIN itrequest15.user ON ticket.User = user.email WHERE isResolved = 0;', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
        //using with express
        //check facebook
    });
});

app.get('/Resolved', function(req, res){
    db.query('SELECT *, DATE_FORMAT(Date_Time, "%b/%d/%Y %I:%i %p") AS ReadTime  FROM itrequest15.ticket JOIN itrequest15.location ON ticket.Building = location.idLocation JOIN itrequest15.department ON ticket.Dept = department.idDepartment JOIN itrequest15.inventory ON ticket.Inventory = inventory.Tag JOIN itrequest15.user ON ticket.User = user.email WHERE isResolved = 1;', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
        //using with express
        //check facebook
    });
});

app.get('/test', function(req, res){
    db.query('SELECT * FROM user', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
        //using with express
        //check facebook
    });
});

//In this version of app.get, the '/' sets the home page when you enter the page. 
app.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
});

//function for adding a new ticket and sending emails
var add_ticket = function (fEmail, fLocation, fDept, fIssueDesc, fInventory, fPhone, fFirst, fLast, callback){
    
    console.log("connecting");
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in at the add_ticket section');
            connection.release();
            callback(false);
            return;
        }
            
        console.log("connected");
        console.log(fEmail, fLocation, fDept, fIssueDesc, fInventory, fPhone, fFirst, fLast)

        connection.query("INSERT INTO `itrequest15`.`ticket` (`ProblemDesc`, `User`, `Date_Time`, `Building`, `Dept`, `phone`, `fName`, `lName`, `isResolved`) VALUES ('" + fIssueDesc + "','" + fEmail + "', NOW(),'" + fLocation + "','" + fDept + "','" + fPhone + "','" + fFirst + "','" + fLast + "','OpenSa Ank')", function(err, rows){
            console.log("sending");
            if(!err) {
                callback(true);
            }
        });
        
        connection.on('error', function(err) {
            console.log("insert issue found");
            callback(false);
            return;
        });
        
/*=============Mail to IT===============*/        
        var mailOptions={
to : 'It Request <it@business.org>',
subject : fLocation +" IT Request",
html : fIssueDesc+"<br><br>",
from: 'ItRequest <' + fEmail + '>'
}
    
    console.log(mailOptions);
smtpTransport.sendMail(mailOptions, function(error, response){
if(error){
console.log(error);

}else{
console.log("Message sent: " + response.message);
}
});

/*=============Mail Confirmation==========*/              
var mailOptions={
to : 'Staff <'+ fEmail +'>',
subject : fLocation +" IT Request",
html : "<h1>Your request has been sent</h1><br>"+fIssueDesc+"<br><br>",
from: 'ItRequest <noreply@business.org>'
}
    
    console.log(mailOptions);
smtpTransport.sendMail(mailOptions, function(error, response){
if(error){
console.log(error);

}else{
console.log("Message sent: " + response.message);
}
});
        
        
        connection.release();
        });
};

//function for adding a new ticket and sending emails
var add_ticket_Internal = function (fEmail, fLocation, fDept, fIssueDesc, fInventory, fFirst, fLast, fIsResolved, fSolution, callback){
    
    console.log("connecting");
    console.log("fIsResolved")
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in at the add_ticket section');
            connection.release();
            callback(false);
            return;
        }
            
        console.log("connected");
        console.log(fEmail, fLocation, fDept, fIssueDesc, fFirst, fLast, fIsResolved);

        connection.query("INSERT INTO `itrequest15`.`ticket` (`ProblemDesc`, `User`, `Date_Time`, `Building`, `Dept`, `fName`, `lName`, `isResolved`, `Resolution`) VALUES ('" + fIssueDesc + "','" + fEmail + "', NOW(),'" + fLocation + "','" + fDept + "','" + fFirst + "','" + fLast + "','"+fIsResolved+"','"+fSolution+"')", function(err, rows){
            console.log("sending");
            if(!err) {
                callback(true);
            }
        });
        
        connection.on('error', function(err) {
            console.log("insert issue found");
            callback(false);
            return;
        });
        
    console.log("fIsResolved= "+fIsResolved);
 if(fIsResolved == "ClosedSa Ank")
     {
        /*=============Mail to IT===============*/        
                var mailOptions={
        to : 'It Request <it@business.org>',
        subject : fLocation +" IT Request",
        html : fIssueDesc+"<br><br>",
        from: 'ItRequest <' + fEmail + '>'
        }

            console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
        console.log(error);

        }else{
        console.log("Message sent: " + response.message);
        }
        });

        /*=============Mail Confirmation==========*/              
        var mailOptions={
        to : 'Staff <'+ fEmail +'>',
        subject : fLocation +" IT Request",
        html : "<h1>Your request has been sent</h1><br>"+fIssueDesc+"<br><br>",
        from: 'ItRequest <noreply@business.org>'
        }

            console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
        console.log(error);

        }else{
        console.log("Message sent: " + response.message);
        }
        });
     }
        
        
        connection.release();
        });
};


//function for updating a previously created ticket. 
var update_ticket = function (fSolution, fIsResolved, fDateComplete, fTicketId, fInventory, callback){
    
    console.log("we've made it to the update statement");
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the update_ticket section');
            connection.release();
            callback(false);
            return;
        }
                   
            
            
        connection.query("UPDATE `itrequest15`.`ticket` SET `isResolved`='"+ fIsResolved +"', `Date_Complete`='"+ fDateComplete +"', `Resolution`='"+ fSolution +"', `Inventory`='" + fInventory + "' WHERE `idTicket`='"+ fTicketId +"'", function(err, rows){
            connection.release();
            if(!err) {
                console.log("Update completed");
                callback(true);
            }
        });
        
        connection.on('error', function(err) {
            console.log("The Update failed");
            callback(false);
            return;
        });
    });
};
