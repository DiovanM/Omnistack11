const crypto = require('crypto');

module.exports =  function generateUID(){
  return crypto.randomBytes(4).toString('HEX');  
}