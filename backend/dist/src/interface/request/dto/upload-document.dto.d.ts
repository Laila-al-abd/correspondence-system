import { DocKind } from '../../../domain/request/enums';
export declare class UploadDocumentDto {
    fileName: string;
    mimeType: string;
    contentBase64: string;
    docKind?: DocKind;
    requestActionId?: string;
    ocrText?: string;
}
