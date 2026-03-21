# DOMAINE 3 : En-tête du cadrage (US 17-21)

## US-017 : Renseigner le nom du client

**En tant que** facilitateur,
**je veux** saisir le nom du client dans l'en-tête
**afin d'** identifier l'intervention.

```gherkin
Scenario: Saisie du nom du client
  Given je suis dans l'en-tête du canvas
  When je clique sur le champ "Client"
  And je saisis "Groupe BPCE"
  Then le champ affiche "Groupe BPCE"
  And tous les participants voient la mise à jour en temps réel
```

---

## US-018 : Renseigner le sponsor

**En tant que** facilitateur,
**je veux** saisir le nom du sponsor
**afin de** savoir qui porte le projet côté client.

```gherkin
Scenario: Saisie du sponsor
  Given je suis dans l'en-tête du canvas
  When je clique sur le champ "Sponsor"
  And je saisis "Marie Dupont - DRH"
  Then le champ affiche "Marie Dupont - DRH"
  And la modification est visible par tous en temps réel
```

---

## US-019 : Renseigner le facilitateur

**En tant que** facilitateur,
**je veux** saisir mon nom dans le champ Facilitateur
**afin d'** identifier qui pilote.

```gherkin
Scenario: Saisie du facilitateur
  Given je suis dans l'en-tête du canvas
  When je saisis "Yoan Lureault - Insuffle" dans le champ "Facilitateur"
  Then le champ est mis à jour pour tous les participants
```

---

## US-020 : Renseigner la date de l'intervention

**En tant que** facilitateur,
**je veux** saisir la date prévue
**afin de** contextualiser le cadrage.

```gherkin
Scenario: Saisie de la date
  Given je suis dans l'en-tête du canvas
  When je clique sur le champ "Date"
  Then un sélecteur de date s'affiche
  When je sélectionne le 15 avril 2026
  Then le champ affiche "15/04/2026"

Scenario: Saisie libre de la date
  Given je clique sur le champ "Date"
  When je saisis manuellement "Juin 2026 - à confirmer"
  Then le champ accepte le texte libre
```

---

## US-021 : Modification concurrente de l'en-tête

**En tant que** participant,
**je veux** voir en temps réel les modifications de l'en-tête
**afin de** rester synchronisé.

```gherkin
Scenario: Deux participants modifient l'en-tête simultanément
  Given "Yoan" modifie le champ "Client"
  And "Sophie" modifie le champ "Sponsor" au même moment
  Then les deux modifications sont enregistrées sans conflit
  And chaque participant voit les deux mises à jour

Scenario: Indicateur de modification en cours
  Given "Yoan" est en train de modifier le champ "Client"
  Then les autres participants voient un indicateur coloré (couleur de Yoan) sur ce champ
  And le champ est temporairement verrouillé pour les autres
```
