// JS 13k 2023 entry

// Global constants
const XMAX=320;
const YMAX=180;
const TILESIZE=16;
const TILESPERROW=12;
const BGCOLOUR="#80c768";

const STATEINTRO=0;
const STATEMENU=1;
const STATEPLAYING=2;
const STATENEWLEVEL=3;
const STATECOMPLETE=4;

// Tile ids
const TILE_COIN=93;
const TILE_CURSOR=132;
const TILE_PLAYER=143;

// Game state
var gs={
  // animation frame of reference
  step:(1/60), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame
  fps:0, // current FPS
  frametimes:[], // array of frame times

  // physics in pixels per frame @ 60fps
  gravity:0.05,
  terminalvelocity:10,
  friction:1,

  // Canvas
  canvas:null, // Tiles
  ctx:null,
  scanvas:null, // Sprites
  sctx:null,
  scale:1, // Changes when resizing window

  // Cursor
  cursor:false, // Should cursor be shown
  cursorx:0, // x position of cursor
  cursory:0, // y position of cursor
  touch:false, // touchscreen - hide mouse

  // Tilemap image
  tilemap:null,
  tilemapflip:null,

  // Main character
  x:0, // x position
  y:0, // y position
  vs:0, // vertical speed
  hs:0, // horizontal speed
  tileid:TILE_PLAYER, // current player tile
  flip:false, // if player is horizontally flipped
  path:[], // path player is following when moving

  // Level attributes
  level:0, // Level number (0 based)
  width:0, // Width in tiles
  height:0, // height in tiles
  xoffset:0, // current view offset from left (horizontal scroll)
  yoffset:0, // current view offset from top (vertical scroll)

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:8, // time until next character animation frame

  // Particles
  particles:[], // an array of particles for explosion frage, footprint / jump dust

  // Game state
  state:STATEPLAYING, // state machine, 0=intro, 1=menu, 2=playing, 3=complete

  // Timeline for animation
  timeline:new timelineobj(),

  // Debug flag
  debug:false
};

// Random number generator
function rng()
{
  return Math.random();
}

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
  var ratio=XMAX/YMAX;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=YMAX/XMAX;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }
  
  gs.scale=(height/YMAX);

  // Tiles
  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';

  // Sprites
  gs.scanvas.style.top=top+"px";
  gs.scanvas.style.left=left+"px";
  gs.scanvas.style.transformOrigin='0 0';
  gs.scanvas.style.transform='scale('+gs.scale+')';
}

