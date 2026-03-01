import pytest

from app.utils.sql_validator import SQLValidationError, validate_and_normalize_sql


ALLOWLIST = {
    "fact_daily_financials",
    "chat_history",
}


def test_accepts_read_only_scoped_query():
    sql = "SELECT date, revenue_net FROM fact_daily_financials WHERE workspace_id = 'abc' ORDER BY date DESC"
    validated = validate_and_normalize_sql(sql, allow_tables=ALLOWLIST, max_rows=100)
    assert "SELECT" in validated.sql.upper()
    assert validated.source_tables == ["fact_daily_financials"]


def test_rejects_non_read_only_query():
    with pytest.raises(SQLValidationError):
        validate_and_normalize_sql(
            "DELETE FROM fact_daily_financials WHERE workspace_id = 'abc'",
            allow_tables=ALLOWLIST,
        )


def test_rejects_missing_workspace_filter():
    with pytest.raises(SQLValidationError):
        validate_and_normalize_sql(
            "SELECT * FROM fact_daily_financials",
            allow_tables=ALLOWLIST,
        )


def test_rejects_disallowed_table():
    with pytest.raises(SQLValidationError):
        validate_and_normalize_sql(
            "SELECT * FROM users WHERE workspace_id = 'abc'",
            allow_tables=ALLOWLIST,
        )
