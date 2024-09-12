"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchRequestTable = exports.batchRequestStatusEnum = exports.companyTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.companyTable = (0, pg_core_1.pgTable)("company", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    jobs_url: (0, pg_core_1.text)("jobs_url").notNull(),
});
// export const popularityEnum = pgEnum('popularity', ['unknown', 'known', 'popular']);
exports.batchRequestStatusEnum = (0, pg_core_1.pgEnum)("status", [
    "validating",
    "failed",
    "in_progress",
    "finalizing",
    "completed",
    "expired",
    "cancelling",
    "cancelled",
]);
exports.batchRequestTable = (0, pg_core_1.pgTable)("batch_request", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .$onUpdateFn(() => new Date()),
    status: (0, exports.batchRequestStatusEnum)("status"),
});
