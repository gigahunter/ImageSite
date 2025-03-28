export const colors = {
  blue: {
    deep: "rgb(0, 121, 191)",
    light: "lightblue",
    lighter: "#d9fcff",
    soft: "#E6FCFF"
  },
  black: "#4d4d4d",
  shadow: "rgba(0,0,0,0.2)",
  grey: {
    darker: "#C1C7D0",
    dark: "#E2E4E6",
    medium: "#DFE1E5",
    N30: "#EBECF0",
    light: "#F4F5F7"
  },
  green: "rgb(185, 244, 100)",
  white: "white",
  purple: "rebeccapurple"
};

export const grid = 8;

export const borderRadius = 2;

export const confirmYes = "確定";
export const confirmNo = "取消";

const CONST = {};

export function setValue(key, value) {
  CONST[key] = value;
}

export function find(key, prop, value) {
  const obj = CONST[key];

  if (!obj) return obj;

  if (obj.find) {
    return obj.find(elm => elm[prop] === value);
  }

  return null;
}

export default CONST;
