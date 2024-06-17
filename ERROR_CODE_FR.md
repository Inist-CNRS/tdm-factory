# Liste des codes d'erreur qu'IA Factory peut renvoyer

Ceci est une liste qui tente d'expliquer toutes les causes liées à un code d'erreur.

## Erreur de type client

Liste les erreurs qui sont dues à un problème lié aux informations envoyées par l'utilisateur.

### Code 40

Ce code est utilisé quand le convertisseur ne peut pas convertir les données, car elles sont :

- incompatibles avec le convertisseur choisi,
- les données sont mal formatées ou corrompues,
- le champ cible est inapproprié ou incorrect

## Erreur de type serveur

Liste les erreurs qui sont dues à un problème du côté de l'application.

### Code 50

Le convertisseur a rencontré une erreur inattendue qui n'a pas été prévu et qui est irrécupérable.

Cette erreur englobe tout le convertisseur, une erreur est apparue à un moment non prévu
par les autres erreurs.

### Code 51

Erreur globale utilisée pour indiquer un problème lié au système de fichier.

Cette erreur peut arriver :

-  quand le disque est plein,
- s'il y a des problèmes avec les accès disque.

### Code 52

L'appel du convertisseur a échoué dû a un problème réseau.

Ceci peut être dû à :

- convertisseur surchargé,
- convertisseur en maintenance,
- problème réseau (routage, proxy, etc.).

### Code 53

L'appel de l'enrichisseur a échoué dû a un problème réseau.

Ceci peut être dû à :

- enrichisseur est surchargé,
- enrichisseur en maintenance,
- problème réseau (routage, proxy, etc.).

### Code 54

L'enrichisseur a refusé l'enrichissement.

Ceci peut être dû à :

- problème réseau qui a causé une corruption des données,
- données à convertir corrompues.

### Code 55

L'enrichisseur a rencontré une erreur inattendue qui n'a pas été prévue et qui est irrécupérable.

Cette erreur englobe tout l'enrichisseur, une erreur est apparue à un moment non prévu
par les autres erreurs.

### Code 56

La récupération des résultats a rencontré une erreur inattendue qui n'a pas été prévue et qui est irrécupérable.

Cette erreur englobe tout la récupération des résultats, une erreur est apparue à un
moment non couvert par les autres erreurs.

### Code 57

La requête de récupération des résultats a échoué à cause d'un problème réseau.

Ceci peut être dû à :

- enrichisseur surchargé,
- enrichisseur en maintenance,
- problème réseau (routage, proxy, etc.).

### Code 58

L'enrichisseur a refusé la récupération des résultats.

Ceci peut être dû à :

- problème réseau qui a causé une corruption des données,
- les données liées ont expiré ou ne sont pas disponibles.
