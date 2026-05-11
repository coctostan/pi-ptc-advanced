export interface ResponseHandle {
  kind: "response";
  responseId: string;
}

export interface FileHandle {
  kind: "file";
  filePath: string;
}

export type SupportedHandle = ResponseHandle | FileHandle;
