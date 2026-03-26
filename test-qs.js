const qs = require('qs');
console.log('qs array parse:', qs.parse('foo[]=bar'));
console.log('qs multiple parse:', qs.parse('foo[]=bar&foo[]=baz'));
