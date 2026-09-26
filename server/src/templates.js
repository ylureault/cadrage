// Modèles de planning Insuffle (v2).
// Règles : créneaux de 15 min, chaque jour tombe juste, zéro tiret long, rien d'inventé.
// Les textes sont des points de départ : à adapter aux mots du client.

const s = (title, duration_minutes, intention = '', format = '', production = '', extra = {}) =>
  ({ title, duration_minutes, intention, format, production, kind: 'collectif', ...extra });
const apport = (title, duration_minutes, intention = '', format = '', production = '', extra = {}) =>
  s(title, duration_minutes, intention, format, production, { kind: 'apport', block_type: 'transition', ...extra });
const pause = (title = 'Pause', duration_minutes = 15) =>
  ({ title, duration_minutes, kind: 'pause', block_type: 'pause' });

export const SYSTEM_TEMPLATES = [
  {
    id: 'tpl2-demi-journee-tables',
    name: 'Séminaire · demi-journée en tables tournantes',
    description: 'On se projette dans un an, on raconte au passé, on repart avec des engagements individuels et 3 pratiques collectives.',
    data: {
      planning: {
        question: 'Comment grandir ensemble quand tout s\'accélère ?',
        intention: 'Que chacun reparte en sachant ce qu\'il fait grandir chez lui, ce qu\'il attend des autres, et ce que l\'équipe s\'engage à faire ensemble.',
        reference: 'Séminaire · demi-journée',
        accueil: 'café d\'accueil dès 8h45',
        event_type: 'seminaire',
        footer_note: 'Toutes les fonctions et tous les niveaux, en tables mélangées.',
      },
      days: [{
        label: 'Jour 1', start_time: '09:00', end_time: '12:30',
        encadre: {
          titre: 'Les tables : on se place dans un an et on raconte au passé',
          items: [
            { label: '1. Rester une équipe.', texte: 'On a grandi et on se sent toujours une équipe. Qu\'est-ce qu\'on a gardé ?' },
            { label: '2. Avoir progressé.', texte: 'Chacun a progressé. Qu\'a-t-il appris, et qui l\'a aidé ?' },
            { label: '3. Décider à son niveau.', texte: 'Chacun décide à son niveau sans attendre. Qu\'est-ce qui l\'a permis ?' },
            { label: '4. Avancer entre fonctions.', texte: 'Les fonctions avancent ensemble. Comment s\'y prend-on au quotidien ?' },
            { label: '5. Tenir le rythme.', texte: 'On a tenu le rythme sans s\'épuiser. Qu\'a-t-on arrêté de faire ?' },
          ],
        },
        sequences: [
          s('Ouverture', 15, 'Dire pourquoi on est là et ce qu\'on fera des engagements.', 'Mot de la direction, en plénière.', '', { block_type: 'ouverture' }),
          s('La ligne d\'ancienneté', 15, 'Voir la croissance de ses propres yeux.', 'Debout, du plus ancien au plus récent. Le plus ancien raconte.', '', { block_type: 'icebreaker', method_key: 'ligne-anciennete' }),
          apport('Partir du futur', 15, 'Partir de l\'entreprise dans un an, pas des problèmes du jour.', 'Apport Futur Désiré®.', '', { method_key: 'apport-futur-desire' }),
          s('Installation des tables', 15, 'Parler avec des collègues qu\'on croise peu.', 'Tables de 6 mélangées. Un hôte volontaire par table.', '', { block_type: 'transition' }),
          s('Tables tournantes (World Café)', 60, 'Raconter au passé l\'entreprise dans un an, sous cinq angles. La direction est dans les tables comme tout le monde.', '3 tours de 20 min. L\'hôte reste à sa table, les autres changent. Questions des tables ci-dessous.', 'Les nappes remplies.', { block_type: 'exploration', method_key: 'world-cafe' }),
          pause(),
          s('La balade des nappes', 15, 'Voir tout ce qui a été dit, pas seulement ses trois tables.', 'Nappes au mur, 3 gommettes chacun.', 'Ce qui donne le plus envie.', { block_type: 'decision', method_key: 'balade-nappes' }),
          apport('Ce qui fait tenir un engagement', 15, 'Éviter la bonne résolution oubliée le lundi.', 'Apport : petit, visible, daté, avec un témoin.'),
          s('Mon engagement', 15, 'Passer de ce qu\'on veut pour l\'entreprise à ce que je fais, moi.', 'Carte « Dans un mois, j\'aurai... », lue à un binôme témoin.', 'Un engagement par personne.', { block_type: 'production', method_key: 'engagement-binome' }),
          s('Nos 3 pratiques', 15, 'Choisir ensemble ce qu\'on change dès lundi.', 'Chaque table propose, vote à main levée.', '3 pratiques collectives.', { block_type: 'decision' }),
          s('Clôture', 15, 'Boucler entre le collectif et la direction.', 'La direction répond aux 3 pratiques. Un mot chacun.', 'La réponse de la direction.', { block_type: 'cloture', method_key: 'un-mot' }),
        ],
      }],
    },
  },
  {
    id: 'tpl2-codir-2-jours',
    name: 'Séminaire CODIR · 2 jours',
    description: 'Diagnostic partagé, cap, 3 chantiers prioritaires, engagements datés. Entretiens individuels à J-21.',
    data: {
      planning: {
        question: 'Où allons-nous ensemble, et qu\'est-ce qu\'on arrête de faire chacun de son côté ?',
        intention: 'Que le CODIR reparte avec un cap qu\'il sait dire en une phrase, 3 chantiers pilotés et des engagements datés.',
        reference: 'Séminaire CODIR · 2 jours',
        accueil: '',
        event_type: 'codir',
        footer_note: 'Entretiens individuels confidentiels trois semaines avant. Suivi programmé à J+15 et J+90.',
      },
      days: [
        {
          label: 'Jour 1', start_time: '09:00', end_time: '17:30',
          sequences: [
            s('Ouverture', 30, 'Poser le cadre, les règles du jeu et ce qu\'on fera des décisions.', 'Plénière. Le DG ouvre, puis se met à la table comme les autres.', '', { block_type: 'ouverture' }),
            apport('Ce que vous nous avez dit', 45, 'Mettre sur la table ce que chacun a dit en entretien, sans savoir qui l\'a dit.', 'Restitution anonyme des entretiens.', 'La photo lucide.', { block_type: 'debriefing' }),
            s('Ce que ça nous fait', 45, 'Réagir au diagnostic avant de le discuter.', 'Trinômes, puis tour de plénière.', 'Ce qui surprend, ce qui manque.', { block_type: 'debriefing' }),
            pause(),
            s('Ce qui nous freine vraiment', 60, 'Nommer ce qu\'on fait tous les jours et qui nous fait tourner en rond.', '1-2-4-Tous.', '3 freins partagés.', { block_type: 'exploration', method_key: '1-2-4-tous' }),
            pause('Déjeuner', 75),
            apport('Partir du futur', 15, 'Arrêter d\'améliorer le passé. Se placer dans l\'après.', 'Apport Futur Désiré®.', '', { method_key: 'apport-futur-desire' }),
            s('Le futur désiré', 120, 'Décrire ensemble ce qui est vrai quand tout a réussi.', 'Projection individuelle, puis binômes, puis plénière.', 'Les récits du futur.', { block_type: 'exploration', method_key: 'projection-futur-desire' }),
            pause(),
            s('Une phrase de cap', 60, 'Écrire le cap que n\'importe qui dans la boîte peut comprendre et désirer.', 'Convergence en plénière, formulation par consentement.', 'Le cap en une phrase.', { block_type: 'decision', method_key: 'consentement' }),
            s('Clôture du jour 1', 30, 'Prendre la température avant la nuit.', 'Un mot chacun.', '', { block_type: 'cloture', method_key: 'un-mot' }),
          ],
        },
        {
          label: 'Jour 2', start_time: '09:00', end_time: '16:30',
          encadre: {
            titre: 'Chaque chantier sort avec',
            items: [
              { label: 'Un pilote.', texte: 'Une personne, pas un comité.' },
              { label: 'Un objectif à 90 jours.', texte: 'Mesurable. On saura dire si c\'est fait.' },
              { label: 'Les ressources.', texte: 'Temps, budget, personnes. Ce qui est vraiment disponible.' },
            ],
          },
          sequences: [
            s('Relire le cap', 15, 'Vérifier que la phrase d\'hier tient après une nuit.', 'Plénière.', '', { block_type: 'ouverture' }),
            s('Choisir 3 chantiers', 60, 'Passer de dix envies à trois priorités.', 'Propositions en binômes, vote par gommettes, décision par consentement.', '3 chantiers prioritaires.', { block_type: 'decision', method_key: 'vote-gommettes' }),
            pause(),
            s('Concevoir les chantiers', 90, 'Rendre chaque chantier pilotable dès lundi.', 'Un sous-groupe par chantier. Canevas pilote, objectif 90 jours, ressources.', 'Une fiche par chantier.', { block_type: 'production', method_key: 'chantier-90-jours' }),
            pause('Déjeuner', 75),
            s('Pitch des chantiers', 60, 'Tester chaque chantier au regard des autres.', '10 min par chantier. Pitch, questions, amélioration.', 'Chantiers consolidés.', { block_type: 'debriefing' }),
            pause(),
            s('Engagements', 60, 'Passer du chantier à ce que je fais, moi.', 'Engagements concrets, datés, vérifiables. Lus à voix haute.', 'Un engagement par personne.', { block_type: 'production', method_key: 'engagement-binome' }),
            s('Le suivi', 30, 'Éviter que tout retombe la semaine suivante.', 'On fixe les dates de suivi en séance.', 'Rendez-vous J+15 et J+90.', { block_type: 'decision' }),
            s('Clôture', 30, 'Fermer le séminaire avec ce qu\'on emporte.', 'Tour de clôture.', '', { block_type: 'cloture', method_key: 'un-mot' }),
          ],
        },
      ],
    },
  },
  {
    id: 'tpl2-lancement-projet',
    name: 'Lancement de projet · demi-journée',
    description: 'Le projet réussi raconté au passé, le pré-mortem, les rôles et les premiers pas.',
    data: {
      planning: {
        question: 'À quoi verra-t-on, dans un an, que ce projet a réussi ?',
        intention: 'Que l\'équipe projet parte avec une image commune de la réussite, les risques nommés et les premiers pas datés.',
        reference: 'Lancement de projet · demi-journée',
        event_type: 'lancement',
      },
      days: [{
        label: 'Jour 1', start_time: '14:00', end_time: '17:30',
        sequences: [
          s('Ouverture du sponsor', 15, 'Dire pourquoi ce projet, pourquoi maintenant, pourquoi vous.', 'Le sponsor parle, puis se tait.', '', { block_type: 'ouverture' }),
          s('Tour d\'inclusion', 15, 'Que chacun dise d\'où il arrive sur ce projet.', 'Une question, un tour.', '', { block_type: 'icebreaker', method_key: 'meteo' }),
          apport('Partir du futur', 15, 'Se placer après la réussite, pas avant les difficultés.', 'Apport Futur Désiré®.', '', { method_key: 'apport-futur-desire' }),
          s('Le projet réussi', 45, 'Raconter au passé ce que le projet a changé.', 'Individuel, puis groupes de 4.', 'Une image commune de la réussite.', { block_type: 'exploration', method_key: 'projection-futur-desire' }),
          pause(),
          s('Pré-mortem', 30, 'Nommer maintenant ce qui pourrait tout faire rater.', 'Groupes de 4. On imagine l\'échec et on remonte le fil.', 'Les risques et leurs parades.', { block_type: 'exploration', method_key: 'pre-mortem' }),
          s('Rôles et règles du jeu', 30, 'Savoir qui décide quoi.', 'Plénière. Qui décide, qui est consulté, qui est informé.', 'Qui fait quoi.', { block_type: 'decision' }),
          s('Premiers pas', 30, 'Que le projet démarre lundi, pas dans un mois.', 'Chacun écrit son premier pas, daté.', 'Les premiers pas datés.', { block_type: 'production', method_key: 'engagement-binome' }),
          s('Clôture', 15, 'Fermer avec l\'énergie du départ.', 'Un mot chacun.', '', { block_type: 'cloture', method_key: 'un-mot' }),
        ],
      }],
    },
  },
  {
    id: 'tpl2-atelier-decision',
    name: 'Atelier de décision · 3 heures',
    description: 'Un sujet qui tourne en rond. On le pose, on ouvre les options, on décide par consentement.',
    data: {
      planning: {
        question: 'Qu\'est-ce qu\'on décide aujourd\'hui, et qu\'est-ce qu\'on laisse mûrir ?',
        intention: 'Que le groupe sorte avec une décision qu\'il assume, un pilote et une date de revue.',
        reference: 'Atelier de décision · 3 heures',
        event_type: 'decision',
      },
      days: [{
        label: 'Jour 1', start_time: '09:00', end_time: '12:00',
        sequences: [
          s('Ouverture', 15, 'Dire ce qui est à décider, et ce qui ne l\'est pas.', 'Plénière. Le périmètre de la décision est affiché.', '', { block_type: 'ouverture' }),
          s('Poser le problème', 30, 'Voir le même problème. Pas chacun le sien.', 'Chacun le formule en une phrase, puis on compare.', 'Le problème en une phrase.', { block_type: 'exploration' }),
          s('Ouvrir les options', 30, 'Sortir du duel entre deux solutions.', '1-2-4-Tous.', 'Les options sur la table.', { block_type: 'exploration', method_key: '1-2-4-tous' }),
          pause(),
          s('Décider', 45, 'Trouver une décision assez bonne pour maintenant, assez sûre pour essayer.', 'Décision par consentement. Proposition, clarification, objections, bonification.', 'La décision.', { block_type: 'decision', method_key: 'consentement' }),
          s('Qui fait quoi', 30, 'Que la décision sorte de la salle.', 'Pilote, premières actions, date de revue.', 'Plan d\'action sur une page.', { block_type: 'production' }),
          s('Clôture', 15, 'Vérifier que chacun peut défendre la décision dehors.', 'Tour rapide.', '', { block_type: 'cloture', method_key: 'un-mot' }),
        ],
      }],
    },
  },
  {
    id: 'tpl2-retro-equipe',
    name: 'Rétrospective d\'équipe · 2 heures',
    description: 'On regarde le chemin parcouru, on nomme ce qui coince, on change une ou deux choses.',
    data: {
      planning: {
        question: 'Qu\'est-ce qu\'on garde, et qu\'est-ce qu\'on arrête ?',
        intention: 'Que l\'équipe reparte avec deux changements concrets qu\'elle teste dès la semaine prochaine.',
        reference: 'Rétrospective · 2 heures',
        event_type: 'retro',
      },
      days: [{
        label: 'Jour 1', start_time: '14:00', end_time: '16:00',
        sequences: [
          s('Check-in', 15, 'Arriver vraiment dans la pièce.', 'Une question, un tour.', '', { block_type: 'ouverture', method_key: 'meteo' }),
          s('La ligne du temps', 30, 'Revoir ensemble ce qui s\'est passé, pas chacun son souvenir.', 'Frise au mur. Chacun pose ses moments forts et faibles.', 'La frise de la période.', { block_type: 'exploration', method_key: 'ligne-du-temps' }),
          s('Ce qui nous freine', 30, 'Nommer ce qu\'on fait et qui nous fait perdre du temps.', 'Groupes de 3. Ce qu\'on fait pour que ça rate.', 'Les freins nommés.', { block_type: 'exploration', method_key: 'triz' }),
          s('Ce qu\'on change', 30, 'Choisir deux changements à tester.', '1-2-4-Tous, puis vote.', '2 changements à tester.', { block_type: 'decision', method_key: '1-2-4-tous' }),
          s('Clôture', 15, 'Fermer proprement.', 'ROTI : chacun note le temps passé de 1 à 5.', '', { block_type: 'cloture', method_key: 'roti' }),
        ],
      }],
    },
  },
  {
    id: 'tpl2-formation-1-jour',
    name: 'Formation · 1 journée (Insuffle Académie)',
    description: 'Charte Académie. 80 % pratique, 20 % théorie. Évaluation des acquis et satisfaction en fin de journée.',
    data: {
      planning: {
        question: 'Que saurez-vous faire ce soir que vous ne faisiez pas ce matin ?',
        intention: 'Que chaque participant reparte en ayant testé la méthode sur un cas réel, le sien.',
        reference: 'Formation · 1 journée',
        charte: 'academie',
        event_type: 'formation',
        footer_note: 'Insuffle Académie, organisme de formation certifié Qualiopi.',
      },
      days: [{
        label: 'Jour 1', start_time: '09:00', end_time: '17:00',
        sequences: [
          s('Accueil et inclusion', 30, 'Se présenter par ce qu\'on vient chercher, pas par sa fonction.', 'Tour d\'inclusion.', 'Les attentes au mur.', { block_type: 'ouverture', method_key: 'meteo' }),
          s('Vos situations', 30, 'Partir des cas réels des participants.', 'Binômes, puis plénière.', 'Les cas de travail.', { block_type: 'exploration' }),
          apport('Apport 1', 30, 'Poser les repères utiles pour la suite.', 'Apport court, illustré.', ''),
          s('Mise en pratique 1', 75, 'Tester tout de suite sur son propre cas.', 'Sous-groupes de 3. Un joue, un observe, un reçoit.', '', { block_type: 'production' }),
          pause(),
          s('Débrief', 15, 'Tirer ce qui marche et ce qui coince.', 'Plénière.', 'Les apprentissages.', { block_type: 'debriefing' }),
          pause('Déjeuner', 60),
          s('Energizer', 15, 'Réveiller le groupe après le déjeuner.', 'Debout.', '', { block_type: 'energizer' }),
          apport('Apport 2', 30, 'Aller un cran plus loin.', 'Apport court.', ''),
          s('Mise en pratique 2', 90, 'Faire en conditions réelles.', 'Sous-groupes, rotation des rôles.', '', { block_type: 'production' }),
          pause(),
          s('Débrief et ancrage', 45, 'Transformer l\'expérience en réflexes.', 'Carnet d\'apprentissage, puis partage.', 'Un réflexe par personne.', { block_type: 'debriefing' }),
          s('Évaluation et clôture', 30, 'Mesurer les acquis et fermer.', 'Évaluation des acquis, questionnaire de satisfaction, tour de clôture.', 'Évaluations remplies.', { block_type: 'cloture' }),
        ],
      }],
    },
  },
  {
    id: 'tpl2-visio-2h',
    name: 'Atelier à distance · 2 heures',
    description: 'Visio. Des sous-salles courtes, des restitutions tenues, une pause écran.',
    data: {
      planning: {
        question: 'Qu\'est-ce qui nous ferait vraiment avancer d\'ici un mois ?',
        intention: 'Que chacun reparte avec une priorité claire et la personne avec qui il la porte.',
        reference: 'Atelier à distance · 2 heures',
        event_type: 'distanciel',
      },
      days: [{
        label: 'Jour 1', start_time: '10:00', end_time: '12:00',
        sequences: [
          s('Connexion et météo', 15, 'Vérifier que tout le monde est là, caméra allumée si possible.', 'Chacun écrit un mot dans le chat.', '', { block_type: 'ouverture', method_key: 'meteo' }),
          s('Le cadre', 15, 'Dire ce qu\'on fait en deux heures et ce qu\'on n\'y fera pas.', 'Plénière, tableau blanc partagé.', '', { block_type: 'ouverture' }),
          s('Les priorités', 30, 'Faire émerger ce qui compte vraiment.', '1-2-4-Tous en sous-salles.', 'Les priorités candidates.', { block_type: 'exploration', method_key: '1-2-4-tous' }),
          pause('Pause écran', 15),
          s('Choisir', 30, 'Passer de la liste aux priorités.', 'Vote en ligne, puis discussion.', 'Les priorités retenues.', { block_type: 'decision', method_key: 'vote-gommettes' }),
          s('Clôture', 15, 'Qui porte quoi, et un mot pour finir.', 'Tour rapide.', 'Un binôme par priorité.', { block_type: 'cloture', method_key: 'un-mot' }),
        ],
      }],
    },
  },
];
