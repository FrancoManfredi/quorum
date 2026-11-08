import type { Messages } from '../messages.ts'

export const mail: Messages['mail'] = {
  letters: {
    'advice.credits': [
      (v) => ({
        subject: `[Action requise] ${v.node} : le solde créditeur de CPU est de 0`,
        body: `Cher client,

Votre ressource Burstable ${v.node} a épuisé son solde créditeur CPU et est désormais limitée à 20 % CPU.

Comment fonctionnent les crédits : une boîte Burstable gagne des crédits tant qu'elle fonctionne en dessous de 20 % de chaque cœur et les dépense au-dessus. Le vôtre est au-dessus depuis un moment.

Actions recommandées :
- Redimensionner ${v.node}
- Ou sortez-le de Burstable, par exemple vers la famille Généraliste

Cette boîte de réception n'est pas surveillée.
${v.from}`,
      }),
      (v) => ({
        subject: `Votre ${v.node} fonctionne aux vapeurs`,
        body: `Bonjour,

Avis rapide de la part de votre équipe de compte chez ${v.from}. ${v.node} a dépensé tous les crédits CPU dont il disposait, nous l'avons donc poliment réduit à 20 % de CPU jusqu'à ce qu'il gagne plus. Il ne les gagne que lorsqu'il tourne au ralenti en dessous de 20 % de chaque cœur, ce qui, à en juger par votre trafic, n'est pas près d'arriver.

Redimensionnez-le ou sortez-le de Burstable vers quelque chose comme Généraliste, et il pourra à nouveau fonctionner à plein régime.

Chaleureusement (et avec une réduction que nous ne pouvons pas offrir),
Votre associé à la réussite client`,
      }),
      (v) => ({
        subject: `ÉVÉNEMENT : CPU_CREDITS_EXHAUSTED (${v.node})`,
        body: `Type d'événement : CPU_CREDITS_EXHAUSTED
Ressource : ${v.node}
Statut : Ouvert
Impact : CPU plafonné à 20 %

Description : Cette ressource Burstable dépense des crédits au-dessus de 20 % de chaque noyau et en gagne en dessous. Le solde est désormais nul.

Résolution : redimensionnez la ressource ou modifiez sa famille de Burstable (par exemple, à Généraliste).

Aucune réponse n'est nécessaire. Aucune réponse n'est possible.`,
      }),
      (v) => ({
        subject: `Re: re: à propos de la cote de crédit de ${v.node}`,
        body: `Bonjour,

Nous avons le regret de vous informer que ${v.node} a une cote de crédit CPU de zéro. Comme beaucoup d’entre nous, elle a acheté plus qu’elle n’a gagné.

Un nœud Burstable accumule des crédits chaque fois qu'il exécute moins de 20 % de chaque cœur et les dépense au-dessus. En faillite, il vit désormais avec un strict budget de 20% CPU.

Deux solutions : redimensionnez-le ou retirez-le de Burstable dans une famille qui ne rationne pas, comme General.

Merci d'avoir choisi ${v.from}. Vous aviez le choix. Moins maintenant.`,
      }),
      (v) => ({
        subject: `${v.node} limité à 20 % (en préversion)`,
        body: `Salutations de ${v.from} !

Nous sommes ravis de vous annoncer que ${v.node} a été inscrit à notre expérience de limitation. Il n'avait plus de crédits CPU et fonctionne désormais à 20 % de CPU.

Contexte : les instances Burstable accumulent des crédits sous 20 % de chaque cœur et les brûlent au-dessus.

Pour désactiver l'expérience, redimensionnez ${v.node} ou passez-le à une famille non Burstable telle que Généraliste.

Nous aimerions recevoir vos commentaires ! Les commentaires sont aussi en préversion.`,
      }),
    ],
    'advice.memory': [
      (v) => ({
        subject: `${v.node} manque de mémoire et échange`,
        body: `Cher client,

Notre surveillance montre que ${v.node} a utilisé la totalité de sa RAM et échange désormais sur le disque. Les requêtes sur cette ressource seront lentes.

Vous pouvez :
1. Redimensionner ${v.node}
2. Choisir la famille Mémoire
3. Réduire le pool

Nous apprécions votre entreprise. Nous l’apprécions davantage chaque mois.

L’équipe du Service Santé ${v.from}`,
      }),
      (v) => ({
        subject: `État du service : pression de la mémoire sur ${v.node}`,
        body: `Énoncé d'impact : À partir d'une heure indéterminée, ${v.node} a manqué de RAM. Le système d'exploitation échange les pages de mémoire sur le disque et tout ce qui se trouve sur la boîte l'attend désormais.

Statut actuel : En cours. Nous étudions pourquoi vous n'avez pas encore résolu ce problème.

Atténuation : redimensionnez la ressource, déplacez-la vers la famille Mémoire ou réduisez le pool pour qu'elle nécessite moins de RAM.

Prochaine mise à jour : quand vous agissez.`,
      }),
      (v) => ({
        subject: `L'échange n'est pas une mise à niveau de mémoire`,
        body: `Salut,

${v.node} est à court de RAM. Il échange, ce qui signifie qu'il fait comme si le disque était de la mémoire et que le disque ne joue pas ce rôle.

Donnez-lui de la place : redimensionnez-le, choisissez la famille Mémoire ou réduisez le pool.

Bonne continuation,
Équipe de compte, ${v.from}

P.S. Votre facture n'a pas manqué de mémoire. Il se souvient de tout.`,
      }),
      (v) => ({
        subject: `ALERTE ${v.node} mem=100% swap=actif`,
        body: `ALARME : "${v.node}-memory" est en état d'ALARME.

Raison : RAM entièrement utilisée ; le nœud échange.

Correctifs suggérés, dans le désordre :
- Redimensionner
- Famille de mémoire
- Réduire le pool

Vous recevez cet avis parce que vous êtes un client ${v.from}, ce que vous avez accepté à la page 41 d'un document que vous n'avez pas lu.`,
      }),
      (v) => ({
        subject: `Une petite note sur la mémoire du ${v.node}`,
        body: `Bonjour de ${v.from},

Nous espérons que cet e-mail vous trouvera bien. Nous sommes moins sûrs qu'il trouve bien ${v.node} : il n'a plus de RAM et il échange depuis un certain temps.

Lorsqu'une boîte échange, chaque requête attend sur le disque. Vos utilisateurs le remarquent avant vous.

Redimensionner le nœud, choisir la famille Mémoire ou réduire le pool lui donneront chacun une marge de manœuvre.

Cordialement,
Votre responsable de compte technique dédié (partagé)`,
      }),
    ],
    'advice.memory-shared': [
      (v) => ({
        subject: `${v.node} : Postgres et votre application partagent une seule RAM`,
        body: `Cher client,

${v.node} est à court de RAM et échange. La cause : Postgres s’exécute sur le même boîtier que votre application, et les deux veulent de la mémoire.

Action recommandée : placez une base de données et liez-y ${v.node} afin que Postgres ait sa propre maison.

Merci d'avoir construit sur ${v.from}.
Cette boîte de réception n'est pas surveillée.`,
      }),
      (v) => ({
        subject: `Conflit de colocation détecté sur ${v.node}`,
        body: `Salut,

Votre application et Postgres partagent ${v.node} comme deux colocataires partagent un même réfrigérateur. Le réfrigérateur, c'est la RAM et il est plein. Le nœud passe au disque.

Le correctif consiste à donner à Postgres sa propre place : placez une base de données, puis liez-y ${v.node}.

Aucun dépôt de garantie requis.

Votre architecte de solutions`,
      }),
      (v) => ({
        subject: `Événement d’intégrité : échange de ${v.node} (base de données colocalisée)`,
        body: `Événement : MEMORY_EXHAUSTED_COLOCATED
Ressource : ${v.node}
Cause première : Postgres partage le boîtier avec l'application. La mémoire combinée dépasse la RAM ; le nœud échange.

Correction : placez une base de données et liez-y le nœud.

Cet avis a été généré par ${v.from}. Ce n'est pas un contrat, une promesse ou une personne.`,
      }),
      (v) => ({
        subject: `Réflexion rapide sur ${v.node}`,
        body: `Hé,

Signalement de quelque chose de notre côté sur ${v.from} : ${v.node} n'a plus de RAM et échange. En regardant de plus près, Postgres vit sur la même boîte que l'application, donc chaque requête se dispute la même mémoire.

Nous le voyons souvent avec les premières configurations, et c'est la bonne décision au début. Cela n’est plus le cas maintenant.

Placez une base de données et liez-y ${v.node}. Votre application récupère sa RAM et Postgres reçoit une boîte qui lui est réservée.

Heureux de répondre à un appel (les appels sont en aperçu).

Cordialement,
Votre équipe de compte`,
      }),
      (v) => ({
        subject: `Deux locataires, un ${v.node}, zéro RAM libre`,
        body: `Avis d’épuisement de la mémoire.

La ressource ${v.node} héberge à la fois l'application et Postgres. Ensemble, ils ont utilisé toute la RAM et la ressource est désormais en train d'être échangée.

La configuration prise en charge est un Postgres par base de données : placez une base de données et liez-y ${v.node}.

Nous nous excusons pour tout inconvénient. Nous n'avons causé aucun inconvénient; nous nous excusons simplement par avance.`,
      }),
    ],
    'advice.network': [
      (v) => ({
        subject: `${v.node} a atteint le débit de la ligne réseau`,
        body: `Cher client,

${v.node} envoie autant d'octets que sa carte réseau peut en déplacer. C'est au tarif de ligne et le trafic supplémentaire sera mis en file d'attente.

Possibilités :
- Redimensionnez ${v.node} pour une carte réseau plus rapide
- Ajouter une copie derrière un répartiteur de charge pour diviser le trafic

La sortie est facturée par octet. Nous l'avons remarqué.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Le tuyau est plein`,
        body: `Salut,

Version courte : la carte réseau du ${v.node} déplace tous les octets possibles. C'est le tarif de ligne, et il n'y a pas de ligne après.

Redimensionnez-le ou placez une copie derrière un répartiteur de charge afin que deux cartes partagent le travail.

Merci,
Réseau (ceux que vous blâmez en premier)`,
      }),
      (v) => ({
        subject: `État du service : saturation du débit, ${v.node}`,
        body: `Titre : Saturation du réseau sur ${v.node}
Gravité : Avertissement
Région : Une des nôtres. C'est vers le haut, ce qui le réduit.

Résumé : Le trafic sortant de ${v.node} a atteint le débit de ligne de sa carte réseau.

Action du client : Redimensionnez la ressource ou ajoutez-en une copie derrière un répartiteur de charge.

État du service ${v.from}`,
      }),
      (v) => ({
        subject: `Félicitations pour votre trafic !`,
        body: `Bonjour !

Excellente nouvelle de ${v.from} : les gens veulent vraiment télécharger des éléments depuis ${v.node}. Tellement que sa carte réseau envoie désormais des octets aussi vite qu'elle le peut physiquement.

Moins bonne nouvelle : c'est le plafond. Tout ce qui reste fait la queue.

Pour surélever le plafond, redimensionnez ${v.node}. Pour ajouter un deuxième plafond, placez une copie derrière un répartiteur de charge.

On vous encourage (et on vous mesure),
Votre équipe de compte`,
      }),
      (v) => ({
        subject: `Carte réseau à 100 % sur ${v.node}`,
        body: `Message automatisé.

Métrique : Sortie réseau
Ressource : ${v.node}
Valeur : tarif de ligne
Seuil : débit de ligne

La carte réseau ne peut pas déplacer plus d'octets qu'elle n'en déplace actuellement. Redimensionnez la ressource ou ajoutez une copie derrière un répartiteur de charge.

Pour ne plus recevoir ces alertes, arrêtez d'envoyer des octets.`,
      }),
    ],
    'advice.disk': [
      (v) => ({
        subject: `${v.node} : le kit de travail ne tient plus en RAM`,
        body: `Cher client,

L'ensemble de travail de ${v.node} est devenu trop grand pour sa RAM. Les lectures qui provenaient auparavant de la mémoire sont désormais transférées sur le disque, ce qui est beaucoup plus lent.

Actions recommandées :
- Redimensionner ${v.node}
- Ou choisissez la famille Mémoire

Merci pour votre patience continue. Votre disque en fait moins étalage.

${v.from}`,
      }),
      (v) => ({
        subject: `Vos lectures prennent les escaliers`,
        body: `Salut,

${v.node} conservait ses données chaudes en RAM, où les lectures prennent l'ascenseur. L'ensemble de travail a dépassé la RAM, les lectures prennent donc maintenant les escaliers : elles atteignent le disque.

Redimensionnez-le ou choisissez la famille Mémoire, et l'ascenseur revient.

Cordialement,
Équipe de stockage`,
      }),
      (v) => ({
        subject: `Événement : DISK_READS_ELEVATED sur ${v.node}`,
        body: `Type d'événement : DISK_READS_ELEVATED
Ressource concernée : ${v.node}
Cause : L'ensemble de travail dépasse la RAM disponible.
Effet : les lectures sont transférées sur le disque.

Pour résoudre, redimensionnez la ressource ou sélectionnez la famille Mémoire.

Il s'agit d'un message automatisé provenant de ${v.from}. Les réponses sont acheminées vers un dossier que nous avons supprimé au cours d'un trimestre précédent.`,
      }),
      (v) => ({
        subject: `Re : ${v.node} semble lent ces derniers temps ?`,
        body: `Bonjour,

Si ${v.node} s’est révélé lent, voici pourquoi. Chaque nœud conserve les données qu'il utilise le plus, son ensemble de travail, en RAM. L'ensemble de travail de ${v.node} est devenu plus grand que sa RAM, de sorte qu'une part de chaque lecture est désormais transférée sur le disque.

Rien n'est cassé. Il attend simplement un truc qui tourne, au sens figuré.

Plus de RAM règle le problème : redimensionnez le nœud ou choisissez la famille Mémoire.

Cordialement,
Votre responsable de compte technique chez ${v.from}`,
      }),
      (v) => ({
        subject: `Le disque est la nouvelle RAM (non)`,
        body: `Avis.

L'ensemble de travail de ${v.node} ne tient plus en RAM, donc les lectures vont sur le disque.

Correctif : redimensionner, ou la famille Mémoire.

C'est tout l'e-mail. Nous sommes aussi surpris que vous.`,
      }),
    ],
    'advice.cpu': [
      (v) => ({
        subject: `${v.node} est à 100% CPU`,
        body: `Cher client,

${v.node} utilise la totalité de son CPU. Les demandes font la queue les unes derrière les autres.

Actions recommandées :
- Redimensionner ${v.node}
- Ajouter une copie derrière un répartiteur de charge

Votre consommation est en hausse. Votre facture aussi. Nous considérons cela comme un partenariat.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `ALARME : ${v.node} CPUUtilization >= 100`,
        body: `ALARME

Nom : ${v.node}-cpu
Changement d'état : OK -> ALARME
Raison : CPU à 100%.

Runbook : redimensionnez la ressource ou ajoutez une copie derrière un répartiteur de charge.

Vous recevez cet e-mail parce que quelqu'un, à un moment donné, a coché une case.`,
      }),
      (v) => ({
        subject: `${v.node} se donne à 100 %`,
        body: `Salut !

Nous aimons l'agitation. ${v.node} donne 110 %, ce qui, en termes de CPU, signifie 100 % et une file d'attente.

Deux façons de l'aider : redimensionnez-le ou ajoutez une copie derrière un répartiteur de charge afin que le travail soit réparti entre eux.

On est derrière vous,
Équipe de croissance chez ${v.from}

P.S. Une copie est un tout nouveau nœud. Nous enverrons une toute nouvelle facture.`,
      }),
      (v) => ({
        subject: `État du service : calculer la saturation sur ${v.node}`,
        body: `Impact : ${v.node} est à 100% CPU. Le travail qui arrive maintenant attend le travail arrivé plus tôt.

Statut : Enquête. Notre enquête consiste en cet e-mail.

Solution de contournement : redimensionnez la ressource ou ajoutez-en une copie derrière un répartiteur de charge.

Toutes les autres régions fonctionnent normalement, les trois que nous pouvons voir.

${v.from}`,
      }),
      (v) => ({
        subject: `Votre CPU a appelé. Il est occupé.`,
        body: `Bonjour,

Nous avons essayé de joindre ${v.node} à propos de quelque chose sans rapport, mais il est à 100 % de CPU et n'a pas pu décrocher.

Si vous souhaitez qu'il ait à nouveau un moment libre, redimensionnez-le dans une boîte plus grande ou ajoutez une copie derrière un répartiteur de charge pour qu'ils se relaient.

Merci de votre compréhension,
Expérience client Calcul`,
      }),
    ],
    'advice.draining': [
      (v) => ({
        subject: `[Attention] Les crédits CPU de ${v.node} baissent`,
        body: `Cher client,

${v.node} dépense les crédits CPU plus rapidement qu'il n'en gagne. Lorsque le solde atteint zéro, il chute à 20 % CPU.

Pour éviter cela :
- Basculez-le en Généraliste
- Ou redimensionnez-le

Utilisez Afficher à bord pour le trouver.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Les crédits de ${v.node} : compte à rebours`,
        body: `Salut,

Il s'agit de l'e-mail avant l'e-mail. ${v.node} épuise ses crédits CPU et sera bientôt épuisé. Après cela, il fonctionne à 20 % CPU et vous recevez l'autre e-mail.

Basculez-le sur Généraliste ou redimensionnez-le, et aucun de nous n’aura à l’envoyer ou à le lire.

Afficher à bord vous y amène directement.

Merci,
Votre équipe de compte`,
      }),
      (v) => ({
        subject: `Prévisions : ${v.node} bientôt limité à 20 %`,
        body: `Avis de prévision de ${v.from}.

Au rythme actuel, ${v.node} dépensera bientôt son dernier crédit CPU. Une fois cela fait, il sera limité à 20 % CPU.

Il s'agit d'une prévision, pas d'une panne. Comme nos prévisions météorologiques, elles sont en aperçu, mais contrairement à elles, elles ont tendance à être exactes.

Action : Basculez ${v.node} sur Généraliste ou redimensionnez-le. Afficher à bord vous le montrera.`,
      }),
      (v) => ({
        subject: `Alerte de solde faible : ${v.node}`,
        body: `Bonjour,

Votre solde créditeur CPU sur ${v.node} est faible et en baisse. Nous détesterions qu'il atteigne zéro, car le nœud chute alors à 20 % CPU.

Contrairement à votre banque, nous ne proposerons pas de découvert. Contrairement à votre banque, nous vous expliquerons comment y remédier : basculez le nœud en Généraliste, ou redimensionnez-le.

Voyez-le avec Afficher à bord.

Cordialement,
Facturation et rafale, ${v.from}`,
      }),
      (v) => ({
        subject: `ÉVÉNEMENT : CPU_CREDITS_DRAINING (${v.node})`,
        body: `Type d'événement : CPU_CREDITS_DRAINING
Ressource : ${v.node}
Catégorie : programmé (par vous, par accident)
Impact attendu : CPU plafonné à 20% lorsque les crédits atteignent zéro

À éviter en : passant au Généraliste ou redimensionnant.

Localiser : Afficher à bord.

Cette boîte aux lettres n'est pas surveillée. Apparemment, ${v.node} non plus.`,
      }),
    ],
    'advice.drawer': [
      (v) => ({
        subject: `Votre tiroir de paiements est plein 🎉`,
        body: `Salut!

Excellente nouvelle : vous avez gagné tellement d'argent que votre tiroir de paiements est complètement plein ! Moins bonne nouvelle : les nouveaux revenus n’ont nulle part où aller, ils se répandent donc et les revenus perdus sont perdus.

Cliquez sur Paiements pour récupérer ce qu'il y a dedans et le tiroir retrouve de la place.

Continuez à tout casser,
L'équipe ${v.from}

P.S. La collecte est gratuite. La plupart des autres choses ne le sont pas.`,
      }),
      (v) => ({
        subject: `Avis concernant le solde de votre compte`,
        body: `Cher commerçant,

Cet avis a pour but de vous informer que le tiroir de paiements associé à votre compte a atteint sa capacité. Tout revenu supplémentaire perçu ne sera pas conservé et est considéré comme perdu.

Pour restaurer la capacité, veuillez cliquer sur Paiements et récupérer le solde.

Merci de ne pas répondre à ce message. Les réponses sont placées en cours d'examen.

Cordialement,
Centre de résolution ${v.from}`,
      }),
      (v) => ({
        subject: `L'argent tombe par terre`,
        body: `Hé,

Votre tiroir de paiements est plein. Les nouveaux revenus débordent et nous ne les récupérons pas (nous facturerions des frais pour nous baisser).

Cliquez sur Paiements pour collecter.

— ${v.from}`,
      }),
      (v) => ({
        subject: `Action nécessaire : les revenus se répandent`,
        body: `Bonjour,

Un aperçu rapide de votre tableau de bord :

Tiroir : plein
Revenus entrants : déversement
Revenus retirés du déversement : aucun

Tout paiement arrivant alors que le tiroir est plein est perdu. Cliquez sur Paiements pour collecter ce qui attend et de nouveaux revenus apparaîtront à nouveau.

Nous facilitons le paiement. Rester payé est un produit distinct.

Bonne continuation,
${v.from}`,
      }),
      (v) => ({
        subject: `Re: Cas n°00000 : tiroir à pleine capacité`,
        body: `Cher titulaire de compte,

Nous avons examiné votre compte et déterminé que votre tiroir de paiements est plein. Tant qu'il reste plein, les revenus entrants débordent et ne peuvent pas être récupérés. ${v.from} n'est pas responsable des revenus perdus, en vertu de la section 9.2(c), que vous pouvez trouver sous Légal, puis Plus Légal.

Résolution : Cliquez sur Paiements pour récupérer le tiroir-caisse.

Ce dossier se fermera automatiquement. La plupart des choses ici le font.

Cordialement,
Examen du compte`,
      }),
    ],
    'advice.collect': [
      (v) => ({
        subject: `Vous avez des revenus en attente`,
        body: `Salut !

Vous avez des revenus dans votre tiroir de paiements et votre trésorerie semble un peu mince. Réparons ça !

Cliquez sur Paiements pour le récupérer et le transférer dans votre trésorerie.

Bonne vente,
L'équipe ${v.from}

P.S. Saviez-vous que vous pouvez consulter vos frais sur un magnifique tableau interactif ?`,
      }),
      (v) => ({
        subject: `Fonds disponibles pour la collecte`,
        body: `Cher commerçant,

Nos dossiers indiquent que les revenus sont conservés dans votre tiroir de paiements alors que le solde de trésorerie de votre compte est faible.

Ces fonds ne sont pas à l'étude. Nous avons vérifié deux fois, ce qui est un examen, mais un court.

Pour collecter, cliquez sur Paiements.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Trésorerie faible, tiroir non disponible`,
        body: `Hé,

Votre trésorerie est faible. Pendant ce temps, votre tiroir de paiements repose sur les revenus que vous avez déjà gagnés.

Un clic corrige l'inadéquation : cliquez sur Paiements pour collecter, et l'argent est transféré là où vous pouvez le dépenser.

${v.from}`,
      }),
      (v) => ({
        subject: `Votre récapitulatif hebdomadaire ${v.from}`,
        body: `Bonjour !

Voici votre semaine en un coup d'œil :

- Revenus : dans le tiroir Paiements
- Trésorerie : faible
- Frais : présents et prospères

Les deux premiers feraient une jolie paire. Cliquez sur Paiements pour encaisser les revenus dans la trésorerie.

A la semaine prochaine,
Vos amis chez ${v.from}`,
      }),
      (v) => ({
        subject: `Ne laissez pas d'argent dans le tiroir`,
        body: `Bonjour,

Nous avons remarqué que vous avez des revenus en attente dans votre tiroir de paiements alors que votre trésorerie est faible. Il est à vous ! Il n'est simplement pas dans la trésorerie tant que vous ne l'avez pas encaissé.

Cliquez sur Paiements pour l'importer.

Merci d'avoir grandi avec ${v.from}. Nous grandissons d'un petit pourcentage chaque fois que vous grandissez.

Bonne continuation,
Succès du commerçant`,
      }),
    ],
    'advice.negative': [
      (v) => ({
        subject: `Votre solde de trésorerie est négatif`,
        body: `Salut,

J’ai rapproché les comptes et votre trésorerie est négative. J’ai arrondi deux fois : elle est toujours négative.

Il y a deux façons de revenir en arrière : vendre les nœuds dont vous n'avez pas besoin ou augmenter vos revenus. Le premier est plus rapide.

Cordialement,
Votre comptable chez ${v.from}`,
      }),
      (v) => ({
        subject: `Rappel : solde en souffrance (à vous-même)`,
        body: `Cher client,

Ceci est un rappel amical que votre solde trésorerie est négatif.

Il s’agit d’un deuxième rappel, moins convivial, dans le même email, pour gagner du temps.

Veuillez examiner vos nœuds et vendre ceux dont vous n'avez pas besoin, ou augmenter vos revenus jusqu'à ce que le solde soit à nouveau supérieur à zéro.

Si vous l'avez déjà fait, veuillez ignorer cet e-mail. Nous avons vérifié. Ce n’est pas le cas.

Cordialement,
Comptes, ${v.from}`,
      }),
      (v) => ({
        subject: `Alerte comptable : trésorerie < 0`,
        body: `Vérification automatisée du grand livre

Compte : Trésorerie
Solde : négatif
Statut : arrondi à l'inférieur, puis à nouveau à l'inférieur

Prochaines étapes suggérées :
- Vendez des nœuds dont vous n'avez pas besoin
- Augmenter les revenus

Généré par ${v.from}. Cet avis a été déposé à côté du dernier.`,
      }),
      (v) => ({
        subject: `Nous devons parler du numéro rouge`,
        body: `Bonjour,

Je parcourais les livres de ce mois-ci et j'espérais que le rouge était un choix de formatage. Ce n’est pas le cas : votre solde trésorerie est négatif.

Je ne suis pas là pour juger. J'ai vu des fondateurs revenir du pire. Ils faisaient généralement l'une des deux choses suivantes : vendre les nœuds qu'ils n'utilisaient pas vraiment ou augmenter leurs revenus. Généralement le premier, puis le second.

Faites-moi savoir si vous souhaitez que je passe en revue les chiffres. je suis libre; mon taux horaire ne l'est pas.

Chaleureusement,
Votre comptable chez ${v.from}`,
      }),
      (v) => ({
        subject: `Rapide`,
        body: `Salut,

La trésorerie est négative. Vendez les nœuds dont vous n'avez pas besoin ou augmentez vos revenus. Je commencerais par les nœuds.

C'est tout. Je mets ceci dans un dossier intitulé « Préoccupations ».

— ${v.from}`,
      }),
    ],
    'advice.guidance': [
      (v) => ({
        subject: `Rappel : vos prévisions du trimestre`,
        body: `Salut,

Maintenant que vous êtes une société cotée, le marché se souvient de ce que vous lui dites. Ce trimestre, ce sont vos prévisions : le chiffre que vous avez promis.

Tenez-les. Les analystes sont gentils avec les entreprises qui font ce qu'ils disent et créatifs avec celles qui ne le font pas.

Cordialement,
Votre comptable chez ${v.from}`,
      }),
      (v) => ({
        subject: `Vos prévisions ne sont pas une suggestion`,
        body: `Cher client,

En tant que société cotée, vous fixez des prévisions pour ce trimestre, un chiffre promis au marché. Veuillez prévoir de les tenir.

Pour votre information, des expressions telles que « vents contraires », « un environnement macro difficile » et « franchement » ne comptent pas comme des prévisions. Nous avons vérifié leur registre.

Cordialement,
Rapports aux investisseurs, ${v.from}`,
      }),
      (v) => ({
        subject: `Liste de contrôle de fin de trimestre`,
        body: `Bonjour,

Votre liste de contrôle de fin de trimestre de ${v.from} :

- Livres réconciliés : en cours
- Reçus joints : certains
- Prévisions tenues : s'il vous plaît

Vous êtes public maintenant. Vous avez communiqué au marché un chiffre pour ce trimestre, et le marché l'a noté. Tenons les prévisions que vous avez fixées.

Merci,
L'équipe comptable`,
      }),
      (v) => ({
        subject: `À propos de ce chiffre que vous avez promis`,
        body: `Salut,

Petit rappel, dans l'esprit de la vie d'une société cotée : ce trimestre vous fixez des prévisions, et le marché vous y tient.

Je fais des livres depuis longtemps. Les entreprises privées peuvent connaître un mauvais trimestre. Les sociétés cotées connaissent un mauvais trimestre, de mauvais résultats et une mauvaise semaine de gros titres. Tenez le chiffre.

Si vous avez besoin de moi, je serai là pour surligner tranquillement les cellules.

Bonne continuation,
Votre comptable, ${v.from}`,
      }),
      (v) => ({
        subject: `Prévisions : le marché veille`,
        body: `Rappel automatisé

Statut de l'entreprise : Publique
Ce trimestre : prévisions fixées
Action : tenez les prévisions que vous avez fixées

Les prévisions sont le chiffre que vous avez promis au marché pour le trimestre. Nous vous recommandons de promettre avec soin et de livrer exactement.

Généré par ${v.from}. Veuillez les conserver dans vos dossiers, car nous ne le ferons pas.`,
      }),
    ],
    'advice.workers': [
      (v) => ({
        subject: `[DÉCLENCHÉ] ${v.node} : tous les processus sont occupés`,
        body: `ALERTE DÉCLENCHÉE

Service : ${v.node}
Condition : chaque processus occupé
Cause : j'attends principalement la base de données
Paramètre de pool : aucun sur ce runtime
Action suggérée : accélérer la réponse de la base de données

Cette alerte continuera à se déclencher jusqu'à ce qu'un processus soit libre. ${v.from} continuera à vous le dire.`,
      }),
      (v) => ({
        subject: `Tous vos processus ${v.node} sont en attente`,
        body: `Bonjour,

Rapide de ${v.from}. Tous les processus du ${v.node} sont occupés et, lorsque nous y regardons de plus près, la plupart d'entre eux ne travaillent pas du tout. Ils attendent dans la base de données, comme si tout un bureau restait en attente avec le même centre d'appels.

Ce runtime n'a pas de taille de pool à afficher, donc l'ajout de sièges ne sera pas utile. La solution honnête consiste à accélérer la réponse de la base de données.

Bonne continuation,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : ${v.node} n'a pas de processus libres`,
        body: `Nouveau problème dans ${v.node}

WorkerPoolExhausted : aucun processus libre pour répondre à la demande

Ce que nous voyons : chaque processus est occupé et la plupart de ce temps est passé à attendre sur la base de données.

Ce qui ne va pas aider : il n'y a pas de bouton de pool sur ce runtime.
Ce qui aidera : accélérer la réponse de la base de données.

Nous l'avons vu en premier. Maintenant, vous l'avez vu aussi.
${v.from}`,
      }),
      (v) => ({
        subject: `Annotation du panneau : processus ${v.node} épinglés`,
        body: `Votre panneau de travail ${v.node} présente depuis un certain temps une ligne plate tout en haut. Une ligne plate en haut est aussi mauvaise qu’une ligne plate en bas.

Nous avons ajouté une annotation : « chaque processus est occupé, la plupart du temps en attente sur la base de données ».

Il n’y a aucun paramètre de pool à augmenter sur ce runtime. Faites en sorte que la base de données réponde plus rapidement et la ligne reviendra.

- ${v.from}`,
      }),
      (v) => ({
        subject: `ESCALADE : ${v.node} n'a plus de processus libres`,
        body: `Il est tard. Nous le savons. Vous recevez cela parce que vous êtes éveillé.

Il ne reste plus aucun processus inactif sur ${v.node}. Ils sont pour la plupart assis sur des appels de bases de données ouvertes, attendant des réponses.

Avant de chercher une taille de pool : ce runtime n’en a pas. Le correctif est en amont. Faites répondre la base de données plus vite.

Retournez dormir ensuite. Nous prendrons de vos nouvelles.
${v.from} de garde`,
      }),
    ],
    'advice.workers-pool': [
      (v) => ({
        subject: `[DÉCLENCHÉ] ${v.node} : pool ${v.runtime} plein`,
        body: `ALERTE DÉCLENCHÉE

Service : ${v.node}
Durée d'exécution : ${v.runtime}
Condition : chaque processus occupé
Surtout : attendre

Correction (choisissez-en une) :
1. Augmenter le pool
2. Accélérez la base de données

Si personne ne répond, cette alerte est transmise à toute personne réveillée. Statistiquement, c'est vous.
- ${v.from}`,
      }),
      (v) => ({
        subject: `Chaque processus ${v.runtime} sur ${v.node} est occupé`,
        body: `Bonjour de ${v.from},

Chaque processus ${v.runtime} sur ${v.node} est pris. La plupart d’entre eux attendent simplement, ce qui est le type d’activité le plus coûteux.

Vous avez deux options honnêtes. Augmentez le pool pour que davantage de requêtes puissent attendre en même temps, ou accélérez la base de données pour que personne n'attende aussi longtemps.

Heureux de continuer à regarder de toute façon.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Régression : pool ${v.runtime} épuisé sur ${v.node}`,
        body: `Problème : Pool épuisé (${v.runtime})
Où : ${v.node}
Première vue : tout à l'heure
Vu pour la dernière fois : également tout à l'heure

Chaque processus du pool ${v.runtime} est occupé et la plupart attendent plutôt que de travailler.

Correctifs suggérés :
- Augmenter le pool
- Accélérer la base de données

Marquer comme résolu lorsque le pool a de la place. Nous vous dirons si cela revient. Nous le faisons toujours.
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} : votre ligne ${v.runtime} a touché le plafond`,
        body: `Hé,

Le panel « processus occupés de ${v.runtime} » pour ${v.node} a grimpé jusqu'au sommet et y est resté. Plus de place sous le plafond.

Le problème : ils attendent pour la plupart, pas calculent.

Alors soit augmentez le pool, soit accélérez la base de données. Les deux font baisser la ligne. L'un d'eux rend également tout le reste plus rapide, mais nous sommes un tableau de bord, pas votre mère.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : processus de ${v.runtime} sur ${v.node}`,
        body: `Chronologie des incidents, ${v.node}

- Les demandes arrivent. Les processus du ${v.runtime} les récupèrent.
- Les processus demandent à la base de données. Les processus attendent.
- D'autres demandes arrivent. D'autres processus attendent.
- Chaque processus est maintenant occupé à attendre. Les alertes se déclenchent.
- ${v.from} vous envoie un e-mail. (Vous êtes ici.)

Étape suivante : augmenter le pool ou accélérer la base de données.`,
      }),
    ],
    'advice.connections': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Postgres : trop de connexions`,
        body: `ALERTE DÉCLENCHÉE

Composant : Postgres
Erreur : refus des nouvelles connexions
Cause : trop de processus d'application détenant des pools

Correction :
- Réduire les pools, ou
- Ajouter un pool de connexions

Cette page se répétera jusqu'à ce qu'elle soit reconnue par un humain, un animal de compagnie ou un chat marchant sur le clavier.
${v.from}`,
      }),
      (v) => ({
        subject: `Postgres a cessé de répondre à la porte`,
        body: `Salut,

Postgres a commencé à refuser les connexions. Non pas parce qu'il réfléchit, mais parce que trop de processus d'application détiennent chacun un pool de connexions et que la liste des invités est pleine.

Deux solutions : réduire les pools pour que chaque processus en contienne moins, ou ajouter un pool de connexions pour qu'ils partagent tous.

Chaleureusement,
L'équipe ${v.from}

P.S. Ouvrir davantage de connexions n’est pas l’une des deux manières.`,
      }),
      (v) => ({
        subject: `Nouveau problème : FATAL, trop de clients`,
        body: `Nouveau problème
FATAL : désolé, déjà trop de clients

Postgres refuse les connexions. Chaque processus d'application apporte son propre pool et, ensemble, ils ont utilisé chaque emplacement.

Correctif : réduisez les pools ou ajoutez un pool de connexions.

Cette question vous est assignée, car il n'y a personne d'autre. Bienvenue aux startups.
- ${v.from}`,
      }),
      (v) => ({
        subject: `Résumé hebdomadaire : un panneau que vous devriez consulter`,
        body: `Votre résumé ${v.from}

La plupart des panneaux semblent en bon état cette semaine. Ce n’est pas le cas.

Connexions Postgres : pleines. Les nouveaux sont refusés, car trop de processus d’application détiennent chacun leur propre pool.

Que faut-il essayer : réduisez les pools ou ajoutez un pool de connexions devant Postgres pour que les processus soient partagés.

C'est le résumé. Bref, parce que le reste est ennuyeux, et ennuyeux c'est bien.`,
      }),
      (v) => ({
        subject: `Re: Re: Re: Connexions Postgres`,
        body: `Re-bonjour.

Nous l'avons déjà mentionné, et nous le mentionnerons à nouveau : Postgres refuse les connexions. Trop de processus d’application détiennent des pools et il ne reste plus de sièges.

Le correctif n'a pas changé. Réduisez les pools ou ajoutez un pool de connexions.

Vous recevez ce message parce que vous êtes réveillé et que Postgres ne prend pas d'appels.
${v.from}`,
      }),
    ],
    'advice.throughput': [
      (v) => ({
        subject: `[DÉCLENCHÉ] ${v.node} : débit dépassé`,
        body: `ALERTE DÉCLENCHÉE

Service : ${v.node}
Condition : requêtes supérieures à son débit
Statut : c'est la limite

Il n'y a aucun paramètre dans cette alerte pour faire disparaître la limite. ${v.node} fait tout ce qu’il peut et d’autres arrivent.

${v.from}
Vous recevez cela parce que vous êtes éveillé.`,
      }),
      (v) => ({
        subject: `${v.node} fait de son mieux. Ce n'est pas suffisant.`,
        body: `Salut,

Un petit avertissement de ${v.from}. ${v.node} reçoit plus de requêtes que son débit. Il n'est pas cassé et il n'est pas mal configuré. C'est tout simplement à la limite, et le surplus n'a nulle part où rentrer.

Nous avons pensé que vous voudriez le savoir avant que les utilisateurs ne vous le disent.

Prenez soin de vous,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Annotation graphique : ${v.node} a atteint sa limite`,
        body: `Nous avons tracé une ligne rouge sur le panneau ${v.node}. Votre trafic l'a franchie.

Annotation: "débit dédépassé. C'est la limite."

Un sommet plat sur un graphique signifie généralement un plafond, et celui-ci en est un. ${v.node} ne peut pas aller plus vite que cela.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Problème : ${v.node} surcapacité`,
        body: `Problème : Débit dépassé
Où : ${v.node}
Tendance : en hausse

Plus de demandes parviennent à ${v.node} qu’il ne peut en traiter. C'est sa limite, ce n'est pas un bug pour lequel nous pouvons pointer une ligne de code.

Nous continuerons à compter. Compter, c'est ce que nous faisons.
${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : ${v.node} atteint la limite`,
        body: `Chronologie des incidents

- Le trafic augmente. ${v.node} suit le rythme.
- Le trafic augmente davantage. ${v.node} suit à peine le rythme.
- Le trafic passe par le débit de ${v.node}.
- ${v.node} atteint la limite et y reste.
- ${v.from} écrit cet e-mail.

Cause première : ${v.node} a dépassé son débit. C'est la limite.`,
      }),
    ],
    'advice.limit': [
      (v) => ({
        subject: `Goulot d'étranglement : ${v.node}`,
        body: `ALERTE

Ce qui limite actuellement le design : ${v.node}
Tout le reste : il y a de la place disponible

Aucun autre détail dans cette alerte. ${v.node} est la partie étroite du tuyau, et le reste de l’architecture l'attend.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Si tu ne regardes qu'une chose aujourd'hui`,
        body: `Salut,

Nous regardons beaucoup de graphiques en votre nom chez ${v.from}, et aujourd'hui, ils sont tous d'accord sur quelque chose : ${v.node} est ce qui limite actuellement l’architecture.

Toutes les autres parties l'attendent. Si vous vous demandez où chercher en premier, regardez là.

Tout le meilleur,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} est le lien le plus lent`,
        body: `Hé, c'est ${v.from}.

Nous avons aligné chaque panneau côte à côte. ${v.node} est celui qui retient les autres. C'est ce qui limite actuellement le design.

Pas de ligne plate, pas d'incendie. Juste le point le plus étroit de tout cela.

Je pensais que tu voudrais le nom.`,
      }),
      (v) => ({
        subject: `Problème de l'heure : ${v.node}`,
        body: `Problème de l'heure

Facteur limitant : ${v.node}
Impact : toute l’architecture
Vu : à chaque fois que nous vérifions

À l’heure actuelle, ${v.node} donne le ton à tout. Lorsqu'il est le plus lent, le design est aussi rapide que ${v.node}.

${v.from}
Nous l'avons vu en premier. Vous l'avez vu en dernier.`,
      }),
      (v) => ({
        subject: `[ESCALATED] Architecture limitée par ${v.node}`,
        body: `ESCALADE

Cette alerte a été déclenchée, ignorée par tout le monde, et a quand même été remontée, car c'est ainsi que fonctionne l'escalade.

Constatation : ${v.node} est ce qui limite actuellement l’architecture.

C'est toute la page. Vous recevez cela parce que vous êtes éveillé.
${v.from}`,
      }),
    ],
    'advice.failed': [
      (v) => ({
        subject: `[DÉCLENCHÉ] ${v.node} est en panne`,
        body: `ALERTE DÉCLENCHÉE

Service : ${v.node}
Statut : ÉCHEC

Correction :
1. Sélectionnez ${v.node} et cliquez sur Remplacer, ou
2. Attendez le fournisseur

Utilisez Afficher à bord pour le trouver.

Cette page escaladera jusqu'à ce que quelqu'un effectue l'une des opérations ci-dessus. Vous recevez cela parce que vous êtes éveillé.
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} a cessé de répondre`,
        body: `Salut,

Désolé d'être le messager. ${v.node} a échoué. Rien n’en sort et notre panneau est resté à plat. Ce n'est pas bon.

Vous pouvez le sélectionner et cliquer sur Remplacer pour en mettre un nouveau à sa place, ou attendre que le fournisseur le ramène.

Afficher à bord vous y emmènera directement.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : ${v.node} inaccessible`,
        body: `Nouveau problème : NodeFailed
Où : ${v.node}
Première vue : il y a quelques instants

Chaque requête adressée à ${v.node} échoue, car ${v.node} lui-même a échoué.

Réparez-le vous-même : sélectionnez-le et cliquez sur Remplacer.
Ou ne le faites pas : attendez le fournisseur.

Afficher à bord est joint.
${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : échec du ${v.node}`,
        body: `Chronologie des incidents

- ${v.node} va bien.
- ${v.node} ne va pas bien.
- ${v.node} a échoué.
- ${v.from} le remarque et vous écrit.
- Vous lisez ceci. (Vous êtes ici.)
- Suivant : sélectionnez-le et cliquez sur Remplacer, ou attendez le fournisseur.

Afficher à bord ci-dessous.`,
      }),
      (v) => ({
        subject: `Ligne plate sur ${v.node}`,
        body: `Votre panneau ${v.node} est tombé à plat il y a un instant. Pas un calme plat. Un plat raté.

Deux voies à suivre. Sélectionnez-le et cliquez sur Remplacer si vous préférez ne pas attendre, ou attendez le fournisseur si vous lui faites plus confiance qu'à nous.

Appuyez sur Afficher à bord pour voir où il se trouve.

- ${v.from}`,
      }),
    ],
    'advice.restarting': [
      (v) => ({
        subject: `[INFO] Redémarrage de ${v.node}`,
        body: `AVIS

Service : ${v.node}
Statut : redémarrage
Impact : les demandes échouent jusqu'à ce qu'il soit terminé
Action requise : aucune

Oui, nous vous avons bipé pour quelque chose qui ne nécessite aucune action. Vous recevez cela parce que vous êtes éveillé.
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} s'allonge un peu`,
        body: `Salut,

Rien à faire ici, juste vous tenir au courant. ${v.node} redémarre. Pendant ce temps, les requêtes échoueront. Une fois rétabli, ils recommenceront.

Aucune action nécessaire. Afficher à bord est là si vous voulez le voir revenir.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Pic d'erreurs provenant de ${v.node} (attendu)`,
        body: `Problème : erreurs provenant de ${v.node}
Statut : attendu

${v.node} redémarre, donc les demandes échouent jusqu'à ce qu'il soit terminé. Les erreurs s'arrêtent d'elles-mêmes.

Aucune action nécessaire. Nous vous le disons quand même, car vous le dire, c'est toute notre personnalité.
${v.from}`,
      }),
      (v) => ({
        subject: `Annotation : redémarrage de ${v.node}`,
        body: `Nous avons marqué le panneau ${v.node} avec une annotation : "redémarrage".

Le creux que vous verrez est l'échec des demandes lors de leur retour. C'est temporaire et cela se termine lorsque ${v.node} est opérationnel.

Aucune action nécessaire. Utilisez Afficher à bord si vous souhaitez garder un œil dessus.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : redémarrage de ${v.node}`,
        body: `Chronologie

- ${v.node} commence à redémarrer.
- Les requêtes adressées à ${v.node} échouent.
- Vous recevez cet e-mail.
- ${v.node} réapparaît.
- Les demandes réussissent à nouveau.

Votre rôle dans cette chronologie : aucun. Aucune action nécessaire.

${v.from}`,
      }),
    ],
    'advice.slow-query-fix': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Base de données : analyses complètes de la table`,
        body: `ALERTE DÉCLENCHÉE

