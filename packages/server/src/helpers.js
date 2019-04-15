const reservedWords = require('./reserved_words.json')

function isReservedKeyword(s) {
  s = s.toLowerCase().trim()
  return reservedWords.indexOf(s) > -1
}

function normalizeChannel(channel) {
  return channel.replace(/[^a-zA-Z0-9-]+/, '').toLowerCase().trim()
}

function isValidChannelName(channel) {
  if (isReservedKeyword(channel)) {
    return false
  }

  return /^[a-zA-Z0-9-]+$/.test(channel)
}

module.exports = {
  isReservedKeyword,
  normalizeChannel,
  isValidChannelName
}
