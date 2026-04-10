"""Pure insight rules — no database or HTTP."""

from __future__ import annotations

from dataclasses import dataclass

from app.modules.insights.schemas import InsightItemResponse


@dataclass(frozen=True)
class InsightSignals:
    """Inputs derived in the service from simulation + progress."""

    total_pnl_usd: float
    trade_count: int
    open_position_count: int
    completed_lesson_count: int
    trades_without_stop_loss: int
    recent_sell_streak: int  # consecutive sells from newest trades (same symbol optional — here: count sells in last 5)


def build_insights(sig: InsightSignals) -> list[InsightItemResponse]:
    """Apply simple heuristics; order is stable (severity high first)."""
    out: list[InsightItemResponse] = []

    if sig.completed_lesson_count >= 1 and sig.trade_count == 0:
        out.append(
            InsightItemResponse(
                type="learning_without_trading",
                title="Passer à la pratique",
                message="Vous avez complété des leçons mais n’avez pas encore exécuté de trade simulé. "
                "Essayez un petit ordre pour appliquer ce que vous apprenez.",
                severity="low",
            )
        )

    if sig.trade_count >= 5 and sig.completed_lesson_count < 2:
        out.append(
            InsightItemResponse(
                type="trading_without_learning",
                title="Renforcer les bases",
                message="Vous tradez souvent côté simulation. Quelques leçons peuvent aider à structurer vos décisions.",
                severity="low",
            )
        )

    if sig.total_pnl_usd < 0 and sig.trade_count >= 2:
        out.append(
            InsightItemResponse(
                type="portfolio_drawdown",
                title="P&L latent négatif",
                message="Votre portefeuille papier est en retrait par rapport au prix de marché des positions ouvertes. "
                "Revoyez taille de position et exposition.",
                severity="medium",
            )
        )

    if sig.recent_sell_streak >= 3 and sig.trade_count >= 3:
        out.append(
            InsightItemResponse(
                type="frequent_exits",
                title="Sorties fréquentes",
                message="Plusieurs ventes récentes d’affilée : vérifiez si vous réagissez trop vite au bruit court terme.",
                severity="low",
            )
        )

    if sig.trades_without_stop_loss >= 3 and sig.trade_count >= 3:
        out.append(
            InsightItemResponse(
                type="no_stop_loss",
                title="Pas de stop-loss renseigné",
                message="Vos trades n’ont pas de niveau de stop-loss enregistré. Définir un plan de sortie réduit l’improvisation.",
                severity="medium",
            )
        )

    if sig.open_position_count == 1 and sig.trade_count >= 3:
        out.append(
            InsightItemResponse(
                type="single_asset_focus",
                title="Concentration sur un actif",
                message="Une seule position ouverte avec plusieurs opérations : la diversification peut lisser le risque.",
                severity="low",
            )
        )

    # Sort: high > medium > low
    rank = {"high": 0, "medium": 1, "low": 2}
    out.sort(key=lambda x: rank[x.severity])
    return out
