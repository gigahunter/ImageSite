const umirc = require("./.umirc").default;

const projFile = "./projs/prod.js";
const js = `import proj from '.${projFile}';

export default proj;
`;

const fs = require("fs");
fs.writeFile("./src/config.js", js, function(err) {
  if (err) {
    throw err;
  }
});

export default umirc;
