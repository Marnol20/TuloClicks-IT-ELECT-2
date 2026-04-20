const express = require('express')
const app = express()

app.use(express.json())

app.post('/test', (req, res) => {
  console.log('Received body:', req.body)
  console.log('Content-Type:', req.get('Content-Type'))
  res.json({ success: true, data: req.body })
})

app.listen(3001, () => {
  console.log('Test server running on port 3001')
})