// Draw tile
function drawtile(tileid, x, y)
{
  // Don't draw tile 0 (background)
  if (tileid==0) return;

  // Clip to what's visible
  if (((x-gs.xoffset)<-TILESIZE) && // clip left
      ((x-gs.xoffset)>XMAX) && // clip right
      ((y-gs.yoffset)<-TILESIZE) && // clip top
      ((y-gs.yoffset)>YMAX))   // clip bottom
    return;

  gs.ctx.drawImage(gs.tilemap, (tileid*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((tileid*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE, x-gs.xoffset, y-gs.yoffset, TILESIZE, TILESIZE);
}

// Draw sprite
function drawsprite(sprite)
{
  // Don't draw sprite 0 (background)
  if (sprite.id==0) return;

  // Clip to what's visible
  if (((Math.floor(sprite.x)-gs.xoffset)<-TILESIZE) && // clip left
      ((Math.floor(sprite.x)-gs.xoffset)>XMAX) && // clip right
      ((Math.floor(sprite.y)-gs.yoffset)<-TILESIZE) && // clip top
      ((Math.floor(sprite.y)-gs.yoffset)>YMAX))   // clip bottom
    return;

  if (sprite.flip)
    gs.sctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILESIZE)-((sprite.id*TILESIZE) % (TILESPERROW*TILESIZE)))-TILESIZE, Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILESIZE, TILESIZE);
  else
    gs.sctx.drawImage(gs.tilemap, (sprite.id*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILESIZE, TILESIZE);
}

// Draw single particle
function drawparticle(particle)
{
  var x=particle.x+(particle.t*Math.cos(particle.ang));
  var y=particle.y+(particle.t*Math.sin(particle.ang));

  // Clip to what's visible
    if (((Math.floor(x)-gs.xoffset)<0) && // clip left
    ((Math.floor(x)-gs.xoffset)>XMAX) && // clip right
    ((Math.floor(y)-gs.yoffset)<0) && // clip top
    ((Math.floor(y)-gs.yoffset)>YMAX))   // clip bottom
  return;

  gs.sctx.fillStyle="rgba("+particle.r+","+particle.g+","+particle.b+","+particle.a+")";
  gs.sctx.fillRect(Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, particle.s, particle.s);
}

// Draw particles
function drawparticles()
{
  for (var i=0; i<gs.particles.length; i++)
    drawparticle(gs.particles[i]);
}

// Generate some particles around an origin
function generateparticles(cx, cy, mt, count, rgb)
{
  for (var i=0; i<count; i++)
  {
    var ang=(Math.floor(rng()*360)); // angle to eminate from
    var t=Math.floor(rng()*mt); // travel from centre
    var r=rgb.r||(rng()*255);
    var g=rgb.g||(rng()*255);
    var b=rgb.b||(rng()*255);

    gs.particles.push({x:cx, y:cy, ang:ang, t:t, r:r, g:g, b:b, a:1.0, s:(rng()<0.05)?2:1});
  }
}

// Do processing for particles
function particlecheck()
{
  var i=0;

  // Process particles
  for (i=0; i<gs.particles.length; i++)
  {
    // Move particle
    gs.particles[i].t+=0.5;
    gs.particles[i].y+=(gs.gravity*2);

    // Decay particle
    gs.particles[i].a-=0.007;
  }

  // Remove particles which have decayed
  i=gs.particles.length;
  while (i--)
  {
    if (gs.particles[i].a<=0)
      gs.particles.splice(i, 1);
  }
}

// Move character around
function updateMovements()
{
  var speed=1;

  // Move main character if a path is set
  if (gs.path.length>0)
  {
    var nextx=Math.floor(gs.path[0]%gs.width)*TILESIZE;
    var nexty=Math.floor(gs.path[0]/gs.width)*TILESIZE;
    var deltax=Math.abs(nextx-gs.x);
    var deltay=Math.abs(nexty-gs.y);

    // Check if we have arrived at the current path node
    if ((deltax==0) && (deltay==0))
    {
      // We are here, so move on to next path node
      gs.path.shift();

      // Generate some "dust" as we move
      generateparticles(gs.x+(TILESIZE/2), gs.y+TILESIZE, 1, 1, {r:1, g:170, b:1});
    }
    else
    {
      // Move onwards, following path
      if (deltax!=0)
      {
        gs.flip=(nextx<gs.x);
        gs.hs=gs.flip?-speed:speed;
        gs.x+=gs.hs;

        if (gs.x<0)
          gs.x=0;
      }

      if (deltay!=0)
      {
        gs.y+=(nexty<gs.y)?-speed:speed;

        if (gs.y<0)
          gs.y=0;
      }
    }
  }

  // Check for particle usage
  particlecheck();
}

// Load level
function loadlevel(level)
{
  // Make sure it exists
  if ((level>=0) && (levels.length-1<level)) return;

  // Set current level to new one
  gs.level=level;

  // Deep copy tiles list to allow changes
  gs.tiles=JSON.parse(JSON.stringify(levels[gs.level].tiles));

  // Get width/height of new level
  gs.width=parseInt(levels[gs.level].width, 10);
  gs.height=parseInt(levels[gs.level].height, 10);

  gs.chars=[];

  // Populate chars (non solid tiles)
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].chars[(y*gs.width)+x]||0, 10);

      if (tile!=0)
      {
        var obj={id:(tile-1), x:(x*TILESIZE), y:(y*TILESIZE), flip:false, hs:0, vs:0, del:false};

        switch (tile-1)
        {
          case TILE_PLAYER: // Player
            gs.x=obj.x; // Set current position
            gs.y=obj.y;

            gs.sx=obj.x; // Set start position
            gs.sy=obj.y;

            gs.vs=0; // Start not moving
            gs.hs=0;
            gs.flip=false;

            gs.path=[]; // Clear any path being followed
            gs.particles=[]; // Clear any leftover particles
            break;

          default:
            gs.chars.push(obj); // Everything else
            break;
        }
      }
    }
  }
}

// Draw level
function drawlevel()
{
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);
      drawtile(tile-1, x*TILESIZE, y*TILESIZE);
    }
  }
}

// Draw chars
function drawchars()
{
  for (var id=0; id<gs.chars.length; id++)
    drawsprite(gs.chars[id]);
}

// Scroll level to player
function scrolltoplayer(dampened)
{
  var xmiddle=Math.floor((XMAX-TILESIZE)/2);
  var ymiddle=Math.floor((YMAX-TILESIZE)/2);
  var maxxoffs=((gs.width*TILESIZE)-XMAX);
  var maxyoffs=((gs.height*TILESIZE)-YMAX);

  // Work out where x and y offsets should be
  var newxoffs=gs.x-xmiddle;
  var newyoffs=gs.y-ymiddle;

  if (newxoffs>maxxoffs) newxoffs=maxxoffs;
  if (newyoffs>maxyoffs) newyoffs=maxyoffs;

  if (newxoffs<0) newxoffs=0;
  if (newyoffs<0) newyoffs=0;

  // Determine if xoffset should be changed
  if (newxoffs!=gs.xoffset)
  {
    if (dampened)
    {
      var xdelta=1;

      if (Math.abs(gs.xoffset-newxoffs)>(XMAX/5)) xdelta=4;

      gs.xoffset+=newxoffs>gs.xoffset?xdelta:-xdelta;
    }
    else
      gs.xoffset=newxoffs;
  }

  // Determine if xoffset should be changed
  if (newyoffs!=gs.yoffset)
  {
    if (dampened)
    {
      var ydelta=1;

      if (Math.abs(gs.yoffset-newyoffs)>(YMAX/5)) ydelta=4;

      gs.yoffset+=newyoffs>gs.yoffset?ydelta:-ydelta;
    }
    else
      gs.yoffset=newyoffs;
  }
}

