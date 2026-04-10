"""Pure helpers for progress percentages (dynamic aggregation)."""


def progress_percentage(completed: int, total: int) -> float:
    """Return a 0–100 float; 0 if there is nothing to complete."""
    if total <= 0:
        return 0.0
    return round(100.0 * completed / total, 2)


def course_is_completed(progress_percent: float) -> bool:
    """Treat full completion at 100%."""
    return progress_percent >= 100.0
