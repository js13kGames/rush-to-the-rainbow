#!/bin/bash

# Check for work folder specified
if [ $# -ge 1 ]
then
  workdir=$1
  echo "Entering ${workdir}"
  cd "${workdir}"
fi

if [ $# -ge 2 ]
then
  param=$2
else
  param=""
fi

zipfile="js13k.zip"
buildpath="tmpbuild"
jscat="${buildpath}/min.js"
indexcat="${buildpath}/index.html"
assetsrc="assets/tilemap.png"
assetsprsrc="assets/spritesheet.png"
assetjs="tilemap.js"
leveljs="levels.js"

# See if the levels asset need to be rebuilt
mostrecentlevel=`ls -larth assets/level*.tmx | tail -1 | awk '{ print $NF }'`
srcdate=`stat -c %Y ${mostrecentlevel} 2>/dev/null`
destdate=`stat -c %Y ${leveljs} 2>/dev/null`

# If no js asset found, force build
if [ "${destdate}" == "" ]
then
  destdate=0
fi

# When source is newer, rebuild
if [ ${srcdate} -gt ${destdate} ]
then
  echo -n "Rebuilding levels..."

  # Clear old dest
  echo -n "" > "${leveljs}"

  # Start new file
  echo -n "var levels=[" > "${leveljs}"
  first="true"
  for file in `ls assets/level*.tmx | sort -V`
  do
    if [ "$first" = "false" ]
    then
      echo -n "," >> "${leveljs}"
    fi

    php compactlevel.php "${file}" | sed 's/,0,/,,/g' | sed 's/,0,/,,/g' | sed 's/\[0,/\[,/g' | sed 's/,0\]/,\]/g' | sed 's/"width"/width/g' | sed 's/"height"/height/g' | sed 's/"storm"/storm/g' | sed 's/"level"/level/g' >> "${leveljs}"

    first="false"
  done

  echo -n "];" >> "${leveljs}"

  echo "done"
fi

# See if the tilemaps asset needs to be rebuilt
srcdate=`stat -c %Y ${assetsrc} 2>/dev/null`
srcsprdate=`stat -c %Y ${assetsprsrc} 2>/dev/null`
destdate=`stat -c %Y ${assetjs} 2>/dev/null`

# If no js asset found, force build
if [ "${destdate}" == "" ]
then
  destdate=0
fi

# When either source is newer, rebuild
if [ ${srcdate} -gt ${destdate} -o ${srcsprdate} -gt ${destdate} ]
then
  echo -n "Rebuilding tilemaps JS..."

  # Clear old dest
  echo -n "" > "${assetjs}"

  # Convert from src to dest
  echo -n 'const tilemap="' >> "${assetjs}"
  base64 -w 0 "${assetsrc}" >> "${assetjs}"
  echo '";' >> "${assetjs}"

  echo -n 'const spritesheet="' >> "${assetjs}"
  base64 -w 0 "${assetsprsrc}" >> "${assetjs}"
  echo '";' >> "${assetjs}"

  echo "done"
fi

if [ "${param}" == "run" ]
then
  curbrowser=`which xdg-open >/dev/null 2>&1`
  if [ "${curbrowser}" == "" ]
  then
    curbrowser="firefox"
  fi

  ${curbrowser} "index.html" >/dev/null 2>&1
  exit 0
fi

# Create clean build folder
echo "Cleaning build folder"
rm -Rf "${buildpath}" >/dev/null 2>&1
mkdir "${buildpath}"

# Concatenate the JS files
echo "Concatenating JS"
touch "${jscat}" >/dev/null 2>&1
for file in "${assetjs}" "${leveljs}" "chipper.js" "timeline.js" "inputs.js" "main.js"
do
  cat "${file}" >> "${jscat}"
done

# Add the index header
echo -n '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta http-equiv="Content-Type" content="text/html;charset=utf-8"/><title>JS13k 2026</title><style>' > "${indexcat}"

# Inject the concatenated and minified CSS files
echo "Minifying CSS"
for file in "main.css"
do
  JAVA_CMD=java yui-compressor "${file}" >> "${indexcat}"
done

# Add on the rest of the index file
echo -n '</style><script type="text/javascript">' >> "${indexcat}"

# Inject the closure-ised and minified JS
echo "Using closure to minify JS"
./closeyoureyes.sh "${jscat}" | tr -d '\n' >> "${indexcat}"

# Add on the rest of the index file
echo -n '</script><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/></head><body><div id="wrapper"><canvas id="canvas" width="320" height="180"></canvas></div></body></html>' >> "${indexcat}"

# Remove the minified JS
rm "${jscat}" >/dev/null 2>&1

# Remove old zip
rm -Rf "${zipfile}" >/dev/null 2>&1

# Zip everything up
echo "ZIP build folder"
zip -j "${zipfile}" "${buildpath}"/*

# Re-Zip with advzip to save a bit more
echo "Trying to reduce ZIP size"
advzip -i 200 -k -z -4 "${zipfile}"

# Determine file sizes and compression
unzip -lv "${zipfile}"
stat "${zipfile}"

zipsize=`stat -c %s "${zipfile}"`
maxsize=$((13*1024))
bytesleft=$((${maxsize}-${zipsize}))
percent=$((200*${zipsize}/${maxsize} % 2 + 100*${zipsize}/${maxsize}))

if [ ${bytesleft} -ge 0 ]
then
  echo "YAY ${percent}% used - it fits with ${bytesleft} bytes spare"
else
  echo "OH NO ${percent}% used - it's gone ovey by "$((0-${bytesleft}))" bytes"
fi
