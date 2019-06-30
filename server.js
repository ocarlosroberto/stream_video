const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/stream.htm'))
})

app.get('/video/:arqVid', function(req, res) {
  const arquivoVideo = req.params.arqVid
  const caminho = 'media/' + arquivoVideo + '.mp4'
  const stat = fs.statSync(caminho)
  const tamanhoArquivo = stat.size
  const range = req.headers.range

  if (range) {
    const particoes = range.replace(/bytes=/, "").split("-")
    const start = parseInt(particoes[0], 10)
    const fim = particoes[1] ? parseInt(particoes[1], 10) : tamanhoArquivo - 1
    const chunksize = (fim - start) + 1
    const arquivo = fs.createReadStream(caminho, {start, fim})
    const cabecalho = {
      'Content-Range': `bytes ${start} - ${fim} / ${tamanhoArquivo}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, cabecalho);
    arquivo.pipe(res);
  }
  else
  {
    const head = {
      'Content-Length': tamanhoArquivo,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(200, head)
    fs.createReadStream(caminho).pipe(res)
  }
})

app.listen(3000, function () {
  console.log('Iniciado servidor de video!')
})