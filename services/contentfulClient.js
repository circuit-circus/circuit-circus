var contentful = require('contentful');

var client = contentful.createClient({
    space: 'oewqprhhhtof',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'a75e18bbc503ef3471d464e9648bfef6cefc1c3ac76338e1fec42d02ba6e718c'
});

exports.client = client;