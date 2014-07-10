Initialize the site/ path:

    git clone git@github.com:rstacruz/navstack.git -b gh-pages site

Update site/ with new files:

    make site

Run browser tests:

    python -m SimpleHTTPServer
    open http://localhost:8000/test

Opening examples:

    npm run examples

Releasing new versions:

    make                      # build css and docs
    bump *.json *.js
    vim History.md
    npm publish
    git release v1.0.0

