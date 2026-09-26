// Insuffle et Insuffle Académie : les offres, telles que vérifiées dans la compétence insuffle-offers.
// Pas de prix (choix produit), pas de date de session (elles changent), rien d'inventé.

export const CONTACT = {
  email: 'contact@insuffle.com',
  emailAcademie: 'contact@insuffle-academie.com',
  tel: '09 80 80 89 62',
  telHref: 'tel:+33980808962',
  site: 'https://insuffle.com',
  siteAcademie: 'https://insuffle-academie.com',
};

export const PREMIER_ECHANGE = '30 minutes d\'échange, gratuit et sans engagement.';

export const OFFRES_INSUFFLE = [
  {
    key: 'codir', titre: 'Séminaire CODIR', duree: '1,5 à 2 jours',
    texte: 'Entretiens individuels trois semaines avant, conception sur-mesure, facilitation, suivi après. Le DG ne peut pas être juge et partie : le facilitateur n\'a pas d\'enjeu politique interne.',
    url: 'https://formation-codir.com',
  },
  {
    key: 'seminaire', titre: 'Séminaire sur-mesure', duree: 'Normandie ou partout en France',
    texte: 'Cohésion, alignement stratégique, vision, transformation. 70 % de travail actif, 30 % d\'apport. Synthèse, plan d\'action, suivi à J+15 et J+90.',
    url: 'https://seminaire-collaboratif.com',
  },
  {
    key: 'facilitation', titre: 'Facilitation ponctuelle', duree: 'Un moment clé',
    texte: 'Réunion CODIR, journée stratégique, problème complexe, lancement de projet. On vient tenir le cadre, vous travaillez le fond.',
    url: 'https://insuffle.com',
  },
  {
    key: 'transformation', titre: 'Accompagnement transformation', duree: '6 à 12 mois',
    texte: 'Le cycle Futur Désiré® : Observer, Désirer, Concevoir, Transformer. Pas de slides livrés, du mouvement produit. Objectif : votre autonomie.',
    url: 'https://futur-desire.com',
  },
];

export const FORMATIONS = [
  { key: 'facilitation', titre: 'Facilitation & Intelligence Collective', duree: '3 jours', public: 'Consultants, coachs, chefs de projet, RH', url: 'https://formation-facilitation.com' },
  { key: 'manager', titre: 'Manager Facilitateur', duree: '3 jours', public: 'Managers qui veulent changer de posture', url: 'https://manager-facilitateur.com' },
  { key: 'fondamentaux', titre: 'Les fondamentaux de la facilitation', duree: '1 jour', public: 'Découvrir la facilitation', url: 'https://insuffle-academie.com' },
  { key: 'sketchnoting', titre: 'Sketchnoting', duree: '2 jours', public: 'Maîtriser les notes visuelles', url: 'https://formation-sketchnote.com' },
  { key: 'bootcamp', titre: 'Bootcamp facilitateur', duree: 'Intensif', public: 'Passer un cap, vite', url: 'https://facilitation-bootcamp.com' },
];

export const FORMATION_FAITS = 'Certifiées Qualiopi, finançables OPCO. 80 % pratique, 20 % théorie. En inter à Paris et Deauville, en intra partout en France.';

export const CLIENTS = ['Renault', 'Natixis', 'ENEDIS', 'PRO BTP', 'Région Normandie', 'Casden', 'SNCF', 'BPCE'];

export const OUTILS = [
  { titre: 'Timer visuel', url: 'https://timer.insuffle.com', texte: 'Un timer projetable pour vos ateliers.' },
  { titre: 'Boussole 4C', url: 'https://boussole.insuffle.com', texte: 'Cap, contraintes, capacités, cadence : le diagnostic en ligne.' },
  { titre: 'Flash CODIR', url: 'https://flash-codir.insuffle.com', texte: 'L\'autodiagnostic rapide d\'un comité de direction.' },
];

export const POSITIONNEMENT = [
  { titre: 'Faciliter n\'est pas animer.', texte: 'L\'animateur fait passer un bon moment. Le facilitateur fait émerger des décisions.' },
  { titre: 'Faciliter n\'est pas conseiller.', texte: 'Le consultant apporte ses solutions. Le facilitateur fait émerger les vôtres.' },
  { titre: 'Collectée n\'est pas collective.', texte: 'Sans désir partagé ni sécurité, les meilleurs outils ne produisent que de l\'intelligence collectée.' },
];

// Ce que dit l'outil quand la situation du collectif appelle un regard extérieur
export const RELAIS_SITUATION = {
  denouer: 'Le problème est connu, le collectif est noué. C\'est le terrain de la facilitation de transformation, et celui où l\'animateur interne a le plus de mal : il est pris dans le nœud.',
  traverser: 'Problème inconnu, collectif noué. On commence par la facilitation stratégique, puis on transforme. C\'est exactement ce qu\'Insuffle accompagne.',
};
