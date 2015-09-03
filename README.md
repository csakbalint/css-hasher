# hacssh
Hacssh is a tiny tool, that obfuscate style classes and ids in html, css, javascript files. It's work is based on the content of the css files. This script is useful for third-party libraries to protect the codes from conflicts.
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
## License

(The MIT License)

Copyright (c) 2015 Bálint Csák <csak.balint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
