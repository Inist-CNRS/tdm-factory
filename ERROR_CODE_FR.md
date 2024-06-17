# List des codes d'erreur qu'IA Factory peut renvoyer

Ceci est une list qui tente d'expliqué toutes les causes liées à un code d'erreur.

## Erreur de type client

List les erreurs qui sont dues à un problème lié aux informations envoyé par l'utilisateur.

### Code 40

Ce code est utilisé quand le convertisseur ne peut pas convertire les données, car elles sont :

- Incompatible avec le convertiseurs choisi
- Les données sont mal formaté ou corrompue
- Le champ cible et inapproprié ou incorrecte

## Erreur de type serveur

List les erreurs qui sont dues à un problème du côté de l'application.

### Code 50

Le convertisseur a rencontré une erreur inattendue qui n'a pas était prevu et qui est irrécupérables.

Cette erreur englobe tout le convertisseur, donc si vous la voyer, c'est qu'une erreur et apparue a un moment non prevue
par les autres erreurs.

### Code 51

Erreur globale utilisée pour indiquer un problème lié au system de fichier.

Cette erreur peut arriver quand :

- Le disque et plein
- S'il y a des problème avec les access disque

### Code 52

L'appelle du convertisseur a échoué du a un problème réseaux.

Ceci peut être dû à :

- Convertisseur est surchargé
- Convertisseur est en maintenance
- Problème réseaux (routage, proxy, etc.)

### Code 53

L'appelle de l'enrichisseur a échoué du a un problème réseaux.

Ceci peut être dû à :

- Enrichisseur est surchargé
- Enrichisseur est en maintenance
- Problème réseaux (routage, proxy, etc.)

### Code 54

L'enrichisseur à refusé l'erichicement.

Ceci peut être dû à :

- Problème réseaux qui a causé une corruption des données
- Les données convertir, on était corrompue

### Code 55

L'enrichisseur a rencontré une erreur inattendue qui n'a pas était prevu et qui est irrécupérables.

Cette erreur englobe tout l'enrichisseur, donc si vous la voyer, c'est qu'une erreur et apparue a un moment non prevue
par les autres erreurs.

### Code 56

La récuperation des resultas a rencontré une erreur inattendue qui n'a pas était prevu et qui est irrécupérables.

Cette erreur englobe tout la récuperation des resultas, donc si vous la voyer, c'est qu'une erreur et apparue a un
moment non prevue par les autres erreurs.

### Code 57

L'appelle pour la récuperation des resultas a échoué du a un problème réseaux.

Ceci peut être dû à :

- Enrichisseur est surchargé
- Enrichisseur est en maintenance
- Problème réseaux (routage, proxy, etc.)

### Code 58

L'enrichisseur a refusé la récuperation des resultas.

Ceci peut être dû à :

- Problème réseaux qui a causé une corruption des données
- Les données liées ont expiré ou ne sont pas disponible