// Redraw the game world
function redraw()
{
  // Scroll to keep player in view
  scrolltoplayer(true);

  // Clear the tile canvas
  gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

  // Draw the level
  drawlevel();

  // Clear the sprites canvas
  gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);

  // Draw the chars
  drawchars();

  // Draw the player
  drawsprite({id:gs.tileid, x:gs.x, y:gs.y+((gs.x%TILESIZE)==8?1:0), flip:gs.flip});

  // Draw the particles
  drawparticles();

  // Draw the cursor
  if ((gs.cursor) && (!gs.touch))
    drawsprite({id:TILE_CURSOR, x:gs.cursorx+gs.xoffset, y:gs.cursory+gs.yoffset, flip:false});
}

// Check if area a overlaps with area b
function overlap(ax, ay, aw, ah, bx, by, bw, bh)
{
  // Check horizontally
  if ((ax<bx) && ((ax+aw))<=bx) return false; // a too far left of b
  if ((ax>bx) && ((bx+bw))<=ax) return false; // a too far right of b

  // Check vertically
  if ((ay<by) && ((ay+ah))<=by) return false; // a too far above b
  if ((ay>by) && ((by+bh))<=ay) return false; // a too far below b

  return true;
}

// Collision check with player hitbox
function checkcollide()
{
  // Generate player hitbox
  var px=gs.x+(TILESIZE/3);
  var py=gs.y+((TILESIZE/5)*2);
  var pw=(TILESIZE/3);
  var ph=(TILESIZE/5)*3;
  var id=0;

  // Iterate over all chars on the map
  for (id=0; id<gs.chars.length; id++)
  {
    // Check for collision with this char
    if (overlap(px, py, pw, ph, gs.chars[id].x, gs.chars[id].y, TILESIZE, TILESIZE))
    {
      switch (gs.chars[id].id)
      {
        case TILE_COIN:
          gs.chars[id].del=true; // Remove coin from map
          break;

        default:
          break;
      }
    }
  }
}

// Update movement and logic of characters
function updatecharAI()
{
  var id=0;

  // Remove anything marked for deletion
  id=gs.chars.length;
  while (id--)
  {
    if (gs.chars[id].del)
      gs.chars.splice(id, 1);
  }
}

// Run an update step to the game state
function update()
{
  // Move player
  updateMovements();

  // Update the AI of all the characters
  updatecharAI();

  // Check for player collision
  checkcollide();
}

function rafcallback(timestamp)
{
  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    redraw();

    // If the update took us out of play state then stop now
    if (gs.state!=STATEPLAYING)
      return;
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  window.requestAnimationFrame(rafcallback);
}

// New level
function newlevel(level)
{
  if ((level<0) || (level>=levels.length))
    return;

    gs.level=level;

    loadlevel(gs.level);

    // Start frame callbacks
    window.requestAnimationFrame(rafcallback);
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Set up tiles canvas
  gs.canvas=document.getElementById("tiles");
  gs.ctx=gs.canvas.getContext("2d");

  // Set up sprites canvas
  gs.scanvas=document.getElementById("sprites");
  gs.sctx=gs.scanvas.getContext("2d");

  gs.scanvas.onmousedown=function(e)
  {
    e = e || window.event;
    settarget(e);
  };

  // Mouse pointer events
  window.addEventListener("mousemove", (e) => { pointerpos(e); } );
  window.addEventListener("mouseout", function() { gs.cursor=false; });

  // Touchscreen events
  window.addEventListener("touchstart", function() { gs.touch=true; });
  window.addEventListener("touchend", function() { gs.touch=true; });
  window.addEventListener("touchcancel", function() { gs.touch=true; });
  window.addEventListener("touchmove", function() { gs.touch=true; });

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Load tilemap
  gs.tilemap=new Image;
  gs.tilemap.onload=function()
  {
    // Create a horizontally flipped version of the spritesheet
    // https://stackoverflow.com/questions/21610321/javascript-horizontally-flip-an-image-object-and-save-it-into-a-new-image-objec
    var c=document.createElement('canvas');
    var ctx=c.getContext('2d');
    c.width=gs.tilemap.width;
    c.height=gs.tilemap.height;
    ctx.scale(-1, 1);
    ctx.drawImage(gs.tilemap, -gs.tilemap.width, 0);

    gs.tilemapflip=new Image;
    gs.tilemapflip.onload=function()
    {
      newlevel(0);
    };
    gs.tilemapflip.src=c.toDataURL();
  };
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };
