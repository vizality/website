(async function() {
  const fs = require('fs');
  const dir = require('path').dirname(__filename);
  const request = require('request');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function saveImage(fileURL, filePath) {
    await sleep(1000);
    request.get({url: fileURL, encoding: null}, (e,r,b) => fs.writeFileSync(filePath, b));
  }

  // var download = function(uri, filename, callback) {
  //   request.head(uri, function(err, res, body){    
  //     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  //   });
  // };
  
  const SVGStore = require('./svgs/svgs');

  var saved = 0;

  for (let svg of SVGStore) {
    svg = svg.replace('/assets', '');

    // download(`https://discordapp.com/assets/${svg}`, `${dir}/svgs/${svg}`, function(){
    //   console.log('done');
    // });
    await saveImage(`https://discordapp.com/assets/${svg}`, `${dir}/svgs/${svg}`);
    saved++;
  }
  console.log(`Finished: Saved ${saved} files.`)
})();