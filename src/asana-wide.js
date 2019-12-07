// ==UserScript==
// @name         Asana Wide Inbox
// @namespace    https://tampermonkey.g5.dk/
// @version      1.0.1
// @description  Make the Asana Inbox use all available horizontal space.
// @author       Jesper Birkestrøm <jesper@birkestroem.dk>, Gustav Nikolaj <gustavnikolaj@gmail.com>
// @match        https://app.asana.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle('body .Inbox-feedPane { flex-grow: 1; }');
    GM_addStyle('body .Inbox-feedPane:only-child { flex-grow: 0; }');
})();
