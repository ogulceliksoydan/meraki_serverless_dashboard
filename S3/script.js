//Global variables:

var userPoolId = 'eu-central-1_L0u4b6nRF';
var clientId = '523eg0kdj10oo75juflc3hpvi5';

var poolData = {UserPoolId: userPoolId, ClientId: clientId};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var url = "https://5sxi6aqju5.execute-api.eu-central-1.amazonaws.com/dev/first-api-test";

templates = {}

//Functions:

function checkLogin() {
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser == null) {
        document.getElementById("signin").style = "display:block";
    } else {
        getTemplates();
    }
}

function login() {
    document.getElementById("loading").style = "display:block";
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var authenticationData = {Username: username, Password: password};

    console.log("Username:", username, "Password:", password);

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {Username: username, Pool: userPool};
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            //var accessToken = result.getAccessToken().getJwtToken();
            var idToken = result.getIdToken().getJwtToken();
            localStorage.token = idToken;
            
            document.getElementById("signin").style = "display:none";
            getTemplates();

            console.log("Authentication successful");
            //console.log("ID Token:", idToken);
            //console.log("Access Token:", accessToken);
        },

        onFailure: function(err) {
            document.getElementById("loading").style = "display:none";

            console.log(JSON.stringify(err))
            alert(JSON.stringify(err.message))
        },
    });
}

function logOut() {
    var cognitoUser = userPool.getCurrentUser();
    cognitoUser.signOut();

    window.location = 'index.html';
    
    console.log("Logged out")
}

function getTemplates() {
    document.getElementById("loading").style = "display:block";

    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.setRequestHeader('Authorization', localStorage.getItem('token'));
    //request.setRequestHeader('Authorization', "wrongtoken"); // for token expiration test
    request.setRequestHeader('Content-Type', 'application/json');

    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Complete data:", typeof this, this);
                var data = JSON.parse(this.response).templates;
                console.log("Items:", typeof data, data);

                data.forEach(item => {
                    var para = document.createElement("option");
                    var node = document.createElement("p");
                    node.innerHTML = item.name;
                    para.appendChild(node);
                    document.getElementById("anchor").appendChild(para);

                    templates[item.name] = item.id
                });
                
                var msg = "Welcome " + JSON.parse(this.response).username;
                document.getElementById("welcome").innerHTML = msg;
                document.getElementById("loading").style = "display:none";
                document.getElementById("main").style = "display:block";

            } else {
                console.log("Token may have expired. Logging out");
                logOut();
            }
        }
    }

    request.send();
}

function postObject() {
    var netwname = document.getElementById("netname").value;
    var template_id = templates[document.getElementById("anchor").value]
    var serials = document.getElementById("serials").value;
    var myobj = {"netname": netwname, "template_id": template_id, "serials": serials.replace(/ /g, "").split('\n')};

    console.log("Created object:", myobj);
    
    var request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Authorization', localStorage.getItem('token'));
    //request.setRequestHeader('Authorization', "wrongtoken"); // for token expiration test
    request.setRequestHeader('Content-Type', 'application/json');
    
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Complete data:", typeof this, this)
                var data = JSON.parse(this.response);
                console.log("Message:", typeof data, data);

                document.getElementById("loading2").style = "display:none";
                document.getElementById("message").innerHTML = this.response;

            } else {
                console.log("Token may have expired. Logging out");
                logOut();
            }
        }
    }
    
    //request.send(myobj);
    request.send(JSON.stringify(myobj));
    document.getElementById("message").innerHTML = "";
    document.getElementById("loading2").style = "display:block";
}