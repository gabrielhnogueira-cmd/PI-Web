const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ erro: 'Rota nao encontrada' }));
});

server.listen(port, () => {
  console.log(`API executando na porta ${port}`);
});