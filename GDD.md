# Game Design Document — Geometry Strategy

> **Statut** : En cours  
> **Dernière mise à jour** : 2026-05-07

---

## 1. Concept

Jeu de stratégie browser-first fusionnant trois genres :

- **RTS simplifié** — vue top-down, phase de placement, gestion de composition
- **Rogue-lite** — runs à zéro, sélection d'upgrades aléatoires avec synergies émergentes
- **Auto-chess** — résolution automatique des combats, interaction joueur minimale pendant le resolve

**Pilier central** : la phase de préparation. Le combat est une validation de la composition construite pendant la run. Le plaisir vient de voir une théorie exploser — ou s'effondrer.

**Facteur différenciant** : le pathfinding Flow Field crée un comportement de foule émergent. Les unités ne se téléportent pas vers leur cible — elles coulent, se compriment, flankent naturellement selon le placement du joueur. Le joueur ne voit pas les lignes de flux (invisibles) mais doit les imaginer et anticiper leurs effets via le placement.

---

## 2. Boucle de jeu

```
[Début de run]
    │
    ▼
[Phase de préparation] ──── Placement des unités + attribution des overclocks
    │
    ▼
[Auto-resolve] ──── Combat automatique ~60 secondes
    │
    ├── Victoire → sélection d'un overclock parmi 3 proposés → prochain round
    │
    └── Défaite → fin de run, retour au hub de méta-progression
```

### Interaction pendant l'auto-resolve

Intentionnellement minimale. Le joueur observe. Aucune action possible pendant le combat — c'est une validation, pas une phase d'action.

---

## 3. Unités

### Types de shapes

Trois catégories, identifiées visuellement par leur forme géométrique :

| Shape | Rôle | Comportement de flux |
|---|---|---|
| **Triangle** | Attaquant | S'insère dans les flux ennemis, perce les formations, priorité aux cibles faibles |
| **Cercle** | Flanqueur / zone | Dévie le flow autour de lui, dégâts au contact, orbite autour des cibles |
| **Carré** | Tank / ancre | Bloque le flux, crée des zones de compression, génère un rayon d'aggro |

### Système d'aggro

**Baseline** : chaque unité cible l'unité ennemie la plus proche dans son flow path.

**Tank (Carré)** : possède un rayon d'aggro. Toute unité ennemie entrant dans ce rayon switch sa cible vers le tank — *sauf si elle a un overclock qui override ce comportement*.

Le joueur doit lire la composition adverse avant le combat, identifier les tanks ennemis, et décider si ses overclocks disponibles permettent de les contourner ou de les exploiter.

---

## 4. Système d'overclocks

### Principe

Un overclock est un modificateur de comportement appliqué à **une unité individuelle** pendant la phase de préparation.

**Règles** :
- Une seule overclock par unité
- Réattribuable librement à chaque phase de préparation
- L'effet est polymorphe : le même overclock se comporte différemment selon le shape sur lequel il est appliqué

### Acquisition

Après chaque victoire, le joueur choisit **1 overclock parmi 3 proposés aléatoirement** (pool commun, pas de séparation offensif/défensif). Les overclocks de counter (Tunnel vision, Fantôme, etc.) peuvent être ignorés s'ils ne sont pas utiles à ce stade de la run.

### Overclocks existants

| Overclock | Sur Triangle | Sur Cercle | Sur Carré |
|---|---|---|---|
| **Surcharge** | Vitesse ×1.5, perd HP en marchant | Orbite plus vite, dégâts contact amplifiés | Bloque le flux sur une surface plus large, immobile pendant le combat |
| **Agro magnétique** | Rush la cible la plus proche, ignore les tanks | Dévie vers les flancs, évite les zones d'aggro | Devient point d'aggro prioritaire pour les ennemis (provocation active) |
| **Fragmentation** | Split en 2 mini-triangles à la mort | Explosion zone à la mort | Laisse un décombre qui bloque temporairement le flow |
| **Tunnel vision** | Ignore les switchs d'aggro, continue vers sa cible initiale | Maintient son orbite initiale même si une cible prioritaire entre en zone | Garde son aggro original, n'attire pas de nouvelles unités |
| **Fantôme** | Invisible aux calculs d'aggro ennemis | Invisible aux calculs d'aggro ennemis | Invisible aux calculs d'aggro ennemis (tank qui ne tank pas) |
| **Prédateur** | Rush délibérément les tanks ennemis en priorité | Orbite autour des tanks, dégâts amplifés sur unités à haute DEF | Charge le tank ennemi le plus proche, duel forcé |

### Signalétique visuelle

Chaque overclock affiche un effet ambiant discret sur l'unité — lisible d'un coup d'œil sans polluer l'écran :

