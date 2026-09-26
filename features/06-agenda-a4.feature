# language: fr

Fonctionnalité: Agenda A4 et exports
  En tant que facilitateur Insuffle
  Je veux sortir un planning A4 aux couleurs d'Insuffle, lisible en une minute par le client
  Afin d'envoyer un document propre, fidèle au format planning-temps-collectif

  Contexte:
    Soit un cadrage avec une question-titre, une intention et un jour de 9h00 à 12h30

  Scénario: Une page A4 par jour
    Quand j'ouvre l'onglet « Agenda A4 »
    Alors je vois une page par jour avec le logo Insuffle, la question-titre soulignée d'un trait jaune,
      le bandeau Intention, la ligne client · date · horaires · lieu · participants · animateur
    Et la grille au quart d'heure avec les colonnes Séquence, Intention, Format, Ce qui en sort

  Scénario: Orientation automatique
    Soit un jour de plus de 8 h
    Alors la page passe en paysage, en deux colonnes matin et après-midi coupées à la pause la plus proche du milieu

  Scénario: Choisir les colonnes
    Quand je décoche « Ce qui en sort »
    Alors la grille passe à trois colonnes
    Et la colonne Séquence ne peut pas être retirée

  Scénario: Encadré sous le planning
    Quand j'ajoute un encadré « Les 5 tables » avec cinq sous-questions
    Alors il s'affiche sous la grille, fond crème, filet jaune

  Scénario: Un bloc trop long est signalé, pas écrasé
    Soit un bloc de 15 min avec un texte de quatre lignes
    Alors la police descend jusqu'à 7 pt au plus bas
    Et si ça déborde encore, le bloc est encadré de rouge avec le conseil de couper du texte

  Scénario: Modifier depuis l'aperçu
    Quand je clique sur un bloc de l'aperçu
    Alors l'éditeur de la séquence s'ouvre

  Plan du Scénario: Exporter
    Quand je clique sur « <export> »
    Alors j'obtiens <résultat>

    Exemples:
      | export                  | résultat                                                              |
      | Imprimer / PDF          | la page prête à imprimer en PDF, A4, arrière-plans compris            |
      | HTML modifiable         | un fichier autonome : on clique sur un texte pour le changer          |
      | Copier pour un mail     | le planning en texte brut dans le presse-papier                       |
      | JSON planning Insuffle  | le JSON de la compétence planning-temps-collectif (build.py)           |
      | Tableur (CSV)           | une ligne par séquence, consignes et matériel compris                  |
      | Sauvegarde complète     | un JSON qui restaure tout le planning                                  |

  Scénario: Importer un planning
    Quand j'importe un JSON au format planning-temps-collectif
    Alors la fiche, les jours, les séquences et les encadrés sont recréés avec les mêmes durées

  Scénario: Fiche animateur
    Quand je choisis « Fiche animateur »
    Alors chaque séquence affiche horaires, intention, format, consignes, matériel, rôles, points d'attention et notes
    Et la liste du matériel à prévoir est regroupée en fin de document
    Et le logo et le nom du client sont en pied de chaque page

  Scénario: Le logo est toujours là
    Quel que soit le document exporté
    Alors le logo Insuffle (ou Insuffle Académie) est visible sur chaque page

  Scénario: Figer la version envoyée au client
    Quand je fige une version « V1 envoyée au client »
    Et que je modifie ensuite le planning
    Alors je peux revoir la V1 en PDF, telle qu'elle a été envoyée
    Et la restaurer, l'annulation restant possible

  Scénario: Préparer le mail au client
    Quand je clique sur « Préparer le mail au client »
    Alors ma messagerie s'ouvre avec l'objet « Planning · client · référence » et le planning en texte
