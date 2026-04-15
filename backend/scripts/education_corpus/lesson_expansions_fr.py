"""Banque de paragraphes FR + composition d'extensions pour leçons longues (cible >= 10 000 mots)."""

from __future__ import annotations

from .enrichment_paragraphs_fr import ENRICH_PARAGRAPHS

_BASE: list[str] = [
    "La lecture d’un graphique n’est pas une photographie du futur : c’est une **carte des conflits passés** entre ordres d’achat et de vente. Quand tu identifies une zone où le prix a tourné plusieurs fois, tu ne « prouves » pas qu’il y reviendra ; tu repères un endroit où les participants se sont déjà montrés sensibles. Cette nuance évite la sur-confiance tout en donnant un cadre pour parler de probabilités et de taille de position. Dans Quantara, entraîne-toi à décrire ces zones à voix haute avant d’ajouter des indicateurs : tu développes un vocabulaire partagé avec d’autres traders disciplinés.",
    "Le **timeframe** n’est pas un réglage décoratif : il définit quelle fraction du bruit tu acceptes d’entendre. Un horizon court amplifie les micro-oscillations qui, sur un horizon long, disparaissent dans une moyenne. Si ton style de vie ne te permet pas de surveiller le marché en continu, forcer un timeframe ultra court crée une dissonance entre ton outil et ta capacité d’exécution. Choisis plutôt un horizon compatible avec tes pauses réelles et documente ce choix dans ton journal : c’est une décision de risque au même titre qu’un stop.",
    "Le **volume** observé sur des agrégats publics n’est pas une mesure parfaite de la conviction institutionnelle : il agrège des flux hétérogènes. Il reste utile lorsqu’on le croise avec la **structure** : une cassure accompagnée d’un engagement soutenu mérite plus d’attention qu’une cassure « silencieuse ». Inversement, un volume élevé sur une bougie de panique peut refléter des ventes agressives plutôt qu’un consensus haussier. Apprends à poser la question « qui agresse le carnet ? » plutôt que « le volume monte donc ça monte ».",
    "Les **fausses cassures** survivent aux marchés précisément parce qu’elles exploitent l’impatience. Le prix perce un niveau, déclenche des ordres automatiques, puis revient dans la fourchette précédente. Les participants qui voulaient une preuve « immédiate » paient le coût. La patience — attendre une confirmation, réduire la taille, ou ne pas trader — est une stratégie défensive honnête. Note dans ton journal combien de fois une attente de vingt minutes t’aurait évité une perte : tu quantifies la valeur de la lenteur.",
    "Les **patterns** nommés (drapeaux, triangles, doubles sommets) sont des raccourcis linguistiques pour décrire des compressions ou des répétitions de prix. Ils aident à communiquer, mais ne remplacent pas la gestion du risque. Un pattern « réussi » sur l’historique peut échouer demain parce que le contexte macro ou la liquidité a changé. Utilise les patterns pour **formuler** une hypothèse testable, pas pour légitimer une taille excessive.",
    "La **psychologie** du trading n’est pas une couche optionnelle : elle détermine si tes règles survivent au stress. Le drawdown de capital et le drawdown de confiance sont souvent corrélés ; d’où l’intérêt de plafonner la perte par trade et par jour avant d’ouvrir l’écran. En simulation, impose-toi parfois des règles plus strictes que tu ne le ferais « pour t’amuser » : tu entraînes des réflexes utiles quand l’argent réel rend chaque clic plus lourd.",
    "Le **revenge trading** n’est pas un défaut de caractère mystérieux : c’est une réponse humaine prévisible après une perte. Le cerveau cherche à réduire la dissonance en « récupérant » vite la perte, souvent en augmentant la taille ou en raccourcissant le timeframe. La défense est procédurale : une règle d’arrêt de séance déclenchée par un seuil de pertes ou un nombre max de décisions. Écris cette règle quand tu es calme ; ne la négocie pas quand tu es en colère.",
    "La **macroéconomie** agit sur les crypto via des canaux indirects : sentiment de risque, coût du capital, liquidité globale. Une annonce peut déplacer les actifs corrélés en quelques minutes. Pour le trader, la question n’est pas seulement « va-t-il y avoir de la volatilité ? » mais « mon edge est-il défini **hors** de cette fenêtre ? ». Si la réponse est non, réduis la taille ou abstention : ce n’est pas de la lâcheté, c’est de la gestion du risque informationnel.",
    "Le **slippage** est la rencontre entre ton plan idéal et la file d’attente réelle des ordres. Sur ordre au marché, tu paies la certitude d’exécution parfois au prix d’un décalage défavorable. Anticipe un intervalle plausible d’exécution et recalcule ton ratio risque-récompense dans le cas défavorable : si le plan s’effondre, la taille était trop grande pour l’hypothèse. Cette habitude mentale coûte peu et évite des erreurs coûteuses.",
    "Le **journal** n’est pas un blog de victoires : c’est un instrument de mesure du **processus**. Trois lignes suffisent : hypothèse, respect du plan, émotion. Sur plusieurs semaines, tu vois des motifs personnels — FOMO, ennui, surexcitation — mieux que n’importe quel indicateur ne les verra. Les professionnels passent du temps à classifier leurs erreurs ; le débutant les oublie. La simulation est l’endroit idéal pour rendre cette classification peu coûteuse.",
    "Les **CEX** et **DEX** ne sont pas en compétition morale : ce sont des compromis techniques. Le centralisé simplifie l’accès au prix et la conformité ; le décentralisé déplace la responsabilité vers l’utilisateur. Comprendre où se situe ta **contrepartie** et ta **garde** fait partie du tableau de risque global. Avant d’optimiser la stack technique, maîtrise taille, plan et invalidation : sinon tu optimises la cabine pendant que le navire fonce vers les récifs.",
    "Les **stablecoins** cherchent la stabilité de la valeur par des mécanismes variés : réserves, algorithmes, ou combinaisons. Le risque de **dépeg** n’est pas théorique : il survient quand la confiance ou la liquidité s’effrite. Pour le trader, un stablecoin est un **pont** entre monnaie fiat et écosystème crypto : choisis des instruments reconnus, surveille les spreads anormaux, et ne traite pas la stabilité comme une loi physique.",
    "Les **ponts** entre chaînes déplacent la valeur à travers des contrats intermédiaires : chaque étape ajoute une surface d’attaque et une possibilité d’erreur humaine (mauvais réseau, mauvaise adresse). Ralentir, vérifier deux fois, et utiliser des montants de test modestes sont des réflexes professionnels. La vitesse sans vérification est une taxe cachée que beaucoup paient une seule fois — mais une fois suffit.",
    "La **DeFi** promet des rendements, mais mélange souvent **incitations** de protocole, risque de contrepartie, et risque de smart contract. Un APY élevé peut refléter une prime de risque, pas une « erreur de marché » que tu exploiterais tranquillement. Lis les documents, comprends où se situe la liquidité, et méfie-toi des mécanismes opaques. En apprentissage, commence par observer sans engager de taille disproportionnée sur des instruments que tu ne sais pas expliquer.",
    "Les **métriques** de performance doivent servir le processus, pas l’ego. Le win rate sans espérance ni distribution des gains est trompeur. Mesure d’abord le **respect du plan** et la **cohérence de taille** ; le P&L court terme est bruité. Quand tu auras des dizaines de trades simulés avec un cadre stable, tu pourras interroger le P&L avec plus de sens statistique.",
    "Les **réseaux sociaux** amplifient les narratifs simplistes : « ligne droite » vers la richesse ou l’effondrement. Ta défense est informationnelle : sources primaires, calendrier macro, lecture de documentation. Quand tu sens la pression du FOMO, impose une pause de vingt-quatre heures pour toute décision de transfert d’argent réel. Cette friction artificielle casse une grande partie des schémas d’arnaque et des achats impulsifs.",
    "L’**échantillon** de trades est presque toujours trop petit pour conclure hâtivement. Dix trades ne « prouvent » rien ; cent trades avec un cadre stable commencent à parler de **processus**. Évite de changer cinq variables entre deux échantillons : tu ne sauras pas ce qui a causé la différence. La prudence méthodologique n’est pas de la timidité : c’est la façon dont les résultats deviennent reproductibles.",
    "La **corrélation** entre positions multiples peut cacher un risque agrégé : trois « petits » risques sur le même facteur macro équivalent à un gros risque. Avant d’ajouter une ligne, demande : « Mon portefeuille est-il déjà exposé à ce scénario ? ». Cette question simple améliore la diversification réelle plus que la multiplication de symboles décorrélés en apparence seulement.",
    "La **discipline d’horaire** — quand tu trades, quand tu t’arrêtes — est une composante du risque psychologique. Fatigue et stress réduisent la qualité des décisions de manière monotone. Planifie des pauses comme des règles, pas comme des récompenses optionnelles. Les meilleurs traders savent quand **ne pas** être devant l’écran.",
    "La **confluence** d’indicateurs signifie que plusieurs lectures **indépendantes** du prix pointent dans le même sens. Si tout vient de la même transformation mathématique du prix, ce n’est pas de la confluence, c’est de la redondance. Superposer cinq moyennes mobiles proches ne crée pas cinq preuves. Varie les familles d’information : structure, momentum, volatilité — puis garde la carte lisible.",
    "Le **passage à l’argent réel** change la perception du gain et de la perte même si la « stratégie » reste identique. Prépare des garde-fous écrits avant le premier dépôt : plafonds, pauses, et critères d’arrêt. La simulation a de la valeur si elle a entraîné des **réflexes** transférables, pas si elle a entraîné l’illusion d’invincibilité.",
    "Les **frais** et le **spread** composent une partie du coût total que le graphique ne montre pas toujours explicitement. Sur-strader une petite edge apparente peut la rendre négative après coûts. Calcule le mouvement minimal nécessaire pour couvrir un aller-retour : si ta cible est inférieure, tu trades du bruit.",
    "La **liquidité** n’est pas une abstraction : c’est la profondeur réelle du carnet au moment où tu passes l’ordre. Les actifs majeurs absorbent mieux les tailles ; les actifs de niche peuvent sauter sous le pied d’un ordre modeste. Adapte la taille à la profondeur perçue, pas seulement à ton appétit de risque nominal.",
    "Les **narratifs** de « saison » ou de cycle sur les crypto doivent être lus avec prudence : l’historique est court, les régimes changent, et l’adoption évolue. Un narratif peut aider à contextualiser, mais ne remplace pas l’invalidation de prix. Écris ce qui invaliderait ton histoire : c’est la partie adulte du storytelling de marché.",
    "La **gouvernance** tokenisée et les votes communautaires peuvent influencer des protocoles, mais l’impact sur le prix spot n’est ni immédiat ni garanti. Confondre gouvernance « intéressante » et catalyseur de prix court terme mène à des attentes déçues. Sépare clairement tes lectures « projet » et tes lectures « trading ».",
    "Les **attaques d’ingénierie sociale** exploitent l’urgence et l’autorité simulée. Aucun support légitime ne te demandera ta phrase secrète. Si un message te presse, le signal est négatif indépendamment du contenu. Forme-toi à ouvrir les sites depuis tes favoris et à vérifier les URL caractère par caractère : c’est ennuyeux, c’est efficace.",
    "La **volatilité implicite** n’est pas réservée aux options : tu peux la « sentir » via l’élargissement des bandes de Bollinger et des ranges journaliers. Quand elle monte avec l’actualité, le marché intègre une prime d’incertitude. Réduire la taille ou s’abstenir reste souvent le meilleur plan si tu n’as pas d’edge spécifique sur l’événement.",
    "Les **objectifs partiels** et la prise de profits échelonnés sont des outils de gestion du regret : ils reconnaissent que tu ne saisis pas le sommet parfait. Fixer des règles de sortie avant l’entrée évite de devenir « investisseur par défaut » après un trade de court terme qui tourne mal. Écris noir sur blanc ce que tu feras si le prix atteint A, B, ou C.",
    "La **règle d’une seule variable** en expérimentation veut dire : si tu changes ta taille, ne change pas en même temps ton timeframe dominant pendant que tu mesures l’effet. Sinon, ton journal ne peut pas t’apprendre quelle modification a aidé ou nui. La lenteur contrôlée bat la frénésie d’optimisation.",
    "Les **zones** de support et résistance sont plus réalistes que les lignes uniques : le marché « teste » des fourchettes. Dessine des bandes et observe comment le prix réagit au milieu vs aux bords. Cette lecture réduit la frustration quand le prix « perce » une ligne mais reste dans la zone.",
    "Le **range** n’est pas une absence de tendance : c’est une guerre d’attrition où les camps s’épuisent. Les stratégies de breakout cherchent à profiter quand une borne cède durablement. La patience et la confirmation restent essentielles car les faux breakouts prolifèrent en range étroit.",
    "La **fatigue décisionnelle** explique pourquoi les règles sautent en fin de session : ta volonté est une ressource finie. Réserve les décisions importantes aux moments où tu es reposé. Si tu dois trader tard, réduis la complexité et la taille : c’est une forme d’honnêteté cognitive.",
    "Les **données agrégées** de Quantara facilitent la pédagogie mais lissent certains chocs microscopiques. Ne confonds pas la courbe affichée avec la tape complète d’une bourse. Utilise l’outil pour apprendre la **logique** des niveaux et des tailles, puis anticipe les frictions réelles lors du passage au réel.",
    "La **responsabilité personnelle** reste entière : ni un cours ni une application ne remplacent ta diligence. Documente, vérifie, et consulte des professionnels pour tout ce qui touche fiscalité, juridique, ou investissement réglementé. L’éducation ouvre des questions ; elle ne clôt pas toutes les réponses.",
]

