import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("finance_requests", (table) => {
        table.json("ai_notes").nullable().comment("Hasil analisis dari Gemini AI");
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("finance_requests", (table) => {
        table.dropColumn("ai_notes");
    });
}
