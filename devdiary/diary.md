# Dev Diary / Postmortem

This is my ninth game jam entry

As in my previous years entering the competition, around the time the theme was announced I created a new project template with updated build and minify steps from my entry last year

As soon as the theme was announced I had some thoughts as to what kind of game I wanted to create to fit the theme, here as some of my initial thoughts/notes/ideas ..

Unicorns and Rainbows
---------------------
* Unicorns are a well known mythical beast which are horses with a single horn on their forehead
* Unicorns often depicted with a white body
* The horn of a unicorn - the [alicorn](https://en.wikipedia.org/wiki/Unicorn_horn), is said to poses magical properties able to purify water, heal sicknesses and counteract poison. This was once sold powdered in europe (actually walrus or narwhal tusks)
* [Alicorn](https://en.wikipedia.org/wiki/Winged_unicorn) can also mean a winged unicorn
* Unicorns are the national animal of [Scotland](https://en.wikipedia.org/wiki/Scotland)
* Scottish Unicorns were united with English lions to create the [royal crest of king James VI](https://en.wikipedia.org/wiki/James_VI_and_I#Arms)
* In business parlance, a unicorn is a startup company valued at over a billion dollars
* Unicorns are also known as Monocerus, to which there is a [constellation](https://en.wikipedia.org/wiki/Monoceros) bearing the name
* Unicorns are often depicted as wild woodland animals, usually solitary
* [Rainbows](https://en.wikipedia.org/wiki/Rainbow) are intrinsicly linked to Unicorns
* True rainbows only appear opposite in the sky to the sun
* No two people can see the exact same rainbow
* All rainbows are actually [complete circles](https://en.wikipedia.org/wiki/Rainbow#Full-circle_rainbow), which can be seen if viewed from height, although at ground level we normally only see the top half
* The end of the rainbow cannot be reached because it moves as you do, the end was purported to contain a pot of gold
* Rainbows can appear infront or behind of scenery
* At night you can see moonbows when the light source is the sunlight reflected from the moon
* A second feinter rainbow can often be seen 10 degrees above the main rainbow with the colours reversed
* The light in the sky is often darker above the rainbow and lighter below
* The 7 colours of the rainbow are just different [frequencies of light](https://www.britannica.com/science/color/The-visible-spectrum). Red 400-480THz, Orange 480-510THz, Yellow 510-530THz, Green 530-600THz, Blue 600-670THz, Indigo 670-700THz, Violet 700-750THz

Game ideas
----------
Usually the JS13k themes are related to death and destruction, so I really didn't know where to start with something like unicorns and rainbows, haha. Anyways to try to cure my ["blank page syndrome"](https://en.wikipedia.org/wiki/Writer%27s_block), I asked AI for some ideas to try to inspire me. Here's a few of the better ones...
* Unicorn Bakery - Where you run a bakery and have to run around making cupcake orders matching ingredients by colour
* Rainbow rescue - Unicorns are trapped in various places, you need to jump between colours to rescue them
* Cloud Unicorn Delivery - You're a delivery driver taking magical packages between floating islands. Make rainbow bridges with your finite rainbow power 
* Rainbow Hooves - A rhythm game where you tap when a moving unicorn steps on specific coloured rainbow tiles. Longer streaks of matches give the dancing unicorn a longer rainbow trail
* Rainbow Rush - Racing across clouds collecting rainbow colours. Each colour gives you a different ability. You need to complete the rainbow before the storm comes

Here is a rough diary of progress as taken from notes and [commit logs](https://github.com/picosonic/js13k-2026/commits/)..

19th August
-----------
The theme was annouced whilst I was on holiday in Spain chasing the [total solar eclipse](https://en.wikipedia.org/wiki/Solar_eclipse_of_August_12,_2026), so I didn't really get much of a chance to start dev until I was back home.

20th August
-----------
As [my entry last year](https://js13kgames.com/2025/games/mochi-and-the-midnight-escape) lost quite a lot of points by not having any audio, and in any case I ran out of time/space to put any in - I decided to add music first. So with this in mind I started looking at compact ways to make reasonable sounding music, with melody, bass and percussion. I had in my mind that the game would be a retro feeling pixelart game, so I steered towards a [chip tune](https://en.wikipedia.org/wiki/Chiptune) sound.

21st August
-----------
After playing around with various looping melodies, I decided on making slight adjustments to the various aspects of the track so that although it's quite repetitive, it doesn't sound too repetitive due to adjustments. Made a start on main character sprite.

24th August
-----------
Added [animation frame callback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) mechanism which will form the core of [game loop](https://en.wikipedia.org/wiki/Video_game_programming#Game_structure). Added beginnings of platformer physics, included a box which can be controlled to move around and jump.

25th August
-----------
Worked on unicorn character. Separated front and rear legs, developed walk animation by drawing all components of unicorn from spritesheet and rotating legs as required using anchor points on the body and leg sections.

26th August
-----------
Tested minified version and found the music wasn't working. This was due to the note frequency table keys being "optimised" which broke the lookups from melody and bassline sequences because the key names no longer existed. The fix was to change the frequency table keys to be strings.

Tried to simplfy drawing of unicorn character so that instead of drawing the whole character every frame (using each of the individual parts including rotates and translations to put the legs in the right place/pose) I could do a create step once then capture it and use the generated bitmap from then on for drawing  (likely a slight performance increase too). In theory I could also horizontally flip each pose much easier than working out how to draw the character from scratch each time but the other way around. However I ended up breaking it completely.

27th August
-----------
With a fresh head and more sleep I decided to try to get character drawing working the way I had intended to yesterday. Firstly it seemed that the rotate and translate steps when drawing the legs were causing issues - but it was actually becuase I had a save/restore canvas before and after the translations and the restore was being done to a different canvas (due to copy/paste typo). However making a large spritesheet and drawing all the poses onto it, then extracting them using getImageData() worked better. I then tried to flip all the poses, however this failed to work because putImageData() doesn't honour translations like drawImage() does. Once I figured this out, it all started working as I originally wanted.

28th August
-----------
Added level drawing and navigating. Fixed flipped sprite creation - when drawing onto a flipped canvas, the coordinates also need to be flipped.

Added character ducking and coyote time (being allowed to jump for a short while after leaving a platform)

29th August
-----------
Added some more states ready for game statemachine. Determined that lives will show as 7 hearts (one for each colour of rainbow), but will go down in half steps. Added rainbow coloured trail which emits particles when moving that cycle through the rainbow.

Wrestled with flipped sprites being inconsistent, sometimes they are fine, other times not. What seemed to make a difference was putting the storing of sprites into the onload handler and using this to save them (incase the loop moved onwards), then doing the flip on the this object.

Added char animation for flag to wave, coins to rotate, and water to flow. Made alterations to tilemap bitmap, rearranging, reducing e.t.c.

30th August
-----------
Fix broken rainbow trail and broken sprite animations. Added tile id constants ready for logic code. Added placeholder for hurt time, so that we can't be hurt more and the player will flash for a period of time to indicate temporary invulnerability.

Set starting point for main character to they don't always start at top left. Added char collision detection so that keys, coins and gems can be collected. When player is standing on blocks with faces the blocks now lower and grimmace.

When water is running from pipes, prevent unicorn from passing as a game mechanic to force the player to look for a button. Buttons can be used to turn off the water, but it only stays off until the button pops back up. However if the unicorn is in the water flow path it won't turn back on until the unicorn is clear - otherwise you can get stuck.

Collecting keys now unlocks all locks, these will be used (like the running water) as a way to add complexity to the player's journey.

31st August
-----------
Celebrating a birthday. Added collecting of hearts and display of the 7 hearts (one for each colour of the rainbow).

Spikes now cause damage when landed on from above and make unicorn jump up in pain. Flash when hurt, and temporarily invulnerable.

When moving sprites by fractional amounts they can be drawn incorrectly, so sprite tile drawing routine ensures they are rendered on whole number coordinates.

Added logic for BOB robots, to animate when active, and to wake up when the player is near or sleep when they are far away. They also cause damage when touched. Sort the BOB character to the end so that they are rendered on top of othet chars.

Added logic to determine if current level is complete by counting the number of remaining coins and gems and checking to see if the player is on the rainbow. This took longer than anticipated because I was checking for overlapping a rainbow tile - but tiles are solid so you can never overlap them, instead I needed to check for overlapping chars.

1st September
-------------
Added [GamePad support](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API). Updates towards a state machine, whereby the player transitions between the various states. When checking for the level being ended, we don't need to offset the look position to see what chars we are overlapping.

I found that you can go off the RHS of the level, but not the left, this was due to the calculation of the width of the level being a multiple of the sprite width not the tile width.

2nd September
-------------
Noticed that bob was able to go off the edge of a platform to the left but not the right. It turned out this was because I wasn't flipping the sprite and so only checking to the right, rather than checking "forwards".

Removed the code that generated the horizontally flipped tilesheet, because it's actually never used. Only the unicorn sprite gets flipped.

Added display of score (when above zero). Previously I've added a bitmapped font and rendered it as tiles, but I'm going to try just using canvas text rendering to save space.

Created writing using a rainbow gradient, used on game state transition to give information.

Detect failure to complete game (out of lives) and success completing game (when last level is completed).

I want to add a level select screen with clickable boxes (rainbow tinted).

3rd September
-------------
Added a coin block, that when hit from below breaks to reveal a coin. These are included in the check for the level being complete, so they all need collecting.

Decided on a name for the game - "Rush to the Rainbow". The ultimate target once you've collected everything is to get to the rainbow before the storm comes. I've add a countdown timer for the coming of the storm.

Pumpkins can now be collected for 5 points, and gems have been upped to 10 points when collected! But neither are required to complete a level.

I've started to add a level select screen which draws 7 buttons, one for each level. The idea is you can only skip levels you've completed, and your achievments are recorded in [localstorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Added breaker blocks, these have exclaimation points on them and can be broken from below by jumping into them, but it takes health to do so.

The level now gets darker as it approaches the storm down to 50% when the rain starts. I'm using a default of 2 minutes for all levels currently, but I aim to adjust it based on the level complexity, so it'll be a property of each level.

What I'd then like to do is when the storm timer has elapsed completely have pieces of the level collapse.

4th September
-------------
Added support for varying the storm timer on a per level basis.

The rain looked a bit too uniform, so I've made it bobble around a little and be affected by the tiles of the level using hit-detection. Incase this creates too much CPU load, I've reduced the amount of rain particles generated.

Make the score slightly bigger when it just increased to try to highlight it, as most of the time it's pretty small.

Added lightning once the storm timer runs out. Just making the screen white-yellow for a frame, no actual lightning bolt is visible.

Since there's now quite a lot of particles around, I removed the "just hit the ground" particles and the "shiny" particles when collecting keys - because they are just not visible enough.

Added a screen to show between levels, showing level number and description. Although due to space constraints the description was later taken out.

Made some notes of what I still want to do before submitting the game.

5th September
-------------
Spent some time updating the description text for the game which will show on the [game select page](https://js13kgames.com/2026/games/rush-to-the-rainbow) of JS13k website. Simplifying text, adding background and goal, emoji, tile descriptions e.t.c.

Added functionality so that when Escape is pressed it exits the game and goes back to the menu.

Thought I'd better test the gamepad functionality works with an actual gamepad, and was happy to see it all worked as expected without any changes. It also worked on a [Retroid Pocket 6](https://www.goretroid.com/en-gb/products/retroid-pocket-6-handheld) Android handheld.

Created some game screenshots for the submission page, using Grok.

![Rush to the Rainbow](../big_screenshot.png?raw=true "Rush to the Rainbow")

6th September
-------------
Updated the submission page with screenshots after resizing, reducing colour depth to 256 and passing through TinyPNG.

Had to rework the description text for the game submission becuase what I had was over the 2048 byte limit - yikes. This involved removing section headings, minimising whitespace and reducing image URLs.

Allow tiles to be destroyed, they jump up a little and then fall down off the level. This happens to coin and breaker blocks, plus any that will randomly be destroyed when the storm comes

Speed up tween-level screen a little, it felt slow.

Added title text to level select menu and updated game complete text to be more accurate.

7th September
-------------
Started to flesh out some level ideas, a horizontal one and a vertical one. Trying to very roughly theme each level after a colour of the rainbow. Once I've got the mechanics of each level sorted I'll need to adjust the storm timers appropriately.

Added a level which is split into 4 zones - to roughly match the seasons.

8th September
-------------
Highlight on the menu which is the currently selected level and which are unlocked levels (ones that have already been completed).

Some of the levels are made too easy because you can jump off the top of the level and across to otherwise blocked sections of the level. So I've blocked that from happening.

Worked on blue level full of pipes and water.

9th September
-------------
Working on some more level updates, starting to come closer to the 13k limit!

Looking at some ways to reduce size including cropping levels, streamlining CSS, etc.

10th September
--------------
More golfing on the HTML and CSS, removing some properties and attributes which are not required or are now defaulted to what I was setting them to.

Removed polyfill for [window.event](https://developer.mozilla.org/en-US/docs/Web/API/Window/event) which was used for MSIE compatibility.

Removed debug feature, including FPS calculations.

Added rainbow and unicorn to level select screen.

11th September
--------------
Remove timeline from level select menu as it wasn't really necessary. Instead use a new menu raf callback.

Updated so that if you quit back to the main menu with Escape, it remembers how far you played up to and which levels have been unlocked. Otherwise this isn't checked properly again until localStorage is read when the page starts up from nothing or F5 is pressed.

Put code in so that level select menu does start the one you've got highlighted, but you can't go passed ones you've not completed.

Refactored code to remove need for timeline library, since I'm not really doing animation, it makes sense to keep it as raf callbacks instead. Then the space saved can be put towards the level entropy.
