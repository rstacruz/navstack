Initialize the site/ path:

    git clone git@github.com:rstacruz/navstack.git -b gh-pages site

Update site/ with new files:

    make site

Opening examples:

    npm run examples

Releasing new versions:

    bump *.json navstack.js
    vim History.md
    git release v1.0.0

