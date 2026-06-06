import { generateKeyBetween } from "fractional-indexing";

export const getNewOrderKey = (items, activeIndex, overIndex) => {
  const isMovingDown = activeIndex < overIndex;
  let prevKey = null;
  let nextKey = null;

  if (isMovingDown) {
    prevKey = items[overIndex].orderKey;
    nextKey =
      overIndex + 1 < items.length ? items[overIndex + 1].orderKey : null;
  } else {
    prevKey = overIndex - 1 >= 0 ? items[overIndex - 1].orderKey : null;
    nextKey = items[overIndex].orderKey;
  }

  return generateKeyBetween(prevKey, nextKey);
};

export const getAppendOrderKey = (items) => {
  if (!items || items.length === 0) {
    return generateKeyBetween(null, null);
  }
  const lastKey = items[items.length - 1].orderKey;
  return generateKeyBetween(lastKey, null);
};

export const assignInitialOrderKeys = (rawSchedule) => {
  let currentKey = null;
  return rawSchedule.map((item) => {
    currentKey = generateKeyBetween(currentKey, null);
    return { ...item, orderKey: currentKey };
  });
};