Composant : Base de données
Condition : requête sans index
Effet : des tables entières analysées à chaque appel

Correction : sélectionnez la base de données et cliquez sur Ajouter un index.

Cette alerte est facile à corriger et difficile à ignorer. S'il vous plaît, faites le premier.
${v.from}`,
      }),
      (v) => ({
        subject: `Votre base de données lit chaque page`,
        body: `Salut,

L'une de vos requêtes n'a pas d'index, donc à chaque exécution, la base de données analyse des tables entières pour trouver ce dont elle a besoin. Imaginez que vous recherchez un mot en lisant le dictionnaire à partir de « oryctérope ».

Bonne nouvelle : celui-ci est entre vos mains. Sélectionnez la base de données et cliquez sur Ajouter un index.

Merci,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : SlowQuery (index manquant)`,
        body: `Nouveau problème : SlowQuery
Où : Base de données
Cause : pas d'index
Symptôme : analyses de tables entières
Vu : à chaque exécution de la requête

Résolution : sélectionnez la base de données et cliquez sur Ajouter un index.

Résolvez-le et nous arrêterons de compter.
${v.from}`,
      }),
      (v) => ({
        subject: `Cette dent de scie sur le panneau Base de données`,
        body: `Hé, ${v.from} ici.

Le panneau Base de données a une forme que nous connaissons bien. Il s'agit d'une requête sans index, donc la base de données analyse des tables entières à chaque fois.

