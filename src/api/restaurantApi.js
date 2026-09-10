import axiosInstance from "./axiosInstance";

const comid = import.meta.env.VITE_DEFAULT_COMID || "1";
const get = (url, params = {}) => axiosInstance.get(url, { params });

export const api = {
  login: ({ username, password, Comid = comid }) =>
    get("/Login", { Username: username, password, Comid }),

  getSections: (Comid = comid) => get("/GetSectionMaster", { Comid }),
  getFloors: (Comid = comid) => get("/GetFloorMaster", { Comid }),

  getTables: ({ Comid = comid, SectionId = 0, FloorId = 0 } = {}) =>
    get("/GetTableDetail", { Comid, SectionId, FloorId }),

  getTableCount: (Comid = comid) => get("/GetTableCount", { Comid }),
  getTodaysCount: (Comid = comid) => get("/GetTodaysCount", { Comid }),

  // typ=4: running, typ=5: completed
  getTableOrders: ({ Comid = comid, typ = 4 } = {}) =>
    get("/GetTableOrderDetail", { Comid, typ }),

  getCategories: (Comid = comid) => get("/GetMenuCategory", { Comid }),

  // CategoryId=0 means all menu items. Otherwise pass a CategoryId from GetMenuCategory.
  getMenu: ({ Comid = comid, CategoryId = 0 } = {}) =>
    get("/GetMenuList", { Comid, CategoryId }),

  // New order: transid=0 and OrderNo=,,. Subsequent items use the returned transId/OrderNo.
  addOrder: ({
    transid = 0,
    OrderNo = ",,",
    tableId,
    Comid = comid,
    Uid = 1,
    MenuId,
    Qty = 1,
  }) =>
    get("/AddOrder", {
      transid,
      OrderNo,
      TableId: tableId,
      Comid,
      Uid,
      MenuId,
      Qty,
    }),

  getOrderDetail: ({ transid, Comid = comid }) =>
    get("/GetOrderdetail", { transid, Comid }),

  deleteOrderEntry: ({ trans3id, Uid = 1 }) =>
    get("/DeleteOrderEntry", { trans3id, Uid }),
};
