# DOMAINE 20 : Retour post-intervention (US 181-185)

## US-181 : Formulaire de feedback post-atelier intégré

```gherkin
Scenario: Activation du feedback
  Given l'atelier est terminé
  When je clique sur "Activer le feedback post-atelier" en mode facilitateur
  Then un formulaire court s'affiche pour les participants qui reviennent :
    | question                                           | type    |
    | L'atelier a-t-il répondu à vos attentes ?          | Note 1-5 |
    | Qu'avez-vous le plus apprécié ?                    | Texte libre |
    | Que faudrait-il améliorer la prochaine fois ?      | Texte libre |
  And le formulaire porte le branding Insuffle

Scenario: Résultats du feedback
  Given 8 participants ont répondu au feedback
  When le facilitateur consulte les résultats
  Then il voit la moyenne des notes et les réponses textuelles
  And les résultats sont exportables en PDF avec la marque Insuffle
```

## US-182 : Comparaison avant/après intervention

```gherkin
Scenario: Vue comparative
  Given j'ai sauvegardé un snapshot avant l'atelier
  And j'ai mis à jour le cadrage après l'atelier
  When je clique sur "Comparer avant/après"
  Then une vue en deux colonnes affiche le snapshot et l'état actuel
  And les différences sont surlignées
```

## US-183 : Envoyer le cadrage complété au client par email

```gherkin
Scenario: Envoi au client
  Given le cadrage est terminé
  When je clique sur "Envoyer au client"
  And je saisis l'email du client
  Then un email est envoyé avec le PDF en pièce jointe
  And l'email est signé "Insuffle Cadrage Live"
```

## US-184 : Archiver avec notes de clôture

```gherkin
Scenario: Notes de clôture
  Given je clique sur "Archiver"
  Then un champ "Notes de clôture" s'affiche
  When je saisis mes notes de clôture et je valide
  Then l'espace est archivé avec les notes
  And les notes apparaissent dans l'export PDF final
```

## US-185 : Lien vers l'accompagnement Insuffle post-atelier

```gherkin
Scenario: CTA post-atelier
  Given un espace est archivé
  Then un encadré propose :
    | "Besoin d'aller plus loin ?"                                |
    | "Insuffle accompagne vos transformations sur la durée."     |
    | Bouton "Découvrir l'accompagnement Insuffle"                |
  And le lien mène vers la page d'accompagnement sur insuffle.com
```
