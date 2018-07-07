module.exports.chat = function(req,callback){

 var data = req.body;
 var query=  data.query;
 var token = data.token;	
 var userID = data.userId;
 callback(query, token,userID);
}

module.exports.logger = function(req,callback){

 var data = req.body;
 var user=  data.userId;
 var password = data.password;	
 callback(user, password);
}



