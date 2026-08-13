import { Identifier } from "../../shared/identifier";
import { RequestAction } from "../request-action";
export interface RequestActionRepository {
    append(action: RequestAction): Promise<void>;
    listByRequest(requestId: Identifier): Promise<RequestAction[]>;
}
