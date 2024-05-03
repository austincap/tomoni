
const socket = io();
var postsOnThisPage = []


// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');

// // Your private key goes here
// const myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');

// // From that we can calculate your public key (which doubles as your wallet address)
// const myWalletAddress = myKey.getPublic('hex');

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bubble-chart
function BubbleChart(data, {
  name = ([x]) => x, // alias for label
  label = name, // given d in data, returns text to display on the bubble
  value = ([, y]) => y, // given d in data, returns a quantitative size
  group, // given d in data, returns a categorical value for color
  title, // given d in data, returns text to show on hover
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links, if any
  width = 640, // outer width, in pixels
  height = width, // outer height, in pixels
  padding = 3, // padding between circles
  margin = 1, // default margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  groups, // array of group names (the domain of the color scale)
  colors = d3.schemeTableau10, // an array of colors (for groups)
  fill = "#ccc", // a static fill color, if no group channel is specified
  fillOpacity = 0.7, // the fill opacity of the bubbles
  stroke, // a static stroke around the bubbles
  strokeWidth, // the stroke width around the bubbles, if any
  strokeOpacity, // the stroke opacity around the bubbles, if any
} = {}) {
  // Compute the values.
  const D = d3.map(data, d => d);
  const V = d3.map(data, value);
  const G = group == null ? null : d3.map(data, group);
  const I = d3.range(V.length).filter(i => V[i] > 0);

  // Unique the groups.
  if (G && groups === undefined) groups = I.map(i => G[i]);
  groups = G && new d3.InternSet(groups);

  // Construct scales.
  const color = G && d3.scaleOrdinal(groups, colors);

  // Compute labels and titles.
  const L = label == null ? null : d3.map(data, label);
  const T = title === undefined ? L : title == null ? null : d3.map(data, title);

  // Compute layout: create a 1-deep hierarchy, and pack it.
  const root = d3.pack()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .padding(padding)
    (d3.hierarchy({children: I})
        .sum(i => V[i]));



  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");


  const leaf = svg.selectAll("a")
    .data(root.leaves())
    .join("a")
      .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.x},${d.y})`);

  leaf.append("circle")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
      .attr("fill-opacity", fillOpacity)
      .attr("r", d => d.r);

  if (T) leaf.append("title")
      .text(d => T[d.data]);

  if (L) {
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    leaf.append("clipPath")
        .attr("id", d => `${uid}-clip-${d.data}`)
      .append("circle")
        .attr("r", d => d.r);

    leaf.append("text")
        .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
      .selectAll("tspan")
      .data(d => `${L[d.data]}`.split(/\n/g))
      .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
        .text(d => d);
  }

  return Object.assign(svg.node(), {scales: {color}});
}



function onloadFunction(){
    var isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i);
    if(isMobile){ console.log("MOBILE"); }
    else { console.log("NOT MOBILE"); }

    paper.install(window);
 
    paper.setup('myCanvas');

    

    if (getQueryParam("post") !== "") {
        //
        socket.emit("viewpost", getQueryParam("post"));
    } else if (getQueryParam("user") !== "") {
        console.log('USER');
        socket.emit('viewuser', getQueryParam("user"));
    } else if (getQueryParam("tag") !== "") {
        //
        socket.emit('requestPostsWithTag', getQueryParam("tag"));
    } else if (getQueryParam("sort") == "like") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestSortedPosts', getQueryParam("sort"), getQueryParam("page"));
        } else {
            socket.emit('requestSortedPosts', getQueryParam("sort"), "0");
        }
    } else if (getQueryParam("sort") == "rand") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestRandPosts', getQueryParam("rand"), getQueryParam("page"));
        } else {
            socket.emit('requestRandPosts', getQueryParam("rand"), "0");
        }
    } else if (getQueryParam("sort") == "recd") {
        if (getQueryParam("page") !== "") {
            socket.emit('requestRecommendedPosts', getQueryParam("page"));
        } else {
            socket.emit('requestRecommendedPosts', "0");
        }
    } else if (getQueryParam("sort") == "multi") {
        socket.emit('requestMulti');
    } else if(getQueryParam("page")!==""){
        socket.emit('requestTop20Posts', getQueryParam("page"));
      }else{
        socket.emit('requestTop20Posts', '0');
      }
    
    console.log(document.URL);
    //$('#gameview').css('display', 'none');

    d3.selectAll('.datamaps-subunit')
        .on('mouseover', function (d) {
            //var $this = d3.select(this);
            console.log(d.id);
        });

    window.setTimeout(function(){
        if (sessionStorage.getItem('userID') !== null) {
            var rollString = sessionStorage.getItem('userroles');
            $('.profallow').css('display', 'inline');
            addRoles(sessionStorage.getItem('userroles'));
            console.log(sessionStorage.getItem('userID'));
            $('#signinstuff').css('display', 'none');
            $('#userprofilestuff').css('display', 'inline-block');
            $('#accountButton').html("<span userid="+sessionStorage.getItem('userID')+">"+sessionStorage.getItem('username')+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");
            $('#userID-newpost').val(sessionStorage.getItem('userID'));
            $('#userID-reply').val(sessionStorage.getItem('userID'));
            $('#posttype-newpost').val("text_post");
            $('#posttype-reply').val("text_post");
            //$(".explorers-only").css("display", "block!important");
            $('#currentrole').html(getFirstRole(sessionStorage.getItem('userroles')));
      }else{
        console.log(sessionStorage.getItem('userID'));
        $('#userID-newpost').val("ANON");
        $('#userID-reply').val("ANON");
        $('#posttype-newpost').val("text_post");
        $('#posttype-reply').val("text_post");
      }
        
        //else {
        //    console.log("FE");
        //    (Boolean(sessionStorage.getItem("Lurker"))) ? $(".lurkers-only").css("display", "block") : null ;
        //    (sessionStorage.getItem("Pollster")=="true") ? $(".pollsters-only").css("display", "block") : null;
        //}
      document.querySelectorAll('img').forEach(function(img){
      img.onerror = function(){this.style.display='none';};
      });
       
    }, 800);
  }
  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }
    // map dimensions
    var ROWS = 50;
    var COLS = 50;
    // font size
    var FONT = 36;
    
    // the structure of the map
var randommap;
    // the ascii display, as a 2d array of characters
    var asciidisplay;
    // a list of all actors, 0 is the player
    var player;
    var actorList;
    var livingEnemies;
    // points to each actor in its position, for quick searching
    var actorMap;
    var ACTORS = 11; // number of actors per level, including player
function openGameView(){

    function create() {
      // init keyboard commands
      game.input.keyboard.addCallbacks(null, null, onKeyUp);

      // initialize map
      initMap();

      // initialize ascii display
      asciidisplay = [];
      for (var y = 0; y < ROWS; y++) {
        var newRow = [];
        asciidisplay.push(newRow);
        for (var x = 0; x < COLS; x++)
          newRow.push(initCell('', x, y));
      }

      // initialize actors
      initActors();

      // draw level
      drawMap();
      drawActors();
    }

    function initCell(chr, x, y) {
      // add a single cell in a given position to the ascii display
      var style = {
        font: FONT + "px monospace",
        fill: "#fff"
      };
      return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);
    }

    function initMap() {
      console.log(postsOnThisPage);
      var contentBucket = '';
      var postcount = 10;
      for (var i=0; i<postcount; i++){
        contentBucket += String(postsOnThisPage[i]['content']);
      }
      console.log(contentBucket);
      // create a new random map
      randommap = [];
      for (var y = 0; y < ROWS; y++) {
        var newRow = [];
        for (var x = 0; x < COLS; x++) {
          if (Math.random() > 0.8) 
            newRow.push('#');
          else 
            newRow.push('.');
        }
          randommap.push(newRow);
      }
    }

    function drawMap() {
      for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++)
            asciidisplay[y][x].content = randommap[y][x];
    }
    function drawActors() {
      for (var a in actorList) {
        if (actorList[a] != null && actorList[a].hp > 0) 
          asciidisplay[actorList[a].y][actorList[a].x].content = a == 0 ? '' + player.hp : 'e';
      }
    }
    function canGo(actor,dir) {
      return  actor.x+dir.x >= 0 &&
          actor.x+dir.x <= COLS - 1 &&
          actor.y+dir.y >= 0 &&
          actor.y+dir.y <= ROWS - 1 &&
          randommap[actor.y+dir.y][actor.x +dir.x] == '.';
    }
    function moveTo(actor, dir) {
      // check if actor can move in the given direction
      if (!canGo(actor,dir)) 
        return false;
      
      // moves actor to the new location
      var newKey = (actor.y + dir.y) +'_' + (actor.x + dir.x);
      // if the destination tile has an actor in it 
      if (actorMap[newKey] != null) {
        //decrement hitpoints of the actor at the destination tile
        var victim = actorMap[newKey];
        victim.hp--;
        
        // if it's dead remove its reference 
        if (victim.hp == 0) {
          actorMap[newKey]= null;
          actorList[actorList.indexOf(victim)]=null;
          if(victim!=player) {
            livingEnemies--;
            if (livingEnemies == 0) {
              // victory message
              var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill : '#2e2', align: "center" } );
              victory.anchor.setTo(0.5,0.5);
            }
          }
        }
      } else {
        // remove reference to the actor's old position
        actorMap[actor.y + '_' + actor.x]= null;
        
        // update position
        actor.y+=dir.y;
        actor.x+=dir.x;

        // add reference to the actor's new position
        actorMap[actor.y + '_' + actor.x]=actor;
      }
      return true;
    }

    function onKeyUp(event) {
      // draw map to overwrite previous actors positions
      drawMap();
      
      // act on player input
      var acted = false;
      switch (event.keyCode) {
        case Phaser.Keyboard.LEFT:
          acted = moveTo(player, {x:-1, y:0});
          break;
          
        case Phaser.Keyboard.RIGHT:
          acted = moveTo(player,{x:1, y:0});
          break;
          
        case Phaser.Keyboard.UP:
          acted = moveTo(player, {x:0, y:-1});
          break;

        case Phaser.Keyboard.DOWN:
          acted = moveTo(player, {x:0, y:1});
          break;
      }
      
      // enemies act every time the player does
      if (acted)
        for (var enemy in actorList) {
          // skip the player
          if(enemy==0)
            continue;
          
          var e = actorList[enemy];
          if (e != null)
            aiAct(e);
        }
      
      // draw actors in new positions
      drawActors();
    }
    function aiAct(actor) {
      var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];  
      var dx = player.x - actor.x;
      var dy = player.y - actor.y;
      
      // if player is far away, walk randomly
      if (Math.abs(dx) + Math.abs(dy) > 6)
        // try to walk in random directions until you succeed once
        while (!moveTo(actor, directions[randomInt(directions.length)])) { };
      
      // otherwise walk towards player
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          // left
          moveTo(actor, directions[0]);
        } else {
          // right
          moveTo(actor, directions[1]);
        }
      } else {
        if (dy < 0) {
          // up
          moveTo(actor, directions[2]);
        } else {
          // down
          moveTo(actor, directions[3]);
        }
      }
      if (player.hp < 1) {
        // game over message
        var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill : '#e22', align: "center" } );
        gameOver.anchor.setTo(0.5,0.5);
      }
    }

    function initActors() {
      console.log(postsOnThisPage);
      // create actors at random locations
      actorList = [];
      actorMap = {};
      for (var e = 0; e < ACTORS; e++) {
        // create new actor
        var actor = {
          x: 0,
          y: 0,
          hp: e == 0 ? 3 : 1,
          link:postsOnThisPage[randomInt(10)]['content']
        };
        do {
          // pick a random position that is both a floor and not occupied
          actor.y = randomInt(ROWS);
          actor.x = randomInt(COLS);
        } while (randommap[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null);

        // add references to the actor to the actors list & map
        actorMap[actor.y + "_" + actor.x] = actor;
        actorList.push(actor);
      }

      // the player is the first actor in the list
      player = actorList[0];
      livingEnemies = ACTORS - 1;
    }
    $("#big-container").hide();
    $( "#gameview" ).show();
    var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.AUTO, null, { create: create });
    //window.location.href = "game.html";
}




(function() {
  var canvas = document.getElementById('basicGlobe');
  var planet = planetaryjs.planet();
  // Loading this plugin technically happens automatically,
  // but we need to specify the path to the `world-110m.json` file.
  planet.loadPlugin(planetaryjs.plugins.earth({
    topojson: { file: 'world-110m.json' }
  }));
  // Scale the planet's radius to half the canvas' size
  // and move it to the center of the canvas.
  planet.projection
    .scale(canvas.width / 2)
    .translate([canvas.width / 2, canvas.height / 2]);
  planet.draw(canvas);
})();


var mapDisplay = L.map('mapDisplay').setView([51.505, -0.09], 10);
const tiles2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapDisplay);

function openHistoryView(){
  $('#entryContainer').hide();
    $('#historyview').show();

  var globe = planetaryjs.planet();
  // Load our custom `autorotate` plugin; see below.
  globe.loadPlugin(autorotate(10));
  // The `earth` plugin draws the oceans and the land; it's actually
  // a combination of several separate built-in plugins.
  //
  // Note that we're loading a special TopoJSON file
  // (world-110m-withlakes.json) so we can render lakes.
  globe.loadPlugin(planetaryjs.plugins.earth({
    topojson: { file:   'world-110m-withlakes.json' },
    oceans:   { fill:   '#000080' },
    land:     { fill:   '#339966' },
    borders:  { stroke: '#008000' }
  }));
  // Load our custom `lakes` plugin to draw lakes; see below.
  globe.loadPlugin(lakes({
    fill: '#000080'
  }));
  // The `pings` plugin draws animated pings on the globe.
  globe.loadPlugin(planetaryjs.plugins.pings());
  // The `zoom` and `drag` plugins enable
  // manipulating the globe with the mouse.
  globe.loadPlugin(planetaryjs.plugins.zoom({
    scaleExtent: [100, 300]
  }));
  globe.loadPlugin(planetaryjs.plugins.drag({
    // Dragging the globe should pause the
    // automatic rotation until we release the mouse.
    onDragStart: function() {
      this.plugins.autorotate.pause();
    },
    onDragEnd: function() {
      this.plugins.autorotate.resume();
    }
  }));
  // Set up the globe's initial scale, offset, and rotation.
  globe.projection.scale(175).translate([175, 175]).rotate([0, -10, 0]);

  // Every few hundred milliseconds, we'll draw another random ping.
  var colors = ['red', 'yellow', 'white', 'orange', 'green', 'cyan', 'pink'];
  setInterval(function() {
    var lat = Math.random() * 170 - 85;
    var lng = Math.random() * 360 - 180;
    var color = colors[Math.floor(Math.random() * colors.length)];
    globe.plugins.pings.add(lng, lat, { color: color, ttl: 2000, angle: Math.random() * 10 });
  }, 150);

  var canvas = document.getElementById('rotatingGlobe');
  // Special code to handle high-density displays (e.g. retina, some phones)
  // In the future, Planetary.js will handle this by itself (or via a plugin).
  if (window.devicePixelRatio == 2) {
    canvas.width = 800;
    canvas.height = 800;
    context = canvas.getContext('2d');
    context.scale(2, 2);
  }
  // Draw that globe!
  globe.draw(canvas);

  // This plugin will automatically rotate the globe around its vertical
  // axis a configured number of degrees every second.
  function autorotate(degPerSec) {
    // Planetary.js plugins are functions that take a `planet` instance
    // as an argument...
    return function(planet) {
      var lastTick = null;
      var paused = false;
      planet.plugins.autorotate = {
        pause:  function() { paused = true;  },
        resume: function() { paused = false; }
      };
      // ...and configure hooks into certain pieces of its lifecycle.
      planet.onDraw(function() {
        if (paused || !lastTick) {
          lastTick = new Date();
        } else {
          var now = new Date();
          var delta = now - lastTick;
          // This plugin uses the built-in projection (provided by D3)
          // to rotate the globe each time we draw it.
          var rotation = planet.projection.rotate();
          rotation[0] += degPerSec * delta / 1000;
          if (rotation[0] >= 180) rotation[0] -= 360;
          planet.projection.rotate(rotation);
          lastTick = now;
        }
      });
    };
  };

  // This plugin takes lake data from the special
  // TopoJSON we're loading and draws them on the map.
  function lakes(options) {
    options = options || {};
    var lakes = null;

    return function(planet) {
      planet.onInit(function() {
        // We can access the data loaded from the TopoJSON plugin
        // on its namespace on `planet.plugins`. We're loading a custom
        // TopoJSON file with an object called "ne_110m_lakes".
        var world = planet.plugins.topojson.world;
        lakes = topojson.feature(world, world.objects.ne_110m_lakes);
      });

      planet.onDraw(function() {
        planet.withSavedContext(function(context) {
          context.beginPath();
          planet.path.context(context)(lakes);
          context.fillStyle = options.fill || 'black';
          context.fill();
        });
      });
    };
  }; 
}





var root = document.documentElement;
const lists = document.querySelectorAll('.hs');

lists.forEach(el => {
    const listItems = el.querySelectorAll('li');
    const n = el.children.length;
    el.style.setProperty('--total', n);
});


function signout(thisButton) {
    sessionStorage.clear();
    $('#accountButton').html("Account");
    $('#signout').css('display', 'none');
    location.reload("localhost");
}
function registerNewUser() {
    console.log($('#rolenumbers').html());
    console.log($('#submitRoleButton').html());
    var registrationData = {
        username: $('#signInName').val(),
        password: $('#passwordvalue').val(),
        newuserRoles: $('#rolenumbers').html(),
        role: $('#submitRoleButton').html()
    };
    socket.emit('registerNewUser', registrationData);
}
function loginUser(){
  var logindata = {
    username: $('#signInName').val(),
    password: $('#passwordvalue').val() 
  };
  socket.emit('login', logindata);
}
function clickAccountButton(thisButton){
  console.log($(thisButton).children()[0]);
  console.log($($(thisButton).children()[0]).attr('userid'));
  if($(thisButton).html()=="Account"){
      $('#signinstuff').css('display', 'inline-block');
      $('#signup-overlay-box').css('display', 'inline-block');
      $(thisButton).html("Close");
  }else if($(thisButton).html()=="Close"){
      $('#signinstuff').css('display', 'none');
      $(thisButton).html("Account");
  }else if(String($($(thisButton).children()[0]).attr('userid'))==sessionStorage.getItem('userID')){
      console.log("ETE");
      viewProfilePage(sessionStorage.getItem('userID'));
  }
}
function addRoles(rollString) {
    console.log("ADD ROLES");
    console.log(sessionStorage.getItem('userroles'));

    if (rollString[0] == '1') {
        $(".lurkers-only").css("display", "none");
    }
    if (rollString[1] == '1') {
        $(".taggers-only").css("display", "block");
    }
    if (rollString[2] == '1') {
        $(".painters-only").css("display", "block");
        document.querySelectorAll('.painters-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
    }
    if (rollString[3] == '1') {
        $(".pollsters-only").css("display", "block");
    }
    if (rollString[4] == '1') {
        $(".tastemakers-only").css("display", "block");
        document.querySelectorAll('.tastemakers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
    }
    if (rollString[5] == '1') {
        document.querySelectorAll('.explorers-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
    }
    if (rollString[6] == '1') {
        $(".summoners-only").css("display", "block");
        document.querySelectorAll('.summoners-only').forEach(function (elem) { elem.style.visibility = 'visible'; });
        
    }
    if (rollString[7] == '1') {
        $(".protectors-only").css("display", "block");
    }
    if (rollString[8] == '1') {
        $(".arbitrators-only").css("display", "block");
    }
    if (rollString[9] == '1') {
        $(".stalkers-only").css("display", "block");
    }
    if (rollString[10] == '1') {
        $(".editors-only").css("display", "block");
    }
    if (rollString[11] == '1') {
        $(".leaders-only").css("display", "block");
    }
    if (rollString[12] == '1') {
        $(".counselors-only").css("display", "block");
    }
    if (rollString[13] == '1') {
        $(".founders-only").css("display", "block");
    }
    if (rollString[14] == '1') {
        $(".algomancers-only").css("display", "block");
    }
}
function getFirstRole(rollString) {
    for (let i = 0; i < rollString.length; i++) {
        if (rollString[i] == '1') {
            switch (i) {
                case 0:
                    return "Lurker";
                case 1:
                    return "Tagger";
                case 2:
                    return "Painter";
                case 3:
                    return "Pollster";
                case 4:
                    return "Tastemaker";
                case 5:
                    return "Explorer";
                case 6:
                    return "Summoner";
                case 7:
                    return "Silencer";
                case 8:
                    return "Arbitrator";
                case 9:
                    return "Stalker";
                case 10:
                    return "Editor";
                case 11:
                    return "Leader";
                case 12:
                    return "Counselor";
                case 13:
                    return "Founder";
                case 14:
                    return "Algomancer";
                default:
                    return "No thing found";
            }
        } 
    }
}

function selectThisRole(roleName) {
    console.log(roleName);
    var rolenumber = '000000000000000';
    switch (roleName) {
        case "Lurker":
            rolenumber = '100000000000000';
            break;
        case "Tagger":
            rolenumber = '010000000000000';
            break;
        case "Painter":
            rolenumber = '001000000000000';
            break;
        case "Pollster":
            rolenumber = '000100000000000';
            break;
        case "Tastemaker":
            rolenumber = '000010000000000';
            break;
        case "Explorer":
            rolenumber = '000001000000000';
            break;
        case "Summoner":
            rolenumber = '000000100000000';
            break;
        case "Protector":
            rolenumber = '000000010000000';
            break;
        case "Arbitrator":
            rolenumber = '000000001000000';
            break;
        case "Stalker":
            rolenumber = '000000000100000';
            break;
        case "Editor":
            rolenumber = '000000000010000';
            break;
        case "Leader":
            rolenumber = '000000000001000';
            break;
        case "Counselor":
            rolenumber = '000000000000100';
            break;
        case "Founder":
            rolenumber = '000000000000010';
            break;
        case "Algomancer":
            rolenumber = '000000000000001';
            break;
        default:
            rolenumber = '000000000000000';
            break;
    }
    console.log(rolenumber);
    $('#rolenumbers').text(rolenumber);
    $('#submitRoleButton').text(roleName);
}
function contextButtonFunction(currentContext){
  console.log(currentContext);
  switch(currentContext){
      case 'Home':
          $('#gridview').css('display', 'none');
          d3.select('svg').selectAll('*').remove();
          $('#d3frame').css('display', 'none');
          document.getElementById('contextButton').innerHTML = 'Alt';
          sessionStorage.setItem('currentPage', 'home');
          socket.emit('requestTop20Posts', 0);
          break;
    case 'Alt':
        $('#entryContainer').empty();
        sessionStorage.setItem('currentPage', 'alt');
        $('#d3frame').css('display', 'block');
        document.getElementById('contextButton').innerHTML = 'Grid';
        socket.emit('retrieveDatabase');
        break;
    case 'Grid':
        $('#entryContainer').empty();
        d3.select('svg').selectAll('*').remove();
          $('#d3frame').css('display', 'none');
          $('#gridview').css('display', 'grid');
        sessionStorage.setItem('currentPage', 'grid');
        document.getElementById('contextButton').innerHTML = 'Home';
        socket.emit('retrieveDatabaseGrid');
        break;
  }
}
function returnChooseRoleBox() {
    $('#signup-overlay-box').css('display', 'none');
}


function getAllPostsWithThisTag(tagname){
  sessionStorage.setItem('currentPage', 'tag');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?tag='+tagname;
  //socket.emit("requestPostsWithTag", tagname);
}
function viewPost(postID){
  sessionStorage.setItem('currentPage', 'post');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?post='+postID;
  // socket.emit('viewpost', postID);
}
function viewProfilePage(userID){
  sessionStorage.setItem('currentPage', 'user');
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?user='+userID;
  //socket.emit('viewuser', sessionStorage.getItem('userID'));
}


function showNewPollBox() {
    $('#userID-poll').val(sessionStorage.getItem('userID'));
    $('#posttype-poll').val('poll_post');
    var newPollContainer = $('#pollContainer');
    newPollContainer.detach();
    newPollContainer.appendTo('body');
    newPollContainer.css('display', 'block');
}
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}
function addPollOption() {
    var pollOptionCounter = String($("#pollOptionContainer > textarea").length + 1);
    if (parseInt(pollOptionCounter) > 6) { console.log("NO MORE"); }
    else {
        var newOptionId = "uploadPollOption-" + pollOptionCounter;
        var newOptionName = "pollOption" + pollOptionCounter;
        var foo = createElementFromHTML('<textarea type="text" style="height:30px;" placeholder="write a poll option here" id="' + newOptionId + '" name="' + newOptionName + '" maxlength="800"></textarea>');
        $('#pollOptionContainer').append(foo);
        $('#pollOptionContainer').append(document.createElement("br"));
    }
}
function returnPollBox() {
    $('#pollContainer').css('display', 'none');
}
function submitNewPoll() {
    console.log("submit poll");
    $("#uploadTitle-poll").empty();
    $("#uploadPollOption-1").empty();
    $("#uploadPollOption-2").empty();
    $("#uploadPollOption-3").empty();
    $("#uploadPollOption-4").empty();
    $("#uploadPollOption-5").empty();
    $("#uploadPollOption-6").empty();
    $("#sampleFile-poll").empty();
    document.querySelector('#myimg').src = "";
    returnPollBox();
}


function showAlgomancyBox() {

    $('#algomancy-overlay-box').css('display', 'block');
    $("#likeweight").bind('keyup change click', function (e) {
        if (!$(this).data("previousValue") ||
            $(this).data("previousValue") != $(this).val()
        ) {
            console.log("changed");
            $(this).data("previousValue", $(this).val());
        }
    });
    $("#likeweight").each(function () {
        $(this).data("previousValue", $(this).val());
    });
}
function submitNewAlgomance() {
    console.log("ALGOMANCE SENT");
    $("#likeweight").empty();
    $("#sizeweight").empty();
    $("#viewweight").empty();
    $("#timeweight").empty();
    $("#commentweight").empty();
    $("#userweight").empty();
    returnAlgomancyBox();
}
function returnAlgomancyBox() {
    $('#algomancy-overlay-box').css('display', 'none');
}


function showPaintBox(postid) {
    console.log("SHOW POSTID");
    console.log(postid);
    $('#paintPostId').val(postid);
    $('#paintUserId').val(sessionStorage.getItem('userID'));
    $('#paintContainer').css('display', 'block');
}
function returnPaintBox() {
    $('#paintContainer').css('display', 'none');
}
function submitNewPaint() {
    console.log("SUBMIT PAINT CHANGE");
}


function showShieldCensorHarvestBox(zeroIsCensorOneIsShieldTwoIsHarvest, postElement){
  var userID = (sessionStorage.getItem('userID') !== null) ? sessionStorage.getItem('userID') : "ANON";
  console.log(userID);
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnReplyBox();
  returnShareBox();
  if(zeroIsCensorOneIsShieldTwoIsHarvest==1){
    $('.censormessage').css('display', 'none');
    $('.shieldmessage').css('display', 'block');  
    $('.harvestmessage').css('display', 'none');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'shield', data:'EEEEEEEEEEEE'});
  }else if(zeroIsCensorOneIsShieldTwoIsHarvest==0){
    $('.censormessage').css('display', 'block');
    $('.shieldmessage').css('display', 'none');
    $('.harvestmessage').css('display', 'none');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'censor', data:'EEEEEEEEEEEE'});
  }else{
    $('.censormessage').css('display', 'none');
    $('.shieldmessage').css('display', 'none');
    $('.harvestmessage').css('display', 'block');
    socket.emit('check', {userID:userID, postID:postElement, taskToCheck:'harvest', data:'EEEEEEEEEEEE'});
  }
  var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
  censorShieldHarvestContainer.detach();
  console.log(postElement);
  console.log($('#'+postElement));
  censorShieldHarvestContainer.appendTo($('#'+String(postElement)));
  censorShieldHarvestContainer.css('display', 'block');
}
function returnShieldCensorHarvestBox(){
  var censorShieldHarvestContainer = $('#censorShieldHarvestContainer');
  censorShieldHarvestContainer.detach();
  censorShieldHarvestContainer.appendTo('#divStorage');
  censorShieldHarvestContainer.css('display', 'none');
}

function showShareBox(postElement){
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnReplyBox();
  var shareButtonContainer = $('#shareButtonContainer');
  shareButtonContainer.detach();
  shareButtonContainer.appendTo('#'+String(postElement.attr('postID')));
  shareButtonContainer.css('display', 'block');
}
function returnShareBox(){
  var shareButtonContainer = $('#shareButtonContainer');
  shareButtonContainer.detach();
  shareButtonContainer.appendTo('#divStorage');
  shareButtonContainer.css('display', 'none');
}

function showReplyBox(postElement){
  console.log(postElement.attr('postID'));
  var postID = String(postElement.attr('postID'));
  console.log($(postElement).children('.post').children('.post-helper').children('.post-title').html());
  returnTagBox();
  returnNewPostBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#replyuploaderholder');
  // fileuploader.css('display', 'block');
  $('#replytoPostID').val(postID);
  console.log(String($(postElement).children('.post').children('.post-helper').children('.post-title').html()));
  $('#title-reply').val(String($(postElement).children('.post').children('.post-helper').children('.post-title').html()));
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#'+postID);
  replyContainer.css('display', 'block');
}
function returnReplyBox(){
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#divStorage');
  // fileuploader.css('display', 'none');
  var replyContainer = $('#replyContainer');
  replyContainer.detach();
  replyContainer.appendTo('#divStorage');
  replyContainer.css('display', 'none');
}

function showTagBox(postID){
  console.log(postID);
  socket.emit('requestTagsForPost', postID);
  returnNewPostBox();
  returnReplyBox();
  returnNewStatsBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var tagContainer = $('#tagContainer');
  tagContainer.detach();
  tagContainer.appendTo('#'+String(postID));
  tagContainer.css('display', 'block');
}
function returnTagBox(){
  var tagContainer = $('#tagContainer');
  tagContainer.detach();
  tagContainer.appendTo('#divStorage');
  tagContainer.css('display', 'none');
}

function showNewPostBox(){
  returnNewStatsBox();
  returnTagBox();
  returnReplyBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#newpostuploaderholder');
  // fileuploader.css('display', 'block');
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('body');
    newPostContainer.css('display', 'block');
    $('#userroles-newpost:text').val(sessionStorage.getItem('userroles'));
    if (sessionStorage.getItem('userroles')[11] == "1") {
        $('#leader-newpost:text').val("leader");
    }
}
function returnNewPostBox(){
  // var fileuploader = $('#fileuploader');
  // fileuploader.detach();
  // fileuploader.appendTo('#divStorage');
  // fileuploader.css('display', 'none');
  var newPostContainer = $('#newPostContainer');
  newPostContainer.detach();
  newPostContainer.appendTo('#divStorage');
  newPostContainer.css('display', 'none');
}

function showVoteBox(postID, upIfTrue){
  var postID = parseInt(postID);
    var userID = parseInt(sessionStorage.getItem('userID'));
    var userrole = sessionStorage.getItem('role');
  returnTagBox();
  returnReplyBox();
  returnNewPostBox();
  returnShieldCensorHarvestBox();
  returnShareBox();
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#'+String(postID));
  console.log(postsOnThisPage);
  console.log('show vote box');
  var postData = postsOnThisPage.find(obj => { return obj.postID === String(postID) });
  console.log(postData);
  newStatsContainer.css('display', 'block');
  $('#upvotestat').html(postData.up);
  $('#downvotestat').html(postData.down);
  console.log(userID, postID, upIfTrue)
  socket.emit('check', {taskToCheck:'vote', userID:userID, postID:postID, data:upIfTrue, role:userrole});
}
function returnNewStatsBox(){
  var newStatsContainer = $('#newStatsContainer');
  newStatsContainer.detach();
  newStatsContainer.appendTo('#divStorage');
  newStatsContainer.css('display', 'none');
}

function confirmCensor(postID){
  if(sessionStorage.getItem('memecoin') > 50){
    var dataPacket = {
      userID: sessionStorage.getItem('userID'),
      postID: postID
    };
    socket.emit('censorAttempt', dataPacket);
    //$('#censorShieldHarvestContainer').css('display', 'none');
  }
}
function confirmHarvest(postElement){
  console.log(postElement);
  socket.emit('harvestPost', postElement, sessionStorage.getItem("userID"));
}


function deleteThisPost(postID) {
    socket.emit('deletePost', postID);
    //returnReportBox();
}
function showAdminBox(postID) {
    console.log("SHOW POSTID");
    console.log(postID);
    $('#adminToolsContainer').css('display', 'block');
    var newAdminContainer = $('#adminToolsContainer');
    newAdminContainer.detach();
    newAdminContainer.appendTo('body');
    newAdminContainer.css('display', 'block');
}


function submitNewPost(){
  console.log("submit");
  $("#new-text-post-data").empty();
  $("#tagForNewPost").empty();
  $("#title-of-new-post").empty();
  $("#sampleFile").empty();
  document.querySelector('#myimg').src = "";
  returnNewPostBox();
}
function submitReply(postElement){
  console.log("submit reply");
  $('#uploadContent-reply').empty();
  //$("#entryContainer").empty();
  $('#tagForNewReply').empty();
  $("#sampleFile-reply").empty();
  document.querySelector('#myimg-reply').src = "";
    returnReplyBox();
}
function previewFile(){
  var preview = document.querySelector('#myimg');
  var previewReply = document.querySelector('#myimg-reply');
  //var file    = document.querySelector('input[type=file]').files[0];
  var file    = document.querySelector('#sampleFile').files[0];
  var fileReply = document.querySelector('#sampleFile-reply').files[0];
  var reader  = new FileReader();
  reader.onloadend = function () {
    console.log("onlined");
    preview.src = reader.result;
    previewReply.src = reader.result;
  }
  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
  if (fileReply) {
    reader.readAsDataURL(fileReply);
  } else {
    preview.src = "";
  }  
}
function showPaintedPosts() {
    socket.emit('requestPaint');
}


function showSummonBox() {
    $('#userIDsummon').val(sessionStorage.getItem('userID'));
    var reportContainer = $('#summonUserContainer');
    reportContainer.detach();
    reportContainer.prependTo('#entryContainer');
    reportContainer.css('display', 'block');
}
function returnSummonBox() {
    var reportContainer = $('#summonUserContainer');
    reportContainer.detach();
    reportContainer.appendTo('#divStorage');
    reportContainer.css('display', 'block');
}

function showGroupCreatorBox() {
    $('#userID_newgroup').val(sessionStorage.getItem('userID'));
    var reportContainer = $('#groupCreatorContainer');
    reportContainer.detach();
    reportContainer.prependTo('#entryContainer');
    reportContainer.css('display', 'block');
}
function returnNewGroupBox() {
    var reportContainer = $('#groupCreatorContainer');
    reportContainer.detach();
    reportContainer.appendTo('#divStorage');
    reportContainer.css('display', 'block');
}


function showReportBox(postID) {
    console.log("SHOW REPORT FOR");
    console.log(postID);
    $('#postID_report').val(postID);
    $('#userID_report').val(sessionStorage.getItem('userID'));
    $('#reportBoxContainer').css('display', 'block');
    var reportContainer = $('#reportBoxContainer');
    reportContainer.detach();
    reportContainer.appendTo('#' + postID);
    reportContainer.css('display', 'block');
}
function submitReport(postID) {
    returnReportBox();
}
function returnReportBox() {
    var reportContainer = $('#reportBoxContainer');
    reportContainer.detach();
    reportContainer.appendTo('#divStorage');
    reportContainer.css('display', 'none');
}

function showMap() {
    $('#entryContainer').empty();
    var mapContainer = $('#mapDisplay');
    mapContainer.detach();
    mapContainer.appendTo('#entryContainer');
    mapContainer.css('display', 'block');
}

function showRecommendBox(postID) {
    console.log(postID);
    $('#postID_taste').val(postID);
    $('#userID_taste').val(sessionStorage.getItem('userID'));
    $('#tastemakerContainer').css('display', 'block');
    var tastemakerBox = $('#tastemakerContainer');
    tastemakerBox.detach();
    tastemakerBox.appendTo('#' + postID);
    tastemakerBox.css('display', 'block');
}
function submitRecommendation(postID) {
    console.log(postID);
    var postToRec = { userID: sessionStorage.getItem("userID"), postID: postID };
    socket.emit('recommendPost', postToRec);
    returnTastemakerBox();
}
function returnTastemakerBox() {
    var tastemakerBox = $('#tastemakerContainer');
    tastemakerBox.detach();
    tastemakerBox.appendTo('#divStorage');
    tastemakerBox.css('display', 'none');
}



function followuser(userID) {
    let datapacket = {
        leaderID: userID,
        followerID: parseInt(sessionStorage.getItem("userID"))
    }
    socket.emit("followuser", datapacket);
}
function viewUserMessages(userID) {
    socket.emit('viewmessages', userID);
}



function upvoteThisTagForThisPost(tagname, postID){
  console.log(tagname);
  console.log(postID);
  var stuffToCheck = {
    userID: sessionStorage.getItem("userID"),
    postID: postID,
    data: tagname,
    task: "upvotetag"
  };
  socket.emit("check", stuffToCheck);
}
function submitTag(tagname, postID){
  console.log(tagname);
  console.log(postID);
  var tagPostOrUser = {
    tagname:tagname,
    postID:postID,
    userID:sessionStorage.getItem("userID"),
    postIfTrue:true
  };
  socket.emit('tagPostOrUser', tagPostOrUser);
}
function favoritePost(postID){
  //0 favorites post, 1 favorites tag, 2 favorites user
  console.log({faveType:0, postidORtagnameORuserid:postID, userid:sessionStorage.getItem('userID')});
  socket.emit('favorite', {faveType:0, postidORtagnameORuserid:postID, userid:sessionStorage.getItem('userID')});

  return;
}
function showAdvancedButtons(postID){
}


//DATA PROCESSING FUNCTIONS
function visitpage(pagenum){
  $("#contextButton").html("Home");
  $("#entryContainer").empty();
  window.location.href='/?page='+String(pagenum);
}
function multistreamView() {
    window.location.href = "/?sort=multi";
}


function requestGroups() {
    console.log('request groups');
    socket.emit('requestGroups', 0);
}

function arbitratorSort() {
    socket.emit('requestPostsForArbitration');
}
function algomancerSort() {
    var algomancyvalues = { commentweight: 1, likeweight: 6, sizeweight: 4, timeweight: 1, userweight: 7, viewweight: 1 };
    console.log(postsOnThisPage);
    postsOnThisPage.sort((a, b) => ( parseInt(a.postID) * algomancyvalues.timeweight + parseInt(a.up) * algomancyvalues.likeweight + parseInt(a.clicks) * algomancyvalues.viewweight + parseInt(a.replycount) * algomancyvalues.commentweight < parseInt(b.postID) * algomancyvalues.timeweight +parseInt(b.up) * algomancyvalues.likeweight + parseInt(b.clicks) * algomancyvalues.viewweight + parseInt(b.replycount) * algomancyvalues.commentweight) ? 1 : -1);
    console.log(postsOnThisPage);
    //socket.emit('requestAlgomancerPosts', 1, [6,1,4,1,1,7]);
}
function controversialSort(){
  console.log(postsOnThisPage);
  postsOnThisPage.sort((a,b) => (parseInt(a.up)+parseInt(a.down)+parseInt(a.replycount) < parseInt(b.up)+parseInt(b.down)+parseInt(b.replycount)) ? 1 : -1);
  console.log(postsOnThisPage);
}
function likedSort(){
  window.location.href="/?sort=like";
}
function loathedSort(){
  window.location.href="/?sort=hate";
}
function recentSort(){
  console.log(postsOnThisPage);
  var sortedPosts=[];//= postsOnThisPage.sort((a,b) => (parseInt(a.postID) < parseInt(b.postID)) ? 1 : -1);

  var my_promise = new Promise(
    function(resolve, reject){
      sortedPosts = postsOnThisPage.sort((a,b) => (parseInt(a.postID) < parseInt(b.postID)) ? 1 : -1);
      if (true) {
        resolve(sortedPosts);
      } else {
        reject(sortedPosts);
      }
  });

  my_promise
   .then( function(data){console.log(sortedPosts);$("#entryContainer").empty();})
   .catch( function(data){ console.log("promise rejected");});
}
function viewedSort(){
  window.location.href="/?sort=clks";
}
function randomSort(){
  window.location.href="/?sort=rand";
}
function recommendedSort() {
  window.location.href = "/?sort=recd";
}
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function is_url(str){
  var regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if(regexp.test(str)){return true;}
  else{return false;}
}
function getQueryParam(param){
  var rx = new RegExp("[?&]" + param + "=([^&]+).*$");
  var returnVal = window.location.search.match(rx);
  return returnVal === null ? "" : decodeURIComponent(returnVal[1].replace(/\+/g, " "));
}
function enlargePic(theImage){
  $(theImage).css("height", document.querySelector(theImage[0]).naturalHeight);
  console.log(theImage);
}
function generateUUID(){
  var d = new Date().getTime();
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  var uuid = 'xxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16;
    if(d > 0){
      var r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {
      var r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c=='x' ? r : (r&0x7|0x8));
  });
  return uuid;
}
function displayStatus(message){
  document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">'+message+'</marquee>';
  //document.getElementById('statusbar').innerHTML = message;
}
function gohome(){
  window.location.assign("/");
}
//subtitle function
$(function(){
  $.getJSON('subtitles.json',function(data){
    $('#statusbar').html(data[getRandomInt(0,Object.keys(data).length)]['text']);
    $('#sub-title').append(data[getRandomInt(0,Object.keys(data).length)]['text']);
  });
});
//change board by typing it in
$(document).ready(function(){
  $("#tag-filter").keyup(function(){
    console.log($(this).val());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).val());
  });
});
//
function dropDownFunction(){
  var x = document.getElementById("Demo");
  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  } else { 
    x.className = x.className.replace(" w3-show", "");
  }
}

function populatePage(posts, tags) {
    console.log('populatepage');
  console.log(posts);
  // $("#entryContainer").empty();
  // postsOnThisPage = posts;
    posts.forEach(function (post) {
        if (post.type == "text_post") {
            
            var date = new Date(post.postID * 1000).toDateString();
            var mustacheData = {
                postID: String(post.postID),
                profit: String(post.upvotes - post.downvotes),
                up: String(post.upvotes),
                down: String(post.downvotes),
                file: String(post.file),
                date: date,
                replycount: String(post.replycount),
                clicks: String(post.clicks),
                title: String(post.title),
                content: String(post.content),
                poster: "",
                posterID: ""
            };
            //CHECK IF POST HAS A LOCATION AND IS NOT DEFAULT LOCATION
            if (post.location !== undefined && post.location !== "") {
                console.log("POST HAS LOCATION");
                mustacheData.location = post.location.split("+").map(element => parseFloat(element));
                let circle = L.circle(mustacheData.location, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 500
                }).addTo(mapDisplay);
                circle.bindPopup("<a href='/?post=" + mustacheData.postID + "' onclick='viewPost(" + mustacheData.postID +");'>" + mustacheData.title + "</a>");
            }
            
    

            //CHECK if poster is a Leader
            if (post.poster !== undefined){
                let temppost = post.poster[0];
                if (!temppost.some(function (i) { return i === null; })) {
                    console.log(temppost);
                    if (temppost[1][11] == "1") {
                        console.log("LEADER FOUND");
                        mustacheData["poster"] = temppost[0] + " ⭐";
                        mustacheData["posterID"] = temppost[2];
                    }
                }
            }

            postsOnThisPage.push(mustacheData);
            //console.log(date);
            var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'>
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div>
                </a>
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='poster-tooltip'><a href='/?user={{posterID}}'><span class='tooltiptext'>view OP</span>{{poster}}</a>&nbsp;</span>&nbsp;&nbsp;
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class='raise profallow lurkers-not-only' onclick='showVoteBox({{postID}}, true);'><span class='tooltiptext'>upvote</span><span style='filter:sepia(100%);'>🔺</span></button>
                <button class='raise profallow lurkers-not-only' onclick='showVoteBox({{postID}}, false);'><span class='tooltiptext'>downvote</span><span style='filter:sepia(100%);'>🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow protectors-only' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button>
                <button class='raise anonallow' onclick='showReportBox({{postID}});'><span class='tooltiptext'>report this post</span>⚠️</button>
                <button class='raise profallow' onclick='showAdminBox({{postID}});'><span class='tooltiptext'>admin tools</span>🛠️</button>
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
        } else if (post.type == "poll_post") {
                console.log(post);
                var date = new Date(post.postID * 1000).toDateString();
                console.log(post.optionvotes);
                var percentagearray = [];
                var percentagetotal = post.optionvotes.reduce((a, b) => a + b, 0);
                for (var i = 0; i < post.content.length; ++i) {
                    percentagearray[i] = (100 * post.optionvotes[i] / percentagetotal).toFixed(1);
                }
                console.log(percentagearray);

                var mustacheData = {
                    postID: String(post.postID),
                    profit: String(post.upvotes - post.downvotes),
                    up: String(post.upvotes),
                    down: String(post.downvotes),
                    file: String(post.file),
                    date: date,
                    replycount: String(post.replycount),
                    clicks: String(post.clicks),
                    title: String(post.title),
                    content: post.content,
                    percentagearray: percentagearray
                };
                postsOnThisPage.push(mustacheData);
                //console.log(date); <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'> </a>  {{#percentagearray}}<ul class="chartlist"> <li><span class='count'>{{.}}</span><span class='index' style='width: {{.}}%'></span></li></ul>{{/percentagearray}}
                var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content">
                    <div class="post-content-span">


                          <div display='table'>
                            <div style='float:left; width:8%;'>{{#percentagearray}} <div style='font-size:2.25vw; line-height:1.2;'><span class='tooltiptext'>vote for poll option</span>{{.}}</div>{{/percentagearray}}</div>
                            <div>{{#content}}<div style='font-size:2.25vw; line-height:1.2;'>{{.}} </div> {{/content}}</div>
                          </div>

                    </div>
                
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button>
                <button class='raise anonallow' onclick='showReportBox({{postID}});'><span class='tooltiptext'>report this post</span>⚠️</button>
                <button class='raise profallow' onclick='showAdminBox({{postID}});'><span class='tooltiptext'>admin tools</span>🛠️</button>
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
            } else if (post.type == "directmessage") {
                var processedPostTemplate = `<span></span>`;
                console.log("DIRECT MESSAGE");
            }
              else {
                var processedPostTemplate = `<span></span>`;
                console.log("UNKNOWN POST TYPE");
            }

        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#entryContainer').append(html);
    
    });
  console.log(tags);
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
}


function populateMultifeed(posts1, posts2, posts3) {
    $('#multiContainer').css('display', 'grid');
    console.log(posts1);
    // $("#entryContainer").empty();
    // postsOnThisPage = posts;
    posts1.forEach(function (post) {
        if (post.type == "text_post") {
            var date = new Date(post.postID * 1000).toDateString();
            var mustacheData = {
                postID: String(post.postID),
                profit: String(post.upvotes - post.downvotes),
                up: String(post.upvotes),
                down: String(post.downvotes),
                file: String(post.file),
                date: date,
                replycount: String(post.replycount),
                clicks: String(post.clicks),
                title: String(post.title),
                content: String(post.content)
            };
            postsOnThisPage.push(mustacheData);
            //console.log(date);
            var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'>
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div>
                </a>
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='recommendPost({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button> 
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
        } else
            if (post.type == "poll_post") {
                var date = new Date(post.postID * 1000).toDateString();
                console.log(post.optionvotes);
                var percentagearray = [];
                var percentagetotal = post.optionvotes.reduce((a, b) => a + b, 0);
                for (var i = 0; i < post.content.length; ++i) {
                    percentagearray[i] = (100 * post.optionvotes[i] / percentagetotal).toFixed(1);
                }
                console.log(percentagearray);

                var mustacheData = {
                    postID: String(post.postID),
                    profit: String(post.upvotes - post.downvotes),
                    up: String(post.upvotes),
                    down: String(post.downvotes),
                    file: String(post.file),
                    date: date,
                    replycount: String(post.replycount),
                    clicks: String(post.clicks),
                    title: String(post.title),
                    content: post.content,
                    percentagearray: percentagearray
                };
                postsOnThisPage.push(mustacheData);
                //console.log(date); <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'> </a>  {{#percentagearray}}<ul class="chartlist"> <li><span class='count'>{{.}}</span><span class='index' style='width: {{.}}%'></span></li></ul>{{/percentagearray}}
                var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content">
                    <div class="post-content-span">


                          <div display='table'>
                            <div style='float:left; width:8%;'>{{#percentagearray}} <div style='font-size:2.25vw; line-height:1.2;'><span class='tooltiptext'>vote for poll option</span>{{.}}</div>{{/percentagearray}}</div>
                            <div>{{#content}}<div style='font-size:2.25vw; line-height:1.2;'>{{.}} </div> {{/content}}</div>
                          </div>

                    </div>
                
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button> 
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
            } else {
                var processedPostTemplate = `<span></span>`;
                console.log("UNKNOWN POST TYPE");
            }

        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#multi-left').append(html);

    });

    console.log(posts2);
    posts2.forEach(function (post) {
        if (post.type == "text_post") {
            var date = new Date(post.postID * 1000).toDateString();
            var mustacheData = {
                postID: String(post.postID),
                profit: String(post.upvotes - post.downvotes),
                up: String(post.upvotes),
                down: String(post.downvotes),
                file: String(post.file),
                date: date,
                replycount: String(post.replycount),
                clicks: String(post.clicks),
                title: String(post.title),
                content: String(post.content)
            };
            postsOnThisPage.push(mustacheData);
            //console.log(date);
            var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'>
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content"><div class="post-content-span">{{content}}</div></div></div>
                </a>
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='recommendPost({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button> 
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
        } else
            if (post.type == "poll_post") {
                var date = new Date(post.postID * 1000).toDateString();
                console.log(post.optionvotes);
                var percentagearray = [];
                var percentagetotal = post.optionvotes.reduce((a, b) => a + b, 0);
                for (var i = 0; i < post.content.length; ++i) {
                    percentagearray[i] = (100 * post.optionvotes[i] / percentagetotal).toFixed(1);
                }
                console.log(percentagearray);

                var mustacheData = {
                    postID: String(post.postID),
                    profit: String(post.upvotes - post.downvotes),
                    up: String(post.upvotes),
                    down: String(post.downvotes),
                    file: String(post.file),
                    date: date,
                    replycount: String(post.replycount),
                    clicks: String(post.clicks),
                    title: String(post.title),
                    content: post.content,
                    percentagearray: percentagearray
                };
                postsOnThisPage.push(mustacheData);
                //console.log(date); <a class='post-helper' href='/?post={{postID}}' onclick='viewPost({{postID}});'> </a>  {{#percentagearray}}<ul class="chartlist"> <li><span class='count'>{{.}}</span><span class='index' style='width: {{.}}%'></span></li></ul>{{/percentagearray}}
                var processedPostTemplate = `
            <div class='post-container' postID='{{postID}}' data-profit='{{profit}}' clicks='{{clicks}}'>
              <div class='post'>
                
                  <div class='post-visual'><img class='activeimage' src='uploaded/{{file}}'/></div>
                  <div class='post-title-helper'><span class='post-title'>{{title}}</span><br/><div class="post-content">
                    <div class="post-content-span">


                          <div display='table'>
                            <div style='float:left; width:8%;'>{{#percentagearray}} <div style='font-size:2.25vw; line-height:1.2;'><span class='tooltiptext'>vote for poll option</span>{{.}}</div>{{/percentagearray}}</div>
                            <div>{{#content}}<div style='font-size:2.25vw; line-height:1.2;'>{{.}} </div> {{/content}}</div>
                          </div>

                    </div>
                
                <div class='post-header'><span class='upvotes-tooltip'>
                  <span class='tooltiptext'>the number of upvotes minus the number of downvotes this post received</span>
                  <span class='upvotecount'>{{profit}}</span>&nbsp;profit</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='views-tooltip'><span class='tooltiptext'>the number of times someone actually clicked on this post</span><span class='viewcount'>{{clicks}}</span>&nbsp;clicks</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span class='post-date'>{{date}}</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<span><span class='post-numreplies'>{{replycount}}</span>&nbsp;replies</span>&nbsp;&nbsp;|
                  &nbsp;&nbsp;<!--<span>reply to&nbsp;<span class='replyToId'></span>--></span>
                </div>
              </div>
              <div class='post-buttons'>
                <button class='raise anonallow' onclick='showReplyBox($(this).parent().parent());'><span class='tooltiptext'>quick reply</span>&#x1f5e8;</button>  
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
                <button class="raise profallow lurkers-not-only" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(2, {{postID}});'><span class='tooltiptext'>convert this posts profit into memecoin, then delete post</span>♻</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(1, {{postID}});'><span class='tooltiptext'>add a free speech shield to this post</span>🛡</button>
                <button class='raise profallow' onclick='showShieldCensorHarvestBox(0, {{postID}});'><span class='tooltiptext'>attempt to censor this post</span>&#x1f4a3;</button>
                <button class='raise anonallow' onclick='showShareBox($(this).parent().parent());'><span class='tooltiptext'>share this post</span><svg xmlns='http://www.w3.org/2000/svg' height='16' viewBox='0 0 24 24' width='24'><path d='M0 0h24v24H0z' fill='none'/><path fill='#dfe09d' d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'/></svg></button>
                <button class='raise profallow' onclick='favoritePost({{postID}});'><span class='tooltiptext'>favorite this post</span>❤</button>
                <button class='raise anonallow taggers-only' onclick='showTagBox({{postID}});'><span class='tooltiptext'>tag this post</span>🏷</button>
                <button class='raise profallow painters-only' onclick='showPaintBox({{postID}});'><span class='tooltiptext'>paint this post</span>🎨</button>
                <button class='raise profallow tastemakers-only' onclick='showRecommendBox({{postID}});'><span class='tooltiptext'>recommend this post</span>👌</button>
                <button class='raise profallow summoners-only' onclick='showSummonBox({{postID}});'><span class='tooltiptext'>summon user</span>🤝</button> 
                <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
              </div>
            </div>`;
            } else {
                var processedPostTemplate = `<span></span>`;
                console.log("UNKNOWN POST TYPE");
            }

        //console.log(processedPostTemplate);
        var html = Mustache.render(processedPostTemplate, mustacheData);
        $('#multi-center').append(html);
    });
}

function populateMessages(messages) {
    console.log(messages);
}

function populatePageWithReports(reportarray) {
    var html = `<table>
              <tr>
                <th>PostID</th>
                <th>Title</th>
                <th>Reasons</th>
                <th>Upvotes</th>
              </tr>`;
    $('#entryContainer').append(html);
    reportarray.forEach(function (post) {
        var mustacheData = {
            postID: String(post[0]),
            title: post[1],
            reasons: post[2],
            upvotes: post[3]
        }
        postsOnThisPage.push(mustacheData);
        //console.log(date);
        var processedPostTemplate = `
            <tr>
            <td>{{postID}}</td><td>{{title}}</td><td>{{reasons}}</td><td>{{upvotes}}</td>
            </tr>
        `;
        html = Mustache.render(processedPostTemplate, mustacheData);
        $('#entryContainer').append(html);
    });
    $('#entryContainer').append('</table>');
}
//CREATE VIRTUAL PILE OF LINKS
function requestPileStyle() {
    console.log(postsOnThisPage);
    $('#entryContainer').empty();
    //var path = new Path.Rectangle([75, 75], [100, 100]);
    //path.strokeColor = 'black';

    //view.onFrame = function (event) {
    //    // On each frame, rotate the path by 3 degrees:
    //    path.rotate(3);
    //}
    var voronoi = new paper.Voronoi();
    var sites = generateBeeHivePoints(view.size / 200, true);
    var bbox, diagram;
    var oldSize = view.size;
    var spotColor = new Color('red');
    var mousePos = view.center;
    var selected = false;

    onResize();

    function onMouseDown(event) {
        sites.push(event.point);
        renderDiagram();
    }

    function onMouseMove(event) {
        mousePos = event.point;
        if (event.count == 0)
            sites.push(event.point);
        sites[sites.length - 1] = event.point;
        renderDiagram();
    }

    function renderDiagram() {
        console.log("render diagram");
        project.activeLayer.children = [];
        var diagram = voronoi.compute(sites, bbox);
        if (diagram) {
            for (var i = 0, l = sites.length; i < l; i++) {
                var cell = diagram.cells[sites[i].voronoiId];
                if (cell) {
                    var halfedges = cell.halfedges,
                        length = halfedges.length;
                    if (length > 2) {
                        var points = [];
                        for (var j = 0; j < length; j++) {
                            v = halfedges[j].getEndpoint();
                            points.push(new Point(v));
                        }
                        createPath(points, sites[i]);
                    }
                }
            }
        }
    }

    function removeSmallBits(path) {
        var averageLength = path.length / path.segments.length;
        var min = path.length / 50;
        for (var i = path.segments.length - 1; i >= 0; i--) {
            var segment = path.segments[i];
            var cur = segment.point;
            var nextSegment = segment.next;
            var next = nextSegment.point + nextSegment.handleIn;
            if (cur.getDistance(next) < min) {
                segment.remove();
            }
        }
    }

    function generateBeeHivePoints(size, loose) {
        var points = [];
        var col = view.size / size;
        for (var i = -1; i < size.width + 1; i++) {
            for (var j = -1; j < size.height + 1; j++) {
                var point = new Point(i, j) / new Point(size) * view.size + col / 2;
                if (j % 2)
                    point += new Point(col.width / 2, 0);
                if (loose)
                    point += (col / 4) * Point.random() - col / 4;
                points.push(point);
            }
        }
        return points;
    }
    function createPath(points, center) {
        var path = new Path();
        if (!selected) {
            path.fillColor = spotColor;
        } else {
            path.fullySelected = selected;
        }
        path.closed = true;

        for (var i = 0, l = points.length; i < l; i++) {
            var point = points[i];
            var next = points[(i + 1) == points.length ? 0 : i + 1];
            var vector = (next - point) / 2;
            path.add({
                point: point + vector,
                handleIn: -vector,
                handleOut: vector
            });
        }
        path.scale(0.95);
        removeSmallBits(path);
        return path;
    }

    function onResize() {
        var margin = 20;
        bbox = {
            xl: margin,
            xr: view.bounds.width - margin,
            yt: margin,
            yb: view.bounds.height - margin
        };
        for (var i = 0, l = sites.length; i < l; i++) {
            sites[i] = sites[i] * view.size / oldSize;
        }
        oldSize = view.size;
        renderDiagram();
    }

    function onKeyDown(event) {
        if (event.key == 'space') {
            selected = !selected;
            renderDiagram();
        }
    }
}

function populateGrid(postsAndAllTagData){
  console.log(postsAndAllTagData);
  //$("#entryContainer").empty();
  postsOnThisPage = postsAndAllTagData;
  postsAndAllTagData.forEach(function(post){
    console.log(post);
    var date = new Date(post.postID * 1000).toDateString();
    var mustacheData = {
      postID:String(post.postID),
      profit:String(post.upvotes-post.downvotes),
      up:String(post.upvotes),
      down:String(post.downvotes),
      file:'uploaded/'+String(post.file),
      date:date,
      replycount:String(post.replycount),
      clicks:String(Math.ceil(post.clicks/10)),
      title:String(post.title),
      content:String(post.content),
      tags:post.tagArray
    };
    postsOnThisPage.push(mustacheData);
    console.log("GRID VIEW");
    console.log(mustacheData.tags);
    var processedPostTemplate= `<div style='border-width:{{clicks}}px;' class='gridcell' postID='{{postID}}'>
                                <div class='gridtitle'>{{title}}</div>
                                <a id='{{postID}}' data-toggle='tooltip' title='{{title}}{{#tags}}&nbsp;{{.}}&nbsp;{{/tags}}' href='/?post={{postID}}'>
                                <img src='{{file}}'/>
                                </a>
                                <div class='gridtitle'>{{date}}</div>
                                </div>`;
    var html = Mustache.render(processedPostTemplate, mustacheData);
    $('#gridview').append(html);
  });
  // tags.forEach(function(tag){
  //   var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
  //   $('#popular-tag-span').append(processedTag); 
  // });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
}

socket.on('userChecked', function(resultOfCheck){
  console.log(resultOfCheck);
  switch(resultOfCheck.task){
    case 'additionalvoteup':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      socket.emit('check', {taskToCheck:'makeadditionalvoteup', userID:resultOfCheck.userID, postID:resultOfCheck.postID, data:resultOfCheck.cost});
      break;
    case 'additionalvotedown':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      socket.emit('check', {taskToCheck:'makeadditionalvotedown', userID:resultOfCheck.userID, postID:resultOfCheck.postID, data:resultOfCheck.cost});
      break;
    case 'madeadditionalvoteup':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      $('#upvotestat').html(String(parseInt($('#upvotestat').html())+1));
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'additionalvoteup'});
      break;
    case 'madeadditionalvotedown':
      $('#cost-of-next-vote').html(resultOfCheck.cost);
      $('#downvotestat').html(String(parseInt($('#downvotestat').html())-1));
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'additionalvotedown'});
      break;
    case 'firstvoteup':
      $('#cost-of-next-vote').html("1");
      $('#upvotestat').html("1");
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'firstvoteup'});
      break;
    case 'firstvotedown':
      $('#cost-of-next-vote').html("1");
      socket.emit('makevote', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost, voteType:'firstvotedown'});
      break;
    case 'failedAdditionalVote':
      console.log('you need more memecoins to vote on this post, but posting on a different one is free!');
      break;
    case 'ableToHarvestPost':
      //socket.emit('harvestPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      $('#harvestmessage-span').html("you'll get "+resultOfCheck.cost+" memecoin from harvesting this post");
      break;
    case 'failedHarvest':
      $('#harvestmessage').html('you cant harvest posts you dont own!');
      console.log('you cant harvest posts you dont own!');
      break;
    case 'ableToCensorPost':
      $('#confirmCensor').prop('disabled', false);
      $('#censormessage-span').html("there are have been "+resultOfCheck.cost+" attempts to censor this post so far, and if there's at least 1 shield you'll waste your memecoin too");
      //socket.emit('censorPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      break;
    case 'failedCensoringCauseTooPoor':
      $('#confirmCensor').prop('disabled', true);
      $('#censormessage-span').html("you need more memecoins to censor this post. consider just getting over it?");
      console.log('you need more memecoin to censor this post. consider just getting over it?');
      break;
    case 'successfulCensoring':
      $('#censormessage-span').html("success! you will be the last person to ever see this post! reload the page to wipe it from the net completely");
      $('#confirmCensor').prop('disabled', true);
      socket.emit('censorSuccess', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, cost:resultOfCheck.cost});
      break;
    case 'failedCensoringCauseShield':
      $('#censormessage-span').html("your attempt to censor this post has failed, but there are merely "+resultOfCheck.cost+" free speech shields remaining");
      break;
    case 'failedCensoringCauseOther':
      console.log('no idea');
      break;
    case 'ableToApplyShield':
      $('#confirmShield').prop('disabled', false);
      //socket.emit('shieldPost', {userID:resultOfCheck.userID, postID:resultOfCheck.postID});
      break;
    case 'failedShielding':
      $('#confirmShield').prop('disabled', true);
      $('#shieldmessage-span').html("you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!");
      console.log('you need more memecoins to shield this post. for more memecoins, try harvesting one of your successful posts!');
      break;
    case 'ableToUpvoteTag':
      socket.emit('upvoteTag', {userID:resultOfCheck.userID, postID:resultOfCheck.postID, tagname:resultOfCheck.cost});
      console.log("tag upvoted!");
      break;
    case 'failedTagUpvote':
      if (resultOfCheck.cost == -1){
        console.log('you need at least 1 memecoin to strengthen the link between a particular post and a tag, but you can make a new one for free');
      }else{
        console.log("unknown error");
      }
      break;
    case 'favoritedPost':
      console.log('should be fave now');
      break;
    default:
      break;
  }
});

socket.on('tagsForPostData', function(tagsForPostData){
  console.log('tagsForPostData');
  $('#existingTagsForThisPost').empty();
  $('#popular-tag-span').empty();
  tagsForPostData.forEach(function(tag){
      var mustacheData = {
        otherposts: tag[0],
        tagname: tag[1],
        tagupvotes: tag[2]
      };
      var tagtemplate = `<button class="postTag" tagname="{{tagname}}">(<a title="# of posts with this tag. click to view all posts with this tag" class="other-posts-with-this-tag" onclick="getAllPostsWithThisTag({{tagname}});">{{otherposts}}</a>)&nbsp;-&nbsp;<span class="tagName">{{tagname}}</span>&nbsp;-&nbsp;(<a title="# of upvotes this tag received for this post. click to spend a memecoin to upvote" class="upvotes-for-tag-for-this-post" onclick="upvoteThisTagForThisPost({{tagname}}, $(this).parent().parent().parent().parent().parent().parent().attr('postID'));">{{tagupvotes}}</a>)</button>&nbsp;&nbsp;`;
        var html = Mustache.render(tagtemplate, mustacheData);
      $('#existingTagsForThisPost').append(html);
      var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[1]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[0]+'</span>)</button>&nbsp;';
      $('#popular-tag-span').append(processedTag);
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
});

socket.on('receiveTagData', function(topPostsForTag){
  postsOnThisPage = [];
  console.log(topPostsForTag);
  populatePage(topPostsForTag[0], []);
  $('#pageID-tagname').html("&nbsp;:&nbsp;"+topPostsForTag[1]);
  window.history.replaceState(null, null, "/?tag="+topPostsForTag[1]);
});

socket.on('receiveTop20Data', function(topPostsAndTags){
  postsOnThisPage = [];
  populatePage(topPostsAndTags[0], topPostsAndTags[1]);
});

socket.on('receiveRecommendedData', function (recommendedData) {
    postsOnThisPage = [];
    populatePage(recommendedData[0], recommendedData[1]);
});

socket.on('receiveSinglePostData', function(dataFromServer){
  postsOnThisPage = [];
  console.log("receiveSinglePostData");
  console.log(dataFromServer);
  var viewedPost = dataFromServer[0];
  var repliesToPost = dataFromServer[1];
  var tags = dataFromServer[2];
  var viewedPostData = new Date(viewedPost.postID * 1000).toDateString();
  var viewedPostMustacheData = {
    postID:viewedPost.postID,
    up:String(viewedPost.upvotes),
    down:String(viewedPost.downvotes),
    clicks:String(viewedPost.clicks),
    title:String(viewedPost.title),
    memecoinsspent:String(viewedPost.memecoinsspent),
    date:viewedPostData,
    content:String(viewedPost.content),
    file:String(viewedPost.file)
  };
  var processedViewedPostTemplate = `
        <div>
          <div class="advanced-post-container" postID="{{postID}}" data-profit="{{profit}}" clicks="{{clicks}}">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{up}}</span>&nbsp;upvotes<br/>
              <span id="advanced-post-downvotes">{{down}}</span>&nbsp;downvotes<br/>
              <span id="advanced-post-clicks">{{clicks}}</span>&nbsp;clicks<br/>
              <span id="advanced-post-mcspent">{{memecoinsspent}}</span>&nbsp;memecoins spent on post<br/>
              <span id="advanced-post-date">{{date}}</span>&nbsp;post was created<br/>
              <span id="advanced-post-id">{{postID}}</span>&nbsp;is post's id#
              <hr/>
              favorited by:<br/>
              <div id="advanced-post-favoriters"></div>
            </div>
            <div id="advanced-post">
              <img class="activeimage advimg" src="uploaded/{{file}}"/>
              <div id="advanced-post-title">{{title}}</div>
            </div>
            <div id="advanced-post-tags">
            </div>
          </div>
          <div id="advanced-post-content">{{content}}</div>
          <div class="post-buttons">
            <button class="raise anonallow" onclick="showReplyBox($(this).parent().parent());"><span class="tooltiptext">quick reply</span>&#x1f5e8;</button>
            <button class="raise profallow" onclick="showVoteBox({{postID}}, true);"><span class="tooltiptext">upvote</span><span style="filter:sepia(100%);">🔺</span></button>
            <button class="raise profallow" onclick="showVoteBox({{postID}}, false);"><span class="tooltiptext">downvote</span><span style="filter:sepia(100%);">🔻</span></button>
            <span class="advancedButtons">
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(2, {{postID}});"><span class="tooltiptext">convert this post's profit into memecoin, then delete post</span>♻</button>
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(1, {{postID}});"><span class="tooltiptext">add a free speech shield to this post</span>🛡</button>
              <button class="raise profallow" onclick="showShieldCensorHarvestBox(0, {{postID}});"><span class="tooltiptext">attempt to censor this post</span>&#x1f4a3;</button>
              <button class="raise anonallow" onclick="showShareBox($(this).parent().parent());"><span class="tooltiptext">share this post</span><svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#dfe09d" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></button>
              <button class="raise profallow" onclick="favoritePost({{postID}});"><span class="tooltiptext">favorite this post</span>❤</button>
            </span>
            <button class="raise anonallow" onclick="showTagBox({{postID}});"><span class="tooltiptext">tag this post</span>🏷</button>
            <div class='statusdiv' id='{{postID}}' up='{{up}}' down='{{down}}'></div>
          </div>
        </div>`;
  var html = Mustache.render(processedViewedPostTemplate, viewedPostMustacheData);
  //$('#result').html( html );
  $('#entryContainer').append(html);
  if(is_url(viewedPost.content)){
    console.log("EISISISI");
    $('#advanced-post-content').empty();
    var urlIframe = "<iframe src='https://web.archive.org/web/"+viewedPost.content+"' height='300px' width='500px' sandbox='allow-same-origin'></iframe>";
    $('#advanced-post-content').append(urlIframe);
  }
  viewedPost.favoritedBy.forEach(function(userWhoFaved){
    $('#advanced-post-favoriters').append('<button class="raise" onclick="viewProfilePage('+String(userWhoFaved[0])+')">'+userWhoFaved[1]+'</button>');
  });
  console.log("TESTS");
  postsOnThisPage.push(viewedPostMustacheData);
  console.log(postsOnThisPage);
  populatePage(repliesToPost, []);
  console.log(postsOnThisPage);
  $('#popular-tag-span').empty();
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
});

socket.on('paintPosts', function (paintDataArray) {
    paintDataArray.forEach(function (paintPostData) {
        paintPostData = JSON.parse(paintPostData);
        //console.log(paintPostData.paintPostId);
        var postToPaint = $("[postid="+paintPostData.paintPostId+"]");
        if (postToPaint !== undefined) {
            console.log(postToPaint);
            postToPaint.css("font-family", paintPostData.paintfont);
            postToPaint.css("border-style", paintPostData.paintborder);
            postToPaint.css("font-size", paintPostData.paintsize);
            postToPaint.css("background-color", paintPostData.paintbackground);
        }
    });
});

socket.on('loggedIn', function(loginData){
    sessionStorage.setItem('userID', loginData.userID);
    sessionStorage.setItem('username', loginData.name);
    sessionStorage.setItem('memecoin', loginData.memecoin);
    sessionStorage.setItem("userroles", loginData.userroles);
    addRoles(loginData.userroles);
    console.log(loginData);
    //sessionStorage.setItem('role', loginData.role);
    $('#signinstuff').css('display', 'none');
    $('#signup-overlay-box').css('display', 'none');
    $('.profallow').css('display','inline');
    $('#accountButton').html("<span userid="+sessionStorage.getItem('userID')+"</span>"+sessionStorage.getItem('username')+"&nbsp;&nbsp;&nbsp;&nbsp;<span id='memecoin-button'>"+sessionStorage.getItem('memecoin')+"₿</span>");
    $('#accountButton').attr('userid', sessionStorage.getItem('userID'));
    $('#currentrole').html(getFirstRole(loginData.userroles));
});

socket.on('userDataFound', function (userData) {
    console.log(userData);
  postsOnThisPage = [];
  var user = userData[0];
  var tags = userData[5];
  var posts = userData[1];
    var faves = userData[6];
    var voted = userData[2];
  //$("#entryContainer").empty();
  var user_date = "1/9/89";//new Date(user.userID * 1000).toDateString();
  var user_mustacheData = {
    userid:String(user.userID),
    username:String(user.name),
    memecoin:String(user.memecoin),
    file:String(user.file),
    date:user_date,
    upvotesdealt:String(userData[3]),
    downvotesdealt:String(userData[4]),
    postcount:String(posts.length),
      bio: String(user.content),
      roles: String(user.userroles),
      voted: Array(user.voted)

    };
    //check if user is viewing own profile
    var processedUserTemplate = `
            <div userID="{{userid}}">
          <div class="advanced-post-container">
            <div id="advanced-post-stats">
              <span id="advanced-post-upvotes">{{upvotesdealt}}</span>&nbsp;upvotes dealt<br/>
              <span id="advanced-post-downvotes">{{downvotesdealt}}</span>&nbsp;downvotes dealt<br/>
              <span id="advanced-post-mcspent">{{memecoin}}</span>&nbsp;memecoin available<br/>
              <span id="advanced-post-date">{{date}}</span>&nbsp;account was created<br/>
              <hr/>
              favorited:<br/>
              <div id="advanced-post-favoriters"></div>
            </div>
            <div id="advanced-post">
              <img class="activeimage advimg" src="uploaded/{{file}}"/>
              <div id="advanced-post-title">{{title}}</div>
            </div>
            <div id="advanced-post-tags">
            </div>
          </div>
          <div id="advanced-post-content">{{bio}}</div>
    `;
    if (sessionStorage.getItem('userID') == user.userID) {
        console.log("PROFILE VIEWED MATCHES CURRENTLY LOGGED IN USER, LIST EACH VOTED POST");
        voted.forEach((element) => processedUserTemplate += "<div><a href='/?post=" + String(element) + "'>" + String(element) + "</a></div>");
        processedUserTemplate += `
          <div><button id="change-user-settings">Change user settings</button></div>
          <div><button id="view-user-messages" onclick="viewUserMessages({{userid}});">View messages</button></div>
          <div><button id="signout" class="raise profallow" onclick="signout(this);">Sign out</button></div>
        </div>`;
    } else {
        if (user.userroles[11] == '1') {
            console.log("VIEWING LEADER'S PAGE");
            processedUserTemplate = `
          <div><button id="follow-user" onclick="followuser({{userid}});">Follow user</button></div>
          <div><button id="signout" class="raise profallow" onclick="signout(this);">Sign out</button></div>
        </div>`;
        } else if (user.userroles[6] == '1') {
            console.log("VIEWING SUMMONER'S PAGE");
            processedUserTemplate = `
        <div><button id="message-user">Message user</button></div>
            <div><button id="signout" class="raise profallow" onclick="signout(this);">Sign out</button></div>
        </div>`;
        } else {
            processedUserTemplate = `
          <div><button id="signout" class="raise profallow" onclick="signout(this);">Sign out</button></div>
        </div>`;
        }

    }

  var html = Mustache.render(processedUserTemplate, user_mustacheData);
  $('#entryContainer').append(html);
  $('#pageID-tagname').html("&nbsp;:&nbsp;"+user.name);
  window.history.replaceState(null, null, "/?user="+user.name);
  postsOnThisPage = [];
  populatePage(posts, tags);
  faves.forEach(function(fave){
    console.log(fave);
    var date = new Date(fave.postID * 1000).toDateString();
    var fave_mustacheData = {
      postID:String(fave.postID),
      profit:String(fave.upvotes-fave.downvotes),
      title:String(fave.title)
    };
    var processedFaveTemplate = `<div class='fave-container'><a href='/?post={{postID}}'>{{profit}} - {{title}}</a></div>`;
    var html = Mustache.render(processedFaveTemplate, fave_mustacheData);
    $('#advanced-post-favoriters').append(html);
  });
  //console.log(tags);
  tags.forEach(function(tag){
    var processedTag = '<button class="fill popular-tag-button"><span class="tag-name">'+tag[0]+'</span>&nbsp;(<span class="number-of-posts-with-tag">'+tag[1]+'</span>)</button>&nbsp;';
    $('#popular-tag-span').append(processedTag); 
  });
  $(".popular-tag-button").on("click", function(){
    console.log($(this).children(".tag-name").html());
    $("#entryContainer").empty();
    socket.emit('requestPostsWithTag', $(this).children(".tag-name").html());
  });
});

socket.on('sendDatabase', function(results){
  postsOnThisPage = [];
  $('#entryContainer').empty();
  $('#adjacentBlocks').empty();
  console.log(results);
  handleRetrievedDatabase(results);
});

socket.on('msgDataFound', function (results) {
    console.log(results);
    for (const [key, value] of Object.entries(results)) {
        console.log(`${key}: ${value}`);
    }
});


socket.on('receiveArbitrationPostsArray', function (results) {
    populatePageWithReports(results);
    console.log(results);
});
socket.on('receiveTop20DataGrid', function(results){
  postsOnThisPage = [];
  $('#entryContainer').empty();
  $('#adjacentBlocks').empty();
  $('#gridview').empty();
  populateGrid(results[0]);
  console.log(results);
});

socket.on('receiveMultifeedData', function (results) {
    console.log(results);
    postsOnThisPage = [];
    populateMultifeed(results[0], results[1], results[2]);
});

var dbresults = {"nodes":[], "links":[]};
var mouseCoordinates = [0, 0];
var selectedNode = null;
var clickOnAddNewTag = false;
var clickOnAddNewPost = false;
var existingTagArray = [];

linkifyOptions = {
  attributes: null,
  className: 'linkified',
  defaultProtocol: 'http',
  events: null,
  format: function (value, type) {
    return value;
  },
  formatHref: function (href, type) {
    return href;
  },
  ignoreTags: [],
  nl2br: false,
  tagName: 'a',
  target: {
    url: '_blank'
  },
  validate: true
};

function clickNewPostButton(){
  closeAllFrames();
  if(clickOnAddNewPost==false){
    document.getElementById('submitnew').style.display="block";
    document.getElementById('uploadNewPostButton').innerHTML="-";
    clickOnAddNewPost=true;
  }else{
    document.getElementById('uploadNewPostButton').innerHTML="+";
    clickOnAddNewPost=false;
  }
}

function displayStatus(message){
  //
  document.getElementById("statusbar").outerHTML = '<marquee behavior="slide" direction="left" scrollamount="20" id="statusbar">'+message+'</marquee>';
}

function sendNewPostToServer(){
  var last3chars = document.getElementById('userInputtedContent').value.slice(-3);
  var typeOfUpload = "text";
  if(last3chars=="jpg"||last3chars=="png"||last3chars=="gif"){
    typeOfUpload = "pic";
  }
  if(document.getElementById('tag2').value==""){
    socket.emit('sendNewPostToServer1', {
      nodename: document.getElementById('nodename').value,
      nodecontent: document.getElementById('userInputtedContent').value,
      tag1: document.getElementById('tag1').value.toLowerCase(),
      type: typeOfUpload
    });
  }else{
    socket.emit('sendNewPostToServer2', {
      nodename: document.getElementById('nodename').value,
      nodecontent: document.getElementById('userInputtedContent').value,
      tag1: document.getElementById('tag1').value.toLowerCase(),
      tag2: document.getElementById('tag2').value.toLowerCase(),
      type: typeOfUpload
    });     
  }
  closeAllFrames();     
  document.getElementById('uploadNewPostButton').innerHTML="+";
  clickOnAddNewPost=false;
  displayStatus("Post uploaded successfully");
  $("svg").empty();
  document.getElementById('nodename').value="";
  document.getElementById('userInputtedContent').value="";
  document.getElementById('tag1').value="";
  document.getElementById('tag2').value="";
  socket.emit('retrieveDatabase');
}

function upvoteTag(){
  socket.emit('upvoteTag', {
    nodename: document.getElementById('postNameInModal').innerHTML,
    nodecontent: document.getElementById('contentInModal').innerHTML,
    tag1: document.getElementById('tagNameInModal').innerHTML
  });
  document.getElementById('upvoteTagModal').style.display = "none";
  displayStatus("Tag successfully upvoted");
}

function upvotePost(){
  socket.emit('upvotePost', {
    nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
    nodecontent: document.getElementById('contentInModal').innerHTML
  });
  document.getElementById('previewframe').style.display = "none";
  displayStatus("Post successfully upvoted");
}

function tagPost(){
  var newTagInput = document.getElementById('newTagInput');
  if(clickOnAddNewTag==true){
    if(existingTagArray.indexOf(newTagInput.value.toLowerCase()) === -1){
      socket.emit('tagPost', {
        nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML,
        newtag: newTagInput.value.toLowerCase() 
      });
      displayStatus("Tag added to post");
    }else{
      socket.emit('upvoteTag', {
        nodename: document.getElementById('postNameInModalPostOnly').innerHTML,
        nodecontent: document.getElementById('contentInModal').innerHTML,
        tag1: newTagInput.value.toLowerCase()
      });
      displayStatus("Tag already existed for this post and was upvoted");
    }
    newTagInput.value = "";
    newTagInput.style.display = "none";
    document.getElementById("tagIt").innerHTML = "Tag it";
    document.getElementById('previewframe').style.display = "none";
    clickOnAddNewTag=false;
  }else{
    newTagInput.style.display = "block";
    document.getElementById("tagIt").innerHTML = "Submit tag?";
    clickOnAddNewTag=true;
  }
  clickOnAddNewPost=false; 
  document.getElementById('uploadNewPostButton').innerHTML="+";
}

function closeAllFrames(){
  var newTagInput = document.getElementById("newTagInput");
  newTagInput.value = "";
  newTagInput.style.display = "none";
  clickOnAddNewTag=false;
  document.getElementById("tagIt").innerHTML="Tag it";
  document.getElementById("submitnew").style.display = "none";
  document.getElementById('previewframe').style.display = "none";
  document.getElementById('upvoteTagModal').style.display = "none";
}

var inputs = $(".submissionslot");

var validateInputs = function validateInputs(inputs){
  var validForm = true;
  inputs.each(function(index) {
    var input = $(this);
    if (input.val()=="") {
      $("#upload").attr("disabled", "disabled");
      validForm = false;
    }
  });
  return validForm;
};

inputs.change(function(){
  if (validateInputs(inputs)) {
    document.getElementById("upload").removeAttribute("disabled");
  }
});

var text_truncate = function(str, length, ending){
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = '...';
  }
  //console.log(String(str));
  if(str !== null) {
    //console.log("STRING IS NOT NULL");
    if (str.length > length) {
      //console.log(str.substring(0, length - ending.length) + ending);
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }     
  }else{
    //console.log("STRING IS NULL");
    return "null";
  }
};

var previewContent = document.getElementById("previewContent");

function handleRetrievedDatabase(results) {

    var promise1 = new Promise(function (resolve, reject) {
        console.log("DBRESULTSNODES");
        console.log(dbresults.nodes);
        //0 = id, 1 = upvotes, 2 = content, 3 = tag from results array
        for (let i = 0; i < results.length; i++) {
            k = i + 1;
            var foundPrev = false;
            var thisPostID = results[i][0];
            if (thisPostID == undefined) {
                continue;
            }
            for (obj of Object.values(dbresults.nodes)) {
                if (obj.id == thisPostID) {
                    foundPrev = true;
                    thisPostID = obj.id;
                    break;
                }
            }
            if (foundPrev == false) {
                dbresults.nodes.push({ id: thisPostID, upvotes: results[i][1], content: results[i][2], img: results[i][5] });
            }
            if (results[k] == undefined) {
                continue;
            } else {
                var thisNextPostID = results[k][0];
                for (obj of Object.values(dbresults.nodes)) {
                    if (obj.id == thisNextPostID) {
                        foundPrev = true;
                        thisNextPostID = obj.id;
                        break;
                    }
                }
                var thisPostTag = results[i][3];
                //IF THIS POSTS TAG IS IDENTICAL TO THE NEXT POSTS TAG
                if (thisPostTag == results[k][3] && thisNextPostID !== null) {
                    //THEN CHECK IF THAT TAG IS ALREADY IN THE EXISTING TAG ARRAY. IF NOT? PUSH IT TO THAT LIST
                    existingTagArray.indexOf(thisPostTag) === -1 ? existingTagArray.push(thisPostTag) : console.log("This item already exists");
                    //BECAUSE THERE MUST BE AT LEAST TWO POSTS WITH THE SAME TAG FOR A LINK TO EXIST, 
                    dbresults.links.push({ source: thisPostID, target: thisNextPostID, tag: thisPostTag });
                }
            }
        }

        resolve(dbresults);
    });


    
    promise1.then(function (data) {


        var margin = { top: 10, right: 40, bottom: 30, left: 30 },
            width = 450 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#svg")
            .attr("width", 1900)
            .attr("height", 1900)
            .on("mousemove", mousemove);
    
        console.log(d3);
        console.log("PROMISE1THEN START");
        console.log(data);



        var nodeIndexToIdDict = {}
        for (indexid in data.nodes) {
            nodeIndexToIdDict[data.nodes[indexid]["id"]] = parseInt(indexid);
        }
        console.log(nodeIndexToIdDict);

        var neoLinks = [];

        //console.log(data.links);
        for (linky in data.links) {
            var templink = {};
            //console.log(data.links[linky]["source"]);
            //console.log(data.links[linky]["source"]);
            var idToConvert = data.links[linky]["source"];
            var newidToConvert = data.links[linky]["target"];
            //console.log(nodeIndexToIdDict[data.links[linky]["source"]]);
            templink["source"] = parseInt(nodeIndexToIdDict[idToConvert]);
            //data.links[linky]["source"] = nodeIndexToIdDict[data.links[linky]["source"]];
            //data.links[linky]["target"] = nodeIndexToIdDict[data.links[linky]["target"]];
            templink["target"] = parseInt(nodeIndexToIdDict[newidToConvert]);
            templink["tag"] = data.links[linky]["tag"];
            neoLinks.push(templink);
            
        }
        console.log(neoLinks);
        //const links = data.links.map(d => ({ ...d }));
        const links = neoLinks;//.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d }));

        // Add a line for each link, and a circle for each node.



        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 5)
            .attr("fill", d3.color("#cccccc"));

        const link = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-opacity", 0.9)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1);

        var path = svg.append("g")
            .selectAll("path")
            .data(links)
            .enter().insert("path")
            .attr("class", "linkpath")
            .attr("id", function (d, i) { return "pathId_" + i; })
            .attr("marker-end", function (d) { return "url(#" + d.tag + ")"; });

        var linktext = svg.append("g").selectAll(".gLink").data(links);

        linktext.join("g").attr("class", "gLink")
            .append("text")
            .attr("class", "gLink")
            .style("font-size", "11px")
            .style("font-family", "sans-serif")
            .attr("x", "50")
            .attr("y", "-4")
            .attr("text-anchor", "start")
            .style("fill", "#f1d141")
            .append("textPath")
            .attr("xlink:href", function (d, i) { return "#pathId_" + i; })
            .text(function (d) { return d.tag; })
            .on("mousedown", clickOnTag);

        var simulation = d3.forceSimulation(nodes)
            .force("collision", d3.forceCollide().radius(1))
            .force("link", d3.forceLink(links).id(function (d, i) { console.log(d); console.log(i); return i; }))
            .force("charge", d3.forceManyBody().strength(-400).distanceMin(20))
            .force("center", d3.forceCenter(600, 600));

        function ticked(){
          node.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
            postTitle.attr("x", function (d) { return d.x; }).attr("y", function (d) { return d.y; });
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
          
            //linktext
            //    .attr("x1", d => d.source.x)
            //    .attr("y1", d => d.source.y)
            //    .attr("x2", d => d.target.x)
            //    .attr("y2", d => d.target.y);

          path.attr("d", function(d) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y;
              return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y;
          });
        }

        simulation.nodes(nodes).on("tick", ticked);
        console.log(links);
        //simulation.force("link").links(links);
        //simulation.restart();
        //console.log(existingTagArray);

 



     


        //var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(nodes).enter()
        //    .append("circle")
        //    .attr("r", function (d) { console.log("TEST");  return (d.upvotes != null || d.upvotes != 0) ? 5*d.upvotes : 5;})
        //      .attr("id", function(d){return "linkId_"+d.id})
        //      .attr("color", "#cccccc")
        //      .on("mousedown", clickOnNode)
        //      .on("mouseover", mouseoverNode)
        //    .append("image")
        //      .attr("xlink:href", function(d){if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(d.img)){return "uploaded/"+d.img;}})
        //      ;
            // .append("svg:image")
            //   .attr('xlink:href', function(d){if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(d.img)){return "uploaded/"+d.img;}})
            //   .call(d3.drag()
            //       .on("start", dragstarted)
            //       .on("drag", dragged)
            //       .on("end", dragended));

        var postTitle = svg.selectAll(".mytext").data(nodes).enter()
            .append("text")
            .on("mousedown", clickOnNode);
        postTitle.style("fill", "#cccccc")
          .attr("width", "10")
          .attr("height", "10")
          .style("fill","#ffd24d")
          .text(function(d) { return text_truncate(d.content, 16); });

              // svg.selectAll(".nodes").data(data.nodes).enter()
              // .append('svg:image')
              //   .attr('xlink:href', function(d){if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(d.img)){return "uploaded/"+d.img;}})
              //   .attr("x", function(d){console.log(d);console.log(d.x);return d.x;})
              //   .attr("y", function(d){return d.y;})
              //   .attr("width", "50")
              //   .attr("height", "50");

        function mousemove(){
          mouseCoordinates = d3.pointer(this);
          //cursor.attr("transform", "translate(" + String(d3.mouse(this)) + ")");
        }
        function mouseoverNode(d, i) {
          var thisObject = d3.select(this)["_groups"][0][0];
          d3.select(node.nodes()[i])
          .transition()
          .attr("r", 2*thisObject["attributes"][0]["nodeValue"] )
          .duration(500);
        }
        function mouseoutNode(d, i) {
          console.log(node);
          console.log(d);
          console.log(i);
          var thisObject = d3.select(this)["_groups"][0][0];
          d3.select(node.nodes()[i])
          .transition()
          .attr("r", thisObject["attributes"][0]["nodeValue"]/2 )
          .duration(500);
        }
        
        function clickOnTag(d, i){
          //console.log(d);
          closeAllFrames();
          document.getElementById('uploadNewPostButton').innerHTML="-";
          clickOnAddNewPost=true; 
          var upvoteModalElement = document.getElementById('upvoteTagModal').style;
          document.getElementById('tagNameInModal').innerHTML = d.tag;
          document.getElementById('contentInModal').innerHTML = d.source.content;
          document.getElementById('postNameInModal').innerHTML = d.source.id;
          //upvoteModalElement.left = String(mouseCoordinates[0])+"px";
          //upvoteModalElement.top = String(mouseCoordinates[1])+"px";
          upvoteModalElement.display = "block";
        }
        function clickOnNode(d, i){
          //previewFrame.innerHTML = linkifyHtml(d.content, linkifyOptions);
          //linkifyStr(previewFrame, linkifyOptions);
          console.log(i.id);
          window.location.href='/?post='+String(i.id);
          closeAllFrames();
          clickOnAddNewPost=true;
          document.getElementById('uploadNewPostButton').innerHTML="-";
          document.getElementById('postNameInModalPostOnly').innerHTML = d.id;
          document.getElementById('contentInModal').innerHTML = d.content;
          previewContent.innerHTML = "<a href="+d.content+">"+d.content+"</a>";
          document.getElementById('previewframe').style.display = "block";
        }
        function restart(){
          node = node.data(data.nodes);

          node.enter().insert("circle", ".cursor")
              .attr("class", "node")
              .attr("r", 5)
              .on("mousedown", mousedownNode);

          node.exit()
              .remove();

          link = link.data(data.links);

          link.enter().insert("line", ".node")
              .attr("class", "link");
          link.exit()
              .remove();
          simulation
              .nodes(data.nodes)
              .on("tick", ticked);

          simulation.force("link")
              .links(data.links);
        }
        function dragstarted(d){
          simulation.stop();
          if (!d3.event.active){ simulation.alphaTarget(0.3).restart();}
          d.fx = d.x;
          d.fy = d.y;
        }
        function dragged(d){
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }
        function dragended(d){
          if (!d3.event.active){simulation.alphaTarget(0);}
          d.fx = null;
          d.fy = null;
        }
      });

}

function autocomplete(inp, arr){
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus-=1;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) { /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) { closeAllLists(e.target); }); /*execute a function when someone clicks in the document:*/
}

autocomplete(document.getElementById("newTagInput"), existingTagArray);
autocomplete(document.getElementById("tag1"), existingTagArray);
autocomplete(document.getElementById("tag2"), existingTagArray);

window.onload = onloadFunction();