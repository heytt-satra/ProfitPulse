"""AST-based SQL validation utilities for safe NL-to-SQL execution."""

from dataclasses import dataclass
from typing import Iterable, List

try:
    import sqlglot
    from sqlglot import exp
    SQLGLOT_AVAILABLE = True
except ModuleNotFoundError:  # pragma: no cover - environment fallback
    sqlglot = None  # type: ignore[assignment]
    exp = None  # type: ignore[assignment]
    SQLGLOT_AVAILABLE = False


class SQLValidationError(ValueError):
    pass


@dataclass
class ValidatedSQL:
    sql: str
    source_tables: List[str]
    warnings: List[str]


if SQLGLOT_AVAILABLE:
    READ_ONLY_ROOTS = (exp.Select, exp.With, exp.Union)
    DANGEROUS_EXPRESSIONS = (
        exp.Delete,
        exp.Insert,
        exp.Update,
        exp.Drop,
        exp.Alter,
        exp.Create,
        exp.TruncateTable,
        exp.Command,
    )


def _has_workspace_scope(where_clause):
    if where_clause is None:
        return False
    for column in where_clause.find_all(exp.Column):
        if column.name and column.name.lower() == "workspace_id":
            return True
    return False


def _collect_table_names(expression) -> List[str]:
    table_names: list[str] = []
    for table in expression.find_all(exp.Table):
        if table.name:
            table_names.append(table.name.lower())
    return sorted(set(table_names))


def _enforce_allowlist(table_names: Iterable[str], allowlist: Iterable[str]) -> None:
    allowed = {name.lower() for name in allowlist}
    unknown = [name for name in table_names if name.lower() not in allowed]
    if unknown:
        raise SQLValidationError(f"Query references disallowed tables: {', '.join(sorted(unknown))}")


def _enforce_workspace_filter(expression) -> None:
    # Require workspace filters on each SELECT touching base tables.
    for select in expression.find_all(exp.Select):
        tables = list(select.find_all(exp.Table))
        if not tables:
            continue
        if not _has_workspace_scope(select.args.get("where")):
            raise SQLValidationError("Each SELECT touching data tables must include a workspace_id filter.")


def _enforce_single_statement(sql: str):
    expressions = sqlglot.parse(sql)
    if len(expressions) != 1:
        raise SQLValidationError("Only one SQL statement is allowed.")
    expression = expressions[0]
    if expression is None:
        raise SQLValidationError("Unable to parse SQL.")
    return expression


def validate_and_normalize_sql(
    sql: str,
    allow_tables: Iterable[str],
    max_rows: int = 200,
) -> ValidatedSQL:
    if not sql or not sql.strip():
        raise SQLValidationError("Generated SQL is empty.")

    if not SQLGLOT_AVAILABLE:
        sql_upper = sql.upper().strip()
        if not (sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")):
            raise SQLValidationError("Only read-only SELECT queries are allowed.")
        for keyword in ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE", ";"]:
            if keyword in sql_upper:
                raise SQLValidationError("Potentially unsafe SQL detected.")
        if "WORKSPACE_ID" not in sql_upper:
            raise SQLValidationError("Query must include workspace_id filter.")

        return ValidatedSQL(
            sql=sql.strip(),
            source_tables=[],
            warnings=["sqlglot is not installed; using fallback validator."],
        )

    expression = _enforce_single_statement(sql)

    if not isinstance(expression, READ_ONLY_ROOTS):
        raise SQLValidationError("Only read-only SELECT queries are allowed.")

    if expression.find(*DANGEROUS_EXPRESSIONS):
        raise SQLValidationError("Write or DDL operations are not allowed.")

    source_tables = _collect_table_names(expression)
    if not source_tables:
        raise SQLValidationError("Query must reference at least one allowed table.")

    _enforce_allowlist(source_tables, allow_tables)
    _enforce_workspace_filter(expression)

    warnings: list[str] = []

    # Ensure bounded results to reduce blast radius and accidental heavy scans.
    if not expression.args.get("limit"):
        expression.set("limit", exp.Limit(expression=exp.Literal.number(max_rows)))
        warnings.append(f"Applied default LIMIT {max_rows}.")

    return ValidatedSQL(
        sql=expression.sql(dialect="postgres"),
        source_tables=source_tables,
        warnings=warnings,
    )
