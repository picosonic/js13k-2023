# Dev Diary / Postmortem

This is my seventh game jam entry. This year I am joined by two developers [Steph-ski](https://github.com/Steph-ski) and [ClDaly2904](https://github.com/ClDaly2904)

Like in all my previous years entering the competition, just before the theme was announced I created a new project template with updated build and minify steps from my entry last year. This year I also added my collaborators to the project.

Our first hurdle was deciding on a group name, the ideas we had were a combination of parts of our names ..

* SteffiJazzCat
* JazzCatSki

Cat liked the idea of doing a platformer having played some of my previous JS13k entries. Steph on the other hand although liked the games I'd done felt we should make something a bit different.

As soon as the theme was announced we had some thoughts as to what kind of game we wanted to create to fit the theme, here as some of our initial thoughts/notes/ideas ..

13th CENTURY
------------
* January 1st 1201 (MCCI) until December 31st 1300 (MCCC)
* Mogol empire was founded by Genghis Khan
* Japan successfully resisted 2 Mongol invasions
* In European history, this period is considered the High Middle Ages
* Fibonacci
* Marco Polo
* Latin Empire created
* King John signs the Magna Carta at Runnymede
* Ottoman Empire
* Lots of wars
* Books shift from monasteries to city libraries
* Pecia book copying
* Wooden moveable type
* Rockets, bombs, landmines and handguns
* Eyeglasses
* Mechanical escapement used by clock mechanisms
* Buttons (and button holes)
* Rapidly incresing population in Europe

Game ideas
----------
* I like doing platformer games, but with some kind of unique feature compared to existing games
* A platformer would give us plenty of scope for various elements of game design - JS coding, CSS, graphics, levels, AI, sound, menus, addictive gameplay, hook, difficulty progression, achievements, e.t.c.

Here is a rough diary of progress as posted on our group chat, [Twitter](https://twitter.com/femtosonic), taken from notes and [commit logs](https://github.com/picosonic/js13k-2023/commits/)..

13th August
-----------
Looking into the 13th Century on Wikipedia, and having ideas about possible games.

Need to decide some objectives. Think about what might help or hinder the player in their quest.

Also need to think about possible music style and level design as these can set the pace of the game.

Decided we need think about puzzles or a hook to make it unique and give it replay value. Plus it doesn't have to be a platformer.

Cat suggested a game where a princess rescues a knight.

14th August
-----------
While out dog walking at lunchtime we discussed some ideas.

On your quest you can pick up spells or potions to help advance.

Thought about what possible enemies we might have, ideas were rats with the plague who infect villagers that you then need to heal. Maybe also spiders.

Maybe have a day and night element to it or different weather where different things happen depending on the environment.

Perhaps have a castle or dungeon with a boss fight?

Discovered a nice tilemap from Kenney [Tiny Town](https://kenney.nl/assets/tiny-town), which has nice medieval looking village tiles. Also liked the look of another Kenney tilemap [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon) which includes lots of castle and dungeon tiles not to mention a large number of characters.

We could make the game point and click rather than a platformer then it could work on mobile/tablet and desktop.

15th August
-----------
Cat thought the Kenney tiles looked cute and a little like a Pokemon village. Also suggesting black death as a good 13th century game mechanic with either rat as enemies or play as a little rat that has to infect villagers.

Steph liked Cat's suggestion that we could go round trying to cure the villagers and avoid the rats.

Bringing this together I suggested collecting potions, spells and objects. Maybe some potions to cure require mixing a few others together.

We need to decide on a minimal set of sprites because the two tile maps are 5kb each so need reducing to just what we need.

I think the next step is to get rendering the tiles/sprites to canvas, then get some character movements going.

22nd August
-----------
After a couple of us had some holiday away from coding, I'm feeling quite far behind in terms of progress since no actual new coding has been done to the project.

I added the timeline and pathfinder libraries from my previous JS13k projects as I think they will prove useful. The timeline to schedule events and the pathfinder to make characters move from where they are to where they need to be whilst avoiding map objects.

I've thought that the game will work best in landscape, so a task will be to determine device orientation and ask user to rotate if it's in portrait mode.

I reduced the canvas size to make the pixelated characters bigger, and made them appear pixelated and not blurred.

The input handler has been split out into a separate JS lib.

Tilemap has been added, just to have the image loaded, flipped and rendered in a RAF call.

23rd August
-----------
Created and added a small test level, just to get familiar again with Tiled.

Added code to the build/run script to detect changes to the level files and rebuild a levels.js file which is a minified representation of them.

Added loading and drawing of the test level.

Fixed game state so that RAF keeps being called.

Started work on mouse input, so that upon press, the position is calculated relative to the canvas. This is limited so that only the canvas fires these events, and the position will be relative to the grid of 16x16. Just need to take level X/Y offset into account for levels which are bigger than the level display area.

Used pathfinder to determine way from current position to clicked position whilst avoiding solid objects.

24th August
-----------
Made the player character follow a path when set, so clicking anywhere on the map will set a target point, generate a path using A star pathfinder algorithm then as part of the frame updates the player will move towards the target.

Combined tile maps for dungeon and town, need to optimise them and pick out just the tiles we actually need, to save space and improve colour map in lowest colours.

Added scroll to player, but then quickly found the click position calculation wasn't taking the scroll into account so had to fix that.

Added some more tiles to the test map just to see how it looks. Also added a default background colour.

25th August
-----------
Added loads more tiles and characters to test level to see how they look. This will also be useful for adding AI to see how they move, and collision detection.

Removed gamepad and keyboard support since this will be a click/touch game instead, there is no need for other input methods at this stage.

Added horizontal flip when character is travelling left/right.

Added a mouse cursor when over the game world canvas. Then spent ages stopping it showing when touchscreen is detected.

Created some issues on github which would be suitable for a good first issue for Steph and Cat to look at.

Also tested the Google closure output to make sure it works.

The current used space out of the 13kb is 90% - most of this is taken up with the huge spritesheet. So the next major task will be to cull it down to size by deciding what will actually be used in the game. This needs to be done before the maps are made otherwise the ids will all change.

26th August
-----------
Reduced tilemap to much smaller set, starting with village and adding people, enemies, potions, treasure chest and a few other bits. Now back down to a more manageable 65%.

Added 8-bit font and text writer library that I've used previously.

Added particle system, which may need tweaking since this is a top down game and gravity won't apply in the same way.

Added collision detection, started with ability to collect coins.

27th August
-----------
Updated level to add some game features, locations and potential tasks.

Added some tile ids for use in game logic.

Made doors in buildings chars so that you can click them as targets and then go inside them.

Now I've got a level which is looking a bit like a game, next stage is to make more things collectable and make other characters move.

2nd September
-------------
Fixed a treasure chest which couldn't be opened, by moving it from tiles to chars.

Added a small test room which can be entered when using a door on the main level. Then when clicking on the door in the test room, the player goes back to the main level beneath the door that was entered.

3rd September
-------------
Found out mini rooms could be escaped from if you click outside the room since exit from room action only happens when it's the end of a followed path (i.e. the door is clicked on). Fixed by adding an invisible solid block just outside the door.

Added custom level property for doorname, which corresponds to the x,y location of where the door is located so that each door goes to a different room.

Added some more inside rooms for buildings, so now we have a Beekeeper's House, Blacksmith's house and Wizard's House.

4th September
-------------
Some of the changes I'd made to levels missed being commited.

Allow treasure chests to be opened, they all reveal coins for now.
But spawning in the same place as the chest didn't work because the player character was also occupying that space and promptly collected the coin because they were overlapping it already meaning it was never seen. So decided to spawn below the chest.

Then fixed issue where treasure could be spawned somewhere inaccessible. When the area below the chest was solid or unreachable the coin could not be collected. Now it checks for the location below being empty and spawns above the chest if it can't spawn below.

It's bugged me that the state of levels isn't preserved as the player moves in and out of buildings through the doors. So I've cached the original state of the levels so the game can be completely restarted. Plus the chars for each level get minified upon loading, which means the nulls are taken out and the x,y positions are set.

5th September
-------------
Write the name of the room at the top of the screen when going inside buildings.

Added some rainbow particles when opening treasure chests.

Ignore other mouse buttons, so only left clicks are processed.

Added some helper functions to use in character AI.

Added logic for ladders/stairs.

Added stausbar which will start off showing coins collected.

6th September
-------------
Added stuff to Wizard's attic.

7th September
-------------
Made a basic launcher batch file for windows environments.

Use different background colours between map and buildings.

Also use differently coloured dust between map and buildings.

Added logic for reading signposts when over them. Need to add some guide ones near the level entry point to give some background.

8th September
-------------
Make the rats chase the wizard to test AI.

10th September
--------------
Make the rats infect the villagers. They now have health bar which reduces on each contact. Once the health reaches zero they turn into a ghost.

Added key logic, so you can collect a key. Once collected you can open a door. Then that door remembers that it is unlocked.

Allow multiple keys to be collected and used.