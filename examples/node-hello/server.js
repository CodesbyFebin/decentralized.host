const http = require("http");

const PORT = process.env.PORT || 8080;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from the decentralized.host mesh (Node.js)!" }));
  })
  .listen(PORT, () => console.log(`listening on ${PORT}`));
