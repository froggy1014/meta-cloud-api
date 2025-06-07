import MediaApi from './MediaApi';

// 기본 export 유지
export default MediaApi;

// 명시적 named export
export { MediaApi };

// 필요한 타입만 명시적으로 export
export type { MediaClass, MediaResponse, MediasResponse, UploadMediaResponse } from './types';
