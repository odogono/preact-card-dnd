import createStore from "unistore";

export const store = createStore({
  isVisible: true,
  tableDims: [0, 0, 0, 0]
});

export const actions = store => ({
  /**
   *
   */
  updateCardTableBounds(state, x, y, width, height) {
    return {
      tableDims: [x, y, width, height]
    };
  }
});
