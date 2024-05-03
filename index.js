const neo4j = require('neo4j-driver');
//const base64Img = require('base64-img');
const uri = 'bolt://localhost:7687';
const dbuser = 'neo4j';
const dbpassword = 'fucksluts';
const driver = neo4j.driver(uri, neo4j.auth.basic(dbuser, dbpassword), { disableLosslessIntegers: true });
const session = driver.session();
// {
//   database: 'memewar2',
//   defaultAccessMode: neo4j.session.WRITE
// });
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const path = require('path');
var ObjectId = require('node-time-uuid');
const sanitizeHtml = require('sanitize-html');
//const fileUpload = require('express-fileupload');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, __dirname+path.sep+'uploaded');
    console.log(__dirname+path.sep+'uploaded');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-';
    //cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');  + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix+file.originalname);
  }
});
var upload = multer({storage:storage});

var fs = require('fs');

// var credentials = {key:fs.readFileSync('key.pem','utf8'), cert:fs.readFileSync('cert.pem', 'utf8')};
// var httpsServer = require('https').createServer(credentials, app);
// const io = require('socket.io')(httpsServer);

var privateKey = fs.readFileSync('memewar.io.key');
var certificate = fs.readFileSync('austintest.cer');
var options = {key: privateKey, cert: certificate, requestCert: true, rejectUnauthorized: false};
var https = require('https');
var httpsServer = https.createServer(options, app);
var io = require('socket.io')(httpsServer);

//var sessionStore = new session.MemoryStore();
const {Blockchain, Transaction} = require('savjeecoin');


//const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Your private key goes here
const myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

// Mine first block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create a transaction & sign it with your key
const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
//savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
savjeeCoin.addTransaction(tx2);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log();
console.log(`Balance of xavier is ${savjeeCoin.getBalanceOfAddress(myWalletAddress)}`);

// Uncomment this line if you want to test tampering with the chain
// savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');









httpsServer.listen(8443, function (){
  //  http://[2606:a000:101a:101:0:5a8b:1cd5:fa71]:3000/index.html
  console.log('Meme War app listening on port 8443 like a prude!');
});


// const httpServer = require('http').createServer(app);
// const io = require('socket.io')(httpServer);

app.use(express.static(__dirname));

// app.use(fileUpload({
//   limits: { fileSize: 50 * 1024 * 1024 },
//   useTempFiles : true,
//   tempFileDir : '/tmp/'
// }));
const PAGESIZE = 10;