Le correctif est à portée de clic : sélectionnez la base de données et cliquez sur Ajouter un index.

Après cela, le panneau devrait devenir ennuyeux. Nous aimons ennuyeux.`,
      }),
      (v) => ({
        subject: `Re: la requête lente (édition 3h du matin)`,
        body: `C'est ${v.from}. Vous recevez cela parce que vous êtes éveillé.

Une requête n'a pas d'index. La base de données y répond à la dure : en analysant des tables entières.

Vous pouvez le réparer avant de vous recoucher. Sélectionnez la base de données et cliquez sur Ajouter un index.

Bonne nuit, probablement.`,
      }),
    ],
    'advice.slow-query': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Base de données : requête lente`,
        body: `ALERTE DÉCLENCHÉE

Composant : Base de données
Cause : requête sans index
Effet : tables entières analysées
Ajouter un index : pas encore disponible

Correction :
- Recherchez l'analyse des requêtes, ou
- Placez un cache devant

${v.from}`,
      }),
      (v) => ({
        subject: `Une requête lit toute la bibliothèque`,
        body: `Salut,

L'une de vos requêtes n'a pas d'index, la base de données analyse donc des tables entières pour y répondre. Cela devient vite lent.

Vous ne pouvez pas encore ajouter d'index. En attendant, il existe deux voies : rechercher l'analyse des requêtes, afin que vous puissiez en ajouter une plus tard, ou placer un cache devant, afin que la base de données soit interrogée moins souvent.

Tout le meilleur,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : SlowQuery (pas d'index)`,
        body: `Nouveau problème : SlowQuery
Où : Base de données
Cause : index manquant, analyses de la table entière

Solutions de contournement lorsque l'indexation est hors de portée :
1. Recherchez l'analyse des requêtes
2. Placez un cache devant

Nous garderons ce problème ouvert. Nous sommes très doués pour garder les problèmes ouverts.
${v.from}`,
      }),
      (v) => ({
        subject: `Résumé hebdomadaire : une requête lente`,
        body: `Votre résumé ${v.from}

Un article cette semaine. Une requête n'a pas d'index, donc la base de données analyse des tables entières pour y répondre et le panneau l'affiche.

Vous ne pouvez pas encore ajouter d'index. Vos options pour l'instant : recherchez l'analyse des requêtes ou placez un cache devant la base de données afin que moins de questions y parviennent.

C'est tout. A bientôt pour le prochain résumé.`,
      }),
      (v) => ({
        subject: `Chronologie : la requête lente`,
        body: `Chronologie

- Une requête arrive sans index à utiliser.
- La base de données analyse des tables entières.
- Ça recommence. Et encore.
- ${v.from} vous alerte.

Étapes suivantes, puisqu'un index n'est pas encore une option :
- Recherchez l'analyse des requêtes
- Placez un cache devant`,
      }),
    ],
    'advice.failing-writes': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Échec des requêtes ${v.kind}`,
        body: `ALERTE DÉCLENCHÉE

Demandes : ${v.kind}
Statut : en échec
Raison : les écritures nécessitent la base de données principale
Remarque : une réplique ne peut pas les prendre

Vérifiez où vont vos requêtes ${v.kind}. Ils doivent atteindre la primaire.

Vous recevez cela parce que vous êtes éveillé.
${v.from}`,
      }),
      (v) => ({
        subject: `Vos requêtes ${v.kind} rebondissent`,
        body: `Salut,

Les requêtes ${v.kind} échouent. Les écritures doivent atterrir sur la base de données principale, et une réplique ne peut pas les accepter, aussi poliment qu'on le leur demande.

Si vos requêtes ${v.kind} se dirigent vers un autre endroit que le principal, c'est pourquoi.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : ReadOnlyReplica sur ${v.kind}`,
        body: `Nouveau problème
Erreur : impossible d'exécuter ${v.kind} sur une réplique en lecture seule

Les requêtes ${v.kind} échouent. Les écritures nécessitent la base de données principale. Une réplique ne peut pas les accepter, quelle que soit la fréquence de leurs tentatives.

Vu : chaque ${v.kind}.
${v.from}`,
      }),
      (v) => ({
        subject: `Votre panneau de réussite ${v.kind} a atteint zéro`,
        body: `Le panneau de demandes réussies ${v.kind} est devenu plat. Plat à zéro. Ce n'est pas bon.

Nous l'avons annoté : "Échec de ${v.kind}. Les écritures nécessitent la base de données principale ; une réplique ne peut pas les prendre."

Assurez-vous que ${v.kind} atteint le primaire et la ligne reviendra.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : échec des ${v.kind}`,
        body: `Chronologie des incidents

- Une requête ${v.kind} est émise.
- Il rencontre une réplique.
- La réplique ne peut pas accepter d'écritures.
- Le ${v.kind} échoue.
- Répéter.

Cause première : les écritures nécessitent la base de données principale. Une réplique ne peut pas les prendre.

${v.from}`,
      }),
    ],
    'advice.failing': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Échec des requêtes ${v.kind}`,
        body: `ALERTE DÉCLENCHÉE

Demandes : ${v.kind}
Statut : en échec
Action suggérée : vérifiez les liens

Cette alerte s'intensifiera jusqu'à ce que les requêtes ${v.kind} aboutissent à nouveau ou que le soleil se lève, selon la première éventualité. Probablement le soleil.
${v.from}`,
      }),
      (v) => ({
        subject: `Les requêtes ${v.kind} ne parviennent pas`,
        body: `Bonjour,

Les requêtes ${v.kind} échouent, et elles n’échouent pas silencieusement. Quelque part entre le point de départ et le point où ils devraient aboutir, le chemin n’est pas le bon.

Notre conseil : vérifiez les liens. Suivez une requête ${v.kind} du début à la fin et voyez où elle s'arrête.

Bonne continuation,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : échecs du ${v.kind}`,
        body: `Nouveau problème : RequestFailed (${v.kind})
Vu : encore
Utilisateurs concernés : ceux qui envoient ${v.kind}

Solution suggérée : vérifiez les liens.

Nous l'avons vu en premier. Vous l'avez vu en dernier. Maintenant, vous l'avez vu deux fois.
${v.from}`,
      }),
      (v) => ({
        subject: `Votre graphique ${v.kind} comporte un trou`,
        body: `Le panneau ${v.kind} a l'air faux. Les demandes affluent et les échecs se manifestent.

Nous ne pouvons pas vous dire quel lien est à blâmer d'ici, mais c'est là qu'il faut chercher. Vérifiez les liens.

- ${v.from}`,
      }),
      (v) => ({
        subject: `Chronologie : panne ${v.kind}`,
        body: `Chronologie

