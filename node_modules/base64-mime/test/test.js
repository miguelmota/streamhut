var test = require('tape');
var base64Mime = require('../index');

var encoded = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAASCAMAAAB2Mu6sAAAAwFBMVEXmd3eurq7ru7utra3wu7v43d3dd3fYd3fdRETh4eHOd3fuu7vmu7v03d3jZmbliIjuzMyysrL0zMz67u7f39/pu7vCRETemZm1MzO/IiLTd3eqqqrlmZnUERHIIiLIVVXDERHQRETid3f77u6/AAC1AADIAADRAACsAACsrKyjAACQAADaAACaAACvr6////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyO2tUAAAAMXRSTlP///////////////////////////////////////////////////////////////8AH5pOIQAAAAFiS0dEPz5jMHUAAAAJcEhZcwAAAEgAAABIAEbJaz4AAAAJdnBBZwAAABgAAAASAIKjTSwAAACvSURBVBjTfZDZDsIgFAWhu23d931rC63K8f+/zoPRRiNxkkvITHi4iDupzRvfNx3AOvEMaDFgcQUJDCfuF8DaGSxt8PFF/QpXBzYoIoTYqp4QiVIJ7zQMFUEYhlVwHqFfnRAENAwFQRThkGXFBkWE446GoSQYwys9r4yxjIGYhkETzGdaTwf7blevYIVmaAhSHjmQL5oUVjQMNyd2j4uD3y/53PxfMEaammMkx0jrHuFnQ3M6rnrlAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDEwLTAyLTExVDE0OjIxOjAyLTA1OjAwuwNY9QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxMC0wMi0xMVQxMzo1MzoxMS0wNTowMGehOawAAAAASUVORK5CYII=';

test('mime', function(t) {
  t.plan(4);
  t.equal(base64Mime(encoded), 'image/png');
  t.equal(base64Mime('data:image/png,base64'), 'image/png');
  t.equal(base64Mime('data:image/svg+xml,base64'), 'image/svg+xml');
  t.equal(base64Mime('data:application/x-www-form-urlencoded,'), 'application/x-www-form-urlencoded');
});
