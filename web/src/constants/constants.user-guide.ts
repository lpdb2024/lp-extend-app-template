/**
 * User Guide Constants
 */

const BASE = "api/user-guides";

export const USER_GUIDE_ROUTES = {
  BASE,
  GUIDE: (id: string) => `${BASE}/${id}`,
  BY_ROUTE: (routeName: string) => `${BASE}/route/${routeName}`,
  SEARCH: `${BASE}/search`,
  SECTIONS: (guideId: string) => `${BASE}/${guideId}/sections`,
  SECTION: (guideId: string, sectionId: string) =>
    `${BASE}/${guideId}/sections/${sectionId}`,
  REORDER_SECTIONS: (guideId: string) =>
    `${BASE}/${guideId}/sections/reorder`,
  UPLOAD_IMAGE: `${BASE}/upload-image`,
};

export enum USER_GUIDE_ACTION_KEYS {
  LIST_GUIDES = "USER_GUIDE_LIST",
  GET_GUIDE = "USER_GUIDE_GET",
  GET_GUIDE_BY_ROUTE = "USER_GUIDE_GET_BY_ROUTE",
  CREATE_GUIDE = "USER_GUIDE_CREATE",
  UPDATE_GUIDE = "USER_GUIDE_UPDATE",
  DELETE_GUIDE = "USER_GUIDE_DELETE",
  SEARCH_GUIDES = "USER_GUIDE_SEARCH",
  ADD_SECTION = "USER_GUIDE_ADD_SECTION",
  UPDATE_SECTION = "USER_GUIDE_UPDATE_SECTION",
  DELETE_SECTION = "USER_GUIDE_DELETE_SECTION",
  REORDER_SECTIONS = "USER_GUIDE_REORDER_SECTIONS",
  UPLOAD_IMAGE = "USER_GUIDE_UPLOAD_IMAGE",
}
