"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyUrls = getCompanyUrls;
exports.createBatchRequest = createBatchRequest;
const _1 = require(".");
const schema_1 = require("./schema");
function getCompanyUrls() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _1.db.query.companyTable.findMany();
    });
}
function createBatchRequest(request_id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield _1.db.insert(schema_1.batchRequestTable).values({
            id: request_id,
            status: "validating",
        });
    });
}
