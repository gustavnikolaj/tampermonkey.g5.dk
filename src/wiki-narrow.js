// ==UserScript==
// @name         Wikipedia Narrow Content
// @namespace    https://tampermonkey.g5.dk/
// @version      1.0.0
// @description  Make wikipedia pages more readable by setting a sane max width.
// @author       Gustav Nikolaj <gustavnikolaj@gmail.com>
// @match        https://en.wikipedia.org/wiki/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle('#bodyContent { max-width: 70em; }');
})();
