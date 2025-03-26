export function updateProp(props, payload) {
  const vvv = payload.value;
  for (var k in vvv) {
    props[k] = vvv[k];
  }
}
