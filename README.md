# hacssh
Monk is a tiny tool, that obfuscate style classes and ids in html, css, javascript files. It work is based on the content of the css files. This script is useful in third-party libraries to protect the codes from conflicts.
## How to use
Via script
```
var hacssh = require('hacssh');

hacssh.run({
    prefix: 'hacssh',
    index: 'aaaaa',
    cwd: './',
    dest: 'dist/,
    css: ['foo.css', 'bar.css'],
    html: ['baz.html']
});
```

or command line

```
node hacssh/index.js --prefix hacssh --index aaaaa --cwd ./ --dest dist/ css foo.css,bar.css --html baz.html
```