///////
//CODE FOLDING LEVEL 3
///////
function writeToBlockchain(content){
  fs.writeFile('blockchain.txt', content, { flag: 'a+' }, err => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

function blockchainTx(amount, walletfrom, walletto){
  // Create a transaction & sign it with your key
  const tx1 = new Transaction(walletfrom, walletto, amount);
  tx1.signTransaction(myKey);
  savjeeCoin.addTransaction(tx1);
  savjeeCoin.getLatestBlock();
}

app.post('/clicked', function (req, res) {

    console.log('clicked');
    res.send('<div>fuck</div>');
});


app.post('/upload', upload.single('sampleFile'), function (req, res, next){
    console.log("UPLOAD POST");
    console.log(req.body.location);
    console.log(req.body.userID);
    console.log(req.body.leader);
  var blockId = new ObjectId();
  var query;
    var fileName = "officialunofficialplaceholderlogo.jpg";
    var postlocation = "100.0000+200.0000";
    console.log(req.body.userroles);
  var postId = parseInt(blockId.getTimestamp());
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    if (typeof req.body.location === 'string') { postlocation = req.body.location; }
    //if (typeof req.body.leader === 'string') { if (req.body.leader) }

  var params = {
            postID: postId,
            upvotes: 1,
            downvotes: 0,
            type: req.body.type,
            title: sanitizeHtml(req.body.title),
            content: sanitizeHtml(req.body.content),
            userID: parseInt(req.body.userID),
            tag: req.body.tag,
            file: fileName,
            clicks: 1,
            censorattempts: 0,
            shields: 0,
            memecoinsspent: 0,
            location: postlocation
  };
  if(req.body.userID=="ANON"){
    query = `
    CREATE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent, location:$location})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (whichtag)<-[ta:TAGGEDAS]-(newpost)
    RETURN newpost, whichtag
    `;
  }else {
    query = `
    MATCH (whomadeit:User {userID:$userID})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent, location:$location})
    MERGE (whichtag)<-[ta:TAGGEDAS]-(newpost)-[cb:CREATEDBY]->(whomadeit)
    RETURN newpost, whichtag
    `;
  }
  session
  .run(query, params)
  .then(function(result){
    console.log(result);
    // result.records[0]["_fields"].forEach(function(record){
    //   console.log(record);
    // });
    // session.close();
  })
  .catch(function(error){
    console.log(error);
  });
  res.redirect('/');
});

app.post('/uploadreply', upload.single('sampleFile-reply'), function (req, res, next){
  console.log("UPLOAD POST REPLY");
  console.log(req.body);
  var blockId = new ObjectId();
  var query;
  var fileName = "officialunofficialplaceholderlogo.jpg";
  var postId = parseInt(blockId.getTimestamp());
  if (typeof req.file === 'object'){ fileName = req.file.filename; }
  var params = {
            postID: postId,
            upvotes: 1,
            downvotes: 0,
            type: req.body.type,
            title: sanitizeHtml(req.body.title),
            content: sanitizeHtml(req.body.content),
            userID: parseInt(req.body.userID),
            tag: req.body.tag,
            file: fileName,
            clicks: 1,
            censorattempts: 0,
            shields: 0,
            memecoinsspent: 0,
            replyto: parseInt(req.body.replyto),
            tagupvotes: 1
  };
  if(req.userID=="ANON"){
    query = `
    MATCH (origPost:Post {postID:$replyto})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[rt:REPLYTO]->(origPost)
    RETURN newpost, whichtag, origPost
    `;
  }else{
    query = `
    MATCH (whomadeit:User {userID:$userID}), (origPost:Post {postID:$replyto})
    MERGE (whichtag:Tag {name:$tag})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[cb:CREATEDBY]->(whomadeit)
    MERGE (newpost)-[rt:REPLYTO]->(origPost)
    RETURN newpost, whichtag, origPost
    `;
  }
  session
  .run(query, params)
  .then(function(result){
    console.log(result);
    // result.records[0]["_fields"].forEach(function(record){
    //   console.log(record);
    // });
    // session.close();
  })
  .catch(function(error){
    console.log(error);
  });
  res.redirect('/');
});

app.post('/summonuser', upload.single('sampleFile-none'), function (req, res, next) {
    console.log("SUMMON USER");
    console.log(req.body);
    var query;
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    var params = {
        postID: parseInt(req.body.postIDsummon),
        inviteename: req.body.userIDsummon,
        userID: parseInt(req.body.userIDsummon)
    };
    query = `
    MATCH (inviter:User {userID:$userID}), (p:Post {postID:$postID}), (invitee:User {name:$inviteename})
    MERGE (invitee)-[cb:SUMMONEDTO]->(p)
    RETURN invitee, cb, p
    `;
    session
        .run(query, params)
        .then(function (result) {
            console.log(result);
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});

app.post('/uploadpoll', upload.single('sampleFile-poll'), function (req, res, next) {
    console.log("UPLOAD POLL");
    console.log(req.body);
    var blockId = new ObjectId();
    var query;
    var fileName = "officialunofficialplaceholderlogo.jpg";
    var postId = parseInt(blockId.getTimestamp());
    var polltitle = sanitizeHtml(req.body.title);
    var polluserID = parseInt(req.body.userID);
    var polltype = req.body.type;
    var pollOptions = [];
    for (let i = 1; i <= 6; i++) {
        if (req.body["pollOption" + String(i)] != null) {
            pollOptions.push(req.body["pollOption" + String(i)]);
        }
    }
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    var params = {
        postID: postId,
        upvotes: 1,
        downvotes: 0,
        type: polltype,
        title: polltitle,
        userID: polluserID,
        tag: "poll",
        file: fileName,
        clicks: 1,
        censorattempts: 0,
        shields: 0,
        memecoinsspent: 0,
        replyto: 453453453445,
        tagupvotes: 1,
        content: pollOptions,
        optionvotes: [0, 0, 0, 0, 0, 0]
    };
    if (req.userID == "ANON") {
        query = `
        MATCH (origPost:Post {postID:$replyto})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[rt:REPLYTO]->(origPost)
        RETURN newpost, whichtag, origPost
        `;
    } else {
        query = `
        MATCH (whomadeit:User {userID:$userID})-[:HASROLE]->(ro:Role {name:"Pollster"})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpoll:Post {type:$type, title:$title, upvotes:$upvotes, downvotes:$downvotes, clicks:$clicks, postID:$postID, content:$content, optionvotes:$optionvotes, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpoll)-[cb:CREATEDBY]->(whomadeit)
        WITH newpoll AS ne
        OPTIONAL MATCH (ne)-[r2:REPLYTO]-(re:Post {postID:$replyto})
        FOREACH (o IN CASE WHEN re IS NOT NULL THEN [re] ELSE [] END |
          MERGE (ne)-[r2:REPLYTO]->(re)
        )
        RETURN ne
        `;
    }
    session
        .run(query, params)
        .then(function (result) {
            //console.log(result);
             result.records[0]["_fields"].forEach(function(record){
               console.log(record);
             });
             //session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});

app.post('/uploadAlgomod', upload.single('sampleFile-algo'), function (req, res, next) {
    console.log("UPLOAD ALGORITHM TWEAK");
    console.log(req.body);
    var blockId = new ObjectId();
    var query;
    var fileName = "officialunofficialplaceholderlogo.jpg";
    var postId = parseInt(blockId.getTimestamp());
    var polltitle = sanitizeHtml(req.body.title);
    var polluserID = parseInt(req.body.userID);
    var polltype = req.body.type;
    var pollOptions = [];
    for (let i = 1; i <= 6; i++) {
        if (req.body["pollOption" + String(i)] != null) {
            pollOptions.push(req.body["pollOption" + String(i)]);
        }
    }
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    var params = {
        postID: postId,
        upvotes: 1,
        downvotes: 0,
        type: polltype,
        title: polltitle,
        userID: polluserID,
        tag: "poll",
        file: fileName,
        clicks: 1,
        censorattempts: 0,
        shields: 0,
        memecoinsspent: 0,
        replyto: 453453453445,
        tagupvotes: 1,
        content: pollOptions,
        optionvotes: [0, 0, 0, 0, 0, 0]
    };
    if (req.userID == "ANON") {
        query = `
        MATCH (origPost:Post {postID:$replyto})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpost)-[rt:REPLYTO]->(origPost)
        RETURN newpost, whichtag, origPost
        `;
    } else {
        query = `
        MATCH (whomadeit:User {userID:$userID})-[:HASROLE]->(ro:Role {name:"Pollster"})
        MERGE (whichtag:Tag {name:$tag})
        MERGE (newpoll:Post {type:$type, title:$title, upvotes:$upvotes, downvotes:$downvotes, clicks:$clicks, postID:$postID, content:$content, optionvotes:$optionvotes, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
        MERGE (whichtag)<-[ta:TAGGEDAS {upvotes:$tagupvotes}]-(newpoll)-[cb:CREATEDBY]->(whomadeit)
        WITH newpoll AS ne
        OPTIONAL MATCH (ne)-[r2:REPLYTO]-(re:Post {postID:$replyto})
        FOREACH (o IN CASE WHEN re IS NOT NULL THEN [re] ELSE [] END |
          MERGE (ne)-[r2:REPLYTO]->(re)
        )
        RETURN ne
        `;
    }
    session
        .run(query, params)
        .then(function (result) {
            //console.log(result);
             result.records[0]["_fields"].forEach(function(record){
               console.log(record);
             });
             //session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});

app.post('/uploadpaintmod', upload.single('sampleFile-paint'), function (req, res, next) {
    console.log(req.body);
    console.log(parseInt(req.body.paintUserId));
    var blockId = new ObjectId();
    var query;
    var fileName = "officialunofficialplaceholderlogo.jpg";
    var postId = parseInt(blockId.getTimestamp());
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    var params = {
        postID: postId,
        upvotes: 1,
        downvotes: 0,
        type: "paintedit",
        title: sanitizeHtml("paintedit"),
        content: JSON.stringify(req.body),
        userID: parseInt(req.body.paintUserId),
        tag: "req.body.tag",
        file: fileName,
        clicks: 1,
        censorattempts: 0,
        shields: 0,
        memecoinsspent: 0,
        replyto: parseInt(req.body.paintPostId),
        tagupvotes: 1
    };
    query = `
    MATCH (whomadeit:User {userID:$userID}), (origPost:Post {postID:$replyto})
    MERGE (newpost:Post {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, shields:$shields, censorattempts:$censorattempts, memecoinsspent:$memecoinsspent})
    MERGE (newpost)-[cb:CREATEDBY]->(whomadeit)
    MERGE (newpost)-[rt:PAINTS]->(origPost)
    RETURN newpost, origPost
    `;
    
    session
        .run(query, params)
        .then(function (result) {
            console.log(result.records);
            result.records.forEach(function(record){
              console.log(record);
            });
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.post('/uploadnewgroup', upload.single('sampleFile-group'), function (req, res, next) {
    console.log("UPLOAD NEW GROUP");
    console.log(req.body);
    var blockId = new ObjectId();
    var query;
    var newsettings = '';
    newsettings += (req.body.byinvite == 'no') ? '0' : '1';
    newsettings += (req.body.byinvite == 'no') ? '0' : '1';
    console.log(newsettings);
    var fileName = "officialunofficialplaceholderlogo.jpg";
    var postId = parseInt(blockId.getTimestamp());
    if (typeof req.file === 'object') { fileName = req.file.filename; }
    var params = {
        postID: postId,
        upvotes: 1,
        downvotes: 0,
        type: 'group',
        focus: req.body.groupfocus,
        title: sanitizeHtml(req.body.groupname),
        content: sanitizeHtml(req.body.groupdescription),
        userID: parseInt(req.body.userIDnewgroup),
        file: fileName,
        clicks: 1,
        settings: newsettings
    };
    query = `
    MATCH (whomadeit:User {userID:$userID})
    MERGE (newgroup:Group {postID:$postID, upvotes:$upvotes, downvotes:$downvotes, type:$type, title:$title, content:$content, file:$file, clicks:$clicks, settings:$settings, focus:$focus})
    MERGE (newgroup)-[cb:CREATEDBY]->(whomadeit)
    RETURN newgroup
    `;

    session
        .run(query, params)
        .then(function (result) {
            console.log(result);
            // result.records[0]["_fields"].forEach(function(record){
            //   console.log(record);
            // });
            // session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});

app.post('/sendmessage', upload.single('sampleFile-message'), function (req, res, next) {
    console.log(req.body);
    var blockId = new ObjectId();
    var query;
    var postId = parseInt(blockId.getTimestamp());
    var params = {
        userID: parseInt(messageData.fromUser),
        title: messageData.messageTitle,
        content: messageData.messageContent,
        tousername: messageData.toUser,
        postID: postId,
        type: 'directmessage'
    };
    var query = `
        MATCH(fromuser:User {userID:$userID}), (touser:User {name:$tousername})
        MERGE (fromuser)-[a:SENTMSG]->(m:Post {postID:$postID, title:$title, type:$type, content:$content })-[b:RECEIVEDMSG]->(touser)
        RETURN fromuser, a, m, b, touser
        `;
    session
        .run(query, params)
        .then(function (result) {
            console.log(result);
            // result.records[0]["_fields"].forEach(function(record){
            //   console.log(record);
            // });
            // session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});

app.post('/uploadreport', upload.single('sampleFile-none'), function (req, res, next) {
    console.log(req.body);
    var blockId = new ObjectId();
    var query;
    var postId = parseInt(blockId.getTimestamp());
    var params = {
        postID: postId,
        upvotes: parseInt(req.body.carecost),
        type: "report",
        userID: parseInt(req.body.userIDreport),
        reportReason: req.body.reportreason,
        replyto: parseInt(req.body.postIDreport)
     };
     query = `
        MATCH (whomadeit:User {userID:$userID}), (origPost:Post {postID:$replyto})
        MERGE (origPost)<-[re:REPORTED]-(whomadeit)
        SET re.upvotes=$upvotes, re.reason=$reportReason
        RETURN origPost, re, whomadeit
        `;
     session
        .run(query, params)
        .then(function (result) {
            console.log(result);
            // result.records[0]["_fields"].forEach(function(record){
            //   console.log(record);
            // });
            // session.close();
        })
        .catch(function (error) {
            console.log(error);
        });
    res.redirect('/');
});
function requestTagsForThisPost(socket, postID){
  var params = {
    postID: parseInt(postID)
  };
  var query = `
    MATCH (p:Post {postID:$postID})-[ta:TAGGEDAS]->(posttags:Tag)
    OPTIONAL MATCH (j:Post)-[:TAGGEDAS]->(t:Tag {name:posttags.name})    
    RETURN COUNT(j) AS otherposts, t.name AS tagname, ta.upvotes AS tagupvotes ORDER BY ta.upvotes DESC
    LIMIT 20
    `;
    session
      .run(query, params)
      .then(function(result){
        if(result.records[0]==null){
          console.log('NULL');
          socket.emit('noDataFound');
        }else{
          var dataForClient = [];
          result.records.forEach(function(record){
            dataForClient.push([record["_fields"][0], record["_fields"][1], record["_fields"][2]]);
          });
          console.log(dataForClient);
          socket.emit('tagsForPostData', dataForClient);
          
        }
      })
      .catch(function(error){
        console.log(error);
      });
}

function requestPostsForArbitration(socket) {
    console.log("REUQEST POSTS FOR ARBITRATION");
    var arbitrationPostsArray = [];
    query = `
    MATCH (n:Post)<-[re:REPORTED]-(m)
    WITH n.postID AS postID, n.title AS title, COLLECT(re.reason) AS reasonarray, SUM(re.upvotes) AS totalcare
    RETURN postID, title, reasonarray, totalcare ORDER BY totalcare DESC
    `;
    session
        .run(query)
        .then(function (result) {
            //console.log(result);
            result.records.forEach(function (record) {
                console.log(record['_fields'][0]);
                console.log(record['_fields'][1]);
                console.log(record['_fields'][2]);
                console.log(record['_fields'][3]);
                arbitrationPostsArray.push(record['_fields']);
            });
            socket.emit('receiveArbitrationPostsArray', arbitrationPostsArray);
        })
        .catch(function (error) {
            console.log(error);
        });
}
function requestPaintedPosts(socket) {
    console.log("REUQEST PAINTER");
    var paintDataArray = [];
    var query;
    query = `
    MATCH (n:Post)<-[:PAINTS]-(m:Post)
    RETURN n.postID, COLLECT(m.content)[0]
    `;
    session
        .run(query)
        .then(function (result) {
            result.records.forEach(function (record) {
                paintDataArray.push(record["_fields"][1]);
            });
            socket.emit('paintPosts', paintDataArray);
            console.log(paintDataArray);
            
        })
        .catch(function (error) {
            console.log(error);
        });
}
function requestTop20Posts(socket, pagenum){
  console.log(String(PAGESIZE*pagenum));
  var topPostsAndTags = [];
    var topPostQuery = `
    MATCH (p:Post)
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (:Post)-[rt:REPLYTO]->(p)
    OPTIONAL MATCH (u:User)<-[cb:CREATEDBY]-(p)
    RETURN p AS posts, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tags, COUNT(DISTINCT rt) AS replies, COLLECT(DISTINCT [u.name, u.userroles, u.userID]) AS poster
    SKIP `+String(PAGESIZE*pagenum)+` LIMIT `+String(PAGESIZE);
    //`;
    var topTagQuery = `
    MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
    WITH t.name AS tag, COUNT(ta) AS tagcount 
    RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
    `;
    session
      .run(topPostQuery)
      .then(function(result){
        var dataForClient = [];
        result.records.forEach(function(record){
          var processedPostObject = record["_fields"][0]["properties"];
          record["_fields"][1].forEach(function(tagAndVote){
            processedPostObject.tagnames = tagAndVote[0];
            processedPostObject.tagvotes = tagAndVote[1];
          });
          processedPostObject.replycount = record["_fields"][2];
            processedPostObject.poster = record["_fields"][3];
            dataForClient.push(processedPostObject);
        });
        topPostsAndTags.push(dataForClient);
          session
            .run(topTagQuery)
            .then(function(result){
              var tagdataForClient = [];
              result.records.forEach(function(record){
                tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
              });
              topPostsAndTags.push(tagdataForClient);
              console.log(topPostsAndTags);
              console.log("POSTS "+String(PAGESIZE*pagenum)+" TO "+String(PAGESIZE*pagenum+PAGESIZE));
              socket.emit('receiveTop20Data', topPostsAndTags);
            })
            .catch(function(error){
              console.log(error);
            });
      })
      .catch(function(error){
        console.log(error);
      });
}

function requestRandPosts(socket, randPages, pagenum) {
  console.log(String(randPages));
  console.log("pagenum "+pagenum);
  var topPostsAndTags = [];
    var topPostQuery = `
    MATCH (:Post) with COUNT(*) as docCount
    MATCH (doc:Post)
    WHERE rand() < `+randPages+`.0/docCount
    RETURN doc
    `;
    var topTagQuery = `
    MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
    WITH t.name AS tag, COUNT(ta) AS tagcount 
    RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
    `;
    session
      .run(topPostQuery)
      .then(function(result){
        var dataForClient = [];
        console.log(result['records']);
        console.log("eoigheoiuhg");
        result['records'].forEach(function(record){
          console.log(record);
          var processedPostObject = record["_fields"][0]["properties"];
          // record["_fields"][1].forEach(function(tagAndVote){
          //   processedPostObject.tagnames = tagAndVote[0];
          //   processedPostObject.tagvotes = tagAndVote[1];
          // });
          processedPostObject.replycount = record["_fields"][2];
          dataForClient.push(processedPostObject);
        });
        topPostsAndTags.push(dataForClient);
          session
            .run(topTagQuery)
            .then(function(result){
              var tagdataForClient = [];
              result.records.forEach(function(record){
                tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
              });
              topPostsAndTags.push(tagdataForClient);
              console.log(topPostsAndTags);
              console.log("RANDOM "+String(randPages)+" POSTS");
              socket.emit('receiveTop20Data', topPostsAndTags);
            })
            .catch(function(error){
              console.error(error);
            });
      })
      .catch(function(error){
        console.error(error);
      });
}
function requestRecommendedPosts(socket, pagenum) {
    console.log("RETRIEVING RECOMMENDED POSTS");
    var topRecommendedPostsAndTags = [];
    var topPostQuery = `
    MATCH (p:Post)<-[:RECOMMENDS]-(:User)
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (:Post)-[rt:REPLYTO]->(p)
    RETURN p AS posts, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tags, COUNT(DISTINCT rt) AS replies
    SKIP `+ String(PAGESIZE * pagenum) + ` LIMIT ` + String(PAGESIZE);
    var topTagQuery = `
    MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
    WITH t.name AS tag, COUNT(ta) AS tagcount 
    RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
    `;
    session
        .run(topPostQuery)
        .then(function (result) {
            var dataForClient = [];
            result.records.forEach(function (record) {
                var processedPostObject = record["_fields"][0]["properties"];
                record["_fields"][1].forEach(function (tagAndVote) {
                    processedPostObject.tagnames = tagAndVote[0];
                    processedPostObject.tagvotes = tagAndVote[1];
                });
                processedPostObject.replycount = record["_fields"][2];
                dataForClient.push(processedPostObject);
            });
            topRecommendedPostsAndTags.push(dataForClient);
            session
                .run(topTagQuery)
                .then(function (result) {
                    var tagdataForClient = [];
                    result.records.forEach(function (record) {
                        tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
                    });
                    topRecommendedPostsAndTags.push(tagdataForClient);
                    console.log(topRecommendedPostsAndTags);
                    console.log("POSTS " + String(PAGESIZE * pagenum) + " TO " + String(PAGESIZE * pagenum + PAGESIZE));
                    socket.emit('receiveRecommendedData', topRecommendedPostsAndTags);
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
}
function requestAlgomancerPosts(socket, pagenum) {

}
function requestSortedPosts(socket, sortType, pagenum) {
    //console.log(String(randPages));
    console.log("pagenum " + pagenum);
    var topPostsAndTags = [];
    var topPostQuery = `
    MATCH (:Post) with COUNT(*) as docCount
    MATCH (doc:Post)
    WHERE rand() < `+ String(randPages) + `.0/docCount
    RETURN doc
    `;
    var topTagQuery = `
    MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
    WITH t.name AS tag, COUNT(ta) AS tagcount 
    RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
    `;
    session
        .run(topPostQuery)
        .then(function (result) {
            var dataForClient = [];
            result.record.forEach(function (record) {
                var processedPostObject = record["_fields"][0]["properties"];
                record["_fields"][1].forEach(function (tagAndVote) {
                    processedPostObject.tagnames = tagAndVote[0];
                    processedPostObject.tagvotes = tagAndVote[1];
                });
                processedPostObject.replycount = record["_fields"][2];
                dataForClient.push(processedPostObject);
            });
            topPostsAndTags.push(dataForClient);
            session
                .run(topTagQuery)
                .then(function (result) {
                    var tagdataForClient = [];
                    result.records.forEach(function (record) {
                        tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
                    });
                    topPostsAndTags.push(tagdataForClient);
                    console.log(topPostsAndTags);
                    console.log("RANDOM " + String(randPages) + " POSTS");
                    socket.emit('receiveTop20Data', topPostsAndTags);
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.error(error);
        });
}

function requestGroups(socket, pagenum) {
    console.log("REUQEST GROUPS");
    var paintDataArray = [];
    var query;
    query = `
    MATCH (g:Tag {type:'group'})-[:CREATEDBY]->(m:User)
    OPTIONAL MATCH (p:Post)-[POSTEDIN]->(g)
    RETURN p, g, m
    `;
    session
        .run(query)
        .then(function (result) {
            result.records.forEach(function (record) {
                paintDataArray.push(record["_fields"][1]);
            });
            socket.emit('paintPosts', paintDataArray);
            console.log(paintDataArray);

        })
        .catch(function (error) {
            console.log(error);
        });
}

function followLeader(socket, idarray) {

}


function requestMultifeedPosts(socket) {
    console.log("MULTIFEED REQUEST");
    var dataForClient = [];
    var posts1 = [];
    var posts2 = [];
    var posts3 = [];
    var topPost1Query = `
    MATCH (:Post) with COUNT(*) as docCount
    MATCH (doc:Post)
    WHERE rand() < 3.0/docCount
    RETURN doc
    `;
    session
        .run(topPost1Query)
        .then(function (result) {

            console.log(result['records']);
            result['records'].forEach(function (record) {
                //console.log(record);
                var processedPostObject = record["_fields"][0]["properties"];
                processedPostObject.replycount = record["_fields"][2];
                posts1.push(processedPostObject);
            });
            dataForClient.push(posts1);
            var topPost2Query = `
            MATCH (p:Post)
            WITH p ORDER BY p.upvotes-p.downvotes DESC
            OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
            OPTIONAL MATCH (:Post)-[rt:REPLYTO]->(p)
            RETURN p AS posts, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tags, COUNT(DISTINCT rt) AS replies
            SKIP `+ String(PAGESIZE * 1) + ` LIMIT ` + String(PAGESIZE);

            session
                .run(topPost2Query)
                .then(function (result) {
                    result.records.forEach(function (record) {
                        var processedPostObject = record["_fields"][0]["properties"];
                        processedPostObject.replycount = record["_fields"][2];
                        posts2.push(processedPostObject);
                    });
                    dataForClient.push(posts2);
                    dataForClient.push(posts3);
                    socket.emit('receiveMultifeedData', dataForClient);
                    console.log("MULTIFEED DATA SENT");
                })
                .catch(function (error) {
                    console.log(error);
                });
        })
        .catch(function (error) {
            console.log(error);
        });
}

function requestTop20PostsGrid(socket){
  var topPostsAndTags = [];
    var topPostQuery = `
    MATCH (p:Post)
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (:Post)-[rt:REPLYTO]->(p)
    RETURN p AS posts, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tags, COUNT(DISTINCT rt) AS replies
    SKIP 0 LIMIT 50
    `;
    var topTagQuery = `
    MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
    WITH t.name AS tag, COUNT(ta) AS tagcount 
    RETURN tag, tagcount ORDER BY tagcount DESC LIMIT 10
    `;
    session
      .run(topPostQuery)
      .then(function(result){
        var dataForClient = [];
        result.records.forEach(function(record){
          var processedPostObject = record["_fields"][0]["properties"];
          console.log(record["_fields"][1]);
          console.log("EOPUITHEIPOUTGHEIUOPGTHPIUEFHVEIPOUYFHIEPOUFHE");
          processedPostObject.tagArray = [];
          record["_fields"][1].forEach(function(tagAndVote){
            processedPostObject.tagArray.push(tagAndVote[0]);
            //processedPostObject.tagvotes = tagAndVote[1];
          });
          //processedPostObject.tagArray = record["_fields"][1];
          processedPostObject.replycount = record["_fields"][2];
          dataForClient.push(processedPostObject);
        });
        topPostsAndTags.push(dataForClient);
          session
            .run(topTagQuery)
            .then(function(result){
              var tagdataForClient = [];
              result.records.forEach(function(record){
                tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
              });
              topPostsAndTags.push(tagdataForClient);
              console.log(topPostsAndTags);
              console.log("TOP 20 POSTS GRID");
              socket.emit('receiveTop20DataGrid', topPostsAndTags);
            })
            .catch(function(error){
              console.log(error);
            });
      })
      .catch(function(error){
        console.log(error);
      });
}

function retrievePostsForNetView(socket){
  var dataForClient = [];
    var topPostQuery = `
    MATCH (p:Post)-[ta:TAGGEDAS]->(t:Tag)
    WITH p.postID AS id, t.name AS tag, ta.upvotes AS tagupvotes, p.upvotes AS upvotes, p.content AS content, p.title AS title, p.file AS file
    ORDER BY tagupvotes DESC 
    WITH id, upvotes, content, COLLECT(DISTINCT [tag, tagupvotes])[0..3] AS toptags, COUNT(DISTINCT tag) AS tagcount, title, file
    UNWIND toptags AS tags
    RETURN id, upvotes, content, tags[0], title, file
    ORDER BY tags[0] DESC
    `;
    session
      .run(topPostQuery)
      .then(function(result){
        result.records.forEach(function(record){
          console.log(record._fields);
          let tagarray = [];
          let postarray = [];
          
          postarray.push(record["_fields"][0], record["_fields"][1], record["_fields"][4], record["_fields"][3], record["_fields"][2], record["_fields"][5]);
          dataForClient.push(postarray);
          //dataForClient.push(record["_fields"]);
          // dataForClient[record["_fields"][0]] = {
          //   upvotes: record["_fields"][1],
          //   tags: tagarray,
          //   title: record["_fields"][2],
          //   file: record["_fields"][5],
          //   content: record["_fields"][4]
          // };
        });
        console.log(dataForClient);
        console.log("SENT NETVIEW FORMAT POSTS TO CLIENT");
        socket.emit('sendDatabase', dataForClient);
      })
      .catch(function(error){
        console.log(error);
      });
}

io.on('connection', function (socket) {
    console.log("connection");
    //requestTop20Posts(socket);

    // socket.on('retrievePostsForMarket', function(){
    //   requestTop20Posts(socket);
    // });

    socket.on('retrieveDatabase', function () {
        retrievePostsForNetView(socket);
    });

    socket.on('retrieveDatabaseGrid', function () {
        requestTop20PostsGrid(socket);
    });

    socket.on('requestTop20Posts', function (pagenum) {
        requestTop20Posts(socket, pagenum);
    });

    socket.on('requestTagsForPost', function (postID) {
        requestTagsForThisPost(socket, postID);
    });

    socket.on('requestMulti', function () {
        requestMultifeedPosts(socket);
    });

    socket.on('requestRandPosts', function (randPages, pagenum) {
        requestRandPosts(socket, "10", pagenum);
    });

    socket.on('requestSortedPosts', function (sortType, pagenum) {
        switch (sortType) {
            case 'loathed':
            case 'controversial':
            case 'latest':
            case 'like':
                requestSortedPosts(socket, sortType, pagenum);
            case 'clks':
                requestTop20Posts(socket, pagenum);
            case 'rand':
                requestRandPosts(socket, "10", pagenum);
            default:
                requestTop20Posts(socket, pagenum);
        }
    });

    socket.on('requestPaint', function () {
        requestPaintedPosts(socket);
    });

    socket.on('requestPostsForArbitration', function () {
        requestPostsForArbitration(socket);
    });

    socket.on('requestRecommendedPosts', function (pagenum) {
        requestRecommendedPosts(socket, pagenum);
    });

    socket.on('requestAlgomancerPosts', function (pagenum) {
        requestAlgomancerPosts(socket, pagenum);
    });

    socket.on('requestGroups', function (pagenum) {
        requestGroups(socket, pagenum);
    });

    socket.on('blockchaintx', function (transaction) {

    });

    /////////////////////
    //ACCOUNT STUFF
    socket.on('registerNewUser', function (registrationData) {
        console.log(registrationData);
        var newuserID = new ObjectId();
        newuserID = newuserID.getTimestamp();
        var query = `
          CREATE (newuser:User {name:$username, userID:$userID, password:$password, memecoin:$memecoin, userroles:$newuserRoles})
          RETURN newuser
          `;
        var params = {
            username: registrationData.username,
            userID: parseInt(newuserID),
            password: registrationData.password,
            memecoin: 200,
            newuserRoles: registrationData.newuserRoles
        };
        session
            .run(query, params)
            .then(function (result) {
                console.log("REGISTERED USER");
                var logindata = result.records[0]["_fields"][0]["properties"];
                socket.emit('loggedIn', logindata);
                //console.log(result.records[0]["_fields"][0]);
                //session.close();
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    socket.on('login', function (loginData) {
        var query = `
      MATCH (newuser:User {name:$username, password:$password})
      RETURN newuser
      `;
        var params = {
            username: loginData.username,
            password: loginData.password
        };
        session
            .run(query, params)
            .then(function (result) {
                console.log("LOGGED IN USER");
                console.log(result.records[0]["_fields"][0]["properties"]);
                var loginresult = result.records[0]["_fields"][0]["properties"];
                socket.emit('loggedIn', loginresult);
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    socket.on('check', function (stuffToCheck) {
        console.log("CHECKING TASK");
        console.log(stuffToCheck);
        var params = {
            userID: stuffToCheck.userID,
            postID: stuffToCheck.postID,
            data: stuffToCheck.data,
            role: stuffToCheck.role
        };
        var query;
        console.log(params);
        switch (stuffToCheck.taskToCheck) {
            case 'vote':
                query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        RETURN p,u
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        if (result.records[0] == null) {
                            console.log("FIRST VOTE");
                            if (stuffToCheck.data == true) {
                                socket.emit('userChecked', { task: 'firstvoteup', userID: params.userID, postID: params.postID, cost: 1 });
                            } else {
                                socket.emit('userChecked', { task: 'firstvotedown', userID: params.userID, postID: params.postID, cost: 1 });
                            }
                        } else {
                            console.log("ADDITIONAL VOTE");
                            if (stuffToCheck.data == true) {
                                socket.emit('userChecked', { task: 'additionalvoteup', userID: params.userID, postID: params.postID, cost: Math.pow(2, (result.records[0]["_fields"][0]["properties"]["upvotes"] + result.records[0]["_fields"][0]["properties"]["downvotes"])) });
                            } else {
                                socket.emit('userChecked', { task: 'additionalvotedown', userID: params.userID, postID: params.postID, cost: Math.pow(2, (result.records[0]["_fields"][0]["properties"]["upvotes"] + result.records[0]["_fields"][0]["properties"]["downvotes"])) });
                            }
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedAdditionalVote', userID: params.userID, postID: params.postID, cost: -1 });
                        console.log(error);
                    });
                break;
            case 'makeadditionalvoteup':
                query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        RETURN p,u
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records[0]["_fields"][1]["properties"]["memecoin"]);
                        console.log("HAVE ENOUGH FOR ADDITIONAL VOTE?");
                        if (result.records[0]["_fields"][1]["properties"]["memecoin"] > stuffToCheck.data) {
                            console.log("YES");
                            socket.emit('userChecked', { task: 'madeadditionalvoteup', userID: params.userID, postID: params.postID, cost: Math.pow(2, (result.records[0]["_fields"][0]["properties"]["upvotes"] + result.records[0]["_fields"][0]["properties"]["downvotes"])) });
                        } else {
                            console.log('NO');
                            socket.emit('userChecked', { task: 'failedAdditionalVote', userID: params.userID, postID: params.postID, cost: -1 });
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedAdditionalVote', userID: params.userID, postID: params.postID, cost: -1 });
                        console.log(error);
                    });
                break;
            case 'makeadditionalvotedown':
                query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        RETURN p,u
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records[0]["_fields"][1]["properties"]["memecoin"]);
                        console.log("HAVE ENOUGH FOR ADDITIONAL VOTE?");
                        if (result.records[0]["_fields"][1]["properties"]["memecoin"] > stuffToCheck.data) {
                            console.log("YES");
                            socket.emit('userChecked', { task: 'madeadditionalvotedown', userID: params.userID, postID: params.postID, cost: Math.pow(2, (result.records[0]["_fields"][0]["properties"]["upvotes"] + result.records[0]["_fields"][0]["properties"]["downvotes"])) });
                        } else {
                            console.log('NO');
                            socket.emit('userChecked', { task: 'failedAdditionalVote', userID: params.userID, postID: params.postID, cost: -1 });
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedAdditionalVote', userID: params.userID, postID: params.postID, cost: -1 });
                        console.log(error);
                    });
                break;
            case 'harvest':
                query = `
        MATCH (p:Post {postID:$postID})-[c:CREATEDBY]->(u:User {userID:$userID})
        RETURN p
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records);
                        if (result.records[0] == null) {
                            socket.emit('userChecked', { task: 'failedHarvest', userID: params.userID, postID: params.postID, cost: 0 });
                            console.log("user doesnt own it");
                        } else {
                            var post = result.records[0]["_fields"][0]["properties"];
                            var profit = ((post.upvotes - post.downvotes) > 0) ? (post.upvotes - post.downvotes) : 0;
                            socket.emit('userChecked', { task: 'ableToHarvestPost', userID: params.userID, postID: params.postID, cost: profit });
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedHarvest', userID: params.userID, postID: params.postID, cost: 0 });
                        console.log(error);
                    });
                break;
            case 'shield':
                query = `
        MATCH (n:User {userID:$userID})
        RETURN n.memecoin
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records);
                        if (result.records[0] == null) {
                            console.log('NO USER WITH THAT ID');
                            socket.emit('userChecked', { task: 'failedShielding', userID: params.userID, postID: params.postID, cost: 0 });
                        } else {
                            console.log("USER EXISTED");
                            var memecoin = parseInt(result.records[0]['_fields'][0]);
                            if (memecoin > 50) {
                                console.log("MORE THAN 50");
                                socket.emit('userChecked', { task: 'ableToApplyShield', userID: params.userID, postID: params.postID, cost: 25 });
                            } else {
                                socket.emit('userChecked', { task: 'failedCensoring', userID: params.userID, postID: params.postID, cost: 0 });
                            }
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedShielding', userID: params.userID, postID: params.postID, cost: 0 });
                        console.log(error);
                    });
                break;
            case 'censor':
                query = `
        MATCH (n:User {userID:$userID}), (p:Post {postID:$postID})
        RETURN n.memecoin, p.censorattempts
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records);
                        if (result.records[0] == null) {
                            console.log('NO USER WITH THAT ID');
                            socket.emit('userChecked', { task: 'failedCensoringCauseOther', userID: params.userID, postID: params.postID, cost: 0 });
                        } else {
                            var memecoin = parseInt(result.records[0]['_fields'][0]);
                            var attempts = parseInt(result.records[0]['_fields'][1]);
                            if (memecoin > 50) {
                                console.log("MORE THAN 50");
                                socket.emit('userChecked', { task: 'ableToCensorPost', userID: params.userID, postID: params.postID, cost: attempts });
                            } else {
                                console.log("LESS THAN 50");
                                socket.emit('userChecked', { task: 'failedCensoringCauseTooPoor', userID: params.userID, postID: params.postID, cost: 0 });
                            }
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case 'upvotetag':
                query = `
        MATCH (u:User {userID:$userID})
        RETURN u.memecoin
        `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records);
                        if (result.records[0] == null) {
                            socket.emit('userChecked', { task: 'failedTagUpvote', userID: params.userID, postID: params.postID, cost: 0 });
                            console.log("user doesnt exist");
                        } else {
                            var memecoin = parseInt(result.records[0]['_fields'][0]);
                            if (memecoin >= 1) {
                                console.log("user has enough memecoin to upvote tag");
                                socket.emit('userChecked', { task: 'ableToUpvoteTag', userID: params.userID, postID: params.postID, cost: stuffToCheck.data });
                            } else {
                                socket.emit('userChecked', { task: 'failedTagUpvote', userID: params.userID, postID: params.postID, cost: -1 });
                            }
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedTagUpvote', userID: params.userID, postID: params.postID, cost: 0 });
                        console.log(error);
                    });
                break;
            case 'arbitrate':
                query = `
            MATCH (u:User {userID:$userID})-[:HASROLE]->(r:Role {name:"Juror"})
            OPTIONAL MATCH (p:Post {type:"dispute"})
            RETURN p
            `;
                session
                    .run(query, params)
                    .then(function (result) {
                        console.log(result.records);
                        if (result.records[0] == null) {
                            socket.emit('userChecked', { task: 'failedDisputeReq', userID: params.userID, postID: params.postID, cost: 0 });
                            console.log("user doesnt exist or isn't a juror");
                        } else {
                            var memecoin = parseInt(result.records[0]['_fields'][0]);
                            console.log("user can receive dispute list");
                            socket.emit('userChecked', { task: 'successfulDisputeReq', userID: params.userID, posts: params.p });
                        }
                    })
                    .catch(function (error) {
                        socket.emit('userChecked', { task: 'failedDisputeReq', userID: params.userID, postID: params.postID, cost: 0 });
                        console.log(error);
                    });
                break;
            default:
                break;
        }
    });



    //////////////
    //VIEWING DETAILS
    socket.on('requestPostsWithTag', function (tagname) {
        var params = {
            tagname: tagname
        };
        var query = `
    MATCH (p:Post)-[:TAGGEDAS]->(g:Tag {name:$tagname})
    WITH p ORDER BY p.upvotes-p.downvotes DESC
    OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
    OPTIONAL MATCH (p)<-[rt:REPLYTO]-(:Post)
    RETURN p AS posts, COLLECT(t.name) AS tags, COLLECT(ta.upvotes) AS tagupvotes, COUNT(rt) AS replies
    LIMIT 20
    `;
        session
            .run(query, params)
            .then(function (result) {
                if (result.records[0] == null) {
                    console.log('NULL');
                    //socket.emit('noDataFound');
                } else {
                    var topPostsForTag = [];
                    var dataForClient = [];
                    result.records.forEach(function (record) {
                        var processedPostObject = record["_fields"][0]["properties"];
                        processedPostObject.tagnames = record["_fields"][1];
                        processedPostObject.tagvotes = record["_fields"][2];
                        processedPostObject.replycount = record["_fields"][3];
                        dataForClient.push(processedPostObject);
                    });
                    console.log(dataForClient);
                    topPostsForTag.push(dataForClient);
                    topPostsForTag.push(tagname);
                    socket.emit('receiveTagData', topPostsForTag);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    socket.on('viewmessages', function (userID) {
        var query = `
        MATCH (recipient:User {userID:$userID})
        OPTIONAL MATCH (recipient)<-[:RECEIVEDMSG]-(r:MSG)<-[:SENTMSG]-(fromuser)
        OPTIONAL MATCH (recipient)-[:SENTMSG]->(s:MSG)->[:RECEIVEDMSG]->(otheruser:User)
        RETURN recipient.name, r.title, r.content, fromuser.name
        `;
        session
            .run(query, { userID: parseInt(userID) })
            .then(function (result) {
                var dataForClient = {};
                if (result.records[0] == null) {
                    socket.emit('noMsgDataFound', 'no messages found');
                    console.log('NULL');
                } else {
                    console.log("NOT null");
                    console.log(result.records[0]["_fields"]);
                    result.records.forEach(function (record) {
                        console.log(record["_fields"]);
                    });
                    dataForClient[result.records[0]["_fields"][3]] = [result.records[0]["_fields"][1], result.records[0]["_fields"][2]];
                    socket.emit('msgDataFound', dataForClient);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    socket.on('viewuser', function (userID) {
        var query = `
      MATCH (u:User {userID:$userID})
      OPTIONAL MATCH (u)-[:TAGGEDAS]->(t:Tag)
      WITH u, COLLECT(DISTINCT t.name) AS tags
      OPTIONAL MATCH (u)<-[:CREATEDBY]-(p:Post)
      WITH u, tags, COLLECT(DISTINCT p) AS posts
      OPTIONAL MATCH (u)-[:FAVORITED]->(f:Post)
      WITH posts, u, tags, COLLECT(DISTINCT f) AS faves
      OPTIONAL MATCH (u)-[:SUMMONEDTO]->(s:Post)
      WITH posts, u, tags, faves, COLLECT(DISTINCT s) AS summons
      OPTIONAL MATCH (u)-[d:VOTEDON]->(v:Post)
      WITH summons, posts, u, tags, faves, COLLECT(DISTINCT v.postID) AS voted, SUM(d.upvotes) AS upvotes, SUM(d.downvotes) AS downvotes
      RETURN u, tags, posts, faves, summons, voted, upvotes, downvotes
      `;
        session
            .run(query, { userID: parseInt(userID) })
            .then(function (result) {
                if (result.records[0] == null) {
                    socket.emit('noDataFound', 'no user found');
                    console.log('NULL');
                } else {
                    console.log("USER FOUND");
                    //[userdata, tags, upvotes dealt, downvotes dealt]
                    var dataForClient = [result.records[0]["_fields"][0]["properties"], result.records[0]["_fields"][1], result.records[0]["_fields"][5], result.records[0]["_fields"][6], result.records[0]["_fields"][7]];
                    let tempData = [];
                    result.records[0]["_fields"][2].forEach(function (record) {
                        tempData.push(record["properties"]);
                    });
                    dataForClient.push(tempData);
                    tempData = [];
                    result.records[0]["_fields"][3].forEach(function (record) {
                        console.log(record.properties); console.log("record.properties");
                        tempData.push(record["properties"]);
                    });
                    dataForClient.push(tempData);
                    tempData = [];
                    result.records[0]["_fields"][4].forEach(function (record) {
                        console.log(record.properties); console.log("record.properties");
                        tempData.push(record["properties"]);
                    });
                    dataForClient.push(tempData);
                    console.log(dataForClient);
                    socket.emit('userDataFound', dataForClient);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    socket.on('viewpost', function (postID) {
        var query = `
      MATCH (p:Post {postID:$postID})
      OPTIONAL MATCH (m:Post)-[rt:REPLYTO]->(p)
      OPTIONAL MATCH (p)-[ta:TAGGEDAS]->(t:Tag)
      OPTIONAL MATCH (p)<-[fa:FAVORITED]-(u:User)
      SET p.clicks = p.clicks + 1
      RETURN p AS postToBeViewed, COLLECT(DISTINCT m) AS replies, COLLECT(DISTINCT [t.name, ta.upvotes]) AS tagstuff, COLLECT(DISTINCT [u.userID, u.name]) AS usersWhoFavorited
      `;
        var topTagQuery = `
      MATCH (t:Tag)<-[ta:TAGGEDAS]-(p:Post)
      WITH t.name AS tag, COUNT(ta) AS tagcount 
      RETURN tag, tagcount ORDER BY tagcount DESC
      `;
        session
            .run(query, { postID: parseInt(postID) })
            .then(function (result) {
                if (result.records[0] == null) {
                    //socket.emit('noDataFound');
                    console.log('NULL');
                } else {
                    var dataForClient = [];
                    result.records.forEach(function (record) {
                        var processedPostObject = record["_fields"][0]["properties"];
                        processedPostObject.tags = record["_fields"][2];
                        processedPostObject.favoritedBy = record["_fields"][3];
                        var repliesArray = [];
                        record["_fields"][1].forEach(function (reply) {
                            repliesArray.push(reply.properties);
                        });
                        dataForClient.push(processedPostObject, repliesArray);
                    });
                    session
                        .run(topTagQuery)
                        .then(function (result) {
                            var tagdataForClient = [];
                            result.records.forEach(function (record) {
                                tagdataForClient.push([record["_fields"][0], record["_fields"][1]]);
                            });
                            dataForClient.push(tagdataForClient);
                            console.log(dataForClient);
                            socket.emit('receiveSinglePostData', dataForClient);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    //socket.emit('receiveSinglePostData', dataForClient);   
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    

    /////////////
    //VOTING
    ///////////
    socket.on('makevote', function (makevotestuff) {
        var query;
        var params = {
            userID: makevotestuff.userID,
            postID: makevotestuff.postID,
            cost: parseInt(makevotestuff.cost)
        };

        switch (makevotestuff.voteType) {
            case 'firstvoteup':
                query = `
        MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})
        MERGE (u)-[v:VOTEDON {upvotes:1, downvotes:0}]->(p)
        `;
                session.run(query, params).then(function (result) {
                    //console.log(result);
                    console.log("firstvotecompleted");
                    //socket.emit('receiveSinglePostData', result);
                    //console.log(result.records[0]["_fields"][1]);
                    //session.close();
                })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case 'firstvotedown':
                query = `
        MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})
        MERGE (u)-[v:VOTEDON {upvotes:0, downvotes:1}]->(p)
        `;
                session.run(query, params).then(function (result) {
                    //console.log(result);
                    console.log("firstvotecompleted");
                    //socket.emit('receiveSinglePostData', result);
                    //console.log(result.records[0]["_fields"][1]);
                    //session.close();
                })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case 'additionalvoteup':
                query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        SET p.upvotes = p.upvotes + 1
        SET v.upvotes = v.upvotes + 1
        SET u.memecoin = u.memecoin - $cost
        RETURN u, p, v
        `;
                session.run(query, params).then(function (result) {
                    //console.log(result);
                    console.log("additionalvotecompleted");
                    //socket.emit('receiveSinglePostData', result);
                    //console.log(result.records[0]["_fields"][1]);
                    //session.close();
                })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case 'additionalvotedown':
                query = `
        MATCH (p:Post {postID:$postID})<-[v:VOTEDON]-(u:User {userID:$userID})
        SET p.downvotes = p.downvotes + 1
        SET v.downvotes = v.downvotes + 1
        SET u.memecoin = u.memecoin - $cost
        RETURN u, p, v
        `;
                session.run(query, params).then(function (result) {
                    //console.log(result);
                    console.log("additionalvotecompleted");
                    //socket.emit('receiveSinglePostData', result);
                    //console.log(result.records[0]["_fields"][1]);
                    //session.close();
                })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
        }
    });



    ////////////////
    //TAGGING
    ////////////
    socket.on('tagPostOrUser', function (tagPostOrUserData) {
        var query;
        var params;
        if (tagPostOrUserData.postIfTrue == true) {
            params = {
                postID: parseInt(tagPostOrUserData.postID),
                tagname: tagPostOrUserData.tagname,
                upvotes: 1
            };
            query = `
      MATCH (p:Post {postID:$postID})
      MERGE (t:Tag {name:$tagname})
      MERGE (p)-[ta:TAGGEDAS]->(t)
      ON CREATE SET ta.upvotes = $upvotes
      ON MATCH SET ta.upvotes = ta.upvotes + $upvotes
      RETURN ta
      `;
        } else {
            params = {
                userID: tagPostOrUserData.userID,
                tagname: tagPostOrUserData.tagname,
                upvotes: 1
            };
            query = `
      MATCH (u:User {userID:$userID})
      MERGE (t:Tag {name:$tagname})
      MERGE (u)-[ta:TAGGEDAS]->(t)
      ON CREATE SET ta.upvotes = $upvotes
      ON MATCH SET ta.upvotes = ta.upvotes + $upvotes
      RETURN ta
      `;
        }
        session
            .run(query, params)
            .then(function (result) {
                console.log(result);
                socket.emit('tagApplied', result);
                console.log(result.records[0]["_fields"][1]);
                //session.close();
            })
            .catch(function (error) {
                console.log(error);
                socket.emit('noDataFound', 'tagPostOrUser fucked up');
            });
    });

    socket.on('upvoteTag', function (upvoteTagStuff) {
        var params = {
            userID: upvoteTagStuff.userID,
            tagname: upvoteTagStuff.tagname,
            postID: upvoteTagStuff.postID
        };
        var query = `
      MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})-[ta:TAGGEDAS]->(m:Tag {name:$tagname})
      SET u.memecoin = u.memecoin - 1
      SET p.memecoinsspent = p.memecoinsspent + 1
      SET ta.upvotes = ta.upvotes + 1
      RETURN ta
      `;
        session
            .run(query, params)
            .then(function (result) {
                console.log(result);
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    ///////////////////
    //HARVEST POST               
    //////////////STILL NEED TO MAKE IT SO YOU CANT GET NEGATIVE PROFIT
    socket.on('harvestPost', function (postID, userID) {
        console.log("HARVEST POST");
        var params = {
            postID: postID,
            userID: userID
        };
        var query = `
    MATCH (u:User {userID:$userID}), (p:Post {postID:$postID})
    SET u.memecoin = u.memecoin + abs(p.upvotes-p.downvotes)
    DETACH DELETE p
    `;
        session
            .run(query, params)
            .then(function (result) {
                result.records.forEach(function (record) {
                    console.log(record);
                });
                socket.emit('postHarvested');
                // session.close();
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    ////////////////////     (u:User {userID:$userID})
    // SET u.memecoin = u.memecoin - 50
    //CURRENT CENSOR COST = 50
    ///////////////////
    socket.on('censorAttempt', function (dataFromClient) {
        console.log("ATTEMPT CENSOR POST");
        var params = {
            postID: parseInt(dataFromClient.postID),
            userID: parseInt(dataFromClient.userID)
        };
        var query = `
    MATCH (p:Post {postID:$postID}), (u:User {userID:$userID})
    SET p.shields = p.shields - 1
    SET p.memecoinsspent = p.memecoinsspent + 50
    SET u.memecoin = u.memecoin - 50
    RETURN p.shields
    `;
        session
            .run(query, params)
            .then(function (result) {
                if (result.records[0] == null) {
                    console.log('THAT POST DOESNT EXIST');
                    socket.emit('userChecked', { task: 'failedCensoringCauseOther', userID: params.userID, postID: params.postID, cost: 50 });
                } else {
                    var shields = parseInt(result.records[0]['_fields'][0]);
                    console.log(shields);
                    if (shields >= 0) {
                        console.log("STILL HAD AT LEAST 1 SHIELD REMAIINING");
                        socket.emit('userChecked', { task: 'failedCensoringCauseShield', userID: params.userID, postID: params.postID, cost: shields + 1 });
                    } else {
                        console.log("CENSOR SUCCESS");
                        socket.emit('userChecked', { task: 'successfulCensoring', userID: params.userID, postID: params.postID, cost: 50 });
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
                socket.emit('userChecked', { task: 'failedCensoringCauseOther', userID: params.userID, postID: params.postID, cost: 50 });
            });
    });

    socket.on('censorSuccess', function (dataFromClient) {
        console.log("CENSOR POST");
        var params = {
            postID: parseInt(dataFromClient.postID),
            userID: parseInt(dataFromClient.userID)
        };
        var query = `
    MATCH (p:Post {postID:$postID})
    DETACH DELETE p
    `;
        session
            .run(query, params)
            .then(function (result) {
                console.log("DELETED POST FROM DATBASE")
            })
            .catch(function (error) {
                console.log(error);
                socket.emit('userChecked', { task: 'failedCensoringCauseOther', userID: params.userID, postID: params.postID, cost: 50 });
            });
    });

    ///////////////////////
    //CURRENT SHIELD COST = 25
    /////////////////////
    socket.on('shieldPost', function (dataFromClient) {
        var params = {
            postID: parseInt(dataFromClient.postID),
            userID: parseInt(dataFromClient.userID)
        };
        var query = `
      MATCH (p:Post {postID:$postID}), (u:User {userID:$userID})
      SET p.shields = p.shields + 1
      SET p.memecoinsspent = p.memecoinsspent + 25
      SET u.memecoin = u.memecoin - 25
      RETURN p, u
      `;
        session
            .run(query, params)
            .then(function (result) {
                console.log(result);
                socket.emit('appliedShield', result);
                console.log(result.records[0]["_fields"][1]);
                //session.close();
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    ///////////////
    //FAVORITE POST
    socket.on('favorite', function (dataFromClient) {
        console.log(dataFromClient);
        switch (dataFromClient.faveType) {
            case 0:
                var query = `
        MATCH (n:Post {postID:$postID}), (m:User {userID:$userID})
        MERGE (n)<-[r:FAVORITED]-(m)
        RETURN n, m
        `;
                session
                    .run(query, { postID: parseInt(dataFromClient.postidORtagnameORuserid), userID: dataFromClient.userid })
                    .then(function (result) {
                        console.log(result);
                        socket.emit('userChecked', { task: 'favoritedPost', userID: dataFromClient.userid, postID: dataFromClient.postidORtagnameORuserid, cost: 50 });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            case 1:
                break;
            case 2:
                break;
        }

    });


    //////////////
    //DELETE POST
    socket.on('deletePost', function (dataFromClient) {
        console.log(dataFromClient);
    });

    ///////////////////
    //REPORT
    //TAKEN CARE OF IN POST SECTION

    //////////////////
    //SEND MESSAGE TO COUNSELOR




    ////////////
    //FOLLOW LEADER
    socket.on('followuser', function (dataFromClient) {
        console.log(dataFromClient);
        followLeader(dataFromClient);
    });


    ////////////////
    //VIEW USER INFO



    ///////////////////////
    //RECOMMEND POST
    socket.on('recommendPost', function (dataFromClient) {
        console.log(dataFromClient);
        var query = `
        MATCH (n:Post {postID:$postID}), (m:User {userID:$userID})
        MERGE (n)<-[r:RECOMMENDS]-(m)
        RETURN n, m
        `;
        session
            .run(query, { postID: parseInt(dataFromClient.postID), userID: dataFromClient.userID })
            .then(function (result) {
                console.log(result);
                socket.emit('userChecked', { task: 'favoritedPost', userID: dataFromClient.userid, postID: dataFromClient.postidORtagnameORuserid, cost: 0 });
            })
            .catch(function (error) {
                console.log(error);
            });
    });
});

// server.listen(80,function(){console.log('Meme War app listening on port 80 like a slut!');});
//httpServer.listen(3030,function(){console.log('Meme War app listeningn on port 3000 like a prude!');});
// server.listen(443,function(){console.log('Meme War app listeningn on port 443 like a prude!');});