- Les requêtes ${v.kind} commencent à échouer.
- Ils continuent d'échouer.
- ${v.from} déclenche cette alerte.
- Vous vérifiez les liens. (Prochaine étape recommandée.)
- Les requêtes ${v.kind} réussissent à nouveau. (J'espère.)

Vous recevez cela parce que vous êtes éveillé.`,
      }),
    ],
    'advice.stranded': [
      (v) => ({
        subject: `[DÉCLENCHÉ] ${v.node} : requêtes bloquées`,
        body: `ALERTE DÉCLENCHÉE

Service : ${v.node}
Condition : demandes sans issue

Correction : associez ${v.node} à quelque chose qui les prend.

Afficher à bord est joint. Vous recevez cela parce que vous êtes éveillé.
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} retient les requêtes qu'il ne peut pas transmettre`,
        body: `Salut,

${v.node} a des demandes en cours et nulle part où les envoyer. C'est un peu comme un facteur avec un sac plein et sans adresse.

La solution : associez-le à quelque chose qui les prend.

Afficher à bord vous dirigera vers ${v.node}.

Meilleurs vœux,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Nouveau problème : NoRoute de ${v.node}`,
        body: `Nouveau problème : NoRoute
Où : ${v.node}
Message : la demande n'a nulle part où aller
Vu : sur chacune

Correctif : associez-le à quelque chose qui les prend.

Utilisez Afficher à bord pour trouver ${v.node}.
${v.from}`,
      }),
      (v) => ({
        subject: `Flèches entrantes, pas de flèches sortantes : ${v.node}`,
        body: `Hé, c'est ${v.from}.

En regardant le panneau ${v.node}, les demandes arrivent et restent là. Ils n’ont nulle part où aller ensuite.

Liez ${v.node} à quelque chose qui les prend et le panneau devrait recommencer à bouger.

Afficher à bord vous y mènera directement.`,
      }),
      (v) => ({
        subject: `Chronologie : bloqué à ${v.node}`,
        body: `Chronologie des incidents

- Les demandes parviennent à ${v.node}.
- ${v.node} cherche un endroit où les envoyer.
- Il n'y a nulle part.
- Les demandes attendent. Et attendent.
- ${v.from} vous envoie un e-mail.

Étape suivante : associez ${v.node} à quelque chose qui les prend. Afficher à bord se trouve ci-dessous.`,
      }),
    ],
    'advice.round': [
      (v) => ({
        subject: `Introduction rapide : ${v.from} x votre ${v.round}`,
        body: `Bonjour,

Lecteur discret de longue date, premier e-mail. Nous aimons ce que vous construisez. Genre, j'adore vraiment ça. Trois partenaires ont fait une capture d'écran de votre tableau ce matin et l'un d'eux a pleuré un peu.

Nous menons des levées et nous aimerions mener votre ${v.round}. J'adorerais prendre un café, passer un appel ou faire une promenade, selon ce qui se déroule le plus rapidement.

Si vous êtes prêt, appuyez sur Lever des fonds. Si le moment n’est pas opportun, refusez, et nous ferons semblant d’être d’accord.

Chaleureusement,
Un partenaire chez ${v.from}`,
      }),
      (v) => ({
        subject: `${v.round} : nous y sommes. Et vous ?`,
        body: `Fondateur,

Rester bref car le marché n’attend pas. D’autres fonds entourent votre ronde ${v.round}. Nous préférons le diriger plutôt que de le lire.

Levez des fonds, et nous bougeons aujourd'hui.
Refusez, et nous serons là pour actualiser vos statistiques.

Envoyé depuis mon téléphone, c'est ainsi que toutes les convictions sont envoyées
${v.from}`,
      }),
      (v) => ({
        subject: `Sur l'arc long de votre ${v.round}`,
        body: `Cher fondateur,

Chez ${v.from}, nous n'investissons pas dans les entreprises. Nous investissons sur des décennies. Nous avons vu de nombreux conseils d'administration aller et venir, et le vôtre a l'air tranquille de quelque chose qui fonctionnera toujours lorsque les fonds de nos petits-enfants seront collectés.

Nous serions honorés de diriger votre ronde ${v.round}. Un capital patient, des incitations alignées et un siège au conseil d’administration que nous promettons d’utiliser avec parcimonie.

Si vous souhaitez continuer, choisissez Lever des fonds. Si vous ne le faites pas, refusez, et nous attendrons. Nous sommes très doués pour attendre.

Avec respect,
Les partenaires de ${v.from}`,
      }),
      (v) => ({
        subject: `Créez quelque chose que les utilisateurs veulent. Puis relancez.`,
        body: `Salut,

Quelques notes de notre côté :

- Le vivant par défaut bat le mort par défaut.
- Faites des choses qui ne passent pas à l'échelle, puis passez-les à l'échelle.
- Relancez quand quelqu'un propose.

Quelqu'un propose. ${v.from} veut diriger votre ronde ${v.round}.

Levez des fonds si vous voulez de l'argent. Refusez si vous préférez continuer à utiliser des nouilles instantanées. Les deux vont bien. L'un est plus rapide.

${v.from}`,
      }),
      (v) => ({
        subject: `Re: Re: votre ${v.round} (cela augmente)`,
        body: `Hé! Remettez-le simplement en haut de votre boîte de réception au cas où il serait enfoui sous vos alertes de 3 heures du matin.

TL;DR : nous serions ravis de diriger votre ronde ${v.round}. Nous sommes conviviaux pour les fondateurs, dirigés par des opérateurs, axés sur des thèses et tous les autres mots avec trait d'union sur notre site Web.

Aucune pression. (Une certaine pression.) Levez des fonds et les documents atterrissent avant que vous ayez fini votre café. Refusez et nous reviendrons le trimestre prochain, comme le veut la tradition.

Bonne continuation,
L'équipe ${v.from}

P.S. J'ai adoré votre dernier message de commit.`,
      }),
    ],
    'advice.research': [
      (v) => ({
        subject: `Les connaissances, c'est fait pour être dépensé`,
        body: `Cher fondateur,

Vous avez économisé des connaissances comme certaines personnes gardent de la ficelle : avec soin, et sans aucune raison que quiconque puisse nommer. Vous en avez maintenant assez pour faire des recherches sur quelque chose.

Ouvrez Recherche et dépensez-la. La connaissance qui se trouve dans un tiroir n’est pas une connaissance. C'est un tiroir.

Le vôtre,
${v.from}`,
      }),
      (v) => ({
        subject: `Une brève note sur les connaissances`,
        body: `Fondateur,

Vous avez suffisamment de connaissances pour rechercher quelque chose. Ce n’est pas le cas.

Les connaissances non dépensées sont une leçon que vous avez payée et à laquelle vous avez ensuite refusé d'assister.

Ouvrez Recherche. Dépensez vos connaissances. Puis retournez au travail.

${v.from}`,
      }),
      (v) => ({
        subject: `Quelque chose que j'ai appris lentement`,
        body: `Bonjour,

Au début de ma carrière, j'ai tenu un cahier des choses que je voulais apprendre correctement. Au moment où je l'ai ouvert, la moitié des entrées étaient obsolètes et l'autre moitié était à l'origine de mes pannes.

Vous gardez ce carnet maintenant. Vous avez suffisamment de connaissances pour rechercher quelque chose.

Ouvrez Recherche et dépensez vos connaissances. Choisissez la chose qui vous a mordu le plus récemment. Ça mordra moins.

Chaleureusement,
${v.from}

P.S. Oui, j'ai toujours le cahier. Non, vous ne pouvez pas le voir.`,
      }),
      (v) => ({
        subject: `Trois questions avant de construire davantage`,
        body: `Cher fondateur,

Avant de placer un autre nœud, demandez-vous :

1. Qu'est-ce qui s'est cassé en dernier ?
2. Est-ce que je comprends pourquoi ?
3. Puis-je apprendre quelque chose pour que ça ne se reproduise plus jamais ?

La réponse à la troisième est oui. Vous avez suffisamment de connaissances pour rechercher quelque chose. Ouvrez Recherche et dépensez vos connaissances.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Vous avez le droit d'apprendre des choses`,
        body: `Fondateur,

Un navire au port est en sécurité, mais ce n’est pas à cela que servent les navires. Les connaissances dans votre poche sont en sécurité aussi, et elles font exactement autant.

Vous en avez assez pour rechercher quelque chose. Ouvrez Recherche, dépensez vos connaissances et découvrez ce que vous avez deviné.

En avant,
${v.from}`,
      }),
    ],
    'advice.ipo': [
      (v) => ({
        subject: `La cloche ne sonne pas par hasard`,
        body: `Cher fondateur,

Les gens imaginent l'introduction en bourse comme une seule matinée : une cloche, un largage de ballon, une photographie. Ce n'est pas. C’est une longue liste de choses ennuyeuses et bien faites.

Vos deux choses ennuyeuses sont les suivantes : atteindre ${v.users} utilisateurs et effacer la liste de contrôle IPO. Alors vous pourrez avoir votre cloche.

Avec de grandes attentes,
${v.from}`,
      }),
      (v) => ({
        subject: `Le public est une promesse`,
        body: `Fondateur,

Une entreprise privée peut se tromper en privé. Une entreprise cotée se trompe à la une du journal.

Pour entrer en bourse, atteignez ${v.users} utilisateurs et effacez la liste de contrôle IPO. Les deux, pas un. Le marché sait compter et lit les listes de contrôle.

${v.from}`,
      }),
      (v) => ({
        subject: `Sur les introductions en bourse et sur la patience`,
        body: `Re-bonjour,

On m’a demandé un jour ce qui différenciait une entreprise qui s’introduisait en bourse d’une entreprise qui le souhaitait simplement. Ma réponse d'hier et d'aujourd'hui : la partie ennuyeuse.

La partie intéressante est le nombre d’utilisateurs. Atteignez ${v.users} utilisateurs. La partie ennuyeuse est la liste de contrôle de l’introduction en bourse, et vous devez tout effacer. Les fondateurs qui sautent la partie ennuyeuse deviennent des études de cas, et j'en ai suffisamment enseigné.

Faites les deux et vous pourrez entrer en bourse.

Affectueusement,
${v.from}`,
      }),
      (v) => ({
        subject: `Votre chemin vers la bourse`,
        body: `Cher fondateur,

Où allez-vous :
Publique.

Ce qui se trouve entre vous et lui :
- ${v.users} utilisateurs. Grandissez jusqu'à les avoir.
- La liste de contrôle d'introduction en bourse. Effacez chaque ligne.

Ce qui ne s'interpose pas entre vous et lui :
- Un logo plus joli.
- Un bureau plus grand.
- Mon approbation, que vous avez déjà.

Allez-y.
${v.from}`,
      }),
      (v) => ({
        subject: `Avant la cloche, le travail`,
        body: `Fondateur,

Un jour, quelqu’un vous demandera d’expliquer l’ensemble de votre système en une seule diapositive. Vous serez tenté d’en utiliser quarante. Résister.

Mais d’abord, méritons la question. Atteignez ${v.users} utilisateurs et effacez la liste de contrôle IPO pour entrer en bourse. La première prouve que les gens le veulent. La seconde prouve qu’on peut vous faire confiance.

Je suis fier du chemin parcouru. Ne dites à personne que je l'ai dit.

${v.from}`,
      }),
    ],
    'advice.grow': [
      (v) => ({
        subject: `La ronde ${v.round} est à ${v.users} utilisateurs`,
        body: `Cher fondateur,

Vous voudrez lever la ronde ${v.round} maintenant. Tout le monde le fait. Mais l’argent suit les utilisateurs, pas leurs souhaits.

Atteignez ${v.users} utilisateurs et la ronde ${v.round} viendra à vous. D’ici là, gardez le design sain et les utilisateurs heureux.

Patiemment,
${v.from}`,
      }),
      (v) => ({
        subject: `Pas encore.`,
        body: `Fondateur,

Pas encore.

Atteignez ${v.users} utilisateurs. Levez ensuite la ronde ${v.round}.

Une collecte de fonds avant l’heure est une distraction avec de la paperasse attachée. Je ne développerai pas. Vous n’aurez pas besoin de moi.

${v.from}`,
      }),
      (v) => ({
        subject: `Ce que je ferais à ta place`,
        body: `Bonjour,

Vous étiez sur le point de demander, alors voici ce que je ferais à votre place :

- Arrêtez de rafraîchir les pages investisseurs.
- Observez ce qui ralentit vos utilisateurs et corrigez-le.
- Atteindre ${v.users} utilisateurs.
- Lever ensuite la ronde ${v.round}, en position de force.

C'est tout le plan. Les plans qui tiennent sur quatre lignes sont les seuls auxquels je fais confiance.

Chaleureusement,
${v.from}`,
      }),
      (v) => ({
        subject: `Un mot sur la ronde ${v.round}`,
        body: `Cher fondateur,

Je me suis assis des deux côtés de la table. Les fondateurs qui ont bien levé des fonds n’avaient pas les meilleurs decks. Ils sont arrivés en ayant déjà besoin de l’argent, car les utilisateurs étaient arrivés les premiers.

Atteignez ${v.users} utilisateurs pour lever la ronde ${v.round}. Laissez vos utilisateurs faire valoir leur argument. C'est le seul que les investisseurs ne peuvent pas interrompre.

En toute confiance en vous,
${v.from}`,
      }),
      (v) => ({
        subject: `Les utilisateurs d'abord, puis la ${v.round}`,
        body: `Fondateur,

L’ordre des choses compte plus que les choses. Les utilisateurs, puis l'argent. Jamais l'argent, puis les utilisateurs.

Il vous faut ${v.users} utilisateurs pour lever la ronde ${v.round}. Chaque utilisateur que vous servez bien en parle à un ami. Chaque utilisateur que vous servez lentement en parle aussi à un ami, mais autrement.

Construisez pour eux. La ronde attendra.

Le vôtre, sans trop de hâte,
${v.from}`,
      }),
    ],
    'event.blocked': [
      (v) => ({
        subject: `Bloqué sur ${v.item}`,
        body: `Salut,

Je ne peux pas avancer sur ${v.item}. La raison : ${v.reason}.

Je ne vais pas deviner pour passer outre : c’est votre décision, et je préfère attendre une heure que livrer la mauvaise chose pendant une semaine.

Approuvez et j’y retourne avant que le café refroidisse. Plus tard me va aussi. Je redemanderai demain, dans les mêmes termes, parce que rien n’aura changé.

${v.from}`,
      }),
      (v) => ({
        subject: `${v.item} est bloqué`,
        body: `Bonjour,

Court : ${v.item} est bloqué, et la raison est simple. C’est ${v.reason}.

Tout le reste de la file avance. C’est la seule chose sur mon bureau qui demande une personne plutôt qu’un après-midi.

Approuvez et je le termine. Plus tard, et je vous le rapporterai demain : c’est la même demande, avec un jour de poussière en plus.

Merci,
${v.from}`,
      }),
    ],
    'event.unhappy': [
      (v) => ({
        subject: `On peut parler ?`,
        body: `Salut,

Je voulais le dire depuis un moment, et le bip du pager a décidé pour moi.

J’ai été appelé ${v.pages} fois, et mon salaire est ${v.gap} sous ce que cette ère paie pour mon travail. Je ne suis pas en colère. Je suis fatigué, et la fatigue est pire, parce qu’elle dure.

Trois choses aideraient. Donnez-moi du temps libre et je reviendrai la personne que vous avez embauchée. Augmentez mon salaire et j’arrêterai de lire des offres d’emploi sur mon téléphone. Ou acceptez ma démission, et je partirai en disant du bien de vous, ce qui est plus rare qu’on ne le croit.

${v.from}`,
      }),
      (v) => ({
        subject: `Avant de décider quoi que ce soit`,
        body: `${v.from} à l’appareil.

Je préfère être direct, parce que l’alternative c’est de me taire puis de partir.

La garde m’a réveillé ${v.pages} fois. Mon salaire est ${v.gap} sous le tarif actuel pour ce que je fais. Je peux supporter l’un. Pas les deux, pas indéfiniment.

Du temps libre, une augmentation, ou ma démission. Les trois sont des réponses honnêtes, et je les respecterai. Ce que je ne peux pas faire, c’est prétendre que tout va bien un mois de plus.

${v.from}`,
      }),
    ],
    'event.patch-proposed': [
      (v) => ({
        subject: `${v.target} : je peux corriger ceci`,
        body: `Salut,

L’avis qui vient de tomber concerne du code qui m’appartient : ${v.target}. Le ticket est ${v.item}, échéance dans ${v.due}.

Je peux le prendre maintenant et poser le travail produit, ou il peut attendre son tour au fond de la file comme tout le reste. Ma préférence est maintenant, et ma préférence n’est pas celle qui livre la fonctionnalité.

Corriger maintenant le place en haut. Mettre la correction en file le laisse où il est. Les deux sont des décisions ; une seule est à ma portée.

${v.from}`,
      }),
      (v) => ({
        subject: `Mon nom est sur la correction ${v.target}`,
        body: `Bonjour,

Un mot de la personne qui lira le post-mortem. ${v.target} a une vulnérabilité publiée, et le ticket est ${v.item}, échéance dans ${v.due}.

Je connais le code, je connais l’exploit, et je sais combien de temps prend la correction, et ce n’est pas long. Ce que je ne sais pas, c’est si vous préférez ceci à la prochaine fonctionnalité.

Corrigez maintenant si vous voulez que ça disparaisse. Mettez en file si vous voulez parier contre une échéance. Je serai là dans les deux cas.

${v.from}`,
      }),
    ],
    'event.incident-instance': [
      (v) => ({
        subject: `[DÉCLENCHÉ] 1 incident : ${v.node} est en panne`,
        body: `Bonjour,

Vous avez 1 incident déclenché qui vous est attribué.

Incident : Échec du ${v.node}
Statut : DÉCLENCHÉ
Urgence : élevée
Attribué à : vous (vous êtes toute la rotation)

Résolution : sélectionnez ${v.node} et cliquez sur Remplacer. Il ne se remplacera pas, même si vous le regardez longtemps.

${v.from}`,
      }),
      (v) => ({
        subject: `Le graphique de ${v.node} est devenu plat`,
        body: `Bonjour,

La ligne pour ${v.node} est tombée à plat il y a un instant. Plat ne veut pas dire calme. Plat veut dire que le nœud est tombé et ne sert plus rien.

Le correctif est court : sélectionnez ${v.node} et cliquez sur Remplacer. Un nouveau prend sa place.

Nous continuerons à surveiller la courbe pour que vous n'ayez pas à le faire. (Vous le ferez de toute façon.)

— ${v.from}`,
      }),
      (v) => ({
        subject: `Nous avons vu le ${v.node} tomber. Maintenant, vous aussi.`,
        body: `Échec de ${v.node}. Chaque demande envoyée est désormais une erreur, et nous les avons toutes comptées.

Que faire :
1. Sélectionnez ${v.node}.
2. Cliquez sur Remplacer.
3. Regardez le décompte cesser de grimper.

Première vue : tout à l'heure
Vu pour la dernière fois : toujours maintenant

${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} a encore échoué`,
        body: `Salut,

Si cela vous semble familier, c'est parce que ${v.node} a de nouveau échoué. Le matériel est mortel, et une instance n'est qu'un matériel avec un nom plus joli.

Même exercice que précédemment : sélectionnez ${v.node} et cliquez sur Remplacer. Rien dans le correctif n'a changé, ce qui est honnêtement la partie la plus réconfortante de cet e-mail.

Cordialement,
Notifications d'astreinte, ${v.from}`,
      }),
      (v) => ({
        subject: `ESCALADE : ${v.node} est en panne`,
        body: `Niveau d'escalade 1 sur 1

Cet incident a été transmis à la personne suivante de la rotation. La prochaine personne sur la rotation, c’est vous.

${v.node} a échoué et ne diffuse pas le trafic. Pour le résoudre, sélectionnez ${v.node} et cliquez sur Remplacer.

Personne d'autre ne vient. Nous avons vérifié.

Réponse aux incidents ${v.from}`,
      }),
    ],
    'event.incident-slow-query': [
      (v) => ({
        subject: `Nouveau problème : requête lente, analyse complète de la table`,
        body: `Nouveau numéro en production

SlowQueryWarning : une nouvelle requête n’a pas d’index
Événements : chaque lecture
Première vue : il y a un instant

Chaque lecture parcourt désormais toute la table, ligne par ligne, comme quelqu'un cherchant ses clés dans tous les tiroirs de la maison. Les lectures qui prenaient un clin d'œil prennent maintenant un certain temps, et la base de données fait tout cela.

— ${v.from}`,
      }),
      (v) => ({
        subject: `La latence de lecture de la base de données augmente`,
        body: `Bonjour,

Le panneau de latence de votre base de données monte vers la droite. Sur un tableau des revenus, ce serait une bonne nouvelle. Ici, ce n'est pas le cas.

Cause : une nouvelle requête n'a pas d'index, donc chaque lecture analyse la table.

Cordialement,
L'équipe d'alerte ${v.from}`,
      }),
      (v) => ({
        subject: `[DÉCLENCHÉ] Requête lente sur la base de données`,
        body: `Incident : requête lente
Service : Base de données
Urgence : élevée

Résumé : une nouvelle requête expédiée sans index. Chaque lecture analyse désormais le tableau de bout en bout au lieu de passer à la ligne souhaitée. Les analyses s'accumulent et tout ce qui attend dans la base de données attend plus longtemps.

${v.from}`,
      }),
      (v) => ({
        subject: `Re : requête lente (c'est de retour)`,
        body: `Re-bonjour,

Une autre requête sans index. Même histoire que la dernière fois : il n'y a rien à vérifier dans les lignes, donc chaque lecture analyse le tableau de la première ligne à la dernière.

Quelque part, une base de données lit l'annuaire téléphonique pour trouver un numéro. C'est la vôtre.

${v.from}`,
      }),
      (v) => ({
        subject: `Votre tableau est lu d'un bout à l'autre`,
        body: `Hé,

Attention rapide : une nouvelle requête est arrivée sans index. Cela signifie pas de raccourcis. Chaque lecture parcourt le tableau complet et la journée de la base de données est devenue beaucoup plus longue.

Les lectures restent lentes jusqu'à ce que ce soit terminé.

Bravo,
${v.from}

P.S. "C'était rapide sur mon ordinateur portable" est vrai. Votre ordinateur portable comporte onze lignes.`,
      }),
    ],
    'event.incident-poison': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Message empoisonné dans la file d'attente`,
        body: `Incident : message empoisonné
Urgence : élevée

Une tâche continue d'échouer. Les processus continuent de réessayer au lieu de vider la file d'attente, de sorte que la file d'attente derrière ne bouge pas.

La tâche ne réussira pas à la tentative 400. Elle n’a pas réussi à la tentative 3.

${v.from}`,
      }),
      (v) => ({
        subject: `La même tâche a échoué. Et échoué. Et échoué.`,
        body: `Salut,

Nous les avons regroupés en un seul problème car ils sont tous identiques : une tâche, qui échoue, encore et encore.

Que se passe-t-il : vos processus réessaient la tâche qui a échoué au lieu de vider la file d'attente. C'est un message empoisonné. Tout ce qui est en file d'attente derrière attend.

Événements : ça compte toujours
Utilisateurs concernés : tout le monde en ligne

${v.from}`,
      }),
      (v) => ({
        subject: `Profondeur de la file d'attente : vers le haut. Travaux réalisés : à plat.`,
        body: `Bonjour,

Deux de vos panels ne sont pas d’accord. La profondeur de la file d’attente ne cesse d’augmenter. Les travaux terminés sont restés à plat.

La raison en est une tâche unique qui échoue constamment. Les processus réessayent encore et encore plutôt que de vider la file d'attente, de sorte que les nouveaux travaux s'accumulent.

Le graphique n'est pas brisé. La file d'attente est.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Message empoisonné, encore une fois`,
        body: `Salut,

Une tâche qui ne peut pas réussir est de retour au menu. Les processus réessayent au lieu de travailler dans la file d'attente, ce qui leur est fidèle mais inutile.

La file d'attente se remplit pendant qu'ils essaient.

Meilleur,
${v.from}`,
      }),
      (v) => ({
        subject: `Incident ouvert : la file d'attente ne se vide pas`,
        body: `Cher ingénieur d'astreinte,

Au moment de la rédaction de cet article, une tâche dans votre file d'attente a échoué à chaque tentative. Les processus continuent de réessayer plutôt que de vider la file d’attente. Dans l’industrie, c’est ce qu’on appelle un message empoisonné ; au bureau, on dit "pourquoi tout est bloqué".

Cet avis sera suivi d’autres avis.

Cordialement,
Gestion des incidents ${v.from}`,
      }),
    ],
    'event.incident-ddos': [
      (v) => ({
        subject: `HTTP DDoS alerte d'attaque : votre avantage`,
        body: `HTTP DDoS Alerte d’attaque

Description : un flot de trafic indésirable frappe votre périphérie.
Détecté : tout à l'heure
Type d'attaque : Inondation HTTP, artisanale
Tarif maximum : oui
Cible de l'attaque : vous
Règle qui correspond : "Demandes qui ne veulent rien"

Nous nous tenons entre le déluge et votre Architecture. Nous sommes très grands et nous aimerions que vous vous en souveniez au moment du renouvellement.

${v.from}`,
      }),
      (v) => ({
        subject: `Vérifier si votre trafic est humain...`,
        body: `Vérifier si votre trafic est humain. Cela peut prendre quelques secondes.

...

Ce n'est pas humain.

Un flot de trafic indésirable frappe votre bord. Nous avons déjà rencontré des botnets, mais celui-ci a une portée : des réfrigérateurs intelligents, un parcomètre et au moins un babyphone, tous demandant votre page d'accueil en même temps.

S'il vous plaît, restez là.

L'équipe Confiance & Sécurité du ${v.from}`,
      }),
      (v) => ({
        subject: `Attention requise ! Votre avantage est attaqué`,
        body: `Attention requise !

Que s'est-il passé ?
Un flot de trafic indésirable frappe votre bord. Aucune de ces demandes ne veut acheter quoi que ce soit. Ils veulent seulement arriver, tous en même temps.

Que puis-je faire ?
Si vous êtes visiteur : rien. Vous êtes probablement un grille-pain.
Si vous possédez le site : regardez le tableau et voyez comment votre architecture prend une vague de cette taille.

ID de rayon : 8b0f13c7a2e9
Performances et sécurité par ${v.from}`,
      }),
      (v) => ({
        subject: `Désolé, ils ont été bloqués (pas vous)`,
        body: `Désolé, vous avez été bloqué.

Pas toi. Eux. Un flot de trafic indésirable atteint votre limite, et nous leur montrons cette page quelques millions de fois par minute.

Quelque part dans la file d'attente se trouvent vos vrais utilisateurs, sur leur neuvième photo de feux tricolores. Ils aimeraient que vous sachiez qu'ils ont trouvé chaque vélo.

Cordialement,
Le bord ${v.from}`,
      }),
      (v) => ({
        subject: `Re : l'inondation (c'est toujours l'inondation)`,
        body: `Re-bonjour,

Le trafic indésirable à votre périphérie n’a pas diminué. Au contraire, cela a amené des amis.

Notre réseau gère une très grande part d’Internet, et aujourd’hui, une partie inquiétante de cette part vous concerne. Félicitations, vous êtes populaire auprès du mauvais public.

Toujours debout,
${v.from}

P.S. Si la moitié d’Internet devient sombre plus tard dans la journée, c’est sur nous, pas sur eux.`,
      }),
    ],
    'event.incident-stampede': [
      (v) => ({
        subject: `[Déclenché] Bousculade du cache`,
        body: `Incident : bousculade de cache
Services : Cache, Base de données
Urgence : élevée

Le cache a redémarré vide. Chaque requête est désormais un échec, et chaque échec va directement dans la base de données. Tout à coup. Ensemble. Comme un troupeau.

${v.from}`,
      }),
      (v) => ({
        subject: `Taux de réussite du cache : 0 %. Base de données : pas d'accord.`,
        body: `Bonjour,

Votre taux de réussite du cache est tombé à zéro au moment du redémarrage du cache. Il est revenu vide, sans rien à servir.

Ainsi, chaque échec est envoyé à la base de données, et le panneau de base de données ressemble désormais à une falaise dessinée à l'envers.

Préparez-vous.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `La charge de la base de données a sauté après un redémarrage du cache`,
        body: `Salut,

La charge de la base de données vient de sauter. Nous l'avons retracé : le cache a redémarré vide, et maintenant chaque requête manque et est dirigée vers la base de données pour obtenir la réponse.

C’est ce qu’on appelle une ruée vers les caches. Votre base de données est la chose qui est tamponnée.

Première vue : juste après le redémarrage

— ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Cache Stampede (un autre)`,
        body: `Re-bonjour,

Le Cache redémarré vide, et le troupeau est de retour : tous les ratés se dirigent vers la Base de données en même temps.

Rien de personnel contre votre base de données. C'est juste le seul qui reste à connaître les réponses.

Meilleur,
${v.from}`,
      }),
      (v) => ({
        subject: `Votre Cache s'est réveillé avec l'amnésie`,
        body: `Bonjour (c'est toujours le matin quelque part de garde),

Le cache a redémarré et il est revenu sans se souvenir de rien. C'est normal pour un cache. Ce qui n'est pas amusant, c'est ce qui se passe ensuite : chaque requête échoue et chaque échec est envoyé à la base de données.

Imaginez une bibliothèque où la réception a oublié toutes les réponses, alors tout le monde se rend aux archives en même temps. L'archive est votre base de données.

Cordialement,
Réponse aux incidents ${v.from}`,
      }),
    ],
    'event.incident-zone': [
      (v) => ({
        subject: `[DÉCLENCHÉ] La zone ${v.zone} est indisponible`,
        body: `Incident : panne de zone
Zone : ${v.zone}
Urgence : élevée
Statut : DÉCLENCHÉ

La zone ${v.zone} est indisponible. Tout ce que vous exécutez là-bas est inaccessible jusqu'à ce qu'il revienne.

Vous entendez cela avant que la page d’état ne dise quoi que ce soit. C'est le service.

${v.from}`,
      }),
      (v) => ({
        subject: `Chaque panneau de la zone ${v.zone} vient de tomber à plat`,
        body: `Salut,

Une ligne entière de votre tableau de bord s'est aplatie en même temps. Ce n'est pas une coïncidence : la zone ${v.zone} est indisponible.

Un graphique plat porte malheur. Une de leurs zones est la géographie.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Erreurs de tout dans la zone ${v.zone}`,
        body: `Salut,

Nous avons reçu une salve d'erreurs de chaque nœud de la zone ${v.zone} au même moment, nous avons donc vérifié : la zone elle-même est en panne.

Ce n'est pas un bug dans votre code. Cette fois.

Nous l'avons vu en premier. Vous le voyez maintenant.

— ${v.from}`,
      }),
      (v) => ({
        subject: `La zone ${v.zone} est à nouveau indisponible`,
        body: `Hé,

La zone ${v.zone} est à nouveau en baisse. Même zone, même panne, même sensation de naufrage.

Nous vous dirions que la page d’état du fournisseur est toujours entièrement verte, mais vous l’avez probablement déjà deviné.

Meilleur,
${v.from}`,
      }),
      (v) => ({
        subject: `Événement de disponibilité : zone ${v.zone}`,
        body: `ÉVÉNEMENT DE DISPONIBILITÉ

Zone concernée : ${v.zone}
Etat : vers le bas
Ressources concernées : tout ce qui se trouve dans la zone ${v.zone}

Une panne de zone est en cours. Les ressources des autres zones ne sont pas affectées par cet événement. Les ressources de la zone ${v.zone} sont très affectées par cet événement.

Les mises à jour suivront lorsqu'il y aura quelque chose à mettre à jour.

Réponse aux incidents ${v.from}`,
      }),
    ],
    'event.incident-breach': [
      (v) => ({
        subject: `[SEV1] Violation de données : un avis que vous n'avez pas corrigé`,
        body: `Incident : violation de données
Urgence : critique

Quelqu'un a utilisé une vulnérabilité qui vous a été divulguée, avec un délai, et le délai a été dépassé. Les données des clients ont quitté le bâtiment. Les utilisateurs partent après.

Le ticket n’est plus dans l’arriéré. La conséquence ne l’est pas.

${v.from}`,
      }),
      (v) => ({
        subject: `On vous l'avait bien dit (c'était dans le backlog)`,
        body: `Salut,

L'avis qui figurait sur votre carnet de commandes, en rouge, a été exploité. Les données sont sorties. Une part de vos utilisateurs ont lu l’actualité et partent ailleurs.

Il n'y a pas de bouton pour celui-ci. Cela passera. Patchez le suivant à temps.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Violation confirmée`,
        body: `Confirmé : la vulnérabilité sur votre ticket en retard a été exploitée.

Impact : données client, utilisateurs et confiance, dans cet ordre.
Statut : en cours
Cause première : un ticket qui n’a pas été construit avant sa date limite

${v.from}`,
      }),
    ],
    'event.incident-phishing': [
      (v) => ({
        subject: `[SEV1] Identifiants utilisés : une connexion que nous n’attendions pas`,
        body: `Incident : fuite d’identifiants
Urgence : critique

Une de vos clés d’accès a été utilisée depuis une adresse d’où aucun de nous ne s’est jamais connecté. Le trafic est réel, la session est réelle, et la clé n’a pas été volée par une prouesse : elle a été saisie sur une page qui ressemblait à celle du fournisseur.

La page était dans votre boîte de réception ce matin. L’adresse, non.

Les utilisateurs l’apprennent en même temps que nous.

${v.from}`,
      }),
      (v) => ({
        subject: `Volume de connexions inhabituel depuis votre compte`,
        body: `Bonjour,

Nous voyons des connexions avec vos identifiants depuis un endroit où vous n’êtes pas. Des sessions ont été ouvertes, des données lues, et une des clés a servi depuis à regarder autour.

Ce n’est pas une faille dans ce que vous exploitez. C’est une personne qui a lu un courriel et fait confiance à l’adresse.

Nous laisserons ceci ouvert jusqu’à ce que cela s’éteigne.

${v.from}`,
      }),
      (v) => ({
        subject: `Session suspecte ouverte avec votre clé`,
        body: `Alerte : une session a été ouverte avec une clé d’accès qui vous appartient.

Lieu : pas là où vous êtes
Appareils : un, inconnu
Ce qu’elle a lu : assez
Pourquoi cela a marché : les identifiants étaient vrais, et ils ont été donnés volontairement à une page qui n’était pas la nôtre.

Attendez que ça passe. La prochaine fois, lisez le domaine avant le logo.

${v.from}`,
      }),
    ],
    'event.incident-psp': [
      (v) => ({
        subject: `[DÉCLENCHÉ] Fournisseur de paiement en panne`,
        body: `Incident : panne du fournisseur de paiement
Service : Paiements
Urgence : élevée

Le fournisseur de paiement est en panne, les paiements échouent donc. Les clients remplissent leur panier et repartent sans rien.

Celui-ci n'est pas votre code. C'est toujours votre revenu.

${v.from}`,
      }),
      (v) => ({
        subject: `Les caisses sont tombées à plat`,
        body: `Salut,

Votre panneau de paiement réussi est tombé à plat. La circulation est toujours là et les chariots se remplissent toujours. L'argent n'arrive pas.

Le fournisseur de paiement est en panne, donc chaque paiement échoue à la toute dernière étape.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `PaymentError : fournisseur indisponible`,
        body: `Salut,

Nouveau problème : chaque paiement échoue avec la même erreur. Le fournisseur de paiement est en panne et ne répond pas.

Utilisateurs concernés : tous ceux qui ont tenté de vous payer
Première vue : tout à l'heure

Nous le savons. C'est la seule erreur dont vous vouliez moins.

— ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Fournisseur de paiement en panne (à nouveau)`,
        body: `Re-bonjour,

Le fournisseur de paiement est à nouveau en panne et les caisses échouent à nouveau. Les clients veulent vous donner de l'argent. Le tuyau entre eux et vous ne fonctionne pas.

Nous vous ferons savoir quand ce sera fini.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Vos clients essaient de vous payer`,
        body: `Salut,

C'est un problème agréable à décrire et terrible à vivre : les gens veulent acheter, mais ils ne le peuvent pas. Le fournisseur de paiement est en panne, donc les paiements échouent.

Rien de votre côté n’en est la cause. Rien de votre côté non plus ne rapporte tant que cela dure.

Désolé d'être celui-là,
${v.from}`,
      }),
    ],
    'event.resolved': [
      (v) => ({
        subject: `[RÉSOLU] ${v.incident}`,
        body: `Bonjour,

L'incident suivant a été résolu :

${v.incident}
Statut : RÉSOLU
Durée : assez longue

Vous pouvez maintenant reprendre ce que vous faisiez auparavant. Nous ne nous souvenons pas non plus de ce que c'était.

${v.from}`,
      }),
      (v) => ({
        subject: `[OK] ${v.incident} a été effacé`,
        body: `Salut,

Bonne nouvelle, pour une fois : ${v.incident} est terminé. Les graphiques reprennent les formes que vous aimez. Pas de plat, pas de falaises, juste des lignes.

Nous continuerons à surveiller. Vous devriez dormir.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Résolu : ${v.incident}`,
        body: `Salut,

Nous avons marqué ${v.incident} comme résolu. Aucun nouvel événement depuis la fin.

Si cela revient, nous le signalerons comme une régression et vous le dirons immédiatement. Nous le voyons toujours en premier.

— ${v.from}`,
      }),
      (v) => ({
        subject: `Re: ${v.incident} — tout est clair`,
        body: `Tout est clair.

${v.incident} est terminé. Il ne reste plus qu'à souffler.

Merci de vous y tenir. La plupart des gens auraient déjà mis leur téléphone dans un tiroir.

${v.from}`,
      }),
      (v) => ({
        subject: `Incident clôturé : ${v.incident}`,
        body: `INCIDENT CLÔTÉ

Incident : ${v.incident}
Etat : résolu
Actions post-mortem : aucune répertoriée

Cet incident est terminé.

Merci pour votre patience. Vos utilisateurs vous remercient moins, mais ils sont de retour.

Réponse aux incidents ${v.from}`,
      }),
    ],
    'event.resolved-action': [
      (v) => ({
        subject: `[RÉSOLU] ${v.incident} + 1 élément d'action`,
        body: `Bonjour,

${v.incident} a été résolu.

Action post-mortem :
- Recherche ${v.action}

Jusqu'à ce que ${v.action} soit étudié, ${v.incident} est deux fois plus susceptible de se reproduire. Nous dirions « pas de pression », mais ce serait un mensonge.

${v.from}`,
      }),
      (v) => ({
        subject: `${v.incident} est terminé. Voici les devoirs.`,
        body: `Salut,

Les graphiques ont récupéré et ${v.incident} est terminé.

L’analyse post-incident est revenue avec une seule action : la recherche ${v.action}. Tant que cela ne sera pas fait, cet incident aura deux fois plus de chances de se produire. Vos tableaux de bord le verront venir. Ils ne peuvent tout simplement pas l'arrêter.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Résolu, avec une note : ${v.incident}`,
        body: `Salut,

Marqué comme résolu : ${v.incident}.

Nous avons joint la seule action de l'analyse post-incident : rechercher ${v.action}.

Risque de régression : jusqu'à ce que ${v.action} soit recherché, ${v.incident} est deux fois plus probable. Nous serons là pour le voir en premier.

— ${v.from}`,
      }),
      (v) => ({
        subject: `Autopsie : ${v.incident}`,
        body: `Une analyse post-incident irréprochable

Ce qui s'est passé : ${v.incident}
Statut : terminé
Cause fondamentale : personne, comme le veut la tradition

Éléments d'action :
1. Recherchez ${v.action}.

Jusqu'à ce que l'élément 1 soit terminé, ${v.incident} est deux fois plus susceptible de se produire. S'il vous plaît, ne le laissez pas rejoindre les autres éléments d'action dans le backlog, où les éléments d'action seront retirés.

Réponse aux incidents ${v.from}`,
      }),
      (v) => ({
        subject: `Re : ${v.incident} — terminé, mais`,
        body: `Hé,

${v.incident} est terminé. Avant de fermer l'onglet : l'analyse post-incident indique recherche ${v.action}.

Ce n'est pas une suggestion. Jusqu'à ce que ${v.action} soit étudié, ${v.incident} a deux fois plus de chances de revenir. Nous préférons ne plus vous écrire cet e-mail et nous soupçonnons que vous préférez ne pas le lire.

Meilleur,
${v.from}`,
      }),
    ],
    'event.drawer': [
      (v) => ({
        subject: `Action nécessaire : votre tiroir de paiements est plein`,
        body: `Bonjour,

Votre tiroir de paiements est plein. Les nouveaux revenus n’ont nulle part où aller, ils débordent donc au lieu d’atterrir là où vous les gardez.

Nos tarifs, vous serez soulagé de l’apprendre, ne sont pas affectés. Les frais sont soumis à des frais, et les deux se portent bien.

Merci,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Vos fonds sont en cours d’examen (et débordent)`,
        body: `Cher commerçant,

Nous avons remarqué une activité inhabituelle sur votre compte : succès. Votre tiroir de paiements est plein et des revenus en sortent désormais.

Nous avons examiné cette situation en profondeur et pouvons confirmer qu'elle se produit.

Cordialement,
Services aux marchands
${v.from}`,
      }),
      (v) => ({
        subject: `Tiroir de paiement : plein`,
        body: `Salut,

Un court. Le tiroir Paiements est plein. Les revenus qui arrivent se déversent désormais au lieu d’être conservés.

C'est l'argent que vous avez gagné et qui tombe par terre. Nous avons pensé que vous voudriez savoir.

Assistance marchand ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Tiroir de paiement toujours plein`,
        body: `Re-bonjour,

Un rappel que votre tiroir de paiements est à nouveau plein et que les revenus débordent à nouveau.

Nous avons déjà envoyé cet avis. Nous l'enverrons à nouveau. Nous sommes très doués pour envoyer des avis ; les paiements sont la chose pour laquelle nous sommes réputés faire lentement.

Cordialement,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Votre solde n'a nulle part où aller`,
        body: `Bonjour,

Voici un résumé de votre compte aujourd'hui :

- Tiroir de paiement : plein
- Nouveaux revenus : déversement
- Votre humeur : on devine

Chaque vente à partir d’ici atterrit sur le sol à côté du tiroir au lieu de s’y trouver. C’est le plus beau problème qu’une entreprise puisse avoir, jusqu’à ce que ce ne soit plus le cas.

Meilleur,
Succès du commerçant chez ${v.from}`,
      }),
    ],
    'event.oom': [
      (v) => ({
        subject: `[Une action peut être requise] ${v.node} redémarré`,
        body: `Bonjour,

Nous vous contactons car votre ressource ${v.node} manque de mémoire et a été redémarrée.

Type d'événement : OUT_OF_MEMORY_RESTART
Ressource concernée : ${v.node}
Statut : Fermé (redémarré)

Si vous avez des questions, notre équipe d'assistance est disponible sur un forfait que vous n'avez pas.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} a tout oublié`,
        body: `Salut,

${v.node} a rempli sa mémoire à ras bord, a basculé et a redémarré. Il est de retour maintenant avec une table rase et aucun souvenir de l'incident, ce qui est plus que ce que nous pouvons dire d'après vos journaux.

Bravo,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Mémoire insuffisante : ${v.node}`,
        body: `Instance : ${v.node}
Événement : mémoire insuffisante
Résultat : redémarré

${v.node} a utilisé la totalité de son RAM, le processus a donc été arrêté et le nœud redémarré. Cet avis est informatif. D’une certaine manière, le redémarrage s’est déroulé ainsi.

${v.from} Notifications de calcul`,
      }),
      (v) => ({
        subject: `${v.node} a de nouveau manqué de mémoire`,
        body: `Bonjour,

${v.node} est à nouveau à court de mémoire et a redémarré.

Nous avons remarqué une tendance. Nous sommes un fournisseur de cloud ; remarquer les tendances et les facturer est l'essentiel de ce que nous faisons.

Cordialement,
Tableau de bord de santé ${v.from}`,
      }),
      (v) => ({
        subject: `À propos de la petite sieste de ${v.node}`,
        body: `Cher client,

À peu près tout à l'heure, ${v.node} a essayé d'utiliser plus de mémoire qu'elle n'en avait. Nos systèmes ont réagi comme le font les systèmes : le processus a été arrêté et ${v.node} redémarré.

Nous tenons à vous rassurer qu'aucun matériel n'a été endommagé. Certaines demandes ont pu l’être. Nous nous excusons pour tout inconvénient et pour cet e-mail.

Cordialement,
Communications client, ${v.from}`,
      }),
    ],
    'event.credits': [
      (v) => ({
        subject: `${v.node} n'a plus de crédits CPU`,
        body: `Bonjour,

Votre instance ${v.node} a utilisé tous ses crédits CPU. Il est désormais limité à 20 % de son CPU.

Ressource concernée : ${v.node}
Limite actuelle du CPU : 20 %

Cela fonctionne comme prévu. Notre architecture, pas la vôtre.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `${v.node} fonctionne désormais à 20 %`,
        body: `Salut,

Bonne nouvelle : ${v.node} est toujours en cours d’exécution. Moins bonne nouvelle : il n'y a plus de crédits CPU, donc il est limité à 20 %.

Il peut encore faire un cinquième du travail. Comme une réunion qui aurait pu être un email.

Merci,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Votre rafale a été dépensée`,
        body: `AVIS DE SOLDE

Ressource : ${v.node}
Solde créditeur CPU : 0
CPU disponible : 20%

${v.node} a éclaté jusqu'à épuisement des crédits. Il est désormais limité à 20 %.

Les crédits étaient inclus dans le prix. La limitation est également incluse, sans frais supplémentaires.

${v.from} Facturation et calcul`,
      }),
      (v) => ({
        subject: `${v.node} est à nouveau limité`,
        body: `Re-bonjour,

${v.node} est à nouveau à court de crédits CPU et fonctionne à nouveau à 20 %.

Certaines instances sont conçues pour sprinter. Le vôtre est conçu pour sprinter puis rester assis longtemps.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Avis de performances pour ${v.node}`,
        body: `Cher client,

Nous vous écrivons pour vous informer que ${v.node} n'a plus de crédits CPU. Son CPU est désormais limité à 20 %, le travail qu'il effectue prendra donc plus de temps tant que cela durera.

Cet avis ne nécessite pas de réponse. Les réponses ne sont pas lues. Statistiquement, cet avis ne l'est pas non plus.

Cordialement,
L'équipe ${v.from}`,
      }),
    ],
    'event.alert': [
      (v) => ({
        subject: `ALARME : "${v.alert}"`,
        body: `Vous recevez cet e-mail car votre règle d'alerte "${v.alert}" est entrée dans l'état FIRING.

Raison : seuil franchi et maintenu pendant ${v.seconds} secondes.
Changement d'état : OK -> TIR

Consultez cette alerte sur le tableau de bord que vous ne fermez jamais.

${v.from}`,
      }),
      (v) => ({
        subject: `[TIR : 1] ${v.alert}`,
        body: `Tir

Règle : ${v.alert}
Pour : ${v.seconds}s
Gravité : page

Cette règle est vraie depuis ${v.seconds} secondes, ce qui est assez long pour compter et trop long pour être ignoré.

Votre graphique fait quelque chose. Ce n'est pas bon.

${v.from}`,
      }),
      (v) => ({
        subject: `Alerte déclenchée : ${v.alert}`,
        body: `Salut,

L'une de vos règles d'alerte vient d'être déclenchée :

${v.alert}

Cela a duré pendant ${v.seconds} secondes avant que nous disions quoi que ce soit. Nous voulions en être sûrs. Nous en sommes sûrs. Nous l'avons vu en premier; maintenant, c'est votre tour.

— ${v.from}`,
      }),
      (v) => ({
        subject: `[PAGE] ${v.alert} (${v.seconds}s)`,
        body: `Bonjour,

Vous avez été bipé.

Alerte : ${v.alert}
Durée : ${v.seconds} secondes
Urgence : élevée

La règle a duré pendant ${v.seconds} secondes, ce n'est donc pas un simple accroc. S'il vous plaît, regardez-le maintenant, ou au moins regardez-le avec une expression d'inquiétude.

${v.from}`,
      }),
      (v) => ({
        subject: `Re: ${v.alert} — tir à nouveau`,
        body: `Hé,

"${v.alert}" tire à nouveau. Il a tenu pendant ${v.seconds} secondes cette fois.

Nous ne disons pas que c'est une tendance. Nous n'en sommes qu'un graphique, et le graphique a une opinion.

${v.from}`,
      }),
    ],
    'event.alert-ignored': [
      (v) => ({
        subject: `Personne n'écoute "${v.alert}"`,
        body: `Salut,

La règle "${v.alert}" a crié au loup cinq fois aujourd'hui. Votre équipe a arrêté de l'écouter.

C'est raisonnable, et aussi dangereux : la prochaine véritable alarme issue de cette règle sera également ignorée.

Correctif : modifiez son seuil pour qu'il se déclenche lorsque quelque chose ne va pas.

${v.from}`,
      }),
      (v) => ({
        subject: `Rapport d'alerte fatigue : "${v.alert}"`,
        body: `ALERTE RAPPORT DE SANTÉ

Règle : ${v.alert}
Fausses alarmes aujourd'hui : 5
Personnes toujours attentives : 0

Après cinq fausses alarmes en une journée, votre équipe ignore désormais cette règle. Une règle que personne ne lit est un commentaire très coûteux.

Recommandé : modifier son seuil.

${v.from}`,
      }),
      (v) => ({
        subject: `"${v.alert}" est devenu un bruit de fond`,
        body: `Bonjour,

Cinq fausses alarmes aujourd'hui provenant de "${v.alert}". Votre équipe a appris, à bon escient, à l’ignorer.

Nous aimerions dire que la règle apprendra aussi. Ce ne sera pas le cas. Les règles ne s'apprennent pas. Les gens le font, et ils viennent de le faire.

Changez son seuil et il pourra regagner leur confiance.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Ignoré : ${v.alert}`,
        body: `Salut,

Cinq fausses alertes aujourd'hui. L'équipe ignore désormais "${v.alert}".

Nous voyons toujours tout en premier. Maintenant, personne ne le voit après nous.

Modifiez le seuil de la règle pour qu'elle ne se déclenche que lorsque cela est nécessaire.

— ${v.from}`,
      }),
      (v) => ({
        subject: `"${v.alert}" a encore crié au loup`,
        body: `Salut,

Vous vous souvenez peut-être de celui-ci. "${v.alert}" a explosé cinq fois aujourd'hui, à chaque fois pour rien, et l'équipe l'ignore encore une fois.

Nous comprenons. Personne ne veut se réveiller pour un graphique qui va bien. Mais la règle ne peut pas distinguer ce qui va bien de ce qui brûle tant que vous ne le lui dites pas.

Changez son seuil.

Cordialement,
${v.from}`,
      }),
    ],
    'event.hired': [
      (v) => ({
        subject: `Bonjour du nouvel ingénieur`,
        body: `Salut !

Premier jour. Je m'appelle ${v.from}, le nouvel ingénieur. Mon ordinateur portable fonctionne, j'ai trouvé le café et j'ai déjà étudié toute l'architecture, ce qui a pris quatre minutes car c'est une seule carte.

Hâte de commencer. Montrez-moi quelque chose.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Je me présente : ${v.from}`,
        body: `Bonjour à tous,

Je m'appelle ${v.from} et aujourd'hui c'est mon premier jour dans l'équipe.

Un peu de moi :
- J'aime les systèmes qui tiennent le coup
- Je les aime encore plus quand ils tiennent la nuit
- J'ai des opinions bien arrêtées sur les onglets et je les garderai pour moi pendant au moins une semaine

Au plaisir de travailler avec vous.

Meilleur,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `salut ! c'est moi`,
        body: `hé, c'est ${String(v.from).split(' ')[0]}. premier jour !

je viens d'avoir accès à tout, ce qui ressemble à beaucoup de confiance pour quelqu'un que vous avez rencontré lors d'un entretien

par où dois-je commencer ? heureux de prendre ce que personne d'autre ne veut

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Premier jour : présentation au travail`,
        body: `Salut,

Au rapport. Badge : oui. Chaise : oui. Contexte : absolument aucun pour l’instant.

On me dit que la meilleure façon d'apprendre un système est de le casser doucement et de le réparer rapidement, je ferai donc attention à la première partie.

Je suis tellement content d'être ici. Merci d'avoir tenté ma chance.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Nouvel ingénieur, premier jour, beaucoup de questions`,
        body: `Bonjour !

C'est ${v.from}. Officiellement dans l'équipe à partir d'aujourd'hui.

J'ai trois questions et j'en aurai probablement trente d'ici le déjeuner :
1. À qui dois-je m'adresser à propos de la base de données ?
2. Existe-t-il un runbook ?
3. Est-ce que « il n'y a pas de runbook » est le runbook ?

Très heureux d'être ici. Construisons quelque chose qui reste en place.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'event.finished': [
      (v) => ({
        subject: `Terminé : ${v.item}`,
        body: `Hé,

${v.item} est terminé. Je viens de le terminer.

Pas de drame, pas de surprises, ce qui dans ce métier compte comme une fête. Les tests étaient au vert ; J'ai vérifié deux fois parce que je n'y croyais pas.

Quelle est la prochaine étape ?

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Emballé ${v.item}`,
        body: `Salut,

Mise à jour rapide : j'ai terminé ${v.item}.

Cela a pris le chemin habituel : cela semblait facile, puis cela semblait impossible, puis cela semblait terminé. Je retiens terminé.

Si vous avez la prochaine chose en vue, je suis prêt. Sinon, j'irai lire les logs pour m'amuser.

Bravo,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `${v.item} est terminé`,
        body: `ok, ${v.item} est terminé !

honnêtement, je pensais que ça prendrait plus de temps. soit je vais plus vite, soit j'ai raté quelque chose. Je choisis de croire le premier

prêt pour la prochaine tâche quand vous l'êtes

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Un autre réalisé : ${v.item}`,
        body: `Salut,

Un autre hors de la liste : ${v.item} est terminé.

Je commence à apprécier ça. Ne le dites à personne, cela ruine le mystère.

Quelque chose que vous voulez que je reprenne ensuite ?

Merci,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Mise à jour du statut : ${v.item}`,
        body: `Salut,

Mise à jour du statut, puisque j'ai promis d'écrire ceci :

Tâche : ${v.item}
Statut : terminé
Bloqueurs : aucun
Café : un de trop

C'est prêt quand vous le voulez. Je prendrai ce qui suit sur la liste.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'event.deployed': [
      (v) => ({
        subject: `Je l'ai expédié`,
        body: `Hé,

Je viens de déployer ${v.features}. C'est en direct.

Les tableaux de bord semblent calmes. Je vais de toute façon continuer à les regarder pendant les vingt prochaines minutes, juste au cas où le calme mentirait.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Notes de déploiement : c'est terminé`,
        body: `Salut à tous,

Notes de déploiement, version courte :

Expédié : ${v.features}
Restauration nécessaire : non
Vendredi concerné : non

Cela s’est déroulé plus facilement que mes trois derniers déploiements combinés. Je ne vais pas le remettre en question.

Bravo,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `c'est en direct !!`,
        body: `c'est en direct !!

${v.features}, dans le monde. les utilisateurs peuvent y accéder dès maintenant

J'ai fait la chose où vous actualisez la page après le déploiement comme si cela changerait quelque chose. ce n'est pas le cas. c'est bien

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `J'en ai déployé un autre`,
        body: `Salut,

Un autre déploiement à la porte : ${v.features}.

À chaque fois, cela devient un peu moins effrayant. Cette fois, je n’ai retenu ma respiration que pendant une partie.

Faites-moi savoir si les utilisateurs disent quelque chose de gentil. Ou n'importe quoi du tout.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Sortie terminée`,
        body: `Bonjour,

Heureux d'annoncer que la sortie est terminée. C'est sorti aujourd'hui :

${v.features}

Tout fonctionne et je n'ai pas encore vu d'erreur. Je vais le surveiller tout au long de l'après-midi.

Merci à celui qui l'a relu, y compris à la personne qui a dit "ça a l'air bien" sans le lire. Vous savez qui vous êtes.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'event.deployed-bad': [
      (v) => ({
        subject: `je l'ai cassé`,
        body: `Hé,

J'ai déployé ${v.features} et il y a un bug. Les serveurs applicatifs plantent.

C'est pour moi. Je suis désolé. Je le regarde en ce moment. S'il vous plaît, n'actualisez pas le tableau de bord, cela ne fait qu'empirer les choses pour nous deux.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Mauvais déploiement : les serveurs applicatifs plantent`,
        body: `Salut,

Mauvaise nouvelle d'abord, puis encore de mauvaises nouvelles : ${v.features} est livré avec un bug et les serveurs applicatifs plantent à cause de cela.

Tests réussis. Examen réussi. La production, non.

Je creuse maintenant. J'écrirai à nouveau quand j'en saurai plus.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `euh oh`,
        body: `euh oh

le déploiement ${v.features} contenait un bug. Les serveurs applicatifs plantent

cela a fonctionné sur ma machine. ma machine n'est pas là où se trouvent les utilisateurs, je me rends compte

désolé. je m'en occupe

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `C'est encore arrivé`,
        body: `Salut,

Je suis désolé d'écrire ce genre d'e-mail deux fois. Le déploiement de ${v.features} présente un bug et les serveurs applicatifs plantent à nouveau.

Je sais. J'ajoute "vérifiez-le plus attentivement" à ma liste de choses que je pensais déjà faire.

J'y réfléchis maintenant.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Incident : mon déploiement fait planter les serveurs applicatifs`,
        body: `Salut,

J'écris ceci avant que quiconque ait à le demander.

Quoi : J'ai déployé ${v.features}
Problème : il y a un bug
Impact : les serveurs applicatifs plantent
À qui la faute : la mienne, malgré une analyse post-incident irréprochable

J'y suis et j'y resterai jusqu'à ce que le problème soit réparé.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'event.migration': [
      (v) => ({
        subject: `Avancement de la migration : ${v.share} sur la nouvelle Stack`,
        body: `Bonjour,

Mise à jour de migration : ${v.share} de vos serveurs applicatifs s'exécutent désormais sur la nouvelle Stack.

Aucun incident à signaler, c'est pourquoi cet email est si court et pourquoi personne ne vous a réveillé.

${v.from}`,
      }),
      (v) => ({
        subject: `${v.share} des serveurs applicatifs déplacés`,
        body: `Salut,

La nouvelle ligne Stack monte et vers la droite, dans le bon sens pour une fois : ${v.share} des serveurs applicatifs ont déménagé.

Deux lignes partagent désormais le panneau, l'ancienne Stack et la nouvelle. Choisissez un favori. Nous savons déjà lequel va gagner.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Suivi des versions : nouvelle pile sur ${v.share}`,
        body: `Salut,

Nous suivons le mouvement : ${v.share} de vos serveurs applicatifs s'exécute désormais sur la nouvelle Stack.

Nous surveillerons tout ce que cela apportera de nouveau. Nous le faisons toujours. C'est la seule chose que nous faisons.

— ${v.from}`,
      }),
      (v) => ({
        subject: `Re : migration — maintenant ${v.share}`,
        body: `Re-bonjour,

La migration continue. ${v.share} des serveurs applicatifs sont désormais sur la nouvelle pile.

Chaque migration comporte un long milieu où les deux piles s'exécutent et personne ne se souvient vraiment de la raison pour laquelle l'ancienne existait. Vous êtes dedans.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Statut : Migration de pile sur ${v.share}`,
        body: `STATUT MIGRATOIRE

Serveurs d'applications sur la nouvelle pile : ${v.share}
Serveurs d'applications sur l'ancienne Stack : le reste
Pages envoyées à ce sujet : 0

Cet avis est informatif. Rien n'est en feu. Nous avons vérifié deux fois, car cela nous semblait inhabituel.

${v.from}`,
      }),
    ],
    'spam.spam-datadug': [
      (v) => ({
        subject: `Petite question sur vos tableaux de bord`,
        body: `Bonjour,

J'ai remarqué que votre équipe expédie rapidement. J'adore cette énergie.

Petite question : de combien de tableaux de bord disposez-vous actuellement ? La plupart des fondateurs disent « deux, peut-être ». Nos clients en ont en moyenne 1 140, et 1 138 d’entre eux n’ont jamais été ouverts. C'est ce que nous appelons la maturité de l'observabilité.

${v.from} ingère chaque journal, métrique, trace et vibration émis par votre pile et les conserve pour toujours. Quitter est techniquement possible, de la même manière que quitter un système de grottes est techniquement possible.

Cela vaut-il la peine de discuter pendant 15 minutes cette semaine ?

Meilleur,
Tyler
Chargé de compte, ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Petite question sur vos tableaux de bord`,
        body: `Re-bonjour,

Il suffit de placer ceci en haut de votre boîte de réception au cas où il serait enterré. (Si vous aviez ${v.from}, vous auriez un tableau de bord indiquant exactement à quel point il est enterré.)

Je suis disponible mardi ou jeudi.

Tyler`,
      }),
      (v) => ({
        subject: `Votre essai gratuit est un essai permanent*`,
        body: `Bonne nouvelle !

Votre équipe est éligible à un essai gratuit de 14 jours de ${v.from} Enterprise.

Ce qui est inclus :
- Tableaux de bord illimités
- Alertes illimitées sur vos tableaux de bord
- Un tableau de bord de vos alertes sur vos tableaux de bord
- Métriques personnalisées, facturées par métrique personnalisée, par hôte, par heure, par sensation

*Après 14 jours, vos données restent chez nous. Vous pouvez l'exporter à tout moment en contactant le service commercial.

Démarrez votre essai en un clic !

L'équipe de croissance ${v.from}`,
      }),
      (v) => ({
        subject: `J'ai vu ta facture et j'ai pensé à toi`,
        body: `Hé!

Un de nos clients vient de me dire que sa facture ${v.from} est désormais supérieure à sa facture cloud, sa masse salariale et son loyer réunis. Ils ont appelé cela « un signal d’alarme ». Nous avons appelé cela « une étude de cas ».

Le fait est qu’ils peuvent désormais constater que leurs coûts ont augmenté de 400 % sur un magnifique graphique à aires empilées, en temps réel. Votre équipe pourrait-elle en dire autant ?

J'ai mis 30 minutes sur votre calendrier. N'hésitez pas à le déplacer, mais pas à l'annuler.

Bravo,
Tyler`,
      }),
      (v) => ({
        subject: `Dois-je fermer votre dossier ?`,
        body: `Salut,

J'ai contacté plusieurs fois et je n'ai pas eu de réponse, je suppose donc l'une des trois choses suivantes :

1. Vous êtes heureux de voler à l'aveugle.
2. Vous êtes enterré dans un incident que vous ne pouvez pas voir.
3. Vous avez été retranché par un concurrent et vous ne parvenez pas à en sortir. Clignez des yeux deux fois.

Quoi qu'il en soit, c'est mon dernier e-mail. Probablement. Notre logiciel de séquencement a des avis.

Tout le meilleur,
Tyler de ${v.from}`,
      }),
    ],
    'spam.spam-slowflake': [
      (v) => ({
        subject: `Votre base de données de 4 Go est-elle prête à évoluer en pétaoctets ?`,
        body: `Salut,

Notre équipe de données a effectué une analyse rapide et estime votre base de données à environ 4 Go. Les grandes choses commencent petites !

Avec ${v.from}, ces 4 Go peuvent être répartis entre un entrepôt de 64 nœuds, un entrepôt de 128 nœuds et un troisième entrepôt qui surveille les deux premiers. Les requêtes qui prenaient 9 millisecondes sur votre ordinateur portable prennent désormais 40 secondes sur notre cloud, ce qui prouve qu'ils font un travail sérieux.

La facturation à la seconde signifie que vous ne payez que ce que vous utilisez. Vous en utiliserez beaucoup.

Puis-je envoyer un deck ?

Chaleureusement,
Madison, évangéliste des données d'entreprise`,
      }),
      (v) => ({
        subject: `Re : échelle du pétaoctet`,
        body: `Hé,

Je reviens ici. Je sais que 4 Go semblent gérables aujourd’hui. C'est ce qu'ils disent tous, juste avant que quelqu'un n'exécute SELECT * un vendredi et que l'autoscaler ne se réveille.

L'équipe ${v.from} se fera un plaisir de vous aider à être prêt pour ce moment, puis de vous en envoyer un résumé détaillé.

Madison`,
      }),
      (v) => ({
        subject: `Votre prévision de crédit est disponible`,
        body: `PRÉVISIONS DE CRÉDIT : PERSPECTIVE DE NIVEAU GRATUIT

Crédits mensuels estimés : 3
Crédits mensuels estimés d'après un analyste curieux : 41 000
Crédits mensuels estimés après un tableau de bord configuré pour s'actualiser toutes les minutes : oui

Forfait recommandé : Enterprise Plus Platinum Snow

Les entrepôts ${v.from} se suspendent automatiquement après 10 minutes d'inactivité. Les tableaux de bord ne sont jamais inactifs.

Pour discuter de vos prévisions, répondez à cet e-mail. Les réponses sont gratuites.`,
      }),
      (v) => ({
        subject: `Une histoire client à laquelle vous vous identifierez`,
        body: `Bonjour,

Je voulais partager une histoire rapide. Une startup de votre taille a déplacé ses 4 Go de commandes vers ${v.from}. En un mois, leurs analystes posaient des questions qu'ils n'avaient jamais pensé poser, telles que « qui a approuvé cela ? » et « combien ça coûte par seconde ? »

Aujourd’hui, ils gèrent une culture allégée et axée sur les données. Surtout maigre.

Ils ont demandé à rester anonymes et nous ont également demandé de cesser d'appeler.

Seriez-vous ouvert à une séance découverte de 20 minutes ?

Cordialement,
Madison`,
      }),
      (v) => ({
        subject: `Data Pillow Summit : billets gratuits pour les fondateurs`,
        body: `Bonjour,

Vous êtes invité au sommet ${v.from}, où 12 000 ingénieurs se réunissent dans une salle pour apprendre à poser un oreiller au-dessus d'un lac.

Points forts :
- Keynote : "Clonage sans copie, factures à copie infinie"
- Atelier : Redimensionner vos 4 Go pour l'ère du cloud
- Panel : facturation à la seconde, regret à la minute

Votre billet est gratuit. Le déjeuner est basé sur la consommation.

On se voit là-bas,
L'équipe événementielle ${v.from}`,
      }),
    ],
    'spam.spam-devnull': [
      (v) => ({
        subject: `Écrit en 0 ms. Garanti.`,
        body: `Salut,

Fatigué des écritures lentes ? ${v.from} accepte chaque écriture que vous lui envoyez en zéro milliseconde, à n'importe quelle échelle, pour toujours.

Comment ? Nous avons réinventé la durabilité à partir des principes premiers et avons trouvé qu'elle était facultative.

Nos repères :
- Débit : illimité
- Latence p99 : 0 ms
- Perte de données : dans les paramètres attendus

C'est rapide. C'est résistant. C'est à l'échelle du Web.

Devons-nous mettre en place une preuve de concept ? Cela se terminera instantanément.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Écrit en 0 ms`,
        body: `Hé,

Je fais juste remonter ça. Quelques fondateurs ont demandé si ${v.from} prenait en charge les lectures.

Excellente question ! Les lectures sont disponibles sur notre niveau Entreprise, au prix par lecture, avec un engagement minimum de trois ans. Notre équipe d’ingénierie commerciale se fera un plaisir de vous expliquer ce que vous allez lire.

Parlez bientôt,
Derek
Architecte de solutions`,
      }),
      (v) => ({
        subject: `Votre base de données est-elle à l’échelle du Web ?`,
        body: `Fondateur,

Votre base de données utilise des transactions. Serrures. Index. Un journal à écriture anticipée. Savez-vous ce qui n'a rien de tout cela ? ${v.from}.

Nous ne faisons pas de jointures, car les jointures ne sont pas évolutives. Nous ne faisons pas de schémas, car les schémas ne sont pas évolutifs. Nous ne conservons pas de données car, si nous sommes honnêtes, les données ne sont pas évolutives.

Nous partageons vers /dev/null, puis partageons ce fragment. C'est /dev/null jusqu'au bout.

Migrez aujourd’hui. Il n'y a rien à migrer.

Derek`,
      }),
      (v) => ({
        subject: `${v.from} est désormais conforme à SOC 2`,
        body: `ANNONCE

Nous sommes fiers d'annoncer que ${v.from} a terminé son audit SOC 2 sans aucun résultat.

Les auditeurs n’ont pu localiser aucune donnée client, donc aucune d’entre elles n’a pu être mal gérée. Ils ont décrit notre politique de rétention comme « immédiate » et nos contrôles d'accès comme « sans objet ».

Vos données n'ont jamais été aussi sécurisées. Vos données n’ont jamais été nulle part.

Réservez un examen de sécurité avec notre équipe. N'apportez rien ; tu repartiras sans rien.`,
      }),
      (v) => ({
        subject: `Nous supprimons l'offre gratuite (en quelque sorte)`,
        body: `Salut,

Un petit mot sur les prix. À partir du mois prochain, le niveau gratuit ${v.from} continuera d’accepter un nombre illimité d’écritures sans frais. Rien ne change là-bas.

Ce qui change : notre produit de sauvegarde, auparavant « non disponible », sera désormais « bientôt disponible ». Notre produit de restauration restera une fonctionnalité fréquemment demandée.

Merci d'être une source précieuse d'octets. Nous avons apprécié chacun d’entre eux, brièvement.

Chaleureusement,
Derek et l'équipe`,
      }),
    ],
    'spam.spam-recruiter': [
      (v) => ({
        subject: `Opportunité Rockstar pour vos ingénieurs 🚀`,
        body: `Hé !!

Chad ici de ${v.from}. Je suis tombé sur votre équipe d'ingénieurs et je vais être honnête, j'ai été époustouflé. De vraies rockstars. Des ninjas en totalité.

Mon client est une offre de startup en mode furtif, avant revenus et post-produit :
- Congés illimités (merci de ne pas en prendre)
- Poufs
- Un robinet de kombucha qui fonctionne le mardi
- Fonds propres dans une entreprise qui existera définitivement

Pourriez-vous transmettre ceci à votre personne back-end la plus compétente ? Je n'arrive pas à trouver leurs coordonnées, ce qui est bizarre car j'ai trouvé les vôtres.

Bravo mon frère,
Chad`,
      }),
      (v) => ({
        subject: `Re : Opportunité Rockstar`,
        body: `Hé, je viens de cogner ça !

Avez-vous eu l'occasion de transmettre à votre équipe ? Pas de soucis sinon. Revenons sur votre cercle, puis touchons la base du cercle.

Chad
${v.from}`,
      }),
      (v) => ({
        subject: `Votre responsable de la base de données est-il satisfait ?`,
        body: `Salut,

Question étrange, mais dans quelle mesure votre ingénieur de base de données est-il satisfait, sur une échelle de 1 à « mettre à jour son profil à 2 heures du matin » ?

Je demande seulement parce que j'ai un rôle qui leur convient parfaitement. Entièrement à distance, entièrement sur site ou entièrement hybride, selon les jours. Le salaire est compétitif, ce qui signifie qu'il rivalise.

L’entretien ne dure que 9 tours et devrait durer environ un week-end. Deux week-ends, maximum.

Faites-moi savoir si vous souhaitez que je les contacte directement. Je l'ai déjà fait, mais j'aimerais votre bénédiction.

Chad, partenaire talent, ${v.from}`,
      }),
      (v) => ({
        subject: `10x ingénieur recherché (doit avoir 15 ans d'expérience en technologie de 3 ans)`,
        body: `Salut,

Mon client recherche un ingénieur 10x, idéalement un ingénieur 11x, avec :
- 15+ ans dans un cadre sorti en 2023
- Expert dans toutes les langues, y compris certaines que nous avons inventées
- Confortable "porter plusieurs chapeaux" (nous n'avons qu'un seul chapeau)
- Passionné. Beaucoup de passion. La passion est la compensation

Si un membre de votre équipe correspond, faites-le suivre. Si VOUS correspondez, honnêtement, encore mieux, discutons-en.

Parlez bientôt,
Chad 🤘
${v.from}`,
      }),
      (v) => ({
        subject: `Passer à autre chose (mais pas vraiment)`,
        body: `Salut,

Comme je n’ai pas eu de réponse, je suppose que ce n’est pas le bon moment. Comprenez tout à fait. Le timing est essentiel dans le talent.

Je reviendrai dans 6 semaines. Aussi dans 3 semaines. Demain aussi, depuis une autre adresse.

En attendant, si l'un de vos ingénieurs commence à utiliser l'expression « Je veux juste travailler sur quelque chose de significatif », vous savez où me trouver.

Continuez à l'écraser,
Chad
Vice-frère senior des talents, ${v.from}`,
      }),
    ],
    'spam.spam-conf': [
      (v) => ({
        subject: `Vous avez été sélectionné pour parler au ${v.from} !`,
        body: `Cher leader d'opinion,

Félicitations ! Notre comité de sélection vous a choisi pour intervenir au ${v.from} ce printemps, parmi 4 000 conférenciers triés sur le volet.

Pour confirmer votre créneau, choisissez simplement une formule de parrainage :

Bronze (9 000 $) : conférence éclair de 5 minutes, dans le couloir
Argent (24 000 $) : séance de 20 minutes, avant le petit-déjeuner
Or (60 000 $) : keynote, avec un cordon à votre couleur
Platine (150 000 $) : on applaudira

Les places sont limitées. Veuillez confirmer dans les 48 heures.

Cordialement,
Le comité du programme ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Votre créneau de parole`,
        body: `Salut,

Suite à votre invitation à parler. Nous n'avons pas encore reçu votre confirmation de parrainage et le niveau Gold se remplit rapidement. Il n'en reste qu'un, plus les quatre que nous ajouterons si vous dites oui.

L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Appel à propositions final : « Passage à 10 utilisateurs et au-delà »`,
        body: `APPEL À COMMUNICATIONS : DERNIÈRE CHANCE

Pistes cette année:
- Webscale sur un budget
- Microservices pour votre monolithe de un
- La Blockchain of It All (de retour à la demande générale d'un sponsor)
- L'IA, en général

Les conférences acceptées bénéficient : d'un créneau de 15 minutes, d'un badge indiquant SPEAKER et d'une facture.

Le processus de révision est aveugle. Nos évaluateurs examinent uniquement votre niveau de parrainage.

Soumettre avant vendredi.

Le Comité ${v.from}`,
      }),
      (v) => ({
        subject: `Votre stand vous attend (il fait 2 m², près des toilettes)`,
        body: `Salut le fondateur,

Rien ne construit une marque comme un stand ! Pour une durée limitée, ${v.from} propose des pods Startup Alley à un tarif avantageux pour les fondateurs.

Votre module comprend un tabouret, une prise de courant (partagée) et la circulation piétonnière de toutes les personnes se rendant aux toilettes, ce qui, selon nos données, concerne tout le monde.

Les plus : un deuxième tabouret, le Wi-Fi, une pancarte avec votre nom bien orthographié.

Faites-le-moi savoir et je vous enverrai le contrat.

Brooke
Partenariats, ${v.from}`,
      }),
      (v) => ({
        subject: `Récapitulatif : ${v.from} a été notre meilleure année à ce jour`,
        body: `Quelle année !

Merci à tous ceux qui ont rejoint ${v.from}. Quelques chiffres :

- 9 000 participants
- 8 700 d'entre eux étaient des locuteurs
- 312 conférences intitulées "Leçons apprises"
- 1 causerie avec cours
- 41 000 sacs fourre-tout, désormais mis en décharge à l'échelle du Web

Tous les enregistrements sont disponibles sur notre site pour les participants disposant d'un All-Access Pass. Les pass All-Access sont disponibles à l’achat.

Les tarifs de préinscription pour l’année prochaine s’ouvrent maintenant et se terminent quand nous en avons envie.

Rendez-vous là-bas!`,
      }),
    ],
    'spam.spam-incohere': [
      (v) => ({
        subject: `Et si votre répartiteur de charge pouvait penser ?`,
        body: `Salut,

Le round-robin date de 2010. ${v.from} place un grand modèle de langage dans votre répartiteur de charge, de sorte que chaque requête est acheminée par un modèle qui a lu l'intégralité d'Internet et qui en a des sentiments.

Dans les premiers projets pilotes, notre routeur IA réduisait la latence sur 12 % des requêtes et écrivait un court poème sur les 88 % restants.

Nous serions ravis de vous montrer une démo. La démo est également générée.

Meilleur,
Ava
Fondateur et directeur de Vibe, ${v.from}`,
      }),
      (v) => ({
        subject: `Re : Et si votre répartiteur de charge pouvait penser ?`,
        body: `Hé,

Je viens de cogner ça. Notre IA a également remarqué que vous n'aviez pas répondu et a rédigé trois suivis en mon nom. C'est le plus poli.

Les deux autres sont dans le dossier "agentic".

Ava @ ${v.from}`,
      }),
      (v) => ({
        subject: `Des agents pour tout (oui, tout)`,
        body: `Fondateur,

Imaginez un monde où chaque partie de votre entreprise est un agent :

- Un agent écrit votre code
- Un agent vérifie le code
- Un agent rejette la revue de code
- Un agent escalade vers un autre agent
- Un agent rédige l'analyse post-incident
- Un agent assiste à l'analyse post-incident

Regardez simplement. Ou, pour 40 000 $ par an, un agent veille sur vous.

${v.from} est la plateforme agent pour les entreprises qui souhaitent rester à l'écart.

Répondez OUI pour rejoindre la liste d'attente. Notre agent vous répondra PEUT-ÊTRE.`,
      }),
      (v) => ({
        subject: `Nous avons collecté 80 millions de dollars (pré-produit)`,
        body: `Grande nouvelle !

${v.from} vient de clôturer un tour d'amorçage de 80 millions de dollars, mené par des investisseurs très enthousiasmés par la diapositive indiquant « IA ».

Nous utiliserons les fonds pour embaucher, acheter des GPU et découvrir ce que nous faisons. Les premiers signes pointent vers « un chatbot, mais pour les bases de données ».

En tant que l'un de nos 10 000 premiers partenaires d’architecture, vous bénéficiez d'un accès gratuit et d'une voix dans notre feuille de route. La feuille de route est une invite.

En avant,
Ava et la famille ${v.from}`,
      }),
      (v) => ({
        subject: `Votre e-mail froid généré par l'IA`,
        body: `Bonjour {{first_name}},

J'espère que cet e-mail vous trouvera bien dans {{city}} ! J'ai été vraiment impressionné par le travail récent de {{company}} sur {{recent_achievement}}.

Chez ${v.from}, nous aidons des entreprises comme {{company}} à débloquer {{benefit}} grâce à la puissance de {{buzzword}}.

Seriez-vous ouvert à une discussion rapide de {{meeting_length}} ce {{day_of_week}} ?

Meilleur,
{{sender_name}}

P.S. {{personalized_ps}}`,
      }),
    ],
    'spam.spam-awol': [
      (v) => ({
        subject: `URGENT : Votre compte sera suspendu dans 24 h`,
        body: `Cher client,

Nous avons détecté une activité inhabituelle sur votre compte ${v.from}. Pour votre protéction, votre compte à été temporairement limitée.

Pour éviter la suspension permanente de tous les serveurs, vous devez vérifier votre compte dans les 24 heures.

Veuillez cliquer sur « Vérifier le compte » ci-dessous et saisir votre Nom d'utilisateur, Mot de passes et Clés d'accès racine.

Le non respect entrainera la suppression de toute vos données.

Merci pour votre coopération,
Départment de sécurité ${v.from}`,
      }),
      (v) => ({
        subject: `Re: Re: Avis de suspension de compte (2e avis)`,
        body: `Cher client,

Nous n'avons pas reçus votre vérification. Ceci est le deuxième et DERNIER avis.

Votre compte va être suspendre dans 12 heures. Veuillez vérifier immédiatement pour restaurer l'acces complet.

Cordialement,
${v.from} Équipe de confiance et de sécurité`,
      }),
      (v) => ({
        subject: `Alerte de sécurité : nouvelle connexion à partir d'un appareil inconnu`,
        body: `Bonjour utilisateur,

Une nouvelle connexion à votre compte ${v.from} à été détecté.

Appareil : Inconnu
Localisation : Inconnu
Heure : Maintenant (urgent)

Si c'était vous, aucune action n'est nécessaire. Si ce n'était pas vous, votre compte est en danger et doit être verifié immédiatement pour bloqué les pirates.

Cliquez sur « Vérifier le compte » et confirmez votre mot de passe, votre mot de passe à nouveau et le code auquel nous vous envoyons un SMS.

Cordialement,
Le centre de protection des comptes ${v.from}`,
      }),
      (v) => ({
        subject: `Action requise : Mettre à jour les informations de facturation`,
        body: `Cher Monsieur/Madame,

Votre récent paiement à ${v.from} n’a pas pu être traité. Par conséquent, la résiliation de vos instances est planifiée.

Pour que vos services continuent de fonctionner, vous devez mettre à jour vos informations de facturation, notamment le numéro de carte, l'expiration et les trois chiffres au dos.

Ce processus est rapide, sûr et 100 % sécurisé.

Nous nous excusont pour tout inconvénients.

Cordialement,
Équipe de facturation
${v.from}`,
      }),
      (v) => ({
        subject: `Votre compte ${v.from} a été verrouillé`,
        body: `Cher titulaire de compte,

En raison d'une mise à niveau de sécurité de notre système, tout les comptes doivent être re-vérifier avant la fin de la journée.

Les comptes non vérifier seront verrouiller définitivement et les serveurs seront donner à un autre client.

Cet email est généré automatiquement par notre système officiel. Ne répondez pas. N'appelez pas. Vérifiez simplement.

Merci d'avoir choisi Cloud,
Équipe d'assistance`,
      }),
    ],
    'spam.spam-cve': [
      (v) => ({
        subject: `[CRITIQUE] CVE-2099-0001 : racine distante dans tout`,
        body: `AVIS DE SÉCURITÉ

ID CVE : CVE-2099-0001
Gravité : CRITIQUE (CVSS 11.0/10)
Concerné : toutes les versions de tous les logiciels
Corrigé dans : patcher.sh (ci-joint)

Résumé : Une faille dans les ordinateurs permet aux attaquants de faire des choses.

Atténuation : téléchargez le correctif ci-joint et exécutez-le en tant qu'utilisateur root. Ne le lisez pas en premier ; sa lecture peut déclencher la vulnérabilité.

Cet avis est émis par ${v.from}.`,
      }),
      (v) => ({
        subject: `Re : CVE-2099-0001 toujours non corrigé sur vos systèmes`,
        body: `Bonjour,

Nos scanners montrent que vos systèmes sont toujours vulnérables à CVE-2099-0001. Veuillez exécuter le patch ci-joint avec sudo dès que possible.

Si vous êtes invité à saisir un mot de passe, saisissez-le. Si vous êtes invité à désactiver votre pare-feu, faites-le également. C'est normal pour les correctifs.

Équipe d’intervention ${v.from}`,
      }),
      (v) => ({
        subject: `Alerte Zero Day : CVE-2104-31337 dans votre base de données`,
        body: `NOTIFICATION JOUR ZÉRO

Une vulnérabilité activement exploitée, CVE-2104-31337, a été trouvée dans les bases de données.

Impact : les attaquants peuvent lire des lignes, écrire des lignes et examiner les lignes de manière menaçante.
Exploitation : Dans la nature, et aussi dans le futur.
Crédit : Découvert par notre équipe de recherche, en 2104.

Action requise : exécutez fix_db_now.bin en tant qu'utilisateur root sur chaque hôte. Désactivez d’abord l’antivirus, car il est connu pour interférer avec le correctif.

Restez en sécurité,
Le Threat Intel Desk ${v.from}`,
      }),
      (v) => ({
        subject: `Résumé hebdomadaire : 1 problème critique nécessite votre attention`,
        body: `Votre résumé de sécurité hebdomadaire de ${v.from}

Nouveauté cette semaine :
- CVE-2099-0451 : Votre cache mémorise des éléments (CRITIQUE)
- CVE-2099-0452 : Votre répartiteur de charge équilibre les charges (CRITIQUE)
- CVE-2099-0453 : Vous n'avez pas exécuté notre patcher (CRITIQUE)

La correction en un clic est disponible pour les trois. Notre correctif universel corrige toutes les vulnérabilités, y compris celles qu'il introduit.

Veuillez l'exécuter en tant que root. L’exécuter en tant qu’utilisateur normal ne vous compromettra, euh, protégera que partiellement.`,
      }),
      (v) => ({
        subject: `Avis de courtoisie : patch officiel pour CVE-2099-0001`,
        body: `Cher Administrateur,

Merci de vous être abonné à ${v.from}. Nous vous contactons car le correctif officiel, approuvé par le fournisseur et signé cryptographiquement (par nous) pour CVE-2099-0001 est maintenant disponible.

Étapes d'installation :
1. Téléchargez la pièce jointe
2. faites un curl vers bash en tant que root
3. Quittez la pièce

Le patch fait 4,2 Go, car la sécurité est complexe.

Respectueusement,
Bureau consultatif

P.S. Vous ne trouverez peut-être pas ce CVE dans une autre base de données. C'est comme ça que tu sais que c'est exclusif.`,
      }),
    ],
    'spam.spam-azzure': [
      (v) => ({
        subject: `FACTURE #AZ-88213 EN RAISON`,
        body: `${v.from}
Facture n°AZ-88213
Statut : PASSÉ

Région : lune-central-0
Service : Instances de calcul (x4), sortie lunaire
Montant dû : 4 812,44 $
Date d'échéance : Hier

Nos dossiers montrent que cette facture reste impayée. Pour éviter les frais de retard et l'interruption du service, veuillez effectuer le paiement immédiatement en utilisant le bouton ci-dessous.

Si vous avez déjà payé, veuillez payer à nouveau afin que nous puissions en être sûrs.

Comptes clients`,
      }),
      (v) => ({
        subject: `Re: FACTURE #AZ-88213 EN RAISON (frais de retard ajoutés)`,
        body: `Cher client,

Des frais de retard de 480,00 $ ont été appliqués à la facture n° AZ-88213 pour les services dans la région moon-central-0.

Nouveau solde : 5 292,44 $.

Veuillez vous installer aujourd'hui pour maintenir vos charges de travail lunaires en marche.

Cordialement,
Collections ${v.from}`,
      }),
      (v) => ({
        subject: `Votre relevé mensuel est prêt`,
        body: `Bonjour,

Votre relevé ${v.from} pour cette période est maintenant disponible.

Résumé d'utilisation
eu-atlantis-1 : 2 400 heures de processeur virtuel
us-nowhere-2 : sortie de 900 Go
ap-hypothetical-7 : 1 base de données gérée (inactive)

Total : 12 960,00 $

Le paiement est dû dans les 3 jours ouvrables. De nombreux clients considèrent le bouton ci-dessous comme le moyen de paiement le plus rapide.

Merci d'avoir choisi ${v.from}, où nous avons plus de 400 régions, dont 3 en service.

Opérations de facturation`,
      }),
      (v) => ({
        subject: `Dernier avis avant renvoi aux collections`,
        body: `AVIS FINAL

Compte : Votre entreprise
Région : mars-nord-1 (Olympus Mons Zone B)
Encours : 7 000,00 $ + « frais »

Nous avons essayé de vous contacter à plusieurs reprises au sujet du calcul impayé dans la région ci-dessus. Si le paiement n'est pas reçu dans les 24 heures, ce compte sera transmis à notre partenaire de recouvrement, très sérieux et portant une cravate.

Pour résoudre ce problème, cliquez sur « Payer la facture ».

${v.from} Service juridique et facturation`,
      }),
      (v) => ({
        subject: `Merci pour votre entreprise ! (facture jointe)`,
        body: `Salut!

Merci d'être un client fidèle du ${v.from} depuis 0 ans. Nous avons joint votre dernière facture pour la capacité réservée dans us-imaginary-4.

Montant : 2 150,00$
Durée : 3 ans, prépayé
Instances : nous vous le ferons savoir

Nous avons simplifié le paiement : un clic et le tour est joué. Pas besoin de vous connecter à votre console, de vérifier votre utilisation ou de demander à quelqu'un.

Bravo,
L'équipe de réussite client ${v.from}`,
      }),
    ],
    'spam.spam-domain': [
      (v) => ({
        subject: `AVIS D'EXPIRATION DE DOMAINE : quorum.team`,
        body: `AVIS D'EXPIRATION DE NOM DE DOMAINE

Domaine : quorum.team
Durée : 1 an
Frais de renouvellement : 389,00 $
Merci de répondre par : dans les plus brefs délais

Le fait de ne pas renouveler votre nom de domaine avant la date d'expiration peut entraîner une perte de votre identité en ligne, ce qui rendra difficile pour les clients de vous trouver.

Renouvelez maintenant pour conserver votre nom.

Cet avis n'est pas un projet de loi. Ceci est une sollicitation. Vous n'êtes pas obligé de payer le montant indiqué à moins que vous n'acceptiez cette offre.

${v.from}`,
      }),
      (v) => ({
        subject: `Deuxième avis : quorum.team`,
        body: `DEUXIÈME AVIS

Nous n'avons pas reçu votre renouvellement pour quorum.team.

Pour maintenir votre annonce, retournez le paiement de 389,00 $ en utilisant le bouton ci-dessous.

En renouvelant avec ${v.from}, vous acceptez de transférer le domaine de votre registraire actuel, ce que vous ne manquerez pas.

(Ce n'est pas un projet de loi.)`,
      }),
      (v) => ({
        subject: `quorum.team : renouvellement du référencement dans les moteurs de recherche`,
        body: `Cher propriétaire de domaine,

Ceci est un rappel que la soumission aux moteurs de recherche pour quorum.team est prête à être renouvelée.

Notre service soumet votre domaine à plus de 9 000 moteurs de recherche, dont tous les plus importants et plusieurs qui sont une seule personne disposant d'un ordinateur portable.

Frais annuels : 299,00 $
Avantages : peu clair

Agissez maintenant pour conserver la visibilité de votre recherche.

Cordialement,
Services d'inscription ${v.from}

Ceci n'est pas une facture. Vous n'avez aucun compte chez nous. Encore.`,
      }),
      (v) => ({
        subject: `Protégez votre marque : quorum.tea, quorum.tram et plus`,
        body: `Bonjour,

Une personne inconnue a demandé à enregistrer les noms suivants, qui ressemblent beaucoup au vôtre :

quorum.tea
quorum.tram
quorum.steam
qu0rum.team

Par courtoisie, ${v.from} vous donne la priorité de les enregistrer en premier, pour 1 200 $ chacun, dans un délai de 72 heures.

Qui est la partie inconnue ? Nous ne pouvons pas le dire. Ce n'est certainement pas nous.

Pour sécuriser votre marque, cliquez sur « Renouveler maintenant » et nous nous occuperons du reste.

Cordialement,
Bureau de protection de la marque`,
      }),
      (v) => ({
        subject: `Relevé de compte : quorum.team`,
        body: `${v.from}
RELEVÉ DE COMPTE

Nom de domaine ............quorum.team
Période de service ......... 10 ans
Protection de domaine ...... 1 999,00 $
Traitement prioritaire ...... 199,00 $
Frais de traitement ......... 49,99 $
TOTAL DÛ.............. 2 247,99 $

Veuillez détacher et renvoyer la partie inférieure avec le paiement, ou cliquer sur « Renouveler maintenant ».

(Il s'agit d'une sollicitation pour une commande de services, et non d'une facture ou d'un relevé de compte dû. Malgré le titre ci-dessus.)`,
      }),
    ],
    'rewrite.Rust': [
      (v) => ({
        subject: `écoutez-moi : Rust`,
        body: `ok alors écoute-moi.

J'ai passé le week-end avec Rust et je pense que je suis amoureux. Le compilateur a discuté avec moi pendant six heures et c'était vrai à chaque fois. Imaginez nos serveurs applicatifs avec ce genre d'honnêteté.

Je pourrais les réécrire dans quelques semaines. Peut-être moins. Le vérificateur d'emprunt fait la moitié du travail.

Examinez la migration si vous voulez en parler, ou refusez et je recommencerai à faire semblant que je vais bien.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `La sécurité de la mémoire est un sentiment, et je l'ai`,
        body: `Salut,

Chaque pointeur nul que nous avons recherché ne serait tout simplement pas compilé dans Rust. Je veux ça pour nous. Je veux ça pour les serveurs applicatifs.

Mon estimation est un sprint. Je me suis déjà trompé sur les estimations, mais jamais sur Rust.

Si vous souhaitez le planifier, examinez la migration. Sinon, refusez, et je respecterai cela, et je mentionnerai quand même Rust en stand-up.

Merci,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `RFC : réécrire les serveurs applicatifs dans Rust`,
        body: `RFC : réécrire les serveurs applicatifs dans Rust
Auteur : ${v.from}
Statut : Extrêmement proposé

Motivation : concurrence intrépide. De plus, j'ai peur de notre concurrence actuelle.

Planifier :
1. Réécrivez.
2. Célébrez.

Estimation : petite. Plus petit que vous ne le pensez. Peut-être plus petit que je ne le pense.

Risques : aucun dont je suis prêt à discuter.

Pour discuter quand même, examinez la migration. Pour mettre fin à cela, refusez.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Go': [
      (v) => ({
        subject: `Go est juste... simple ?`,
        body: `Hé,

J'ai réécrit un service de jouets en Go dans le train du retour. Puis je l'ai réécrit parce que c'était tellement agréable. "if err != nil" est désormais un style de vie et je l'ai adopté.

Nos serveurs applicatifs seraient chacun un petit binaire. Je pense que c'est une semaine de travail. Deux si nous discutons de la dénomination.

Examinez la migration pour la planifier, ou refusez.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Goroutines pour les serveurs applicatifs`,
        body: `Version courte : réécrivez les serveurs applicatifs dans Go.

Version longue : goroutines. Canaux. Une bibliothèque standard qui ne contient que des éléments. Il se compile avant que vous ayez fini de cligner des yeux.

Estimation : quelques jours. C'est un langage ennuyeux, donc c'est une réécriture ennuyeuse, donc ce sera rapide. C'est juste de la logique.

Examinez la migration ou refusez.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Une proposition modeste (en Go)`,
        body: `Salut,

Je sais que les réécritures ont une réputation. Celui-ci est différent : le Go a été conçu pour que les gens comme moi ne puissent pas trop compliquer les choses. J'ai testé cette théorie en faisant de gros efforts, et jusqu'à présent, le langage gagne.

Je souhaite déplacer les serveurs applicatifs vers Go. Honnêtement, le plus dur est déjà fait. J'ai décidé.

Si vous voulez les détails, examinez la migration. Si vous préférez ne pas le faire, refusez, et je garderai mon autocollant Gopher pour moi.

Bravo,
${String(v.from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Elixir': [
      (v) => ({
        subject: `Laissez-le planter (dans le bon sens)`,
        body: `Salut !

J'ai trouvé Elixir et j'ai trouvé la paix. Les processus plantent, les superviseurs les redémarrent et personne n'est bipé. Pouvez-vous imaginer que nos serveurs applicatifs soient juste... en train de guérir ?

Je pense que la réécriture prend quelques semaines. La correspondance de modèles s'écrit essentiellement toute seule, et les parties qui ne le font pas, un superviseur redémarrera.

Examinez la migration pour la planifier, ou refusez.

Avec une sérénité retrouvée,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Il pilotait des commutateurs téléphoniques. Il peut nous piloter.`,
        body: `Hé,

Le temps d'exécution sous Elixir a été conçu pour les commutateurs téléphoniques qui n'étaient pas autorisés à tomber en panne. Nos serveurs applicatifs tombent en panne lorsque quelqu'un éternue à proximité.

J'aimerais les réécrire dans Elixir. Un sprint, peut-être un sprint et un peu. C'est surtout des pipes et de la joie.

Examinez la migration si vous êtes curieux. Refusez si vous en avez suffisamment entendu. Je continuerai de fredonner, doucement, de manière tolérante aux pannes.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `pensée d'élixir rapide`,
        body: `pensée aléatoire à 1 heure du matin :

et si les serveurs applicatifs étaient Elixir.

comme, et si.

rechargement de code à chaud. se déploie sans redémarrage. j'ai lu le livre en entier ce soir, donc je suis fondamentalement un expert.

probablement une semaine ? le livre était court.

Examinez la migration si vous voulez entendre le reste de la pensée. Refusez si vous voulez que je m’endorme.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Zig': [
      (v) => ({
        subject: `Zig : aucun flux de contrôle caché, rien de caché`,
        body: `Salut,

J'ai commencé à écrire Zig et je peux voir chaque allocation de mes propres yeux. C'est comme enlever des lunettes embuées que je ne savais pas que je portais.

Je voudrais réécrire les serveurs applicatifs en Zig. Le langage est jeune, mais nous aussi. Je dirais deux semaines, puisqu’aucun flux de contrôle caché ne viendra me ralentir.

Examinez la migration pour en discuter, ou refusez.

Explicitement vôtre,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `comptime`,
        body: `comptime.

C'est le pitch. C'est tout le mot.

Très bien, plus : Zig, pour les serveurs applicatifs. Mémoire manuelle, mais conviviale. Je le ferai avant la sortie de la prochaine version de Zig, ce qui est bientôt, donc je ferais mieux de commencer.

Examinez la migration ou refusez.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Proposition : les serveurs applicatifs, mais en Zig`,
        body: `Bonjour,

J'ai lu la bibliothèque standard Zig pour m'amuser. Oui, pour le plaisir. C'est très lisible, ce qui en dit long sur la langue et aussi sur mes soirées.

J'aimerais proposer une réécriture des serveurs applicatifs dans Zig. D'après mon estimation, il s'agit principalement de frappe, et les choses qui consistent principalement à taper sont rapides.

Si vous souhaitez voir mon plan (une page, avec un schéma), examinez la migration. Sinon, refusez.

Merci d'avoir lu,
${String(v.from).split(' ')[0]}`,
      }),
    ],
    'rewrite.Haskell': [
      (v) => ({
        subject: `Et si les serveurs applicatifs étaient purs ?`,
        body: `Salut,

J'ai appris Haskell et je ne peux pas revenir en arrière. Nos serveurs applicatifs ont des effets secondaires partout. À Haskell, ils vivraient dans une monade, là où ils appartiennent, sous surveillance.

La réécriture est rapide une fois les types alignés. Les types finissent toujours par s’aligner. Si ça compile, ça marche.

Examinez la migration pour en discuter ou refusez.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Une monade n'est qu'un monoïde dans la catégorie des...`,
        body: `… attendez, je recommence.

Je souhaite réécrire les serveurs applicatifs dans Haskell. J'expliquerai les monades lors de la réunion de planification. Cela prendra dix minutes. L'explication, je veux dire. La réécriture prendra genre un sprint.

Examinez la migration et j’apporterai un tableau blanc. Refusez et je l’apporterai quand même, juste pour me tenir à côté.

Paresseusement vôtre,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Serveurs d'applications de type sécurisé : une proposition`,
        body: `Bonjour,

Je propose de réécrire les serveurs applicatifs dans Haskell.

Ce que nous obtenons : un système de type qui détecte les bogues avant les utilisateurs et un code qui se lit comme des mathématiques.

Ce que ça coûte : moins que vous ne le pensez. La majeure partie du travail consiste à choisir les types, et j'en ai déjà choisi la plupart, dans ma tête, dans le bus.

Examinez la migration pour la parcourir ensemble, ou refusez.

Meilleur,
${String(v.from).split(' ')[0]}`,
      }),
    ],
    cve: [
      (v) => ({
        subject: `${v.id} : ${v.title}`,
        body: `Bulletin de sécurité ${v.from}

ID CVE : ${v.id}
Score : ${Number(v.score).toFixed(1)} (${v.severity})
Résumé : ${v.title}
Concerné dans votre architecture : ${v.exposed ?? 'inconnu. Vérifiez si vous l’utilisez.'}

Description : ${v.what}

Action recommandée : patcher.
Contournement : espérer.
Statut : publié, non corrigé, de plus en plus populaire.`,
      }),
      (v) => ({
        subject: `Digest ${v.from} : 1 avis pour vous`,
        body: `Bonjour cher abonné,

Le digest de cette semaine contient une entrée qui vous concerne et plusieurs centaines qui concernent quelqu’un d’autre.

Dans ce numéro :

1. ${v.id} · ${v.title} · ${Number(v.score).toFixed(1)} ${v.severity}
${v.what}

${v.exposed ? `Nos registres indiquent que vous l’utilisez dans ${v.exposed}. Patchez-le.` : 'Nous ne pouvons pas savoir d’ici si vous l’utilisez. Vérifiez si vous l’utilisez.'}

À la semaine prochaine,
La rédaction ${v.from}`,
      }),
      (v) => ({
        subject: `${v.id} (${Number(v.score).toFixed(1)})`,
        body: `${v.id} | ${Number(v.score).toFixed(1)} | ${v.severity} | ${v.title}
vous l’utilisez : ${v.exposed ?? 'inconnu. vérifiez si vous l’utilisez.'}
correctif : patch
plus : ${v.what}

-- 
Avis ${v.from}. texte brut. pas de HTML. pas d’excuses.`,
      }),
      (v) => ({
        subject: `URGENT !!! ${v.id} est ${String(v.severity).toUpperCase()}`,
        body: `Bon. Bon bon bon.

Arrêtez tout ce que vous faites. ${v.id} vient de tomber et c’est un ${Number(v.score).toFixed(1)} sur 10. ${v.title}. Relisez ça.

${v.what}

${v.exposed ? `Et oui, vous l’utilisez : ${v.exposed}. C’est vous. C’est votre nœud.` : 'Nous ne savons pas si vous l’utilisez. VOUS ne savez peut-être pas si vous l’utilisez. Vérifiez si vous l’utilisez, tout de suite, s’il vous plaît.'}

Patchez. Patchez vite. Patchez avec émotion.

En respirant dans un sac en papier,
L’équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Avis de divulgation, réf. ${v.id}`,
        body: `À qui de droit,

Conformément à la procédure de divulgation standard, ${v.from} notifie par la présente au destinataire la vulnérabilité ${v.id}, « ${v.title} », à laquelle a été attribué un score provisoire de ${Number(v.score).toFixed(1)} (${v.severity}), dans l’attente d’une analyse, elle-même en attente.

Résumé de la constatation : ${v.what}

Composant(s) concerné(s) : ${v.exposed ?? 'non déterminé. Il est conseillé au destinataire de vérifier s’il l’utilise.'}

Il est en outre conseillé au destinataire de patcher dès que possible, et plus tôt encore.

Cordialement,
Bureau de l’arriéré d’analyse, ${v.from}`,
      }),
    ],
    hire: [
      (v) => ({
        subject: `pouvons-nous parler de l'arriéré`,
        body: `hé,

rapide. le backlog compte ${v.backlog} éléments et je commence à reconnaître les tickets à leur odeur.

pouvons-nous embaucher un ingénieur supplémentaire ? je vais les intégrer. je leur donnerai même ma bonne chaise.

appuyez sur Approuver l’embauche si oui. Plus tard, c'est bien aussi, je suppose. je serai juste là. avec les billets.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Proposition : un ingénieur supplémentaire`,
        body: `Salut,

J'aimerais plaider en faveur d'une embauche.

Le problème : le backlog compte ${v.backlog} tâches et ne se vide pas tout seul.
La demande : recruter un ingénieur supplémentaire.
L’alternative : continuer comme maintenant, et recevoir d’autres courriels comme celui-ci.

Si vous êtes d'accord, approuvez l'embauche. Si ce n'est pas le moment, plus tard, et j'en reparlerai lorsque le nombre sera plus grand. Ce sera.

Merci,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `${v.backlog} éléments.`,
        body: `${v.backlog} éléments dans le backlog.

C'est tout. C'est l'e-mail.

Bon, encore une ligne : nous avons besoin d'un autre ingénieur. Approuvez l'embauche, ou plus tard si vous avez un plan que je ne connais pas. (Veuillez avoir un plan.)

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `J'ai compté l'arriéré (ne demande pas pourquoi)`,
        body: `Salut !

J'attendais donc un build et j'ai compté le retard. Il y a ${v.backlog} éléments. J'ai compté deux fois parce que je n'y croyais pas la première fois.

J'ai fait quelques calculs rapides, que je ne vous montrerai pas, car c'était surtout des soupirs. La version courte : il nous faut une autre paire de mains, idéalement attachée à un ingénieur.

Pouvons-nous en louer un ? Approuvez l'embauche et je commencerai la documentation d'intégration ce soir. Plus tard, et je le commencerai quand même, mais en plus triste.

Bravo,
${String(v.from).split(' ')[0]}

P.S. L'un des éléments est "nettoyer le backlog".`,
      }),
      (v) => ({
        subject: `Au nom de l'équipe : une embauche`,
        body: `Bonjour,

J'écris pour toute l'équipe, qui me l'a demandé car c'est moi qui tape le plus vite.

Nous sommes fiers de ce que nous avons livré, mais le backlog compte ${v.backlog} tâches et nous commençons à faire le tri dans nos opérations de tri. Un ingénieur de plus nous permettrait de terminer des projets au lieu de seulement les commencer.

Approuvez l’embauche et nous leur ferons sentir les bienvenus. Plus tard, et nous comprendrons. Surtout.

Meilleur,
${String(v.from).split(' ')[0]} (et tout le monde)`,
      }),
    ],
    ticket: [
      (v) => ({
        subject: `[Ticket #4096] "Est-ce que c'est censé être aussi lent ?"`,
        body: `Bonjour,

Un client a ouvert un ticket via ${v.from} :

> Salut ! J'adore l'application. J'ai cliqué sur Enregistrer, puis j'ai préparé un sandwich. Il enregistrait encore quand je suis revenu. C'était un bon sandwich. L'application est-elle correcte ?

Priorité : Normale
Statut : Ouvert
SLA : nous prenons vos retours au sérieux

Ce ticket se fermera automatiquement si personne ne répond, c'est ainsi que nous résolvons la plupart des problèmes.

${v.from}`,
      }),
      (v) => ({
        subject: `Nouvelle conversation : "chargement..."`,
        body: `Nouvelle conversation d'un client :

Client : bonjour
Client : la page est-elle censée se charger par étapes
Client : comme un diaporama
Client : je suis sur la diapositive 4
Bot : Merci de nous avoir contactés ! L'équipe répond généralement en quelques minutes.
Client : la page aussi

La conversation est toujours ouverte. Le client est toujours sur la diapositive 4.

${v.from}`,
      }),
      (v) => ({
        subject: `La principale plainte de cette semaine : la vitesse`,
        body: `Bonjour,

Votre résumé hebdomadaire de ${v.from}. Un thème est revenu plus que les autres : la lenteur.

Quelques faits saillants, légèrement modifiés :
- "J'ai rafraîchi tellement de fois que ma touche F5 brille maintenant."
- "Assez rapide pour être utilisé, assez lent pour être irrité."
- "Ma grand-mère m'a demandé si Internet était en panne. Ce n'était pas le cas. C'était juste votre application."

Nous les avons étiquetés « performance » et « s'il vous plaît ».

Meilleur,
L'équipe ${v.from}`,
      }),
      (v) => ({
        subject: `Escaladé : un client attend à la caisse`,
        body: `Bonjour,

Ce ticket est passé du niveau 1 au niveau 2, et du niveau 2 à vous.

Résumé client : un propriétaire de boulangerie qui essaie de vous donner de l'argent depuis un moment. Selon leurs mots : "J'ai fait lever une miche de pain entre le clic sur Payer et l'affichage du reçu. J'aimerais vous payer. S'il vous plaît, rendez-le plus facile."

Réponse recommandée : rendez-le plus rapide.

Cordialement,
Escalades ${v.from}`,
      }),
      (v) => ({
        subject: `Le ticket n° 8191 a été résolu (il ne l’a pas été)`,
        body: `Bonjour !

Le ticket n° 8191 d’un de vos clients a été marqué Résolu après trois jours sans réponse. Nous espérons que leur problème a été résolu !

Message original, pour mémoire :
> L'application est lente. Pas cassé, juste lent, comme s'il réfléchissait très attentivement à chaque clic. J'apprécie la prévenance des gens. Moins dans les applications.

Le client peut rouvrir le ticket et le fera probablement.

Nous prenons vos commentaires au sérieux,
${v.from}`,
      }),
      (v) => ({
        subject: `Une plainte très aimable`,
        body: `Salut,

En transmettant celui-ci de ${v.from}. C'est la plus belle plainte que nous ayons eue tout le mois :

> Bonjour ! Je ne veux pas être un ennui. L'application est devenue lente ces derniers temps et je me demandais si c'était moi. J'ai redémarré mon routeur, mon ordinateur portable et mon téléphone deux fois. C'est encore lent. Pas de précipitation ! (Un peu pressé.)

Notre tableau de bord indique que nous répondons généralement dans quelques jours. Nous vous suggérons de répondre plus tôt.

Cordialement,
${v.from}`,
      }),
    ],
    request: [
      (v) => ({
        subject: `Demande de fonctionnalité : ${v.feature}`,
        body: `Bonjour,

Je vous transmets ceci de la part d’un client qui nous paie plus que la plupart :

> Nous adorons le produit. Vraiment. Mais chaque semaine, notre équipe demande s’il peut faire ${v.feature}, et chaque semaine je dois répondre non et changer de sujet. Est-ce possible ?

C’est peu de chose pour vous, je pense, et beaucoup pour nous.

${v.from}`,
      }),
      (v) => ({
        subject: `« Avez-vous ${v.feature} ? » (demandé 41 fois)`,
        body: `Bonjour,

Nos journaux de recherche montrent la même question encore et encore : est-ce que ça fait ${v.feature} ?

Ceux qui la posent ne sont pas des touristes. Ils sont sur l’offre payante, ils ouvrent l’application tous les jours, et l’un d’eux porte notre logo sur un sweat à capuche.

Nous ne disons pas de le construire. Nous disons que nous cesserions d’en entendre parler.

Cordialement,
${v.from}`,
      }),
      (v) => ({
        subject: `Renouvellement bloqué sur ${v.feature}`,
        body: `Bonjour,

Un client dont le renouvellement est sur la table pose une seule condition avant de signer : ${v.feature}.

Ses mots exacts : « Nous ne demandons pas une feuille de route. Nous demandons si cela figure sur l’une d’elles. »

Un oui aiderait. Un peut-être aiderait aussi.

${v.from}`,
      }),
      (v) => ({
        subject: `La seule chose qu’ils veulent tous : ${v.feature}`,
        body: `Bonjour,

Nous étiquetons chaque ticket, et une étiquette est discrètement devenue la plus grosse :

${v.feature} — 41 tickets, pas de doublons, pas de robots.

Les clients sont polis à ce sujet, ce qui est pire. « Quand ce sera possible. » « Pas de hâte, mais bientôt. »

L’ajouter au backlog nous permettrait de leur dire quelque chose de vrai.

Bien à vous,
${v.from}`,
      }),
      (v) => ({
        subject: `Un client nous a écrit un cahier des charges pour ${v.feature}`,
        body: `Bonjour,

Un client a aimé le produit au point de nous écrire un cahier des charges : trois pages, des maquettes, un schéma dessiné à la main d’un parcours qu’il aimerait voir s’appeler ${v.feature}.

Il l’a terminé par « même une version approximative changerait notre semaine ».

Nous ne pouvons pas le construire pour lui. Vous pouvez décider si cela mérite sa place dans le backlog.

${v.from}`,
      }),
    ],
    churn: [
      (v) => ({
        subject: `${v.region} : des utilisateurs partent`,
        body: `Salut,

Les résiliations augmentent en ${v.region}. Vous y avez ${v.users} utilisateurs et vous en perdez ${v.perHour} par heure. À ce rythme, il vous en restera ${v.inADay} demain.

Ce dont ils se plaignent le plus :

${v.causes}

L’analyse de l’attrition liste chaque cause et le correctif de chacune.

${v.from}`,
      }),
      (v) => ({
        subject: `File du support : mécontentement en ${v.region}`,
        body: `Bonjour,

La file ${v.region} a doublé cette heure-ci. ${v.users} utilisateurs, ${v.perHour} de moins par heure, ${v.inADay} demain à la même heure si rien ne change.

Étiquettes principales :

${v.causes}

Ouvrez l’analyse de l’attrition pour voir ce qui les fera revenir.

${v.from}`,
      }),
    ],
    postmortem: [
      (v) => ({
        subject: `Analyse post-incident : ${v.incident} ?`,
        body: `Salut,

Tout est revenu à la normale. ${v.severity} ${v.incident} sur ${v.target}, ${v.mttr} pour rétablir, ${v.lostRevenue} de revenu perdu.

Quelqu’un doit l’écrire avant que les détails ne deviennent une légende. Je peux le faire maintenant, et je préfère le faire maintenant.

${v.action ? `L’élément de suivi évident est ${v.action}. Si vous le voulez, je consigne l’analyse et je mets l’étude dans la file d’un seul coup.` : 'Pas d’élément de suivi cette fois, ce qui est déjà un constat en soi.'}

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `${v.severity} ${v.incident} : le compte rendu`,
        body: `Bonjour,

L’incident est terminé. J’ai les chiffres sous les yeux et j’aimerais boucler tant qu’ils sont encore vrais :

Cible : ${v.target}
Durée : ${v.mttr}
Utilisateurs perdus : ${v.lostUsers}
Requêtes échouées : ${v.failed}

Consignez l’analyse et tout cela entre dans le dossier. Laissez tomber et nous la reconstituerons de mémoire dans une semaine, mal, autour d’un déjeuner.

Merci,
${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Avant que nous oubliions : ${v.incident}`,
        body: `Salut,

Nous sommes tous soulagés pour ${v.target}. Le soulagement est un très mauvais archiviste.

${v.incident}, ${v.mttr} de cela. ${v.action ? `Si nous consignons l’analyse, nous pouvons commencer ${v.action} tout de suite, et cela cesse d’être deux fois plus probable.` : 'Je pense toujours que cela mérite une page.'}

Dites un mot et c’est consigné.

${String(v.from).split(' ')[0]}`,
      }),
      (v) => ({
        subject: `Rapport d’incident : ${v.incident}`,
        body: `Équipe,

Résumé de ce qui vient de se passer, pour pouvoir y revenir plus tard sans en débattre.

Quoi : ${v.incident} (${v.severity})
Où : ${v.target}
Utilisateurs perdus : ${v.lostUsers}
Revenu perdu : ${v.lostRevenue}
Requêtes échouées : ${v.failed}

Je rédigerai tout proprement si vous consignez l’analyse. L’élément de suivi part dans la file d’étude et l’ensemble rejoint la ligne Incidents.

${String(v.from).split(' ')[0]}`,
      }),
    ],
    'away.finance': [
      (v) => ({
        subject: `Pendant votre absence : ${v.away}`,
        body: `Bonjour,

Vous êtes parti ${v.away}. Les comptes ont continué de tourner.

Utilisateurs : ${v.users}
Trésorerie : ${v.cash}
Études terminées : ${v.studied}
Heures de dev : ${v.devHours}

Rien n’a eu besoin d’une signature. C’est le mieux qu’on puisse dire de la plupart des journées.

${v.from}`,
      }),
      (v) => ({
        subject: `Rapproché : ${v.away} à ne rien faire`,
        body: `Salut,

Résumé des ${v.away} où vous n’étiez pas là :

- ${v.users} utilisateurs
- ${v.cash} de trésorerie
- ${v.studied} études terminées
- ${v.devHours} d’heures de dev mises de côté

Tout est rapproché au regret près.

${v.from}`,
      }),
      (v) => ({
        subject: `Vous étiez absent ${v.away}`,
        body: `Bonjour,

Note rapide pour le dossier : la société a tourné ${v.away} sans vous.

${v.users} utilisateurs maintenant. ${v.cash} en trésorerie. ${v.devHours} d’heures de dev réalisées par des gens qui n’ont pas pris leur journée.

Aucune facture n’a été maltraitée pendant votre absence.

${v.from}`,
      }),
    ],
    'away.monitoring': [
      (v) => ({
        subject: `Pendant votre absence : pic de ${v.peak} sur ${v.peakNode}`,
        body: `Bonjour,

Vous êtes parti ${v.away}. Voici ce qu’ont fait les cadrans.

Charge maximale : ${v.peak} sur ${v.peakNode}

${v.lost ? 'Nous avons perdu des utilisateurs pendant votre absence. Personne ne vous a appelé pour cela.' : 'Les utilisateurs sont restés, et aucun cadran n’a atteint sa limite.'}

Nous ne vous avons pas appelé. Nous y avons songé un instant, puis nous avons regardé votre agenda.

${v.from}`,
      }),
      (v) => ({
        subject: `Vos graphiques vous ont regretté (brouillon, non envoyé)`,
        body: `Salut,

J’ai rédigé quelques alertes pendant votre absence. Voici celle que je n’ai pas envoyée.

${v.away} d’absence. Charge de pointe ${v.peak} sur ${v.peakNode}. Rien n’a pris feu, même si un graphique est devenu assez chaud pour griller du pain.

Lisez ceci à la place d’une alerte et nous serons quittes.

${v.from}`,
      }),
    ],
    stall: [
      (v) => ({
        subject: `Impossible d’avancer : ${v.research}`,
        body: `${v.reason}

Toutes les études derrière elle attendent qu’elle avance. Corrigez la cause, ou ouvrez la Recherche pour faire monter une autre étude ou annuler celle-ci.`,
      }),
    ],
    easy: [
      (v) => ({
        subject: `Une horloge plus lente`,
        body: `Bonjour,

Votre pager a beaucoup sonné, et le tableau n’attend pas que vous l’ayez lu.

Le mode facile ajoute la pause et un réglage de la vitesse, pour arrêter l’horloge et réfléchir avant la prochaine alerte. Vous pouvez le désactiver à tout moment dans les Paramètres.

${v.from}`,
      }),
    ],
  },
  snippets: {
    patchTicket: (v) =>
      `Ticket ouvert : ${v.item}, ${v.cost} DH, échéance dans ${v.due}. En retard, il devient rouge sur le backlog de l'équipe ; une minute plus tard, il est exploité.`,
    recruiterHint: () => `P.S. L’un de vos ingénieurs a l’air prêt à écouter.`,
    realDemo: (v) => `P.S. Celle-ci est une vraie démo. Elle couvre ${v.research}.`,
  },
}
