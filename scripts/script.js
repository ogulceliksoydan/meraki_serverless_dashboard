//Global variables:

var userPoolId = 'eu-central-1_L0u4b6nRF';
var clientId = '523eg0kdj10oo75juflc3hpvi5';

var poolData = {UserPoolId : userPoolId, ClientId : clientId};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var url = "https://5sxi6aqju5.execute-api.eu-central-1.amazonaws.com/dev/first-api-test";

//Functions:

function getTemplates(){
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.setRequestHeader('Authorization', localStorage.getItem('token'));
    //request.setRequestHeader('Authorization', "wrongtoken"); // for token expiration test
    request.setRequestHeader('Content-Type', 'application/json');

    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Complete data:", typeof this, this);
                var data = JSON.parse(this.response);
                console.log("Dropdown items:", typeof data, data);
                data.forEach(item => {
                    var para = document.createElement("option");
                    var node = document.createTextNode(item);
                    para.appendChild(node);
                    var element = document.getElementById("anchor");
                    element.appendChild(para);
                });
                $("#body").css({'visibility':'visible'});
            } else {
                console.log("Token may have expired. Logging out");
                logOut();
            }
        }
    }

    request.send();
}

function createNetwork(postObj){
    var request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Authorization', localStorage.getItem('token'));
    //request.setRequestHeader('Authorization', "wrongtoken"); // for token expiration test
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Complete data:", typeof this, this)
                var data = JSON.parse(this.response);
                console.log("Message:", typeof data, data);
                document.getElementById("message").innerHTML = this.response;
            } else {
                console.log("Token may have expired. Logging out");
                logOut();
            }
        }
    }
    
    //request.send(postObj);
    request.send(JSON.stringify(postObj));
}

function login(){
    var username = $('#username').val();
    var password = $('#password').val();
    var authenticationData = {Username: username, Password: password};

    console.log("Username:",username , "Password:",password);

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {Username : username,Pool : userPool};
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            //var accessToken = result.getAccessToken().getJwtToken();
            var idToken = result.getIdToken().getJwtToken();
            //localStorage.setItem('token', idToken);
            localStorage.token = idToken;
            
            window.location = './index.html';
            console.log("Authentication successful");
            //console.log("ID Token:", idToken);
            //console.log("Access Token:", accessToken);
        },

        onFailure: function(err) {
            console.log(JSON.stringify(err))
            alert(JSON.stringify(err.message))
        },
    });
}

function checkLogin(redirectOnRec){
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        if (redirectOnRec) {
            window.location = './index.html';
        } else {
            getTemplates();   
        }
    } else {
        if (!redirectOnRec) {
            window.location = './signin.html';
        } else {
            $("#body").css({'visibility':'visible'});
        }
    }
}

function logOut() {
    var cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();
    window.location = './signin.html';
    console.log("Logged out")
}

function post(){
    var netwname = $('#netname').val();
    var template = document.getElementById("anchor").value;
    var serials = $('#serials').val();
    var myobj = {"netname": netwname, "template": template, "serials": serials.replace(/ /g, "").split('\n')};
    console.log("Created object:", myobj);
    createNetwork(myobj);
}