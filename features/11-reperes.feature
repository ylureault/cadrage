# language: fr

Fonctionnalité: Repères Insuffle
  En tant que facilitateur
  Je veux avoir sous la main la méthode Insuffle pendant le cadrage
  Afin de poser les bonnes questions au sponsor et de concevoir juste

  Scénario: Ouvrir les repères
    Quand je clique sur « Repères » dans la barre du haut
    Alors je vois la phrase signature « La facilitation, c'est rendre le système intelligent en le questionnant. »

  Plan du Scénario: Les onglets des repères
    Quand j'ouvre l'onglet « <onglet> »
    Alors je trouve <contenu>

    Exemples:
      | onglet    | contenu                                                                          |
      | Cadrer    | la Boussole 4C, le cadre et le cadre de facilitation, les 3P, la carte de la complexité, les trois facilitations |
      | Questions | les 28 questions génératives, copiables en un clic                               |
      | Concevoir | le double diamant, les règles d'un planning client, les convictions, B = f (P, E) |
      | Décider   | consensus, compromis, consentement ; le conflit catalyseur ; la sécurité psychologique |

  Scénario: Les 8 polarités
    Quand je descends sous le canvas de cadrage
    Alors la section s'intitule « Les 8 polarités »
