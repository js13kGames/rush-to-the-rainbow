// Input processing

// Clear input state
function clearinputstate()
{
  gs.keystate=KEYNONE;
  gs.padstate=KEYNONE;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return (((gs.keystate&keybit)!=0) || ((gs.padstate&keybit)!=0));
}

///////////
// Keyboard
///////////

const key_arrow="Arrow";
const key_key="Key";

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.code)
  {
    case key_arrow+"Left": // cursor left
    case key_key+"A": // A
    case key_key+"Z": // Z
      if (dir==1)
        gs.keystate|=KEYLEFT;
      else
        gs.keystate&=~KEYLEFT;

      e.preventDefault();
      break;

    case key_arrow+"Up": // cursor up
    case key_key+"W": // W
    case key_key+"Q": // Q
    case "Semicolon": // semicolon
      if (dir==1)
        gs.keystate|=KEYUP;
      else
        gs.keystate&=~KEYUP;

      e.preventDefault();
      break;

    case key_arrow+"Right": // cursor right
    case key_key+"D": // D
    case key_key+"X": // X
      if (dir==1)
        gs.keystate|=KEYRIGHT;
      else
        gs.keystate&=~KEYRIGHT;

      e.preventDefault();
      break;

    case key_arrow+"Down": // cursor down
    case key_key+"S": // S
    case "Period": // dot
      if (dir==1)
        gs.keystate|=KEYDOWN;
      else
        gs.keystate&=~KEYDOWN;

      e.preventDefault();
      break;

    case "Enter": // enter
    case "Space": // space
      if (dir==1)
        gs.keystate|=KEYACTION;
      else
        gs.keystate&=~KEYACTION;

      e.preventDefault();
      break;

    case "Escape": // escape
      if ((!gs.quit) && (dir==1))
        gs.quit=true;

      e.preventDefault();
      break;

    case "Slash": // forward slash (prevent search popup)
      e.preventDefault();
      break;

    default:
      break;
  }
}

///////////
// Gamepad
///////////

const axes_0123=[0, 1, 2, 3];
const axes_0134=[0, 1, 3, 4];

// Scan for any connected gamepads
function gamepadscan()
{
  var gleft=false;
  var gright=false;
  var gup=false;
  var gdown=false;
  var gjump=false;

  // Find active pads
  for (const gamepad of navigator.getGamepads())
  {
    if (!gamepad) continue;

    // If found by scan before event - register it
    if ((gs.gamepad==-1) && (gamepad.connected))
      addGamepad(gamepad);

    // Only support first found gamepad
    if ((gs.gamepad==gamepad.index) && (gamepad.connected))
    {
      // Check analog axes
      for (var i=0; i<gamepad.axes.length; i++)
      {
        var val=gamepad.axes[i];

        if (i==gs.gamepadaxes[0])
        {
          gs.gamepadaxesval[0]=val;

          if (val<-0.5) // Left
            gleft=true;

          if (val>0.5) // Right
            gright=true;
        }

        if (i==gs.gamepadaxes[1])
        {
          gs.gamepadaxesval[1]=val;

          if (val<-0.5) // Up
            gup=true;

          if (val>0.5) // Down
            gdown=true;
        }

        if (i==gs.gamepadaxes[2])
          gs.gamepadaxesval[2]=val;

        if (i==gs.gamepadaxes[3])
          gs.gamepadaxesval[3]=val;
      }

      // Check buttons
      for (i=0; i<gamepad.buttons.length; i++)
      {
        var val=gamepad.buttons[i];
        var pressed=(val==1.0);

        if (typeof(val)=="object")
        {
          pressed=val.pressed;
          val=val.value;
        }

        if (pressed)
        {
          switch (i)
          {
            case gs.gamepadbuttons[0]: gleft=true; break;
            case gs.gamepadbuttons[1]: gright=true; break;
            case gs.gamepadbuttons[2]: gup=true; break;
            case gs.gamepadbuttons[3]: gdown=true; break;
            case gs.gamepadbuttons[4]: gjump=true; break;
            default: break;
          }
        }
      }

      // Update padstate
      var newstate=KEYNONE;

      if (gup) newstate|=KEYUP;
      if (gdown) newstate|=KEYDOWN;
      if (gleft) newstate|=KEYLEFT;
      if (gright) newstate|=KEYRIGHT;
      if (gjump) newstate|=KEYACTION;

      gs.padstate=newstate;
    }
  }
}

