export default {
  namespace: 'UI',
  state: {
    defaultBeh: true,
    clickNext: false,
    clickPre: false,
  },

  effects: {},

  reducers: {
    reset(state, payload) {
      const { key } = payload.payload;
      state[key] = null;
      return state;
    },

    setValue(state, payload) {
      const { key, value } = payload.payload;
      state[key] = value;
      return state;
    },
  },
};
