/**
 * Décor saisonnier partagé par toutes les pages du site.
 *
 * Saison automatique selon le mois (hémisphère nord), avec un réglage de
 * test : ajouter ?saison=hiver|printemps|ete|automne à l'URL force cette
 * saison (mémorisée en localStorage tant qu'on ne remet pas ?saison=auto).
 */
(function () {
  "use strict";

  var SAISONS = {
    printemps: { particule: "🌸", image: "/images/saison-printemps.png" },
    ete: { particule: null, image: "/images/saison-ete.png" },
    automne: { particule: "🍂", image: "/images/saison-automne.png" },
    hiver: { particule: "❄️", image: "/images/saison-hiver.png" },
  };

  function saisonParMois(mois) {
    if (mois >= 2 && mois <= 4) return "printemps"; // mars à mai
    if (mois >= 5 && mois <= 7) return "ete"; // juin à août
    if (mois >= 8 && mois <= 10) return "automne"; // septembre à novembre
    return "hiver"; // décembre à février
  }

  function saisonActuelle() {
    try {
      var params = new URLSearchParams(window.location.search);
      var forcee = params.get("saison");
      if (forcee === "auto") {
        localStorage.removeItem("saison_forcee");
      } else if (forcee && SAISONS[forcee]) {
        localStorage.setItem("saison_forcee", forcee);
      }
      var stockee = localStorage.getItem("saison_forcee");
      if (stockee && SAISONS[stockee]) return stockee;
    } catch (e) {
      // localStorage indisponible (navigation privée...) : on retombe sur la saison réelle
    }
    return saisonParMois(new Date().getMonth());
  }

  function reduireLesMouvements() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function creerParticules(saison) {
    var config = SAISONS[saison];
    if (!config || !config.particule || reduireLesMouvements()) return;

    var conteneur = document.createElement("div");
    conteneur.className = "saison-particules";
    conteneur.setAttribute("aria-hidden", "true");
    document.body.appendChild(conteneur);

    var nombre = window.innerWidth < 640 ? 10 : 20;
    for (var i = 0; i < nombre; i++) {
      var p = document.createElement("span");
      p.className = "saison-particule";
      p.textContent = config.particule;
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = 10 + Math.random() * 12 + "s";
      p.style.animationDelay = Math.random() * -20 + "s";
      p.style.fontSize = 14 + Math.random() * 12 + "px";
      p.style.opacity = String(0.4 + Math.random() * 0.4);
      conteneur.appendChild(p);
    }
  }

  // Affiche l'illustration saisonnière si le fichier existe déjà ; ne fait
  // rien sinon (pas d'image cassée tant que le fichier n'est pas déposé).
  function creerIllustration(saison) {
    var config = SAISONS[saison];
    if (!config || !config.image) return;

    var test = new Image();
    test.onload = function () {
      var img = document.createElement("img");
      img.className = "saison-illustration";
      img.src = config.image;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      document.body.appendChild(img);
    };
    test.src = config.image;
  }

  function appliquer() {
    var saison = saisonActuelle();
    document.documentElement.setAttribute("data-saison", saison);
    creerParticules(saison);
    creerIllustration(saison);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", appliquer);
  } else {
    appliquer();
  }
})();