function addGamepad(gamepad)
{
  if (gs.gamepad==-1)
  {
    // Cache gamepad id
    gs.gamepad=gamepad.index;

    // Reset button mappings
    gs.gamepadbuttons.forEach((mapping) => {mapping=-1;});
    // [0] left (left) d-left
    // [1] right (left) d-right
    // [2] top (left) d-up
    // [3] bottom (left) d-down
    // [4] bottom button (right) x

    // Reset axes mappings
    gs.gamepadaxes.forEach((mapping) => {mapping=-1;});
    // [0] left/right axis
    // [1] up/down axis
    // [2] cam left/right axis
    // [3] cam up/down axis

    if (gamepad.mapping==="standard")
    {
      // Browser supported "standard" gamepad
      gs.gamepadbuttons[0]=14; // left (left) d-left
      gs.gamepadbuttons[1]=15; // right (left) d-right
      gs.gamepadbuttons[2]=12; // top (left) d-up
      gs.gamepadbuttons[3]=13; // bottom (left) d-down
      gs.gamepadbuttons[4]=0;  // bottom button (right) x

      gs.gamepadaxes=axes_0123;
    }
    else
    if (gamepad.id.match(/^054c-0268-/i)) // "054c-0268-Sony PLAYSTATION(R)3 Controller"
    {
      // PS3 DualShock 3
      gs.gamepadbuttons[0]=15; // left (left) d-left
      gs.gamepadbuttons[1]=16; // right (left) d-right
      gs.gamepadbuttons[2]=13; // top (left) d-up
      gs.gamepadbuttons[3]=14; // bottom (left) d-down
      gs.gamepadbuttons[4]=0;  // bottom button (right) x

      gs.gamepadaxes=axes_0134;
    }
    else
    if (gamepad.id.match(/^045e-028e-/i)) // "045e-028e-Microsoft X-Box 360 pad"
    {
      // XBOX 360
      // 8Bitdo GBros. Adapter (XInput mode)
      gs.gamepadbuttons[4]=0;  // bottom button (right) x

      gs.gamepadaxes[0]=6; // left/right axis
      gs.gamepadaxes[1]=7; // up/down axis
      gs.gamepadaxes[2]=3; // cam left/right axis
      gs.gamepadaxes[3]=4; // cam up/down axis
    }
    else
    if (gamepad.id.match(/^0f0d-00c1-/i)) // "0f0d-00c1-  Switch Controller"
    {
      // Nintendo Switch
      gs.gamepadbuttons[4]=1;  // bottom button (right) x

      gs.gamepadaxes[0]=4; // left/right axis
      gs.gamepadaxes[1]=5; // up/down axis
      gs.gamepadaxes[2]=2; // cam left/right axis
      gs.gamepadaxes[3]=3; // cam up/down axis
    }
    else
    if ((gamepad.id.match(/^054c-05c4-/i)) ||  // "054c-05c4-Sony Computer Entertainment Wireless Controller"
        (gamepad.id.match(/^045e-02e0-/i))) // "045e-02e0-8Bitdo SF30 Pro" or "045e-02e0-8BitDo GBros Adapter"
    {
      // PS4 DualShock 4
      // 8Bitdo SF30 Pro GamePad (XInput mode)
      // 8Bitdo GBros. Adapter (XInput mode)
      gs.gamepadbuttons[4]=0;  // bottom button (right) x

      gs.gamepadaxes=axes_0134;
    }
    else
    if (gamepad.id.match(/^054c-0ce6-/i)) // "054c-0ce6-Sony Interactive Entertainment Wireless Controller" or "054c-0ce6-Wireless Controller"
    {
      // PS5 DualSense
      gs.gamepadbuttons[4]=1;  // bottom button (right) x

      gs.gamepadaxes[0]=0; // left/right axis
      gs.gamepadaxes[1]=1; // up/down axis
      gs.gamepadaxes[2]=2; // cam left/right axis
      gs.gamepadaxes[3]=5; // cam up/down axis
    }
    else
    if ((gamepad.id.match(/^057e-2009-/i)) || // "057e-2009-Pro Controller"
        (gamepad.id.match(/^18d1-9400-/i))) // "18d1-9400-Google Inc. Stadia Controller" or "18d1-9400-Google LLC Stadia Controller rev. A" or "^18d1-9400-Stadia"
    {
      // Nintendo Switch Pro Controller
      // 8Bitdo SF30 Pro GamePad (Switch mode)
      // 8Bitdo GBros. Adapter (Switch mode)
      // Google Stadia Controller (Wired and Bluetooth)
      gs.gamepadbuttons[4]=0;  // bottom button (right) x (a on Stadia)

      gs.gamepadaxes=axes_0123;
    }
    else
    if (gamepad.id.match(/^2dc8-6100-/i)) // "2dc8-6100-8Bitdo SF30 Pro"
    {
      // 8Bitdo SF30 Pro GamePad (DInput mode)
      gs.gamepadbuttons[4]=1;  // bottom button (right) x

      gs.gamepadaxes=axes_0123;
    }
    else
    {
      // Unknown non-"standard" mapping
      gs.gamepadbuttons[0]=14; // left (left) d-left
      gs.gamepadbuttons[1]=15; // right (left) d-right
      gs.gamepadbuttons[2]=12; // top (left) d-up
      gs.gamepadbuttons[3]=13; // bottom (left) d-down

      gs.gamepadbuttons[4]=0;  // bottom button (right) x
    }
  }
}

function removeGamepad(gamepad)
{
  // See if it's the pad we are using
  if (gs.gamepad==gamepad.index)
  {
    gs.gamepad=-1;
    gs.padstate=KEYNONE;
  }
}

window.addEventListener("gamepadconnected", (evt) => {
  addGamepad(evt.gamepad);
});

window.addEventListener("gamepaddisconnected", (evt) => {
  removeGamepad(evt.gamepad);
});