| Overclock | Effet visuel |
|---|---|
| Surcharge | Aura électrique clignotante |
| Agro magnétique | Halo pulsant rouge/orange |
| Fragmentation | Contour en pointillés |
| Tunnel vision | Ligne de visée fixe vers la cible initiale |
| Fantôme | Opacité ~60% + légère distorsion |
| Prédateur | Particules rouges vers la cible |

Implémentation PixiJS : filtres GLSL simples + overlay sprite. Coût de rendu négligeable.

---

## 5. Système d'upgrades (rogue-lite)

### Principe de rareté

Quatre niveaux : **Commun · Peu commun · Rare · Légendaire**

La rareté change la **portée et la profondeur** de l'effet, pas uniquement les pourcentages.

| Rareté | Principe |
|---|---|
| Commun | Affecte 1 type d'unité, effet simple |
| Peu commun | Affecte 1 type d'unité, effet conditionnel ou à seuil |
| Rare | Affecte 2 types d'unités ou propage l'effet aux alliés proches |
| Légendaire | Affecte toutes les unités ou modifie le comportement de flux globalement |

### Deux catégories d'upgrades

- **Modificateurs d'unités** — stats ou comportements d'un ou plusieurs types
- **Modificateurs de règles** — changent les conditions du combat (ex : "les unités qui meurent au centre soignent les alliées")

Les overclocks et les upgrades sont des systèmes distincts. Un upgrade est permanent pour la run, un overclock est réattribuable à chaque phase de préparation.

---

## 6. Méta-progression

### Stat boosts (méta uniquement)

Ces modificateurs ne sont jamais proposés en in-run. Ils réduisent la frustration des premières runs sans créer de décisions stratégiques parasites.

| Stat | Rôle |
|---|---|
| HP de base | Survie initiale |
| Vitesse de déplacement | Réactivité du flux |
| Dégâts de base | Pression offensive |
| Vitesse de rechargement | Cadence d'attaque |
| Chances de coup critique | Variance offensive |
| Dégâts critiques | Plafond de burst |

**Règle d'équilibrage cible** : un joueur sans méta-progression doit pouvoir finir les rounds 1-5. Les rounds 6-10 nécessitent une méta partielle. Le mode infini nécessite méta complète + maîtrise tactique.

### Overclocks en méta

Les overclocks ne sont jamais déblocables via méta. Un overclock acquis via méta devient invisible — le joueur ne le "découvre" plus, il optimise autour d'un état déjà connu. La découverte et la tension de choix doivent rester in-run.

---

## 7. Monétisation

**Modèle** : free-to-play + déblocage de configurations

- 3 configurations de départ disponibles gratuitement (combinaison de shapes + passif unique)
- 6-8 configurations supplémentaires achetables (~2-3€ à l'unité ou en pack)
- Skins cosmétiques sur particles/couleurs (cheap à implémenter, aucun impact gameplay)
- Pas de battle pass en V1

**Une configuration = un paradigme tactique**, pas un personnage narratif. Ex : "4 triangles 1 carré" joue fondamentalement différemment de "3 cercles 2 triangles". Ce n'est pas du cosmétique déguisé — c'est de la profondeur stratégique vendue honnêtement.

---

## 8. Map & Placement

> ⚠️ Section à définir — décisions en attente

Points à trancher :
- Taille de la grille de placement
- Symétrie ou asymétrie des zones de départ
- Obstacles statiques sur la map (modifient le flow field)

---

## 9. Structure d'une run

> ⚠️ Section à définir — décisions en attente

Points à trancher :
- Nombre de rounds par run
- Présence de boss (round 5, round 10 ?)
- Conditions de victoire d'une run complète

---

## 10. Stack technique

| Composant | Choix | Justification |
|---|---|---|
| Rendu | PixiJS (WebGL) | Formes géométriques sans sprites, très performant |
| Logique de combat | Web Workers | Évite le freeze UI avec de nombreuses unités |
| Collisions | Cercles (calcul de distance) | 100x moins coûteux qu'un moteur physique complet |
| Pathfinding | Flow Field | Performance constante indépendante du nombre d'unités |
| Frontend | Vite + React | Léger, pas de SSR inutile pour V1 |
| Backend / persistance | Supabase | Méta-progression, saves cloud |

**Parti pris visuel** : abstraction totale. Formes géométriques + couleurs + particules simples pour le game feel. Aucun sprite, aucune animation complexe.

**Contrainte critique** : les effets d'upgrade et d'overclock voyagent entre thread UI et Web Worker sous forme d'IDs — jamais de fonctions sérialisées. Chaque thread a sa propre copie du registre d'effets.

---

## 11. Questions ouvertes

- [ ] Map : taille de grille, symétrie, obstacles
- [ ] Structure de run : nombre de rounds, boss
- [ ] Multijoueur : hors scope V1, architecture à prévoir extensible pour V2
- [ ] Valeurs de calibration : HP de base, dégâts par type, rayon d'aggro des Carrés, durée d'un round
