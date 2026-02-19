"""add users and ownership

Revision ID: c3c39f1df0a8
Revises: 7ee3523d1a46
Create Date: 2026-02-19 00:39:49.519561

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3c39f1df0a8'
down_revision: Union[str, None] = '7ee3523d1a46'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)

    # 2) goals: add user_id + FK using batch mode (SQLite-safe)
    with op.batch_alter_table("goals") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            "fk_goals_user_id_users",
            "users",
            ["user_id"],
            ["id"],
            ondelete="CASCADE",
        )

    # 3) tasks: add user_id + FK using batch mode (SQLite-safe)
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            "fk_tasks_user_id_users",
            "users",
            ["user_id"],
            ["id"],
            ondelete="CASCADE",
        )



def downgrade() -> None:
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_constraint("fk_tasks_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("goals") as batch_op:
        batch_op.drop_constraint("fk_goals_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

