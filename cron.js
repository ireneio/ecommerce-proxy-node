const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const consola = require('consola')

// Target Directory
const directory = './uploads'
// Interval
const interval = '* * 3 * *'

const removeUploads = function () {
  consola.info({
    message: `Cron Job: remove-uploads is running with a schedule of: ${interval}...`,
    badge: true
  })
  cron.schedule(interval, () => {
    consola.info({
      message: 'Cron Job: remove-uploads has ran',
      badge: true
    })
    fs.readdir(directory, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err
        })
      }
    })
  })
}

module.exports = {
  removeUploads
}
