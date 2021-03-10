# Converse Headless

[Converse](https://conversejs.org) has a special build called the *headless build*.

You can generate it yourself by running ``npm run build``
in the root.

The headless build is a bundle of all the non-UI parts of Converse, and its aim
is to provide you with an XMPP library (and application) on which you can build
your own UI.

It's also installable with NPM/Yarn as [converse-headless-xmpp](https://www.npmjs.com/package/converse-headless-xmpp).

The main distribution of Converse relies on the headless build.

Based on:
1. [frontend-webpack-boilerplate](https://github.com/WeAreAthlon/frontend-webpack-boilerplate)
2. [Converse](https://conversejs.org)
