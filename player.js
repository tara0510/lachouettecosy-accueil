    /* Lecteurs du Coin Cosy : la liste des épisodes vient de l'annuaire public d'Apple Podcasts (mise à jour à
       chaque nouvel épisode). Un lecteur « tous les épisodes » (repli sur Spotify si la liste est introuvable)
       et un lecteur « Derrière le chaudron » qui ne garde que les entretiens (un par mois). */
    var LEC_URL = 'https://itunes.apple.com/lookup?id=1807794277&media=podcast&entity=podcastEpisode&limit=200&country=fr';
    var LEC_SPOTIFY = 'https://open.spotify.com/embed/show/4HGgYjF5aKj6ZxD9TDKqMJ?utm_source=generator&theme=0';
    var LECTEURS = [];

    function lecEl(tag, classe, texte) {
      var e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texte !== undefined) e.textContent = texte;
      return e;
    }
    function lecDate(iso) {
      return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    function lecDuree(ms) {
      if (!ms) return '';
      var m = Math.max(1, Math.round(ms / 60000));
      if (m < 60) return m + I18N[lang].lecMin;
      return Math.floor(m / 60) + ' h ' + ('0' + (m % 60)).slice(-2);
    }
    function lecTexte(html) {
      return new DOMParser().parseFromString(html || '', 'text/html').body.textContent.trim();
    }
    function lecSpotify(zoneId) {
      var zone = document.getElementById(zoneId);
      zone.textContent = '';
      var cadre = lecEl('div', 'spotify-embed');
      var f = document.createElement('iframe');
      f.src = LEC_SPOTIFY; f.width = '100%'; f.height = '232'; f.frameBorder = '0'; f.loading = 'lazy';
      f.title = 'Lecteur Spotify — Le Coin Cosy';
      f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      f.style.cssText = 'width:100%;display:block;';
      cadre.appendChild(f);
      zone.appendChild(cadre);
    }

    /* Fabrique un lecteur : zoneId = conteneur, pref = préfixe des identifiants, opt = { garde(e), titre(e),
       cles: { dernier, tous, nb } (clés I18N), recherche: true/false } */
    function creerLecteur(zoneId, pref, opt) {
      var L = { episodes: [], courant: 0, filtre: '', pret: false };
      var id = function (n) { return document.getElementById(pref + '-' + n); };
      L.construire = function () {
        var zone = document.getElementById(zoneId);
        zone.textContent = '';
        var vedette = lecEl('div', 'lecteur-vedette');
        var img = lecEl('img', 'lecteur-pochette'); img.id = pref + '-pochette'; img.alt = ''; img.width = 116; img.height = 116;
        var infos = lecEl('div', 'lecteur-infos');
        var et = lecEl('span', 'lecteur-etiquette'); et.id = pref + '-etiquette';
        var ti = lecEl('h3'); ti.id = pref + '-titre';
        var me = lecEl('p', 'lecteur-meta'); me.id = pref + '-meta';
        var de = lecEl('p', 'lecteur-desc'); de.id = pref + '-desc';
        infos.append(et, ti, me, de);
        vedette.append(img, infos);
        var audio = document.createElement('audio'); audio.id = pref + '-audio'; audio.controls = true; audio.preload = 'none';
        var tete = lecEl('div', 'lecteur-tete');
        var tous = lecEl('strong'); var tousTxt = lecEl('i'); tousTxt.id = pref + '-tous'; tousTxt.style.fontStyle = 'normal';
        var nb = lecEl('span'); nb.id = pref + '-nb'; tous.append(tousTxt, nb);
        tete.appendChild(tous);
        if (opt.recherche) {
          var rech = document.createElement('input'); rech.type = 'search'; rech.id = pref + '-recherche'; rech.className = 'lecteur-recherche';
          rech.addEventListener('input', function () { L.filtre = rech.value.trim().toLowerCase(); L.liste(); });
          tete.appendChild(rech);
        }
        var liste = lecEl('ul', 'lecteur-liste'); liste.id = pref + '-liste';
        zone.append(vedette, audio, tete, liste);
      };
      L.vedette = function (i, lire) {
        var e = L.episodes[i];
        if (!e) return;
        L.courant = i;
        var audio = id('audio');
        if (audio.getAttribute('data-id') !== String(e.id)) {
          audio.setAttribute('data-id', String(e.id));
          audio.src = e.audio;
        }
        var p = id('pochette'); p.src = e.image; p.alt = opt.titre(e);
        id('titre').textContent = opt.titre(e);
        id('meta').textContent = [lecDate(e.date), lecDuree(e.duree)].filter(Boolean).join(' · ');
        id('desc').textContent = e.desc;
        id('etiquette').textContent = (i === 0) ? I18N[lang][opt.cles.dernier] : I18N[lang].lecEnCours;
        L.liste();
        if (lire) {
          audio.play().catch(function () {});
          document.getElementById(zoneId).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      };
      L.liste = function () {
        var ul = id('liste');
        if (!ul) return;
        ul.textContent = '';
        var n = 0;
        L.episodes.forEach(function (e, i) {
          if (L.filtre && opt.titre(e).toLowerCase().indexOf(L.filtre) === -1) return;
          n++;
          var li = document.createElement('li');
          var b = lecEl('button', 'lecteur-item' + (i === L.courant ? ' actif' : ''));
          b.type = 'button';
          var im = lecEl('img'); im.src = e.image; im.alt = ''; im.width = 44; im.height = 44; im.loading = 'lazy';
          var t = lecEl('span', 'txt');
          t.append(lecEl('span', 'ti', opt.titre(e)), lecEl('span', 'me', [lecDate(e.date), lecDuree(e.duree)].filter(Boolean).join(' · ')));
          b.append(im, t, lecEl('span', 'pl', i === L.courant ? '♪' : '▶'));
          b.addEventListener('click', function () { L.vedette(i, true); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        if (!n) { var v = document.createElement('li'); v.appendChild(lecEl('p', 'lecteur-vide', I18N[lang].lecAucun)); ul.appendChild(v); }
        id('nb').textContent = L.filtre ? '' : ' · ' + L.episodes.length + I18N[lang][opt.cles.nb];
      };
      L.textes = function () {
        if (!L.pret) return;
        id('tous').textContent = I18N[lang][opt.cles.tous];
        var r = id('recherche');
        if (r) { r.placeholder = I18N[lang].lecChercher; r.setAttribute('aria-label', I18N[lang].lecChercher); }
        L.vedette(L.courant, false);
      };
      L.init = function (tousLesEpisodes) {
        L.episodes = tousLesEpisodes.filter(opt.garde);
        if (!L.episodes.length) return false;
        L.construire();
        L.pret = true;
        L.textes();
        return true;
      };
      LECTEURS.push(L);
      return L;
    }

    var lecTous = creerLecteur('lecteur', 'lec', {
      garde: function () { return true; },
      titre: function (e) { return e.titre; },
      cles: { dernier: 'lecDernier', tous: 'lecTous', nb: 'lecNb' },
      recherche: true,
    });
    var lecChaudron = creerLecteur('lecteur-chaudron', 'chd', {
      garde: function (e) { return /^\[\s*derri[eè]re le chaudron/i.test(e.titre); },
      titre: function (e) { return e.titre.replace(/^\[\s*derri[eè]re le chaudron\s*(#\d+)?\s*\]\s*[-–—:]?\s*/i, function (m, n) { return n ? n + ' · ' : ''; }); },
      cles: { dernier: 'chdDernier', tous: 'chdTous', nb: 'chdNb' },
      recherche: false,
    });

    function lecOnglet(chaudron) {
      document.getElementById('lecteur').hidden = chaudron;
      document.getElementById('lecteur-chaudron').hidden = !chaudron;
      document.getElementById('t-chaudron-desc').hidden = !chaudron;
      document.getElementById('onglet-tous').setAttribute('aria-selected', String(!chaudron));
      document.getElementById('onglet-chaudron').setAttribute('aria-selected', String(chaudron));
      document.querySelectorAll('.lecteur audio').forEach(function (a) { a.pause(); });
    }
    document.getElementById('onglet-tous').addEventListener('click', function () { lecOnglet(false); });
    document.getElementById('onglet-chaudron').addEventListener('click', function () { lecOnglet(true); });

    function lecCharger() {
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var minuteur = setTimeout(function () { if (ctrl) ctrl.abort(); }, 9000);
      fetch(LEC_URL, ctrl ? { signal: ctrl.signal } : undefined)
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
        .then(function (d) {
          clearTimeout(minuteur);
          var eps = (d.results || []).filter(function (x) {
            return x.wrapperType === 'podcastEpisode' && typeof x.episodeUrl === 'string' && x.episodeUrl.indexOf('https://') === 0;
          }).map(function (x) {
            return { id: x.trackId, titre: x.trackName, date: x.releaseDate, duree: x.trackTimeMillis,
                     audio: x.episodeUrl, image: x.artworkUrl600 || x.artworkUrl160 || '', desc: lecTexte(x.description || x.shortDescription) };
          }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
          if (!lecTous.init(eps)) throw new Error('vide');
          if (lecChaudron.init(eps)) document.getElementById('lec-onglets').hidden = false;
        })
        .catch(function () { clearTimeout(minuteur); if (!lecTous.pret) lecSpotify('lecteur'); });
    }

    /* Un seul épisode à la fois : lancer un lecteur met l'autre en pause */
    document.addEventListener('play', function (ev) {
      document.querySelectorAll('.lecteur audio').forEach(function (a) { if (a !== ev.target) a.pause(); });
    }, true);

