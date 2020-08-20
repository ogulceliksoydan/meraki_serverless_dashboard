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
                    var node = document.createTextNode(item.id + ":" + item.name);
                    para.appendChild(node);
                    var element = document.getElementById("anchor");
                    element.appendChild(para);
                });
                var msg = "Welcome " + localStorage.getItem('user');
                document.getElementById("loading").innerHTML = msg;
                document.getElementById("loading").style = "font-weight:bold";
                document.getElementById("main").style = "visibility:visible";
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
    document.getElementById("message").innerHTML = "Loading..."
}

function login(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var authenticationData = {Username: username, Password: password};

    console.log("Username:",username , "Password:",password);

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {Username : username,Pool : userPool};
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            //var accessToken = result.getAccessToken().getJwtToken();
            var idToken = result.getIdToken().getJwtToken();
            localStorage.token = idToken;
            localStorage.user = username
            
            window.location = './index2.html';
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
            window.location = './index2.html';
        } else {
            getTemplates();   
        }
    } else {
        if (!redirectOnRec) {
            window.location = './signin.html';
        } else {
            document.getElementById("body").style = "visibility:visible";
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
    var netwname = document.getElementById("netname").value;
    var template = document.getElementById("anchor").value;
    var serials = document.getElementById("serials").value;
    var myobj = {"netname": netwname, "template": template.split(':')[0], "serials": serials.replace(/ /g, "").split('\n')};
    console.log("Created object:", myobj);
    createNetwork(myobj);
}