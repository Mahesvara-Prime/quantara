"""SQLAlchemy models for market_data (MVP: no persisted market tables).

Spot prices and candles are fetched on demand from the configured provider.
Future: optional Asset / MarketSnapshot entities if caching is introduced.
"""
