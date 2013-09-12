var path   = require('path');
var fs     = require('fs');
var async  = require('async');

var EventEmitter = require('events').EventEmitter;

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

module.exports = function (file_to_upload, program) {
  var azure       = require('azure');
  var blobService = azure.createBlobService();
  var emitter     = new EventEmitter();

  blobService.createContainerIfNotExists(program.container, { publicAccessLevel : 'blob' }, function(error){
    if(error) return emitter.emit('error', error);
    if (program.from) {
      var blobUrl  = blobService.getBlobUrl(program.container, program.from);

      return blobService.copyBlob(blobUrl, program.container, file_to_upload, function(error){
        if(error) return emitter.emit('error', error);
        
        emitter.emit('end');

      });
    }

    var size = fs.statSync(file_to_upload).size;
    var chunkSize = Math.pow(1024,2) * program.chunksize;
    var chunks = Math.ceil(size / chunkSize);
    var blobName = path.basename(file_to_upload);
    
    emitter.emit('starting', chunks);

    async.timesSeries(chunks, function (n, next) {
      

      var start = n * chunkSize;
      var end = start + chunkSize;// - 1;
      if (n == chunks-1) {
        end = start+(size%chunkSize);
      }
      var blockId = blobName + '--' + pad(n, 4);
      
      var stream = fs.createReadStream(file_to_upload, {start: start, end: end});

      blobService.createBlobBlockFromStream(blockId, program.container, blobName, stream, end-start, function(error){
        if(error) return emitter.emit('error', error);
        if (!program.quiet) emitter.emit('chunk send');
        next(null, blockId);
      });

    }, function (err, blocks) {
      if (err) return emitter.emit('error', err);

      var blockList = {
        LatestBlocks: blocks
      };

      blobService.commitBlobBlocks(program.container, blobName, blockList, function (err) {
        if (err) return emitter.emit('error', err);
        emitter.emit('end');
      });

    });

  });
  
  return emitter;
};