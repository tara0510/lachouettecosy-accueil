/* Socle commun des pages refaites : langue FR/EN, textes partagés (menu, pied de page, newsletter, avis),
   menu mobile, pensée du jour, formulaire de newsletter. Chaque page fournit PAGE_I18N (ses propres textes)
   avant ce fichier ; I18N (i18n-base.js) et PENSEES (pensees.js) sont chargés avant. */
var lang = localStorage.getItem('lang') === 'en' ? 'en' : 'fr';
// Anti-spam de /api/newsletter et /api/contact : heure d'affichage de la page.
var RENDU_PAGE = Date.now();

var COMMUN = {
  fr: {
    navAccueil: "Accueil", navAppli: "L'appli", navPodcast: "Le podcast", navBoutique: "La boutique", navContact: "Contact",
    navMenu: "Menu",
    newsletterEyebrow: "Rejoins le cercle",
    newsletterSucces: "C'est fait. Bienvenue dans le cercle : ton prochain rendez-vous cosy arrive jeudi.",
    avisBtn1: "Laisser un avis Trustpilot", avisBtn2: "Avis sur Facebook",
    piedMentions: "Mentions légales", piedGuides: "Guides", piedBlog: "Blog", piedContact: "Contact",
    piedPhrase: "La Chouette Cosy · sorcellerie douce et magie du quotidien",
  },
  en: {
    navAccueil: "Home", navAppli: "The app", navPodcast: "The podcast", navBoutique: "The shop", navContact: "Contact",
    navMenu: "Menu",
    newsletterEyebrow: "Join the circle",
    newsletterSucces: "Done. Welcome to the circle: your next cosy rendezvous lands on Thursday.",
    avisBtn1: "Leave a Trustpilot review", avisBtn2: "Review us on Facebook",
    piedMentions: "Legal notice", piedGuides: "Guides", piedBlog: "Blog", piedContact: "Contact",
    piedPhrase: "La Chouette Cosy · gentle witchcraft and everyday magic",
  },
};
['fr', 'en'].forEach(function (l) {
  Object.assign(I18N[l], COMMUN[l]);
  if (window.PAGE_I18N && PAGE_I18N[l]) Object.assign(I18N[l], PAGE_I18N[l]);
});

function appliquerTraductions() {
  var d = I18N[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n')];
    if (v !== undefined) e.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n-ph')];
    if (v !== undefined) e.setAttribute('placeholder', v);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(function (e) {
    var v = d[e.getAttribute('data-i18n-alt')];
    if (v !== undefined) e.setAttribute('alt', v);
  });
  if (d.titrePage) document.title = d.titrePage;
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.classList.toggle('actif', b.dataset.lang === lang);
  });
  var debutAnnee = new Date(new Date().getFullYear(), 0, 0);
  var jour = Math.floor((Date.now() - debutAnnee) / 86400000);
  var p = document.getElementById('pensee-texte');
  if (p && typeof PENSEES !== 'undefined') p.textContent = PENSEES[lang][jour % PENSEES[lang].length];
  if (window.surLangue) window.surLangue();
}

document.querySelectorAll('.lang button').forEach(function (b) {
  b.addEventListener('click', function () {
    lang = b.dataset.lang;
    localStorage.setItem('lang', lang);
    appliquerTraductions();
  });
});

var burger = document.getElementById('burger');
if (burger) {
  burger.addEventListener('click', function () {
    var ouvert = document.getElementById('menu').classList.toggle('ouvert');
    burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
}

/* Newsletter (présente sur plusieurs pages) */
var formNews = document.getElementById('form-newsletter');
if (formNews) {
  formNews.addEventListener('submit', function (e) {
    e.preventDefault();
    var bouton = formNews.querySelector('button');
    var msg = document.getElementById('msg-newsletter');
    var email = document.getElementById('email-newsletter').value;
    var piege = document.getElementById('champ-piege').value;
    var libelle = bouton.querySelector('.ruban');
    bouton.disabled = true;
    libelle.textContent = I18N[lang].newsletterAttente;
    msg.className = 'retour';
    msg.textContent = '';
    function echec() {
      bouton.disabled = false;
      libelle.textContent = I18N[lang].newsletterBtn;
      msg.className = 'retour ko';
      msg.textContent = I18N[lang].newsletterErreur;
    }
    fetch('https://app.lachouettecosy.com/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, langue: lang, siteWeb: piege, rendu: RENDU_PAGE }),
    })
      .then(function (res) {
        if (res.ok) {
          formNews.style.display = 'none';
          msg.className = 'retour ok';
          msg.textContent = I18N[lang].newsletterSucces;
        } else echec();
      })
      .catch(echec);
  });
}
