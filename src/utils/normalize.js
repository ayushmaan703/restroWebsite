export const unwrap = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.result)) return data.result;
  if (data && Array.isArray(data.Result)) return data.Result;
  if (data && typeof data === 'object') {
    for (const key of ['items', 'Items', 'rows', 'Rows', 'records', 'Records']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return data ?? [];
};

export const asArray = (data) => (Array.isArray(data) ? data : data ? [data] : []);

export const value = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') return obj[key];
  }
  return fallback;
};

export const toNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

export const normalizeTable = (row, index) => {
  const availability = String(value(row, ['Avilability', 'Availability', 'availability'], '')).toUpperCase();
  const status = String(value(row, ['Status', 'TableStatus', 'status'], '0'));

  return {
    id: String(value(row, ['ID', 'Id', 'TableId', 'TableID', 'id'], index + 1)),
    tableNo: value(row, ['TableNo', 'TableName', 'Table', 'Tableno', 'tableNo'], `Table ${index + 1}`),
    sectionId: String(value(row, ['SectionId', 'SectionID', 'sectionId'], '0')),
    section: value(row, ['SectionName', 'Section', 'sectionName'], ''),
    floorId: String(value(row, ['FloorId', 'FloorID', 'floorId'], '0')),
    floor: value(row, ['FloorName', 'Floor', 'floorName'], ''),
    capacity: toNumber(value(row, ['Capacity', 'capacity'], 0)),
    status,
    availability: availability || (status === '1' ? 'OCCUPIED' : 'AVAILABLE'),
    raw: row,
  };
};

export const normalizeCategory = (row, index) => ({
  id: String(value(row, ['CategoryId', 'CategoryID', 'MenuCategoryId', 'id'], index)),
  name: value(row, ['Category', 'CategoryName', 'Name', 'categoryName'], `Category ${index + 1}`),
  raw: row,
});

export const normalizeMenuItem = (row, index) => ({
  id: String(value(row, ['ItemId', 'ItemID', 'MenuId', 'MenuID', 'id'], index + 1)),
  name: value(row, ['Item', 'ItemName', 'MenuName', 'Menu', 'Name', 'menuName'], `Item ${index + 1}`),
  price: toNumber(value(row, ['SellPriceWithGst', 'SellPrice', 'Rate', 'Price', 'Amount'], 0)),
  priceWithoutGst: toNumber(value(row, ['SellPrice', 'Amount_WithoutGst', 'Rate', 'Price'], 0)),
  gst: toNumber(value(row, ['GstAmt', 'GST', 'Gst'], 0)),
  category: value(row, ['Category'], ''),
  categoryId: String(value(row, ['CategoryId', 'CategoryID', 'categoryId'], '0')),
  description: value(row, ['Description', 'Desc', 'description'], ''),
  image: value(row, ['Image', 'ImageUrl', 'ImageURL', 'Photo', 'PhotoUrl', 'image', 'imageUrl'], ''),
  raw: row,
});

export const normalizeOrderSummary = (row, index) => ({
  transid: String(value(row, ['transid', 'TransId', 'TransID'], '')),
  orderNo: String(value(row, ['OrderNo', 'OrderNumber', 'orderNo'], '')),
  tableNo: value(row, ['TableNo', 'tableNo'], ''),
  tableId: String(value(row, ['tableid', 'TableId', 'TableID'], '')),
  qty: toNumber(value(row, ['Qty', 'Quantity', 'qty'], 0)),
  amount: toNumber(value(row, ['Amount', 'Total', 'total'], 0)),
  discount: toNumber(value(row, ['Discount', 'discount'], 0)),
  orderBy: value(row, ['OrderBy', 'orderBy'], ''),
  orderedTime: value(row, ['OrderedTime', 'orderTime'], ''),
  doneBy: value(row, ['DoneBy', 'doneBy'], ''),
  doneTime: value(row, ['DoneTime', 'doneTime'], ''),
  status: value(row, ['Status', 'OrderStatus', 'status'], ''),
  raw: row,
  index,
});

export const normalizeOrderItem = (row, index) => ({
  key: String(value(row, ['trans3id', 'Trans3Id', 'id', 'Id', 'DetailId', 'OrderDetailId'], index)),
  trans3id: String(value(row, ['trans3id', 'Trans3Id'], '')),
  menuId: String(value(row, ['ItemId', 'ItemID', 'MenuId', 'MenuID'], '')),
  name: value(row, ['Item', 'ItemName', 'MenuName', 'Menu', 'Name'], 'Item'),
  qty: toNumber(value(row, ['Qty', 'Quantity', 'qty'], 1), 1),
  price: toNumber(value(row, ['Amount', 'SellPriceWithGst', 'Rate', 'Price'], 0)),
  priceWithoutGst: toNumber(value(row, ['Amount_WithoutGst', 'SellPrice', 'Rate', 'Price'], 0)),
  gst: toNumber(value(row, ['GstAmt', 'GST', 'Gst'], 0)),
  kitchenStatus: value(row, ['KitchenStatus', 'Kitchenstatus'], 'New'),
  raw: row,
});

export const isOccupied = (table) => {
  if (!table) return false;
  const availability = String(table.availability ?? '').toLowerCase();
  const status = String(table.status ?? '').toLowerCase();
  return availability === 'occupied' || status === '1' || status === 'occupied';
};
