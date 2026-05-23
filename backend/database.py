import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from auth import hash_password


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "smart_learning_assistant.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            upload_time TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT,
            created_at TEXT
        )
        """
    )

    user_columns = [row["name"] for row in cursor.execute("PRAGMA table_info(users)").fetchall()]
    if "password_hash" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
    if "created_at" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN created_at TEXT")

    admin_user = cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@student.com",)).fetchone()
    if admin_user:
        cursor.execute(
            """
            UPDATE users
            SET name = ?, password_hash = COALESCE(password_hash, ?), created_at = COALESCE(created_at, ?)
            WHERE email = ?
            """,
            ("Admin Student", hash_password("admin123"), datetime.utcnow().isoformat(), "admin@student.com"),
        )
    else:
        cursor.execute(
            """
            INSERT INTO users (email, name, password_hash, created_at)
            VALUES (?, ?, ?, ?)
            """,
            ("admin@student.com", "Admin Student", hash_password("admin123"), datetime.utcnow().isoformat()),
        )

    connection.commit()
    connection.close()


def create_uploaded_file(filename: str, filepath: str, file_size: int) -> dict[str, Any]:
    connection = get_connection()
    cursor = connection.cursor()
    upload_time = datetime.utcnow().isoformat()
    cursor.execute(
        """
        INSERT INTO uploaded_files (filename, filepath, file_size, upload_time)
        VALUES (?, ?, ?, ?)
        """,
        (filename, filepath, file_size, upload_time),
    )
    file_id = cursor.lastrowid
    connection.commit()
    row = cursor.execute("SELECT * FROM uploaded_files WHERE id = ?", (file_id,)).fetchone()
    connection.close()
    return dict(row) if row else {}


def get_uploaded_file(file_id: int) -> dict[str, Any] | None:
    connection = get_connection()
    row = connection.execute("SELECT * FROM uploaded_files WHERE id = ?", (file_id,)).fetchone()
    connection.close()
    return dict(row) if row else None


def list_recent_files(limit: int = 3) -> list[dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute(
        """
        SELECT * FROM uploaded_files
        ORDER BY datetime(upload_time) DESC, id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    connection.close()
    return [dict(row) for row in rows]


def create_chat_history(module: str, question: str, answer: str) -> None:
    connection = get_connection()
    connection.execute(
        """
        INSERT INTO chat_history (module, question, answer, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (module, question, answer, datetime.utcnow().isoformat()),
    )
    connection.commit()
    connection.close()


def get_user_by_email(email: str) -> dict[str, Any] | None:
    connection = get_connection()
    row = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    connection.close()
    return dict(row) if row else None


def get_user_by_id(user_id: int) -> dict[str, Any] | None:
    connection = get_connection()
    row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    connection.close()
    return dict(row) if row else None


def create_user(email: str, name: str, password: str) -> dict[str, Any]:
    connection = get_connection()
    cursor = connection.cursor()
    created_at = datetime.utcnow().isoformat()
    password_hash = hash_password(password)
    cursor.execute(
        """
        INSERT INTO users (email, name, password_hash, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (email, name, password_hash, created_at),
    )
    user_id = cursor.lastrowid
    connection.commit()
    row = cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    connection.close()
    return dict(row) if row else {}


def get_dashboard_stats() -> dict[str, Any]:
    connection = get_connection()
    total_files = connection.execute("SELECT COUNT(*) AS count FROM uploaded_files").fetchone()["count"]
    questions_asked = connection.execute("SELECT COUNT(*) AS count FROM chat_history WHERE module = 'learning_qa'").fetchone()["count"]
    total_interactions = connection.execute("SELECT COUNT(*) AS count FROM chat_history").fetchone()["count"]
    recent_activity = connection.execute(
        """
        SELECT module, question, created_at
        FROM chat_history
        ORDER BY datetime(created_at) DESC, id DESC
        LIMIT 8
        """
    ).fetchall()
    recent_uploads = connection.execute(
        """
        SELECT filename, upload_time
        FROM uploaded_files
        ORDER BY datetime(upload_time) DESC, id DESC
        LIMIT 7
        """
    ).fetchall()
    connection.close()

    activity_map: dict[str, int] = {}
    for row in recent_uploads:
        label = datetime.fromisoformat(row["upload_time"]).strftime("%b %d")
        activity_map[label] = activity_map.get(label, 0) + 1

    upload_activity = [{"label": label, "count": count} for label, count in activity_map.items()]

    return {
        "total_files_uploaded": total_files,
        "questions_asked": questions_asked,
        "total_interactions": total_interactions,
        "last_uploaded_files": list_recent_files(3),
        "recent_activity": [dict(row) for row in recent_activity],
        "upload_activity": upload_activity,
    }