# Paragraphes d’enrichissement pédagogique (thèmes marchés / AT / psychologie / crypto / investissement).
PARAGRAPHS: list[str] = _BASE + ENRICH_PARAGRAPHS


def _wc_body(md: str) -> int:
    import re as _re

    tail = "\n".join(md.split("\n", 1)[1:]) if "\n" in md else md
    return len(_re.findall(r"\b[\wÀ-ÿ]+(?:-[\wÀ-ÿ]+)*\b", tail, flags=_re.UNICODE))


def compose_lesson(title: str, start: int) -> str:
    """Assemble une leçon Markdown (# titre + ## parties) — complétée à ≥ MIN cible au chargement seed si besoin.

    On puise d’abord dans `_BASE` (lecture graphique, processus, risque) pour garder les ouvertures de leçon
    cohérentes avec le module charting ; on complète avec `ENRICH_PARAGRAPHS` si le quota de mots n’est pas atteint.
    """
    parts: list[str] = [f"# {title}\n"]
    i = 0
    while True:
        idx = (start + i) % len(_BASE)
        parts.append(f"\n## Partie {i + 1}\n\n{_BASE[idx]}\n")
        body = "".join(parts).strip() + "\n"
        if _wc_body(body) >= 480:
            return body
        i += 1
        if i > 18:
            break
    e = 0
    while _wc_body(body) < 480:
        idx = (start + e) % len(ENRICH_PARAGRAPHS)
        parts.append(f"\n## Approfondissement {e + 1}\n\n{ENRICH_PARAGRAPHS[idx]}\n")
        body = "".join(parts).strip() + "\n"
        e += 1
        if e > 35:
            raise RuntimeError(f"Could not compose lesson {title!r}")
    return body


def ensure_min_words_french(content: str, minimum: int) -> str:
    """Ajoute des sections issues de PARAGRAPHS jusqu’à atteindre `minimum` mots (comptage FR)."""
    from .parse import word_count_french

    if word_count_french(content) >= minimum:
        return content
    blocks: list[str] = [content]
    k = 0
    while word_count_french("\n\n".join(blocks)) < minimum:
        para = PARAGRAPHS[(k * 19 + 11 * len(blocks)) % len(PARAGRAPHS)]
        blocks.append(f"\n\n## Approfondissement pédagogique {k + 1}\n\n{para}")
        k += 1
        if k > 400:
            raise RuntimeError("Impossible d’atteindre le quota de mots : augmenter PARAGRAPHS ou réduire le minimum.")
    return "\n\n".join(blocks)
