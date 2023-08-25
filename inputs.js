// Input processing

///////////
// Mouse
///////////

// Set a position on the map to try to navigate to
function settarget(e)
{
  // e.button (0=left, 1=wheel/middle, 2=right)
  // e.offsetX/Y (target relative)
  // e.pageX/Y (document relative)
  // e.screenX/Y (screen relative)
  // e.layerX/Y (original element relative - scaled)
  //console.log(e);
  var myx=Math.floor((e.clientX-e.target.getBoundingClientRect().left)/gs.scale)+gs.xoffset;
  var myy=Math.floor((e.clientY-e.target.getBoundingClientRect().top)/gs.scale)+gs.yoffset;
  //console.log(myx+", "+myy);

  gs.path=pathfinder(
    (Math.floor(gs.y/TILESIZE)*gs.width)+Math.floor(gs.x/TILESIZE), // Current pos
    (Math.floor(myy/TILESIZE)*gs.width)+Math.floor(myx/TILESIZE));  // Clicked pos
}