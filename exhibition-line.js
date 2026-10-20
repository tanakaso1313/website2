/* The line beside the studio name saying which exhibition is open right now.
 *
 * The dates are not written here. They are read from the bio page's structured data, which is
 * the one place exhibitions are recorded, so changing a date on the bio page changes this too.
 * Nothing is announced before it opens: the line exists only while a show is running, and
 * disappears by itself the day after the last one closes.
 */
(function exhibitionLine() {
    'use strict';

    var INSTAGRAM = 'https://www.instagram.com/s_o_tanaka';
    var EVERY_MS = 5000;   /* how long each exhibition is shown when several are open */
    var FADE_MS = 500;
    var GAP_MS = 250;      /* blank between one exhibition leaving and the next arriving */

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0');
    }

    function longDate(iso) {
        var p = iso.split('-');
        return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]))
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    }

    function nodesIn(data) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data['@graph'])) return data['@graph'];
        return data ? [data] : [];
    }

    function exhibitionsFrom(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var found = [];
        doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (tag) {
            var data;
            try { data = JSON.parse(tag.textContent); } catch (e) { return; }
            nodesIn(data).forEach(function (n) {
                if (!n || n['@type'] !== 'ExhibitionEvent') return;
                if (!n.startDate || !n.endDate) return;
                var place = n.location || {};
                var city = (place.address || {}).addressLocality;
                if (!place.name || !city) return;
                found.push({ venue: place.name, city: city, start: n.startDate, end: n.endDate });
            });
        });
        return found;
    }

    function openNow(all, day) {
        return all.filter(function (e) { return e.start <= day && day <= e.end; })
                  .sort(function (a, b) { return a.end < b.end ? -1 : a.end > b.end ? 1 : 0; });
    }

    function build(list) {
        var box = document.createElement('div');
        box.className = 'exline';
        var link = document.createElement('a');
        link.href = INSTAGRAM;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        box.appendChild(link);

        var lead = document.createElement('span');
        lead.className = 'exline-lead';
        lead.textContent = 'Now showing at';
        var slot = document.createElement('span');
        slot.className = 'exline-slot';
        link.append(lead, document.createTextNode(' '), slot);

        function fill(e, withDate) {
            slot.textContent = '';
            var venue = document.createElement('span');
            venue.className = 'exline-venue';
            venue.textContent = e.venue;
            var comma = document.createElement('span');
            comma.className = 'exline-comma';
            comma.textContent = ',';
            var city = document.createElement('span');
            city.className = 'exline-city';
            city.textContent = e.city;
            slot.append(venue, comma, document.createTextNode(' '), city);
            if (withDate) {
                var when = document.createElement('span');
                when.className = 'exline-when';
                when.textContent = 'until ' + longDate(e.end);
                slot.append(document.createTextNode(' '), when);
            }
        }

        /* Everything that can be dropped is dropped in order of how little it is missed:
           the closing date first, then the line breaks between venue and city. Measured from
           what the browser actually drew, because a long venue name overflows a tablet in the
           wide layout too, where a phone-width rule would never fire. */
        function rows() {
            var tops = {};
            Array.prototype.forEach.call(link.getClientRects(), function (r) {
                tops[Math.round(r.top)] = 1;
            });
            return Object.keys(tops).length;
        }
        function fit() {
            var when = slot.querySelector('.exline-when');
            var comma = slot.querySelector('.exline-comma');
            if (when) {
                when.hidden = false;
                if (rows() > 1) when.hidden = true;
            }
            if (comma) {
                comma.hidden = false;
                var venue = slot.querySelector('.exline-venue');
                var city = slot.querySelector('.exline-city');
                if (venue && city &&
                    Math.round(city.getBoundingClientRect().top) >
                    Math.round(venue.getBoundingClientRect().top)) comma.hidden = true;
            }
        }

        var i = 0;
        function show(n) { fill(list[n], true); fit(); }
        show(0);

        /* Measuring once is measuring too early: the web font has not arrived, so the line is
           sized wrong and the date is kept when it does not fit. */
        window.addEventListener('resize', fit);
        window.addEventListener('orientationchange', fit);
        window.addEventListener('load', fit);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

        var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (list.length > 1 && !still) {
            var paused = false;
            link.addEventListener('mouseenter', function () { paused = true; });
            link.addEventListener('mouseleave', function () { paused = false; });
            /* The whole line goes, not just the venue: fading only the venue leaves
               "Now showing at" hanging over empty space, which reads as a fault. */
            setInterval(function () {
                if (paused) return;
                box.classList.add('exline-fading');
                setTimeout(function () {
                    i = (i + 1) % list.length;
                    show(i);
                    setTimeout(function () { box.classList.remove('exline-fading'); }, GAP_MS);
                }, FADE_MS);
            }, EVERY_MS);
        } else if (list.length > 1) {
            /* No movement for a visitor who asks for none: name them all instead. */
            slot.textContent = '';
            list.forEach(function (e, n) {
                if (n) slot.append(document.createTextNode(' and '));
                var v = document.createElement('span');
                v.className = 'exline-venue';
                v.textContent = e.venue;
                var c = document.createElement('span');
                c.className = 'exline-city';
                c.textContent = e.city;
                slot.append(v, document.createTextNode(', '), c);
            });
            fit();
        }
        return box;
    }

    function read(path) {
        return fetch(path, { credentials: 'same-origin' })
            .then(function (r) { return r.ok ? r.text() : null; })
            .catch(function () { return null; });
    }

    function start() {
        var topline = document.querySelector('.topline');
        if (!topline) return;
        /* The live site serves the bio page without its extension; a plain static server
           (a local preview) only has the file itself, so fall back to it. */
        read('/bio')
            .then(function (html) { return html || read('/bio.html'); })
            .then(function (html) {
                if (!html) return;
                var open = openNow(exhibitionsFrom(html), today());
                if (!open.length) return;
                topline.appendChild(build(open));
                document.body.classList.add('has-exline');
            })
            .catch(function () { /* no exhibition line rather than a broken one */ });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
