export default {
  command: ['hidetag', 'tag'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args, usedPrefix, command) => {

    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants || []
    const mentions = groupParticipants.map(p => p.jid || p.id || p.lid || p.phoneNumber)
      .filter(Boolean)
      .map(id => client.decodeJid(id))

    const userText = (args.join(' ') || '').trim()
    const src = m.quoted || m

    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long'
    })

    const firma = `\n> Jysuys Bot 🥷 | ${fecha}`

    const hasImage = Boolean(src.message?.imageMessage || src.mtype === 'imageMessage')
    const hasVideo = Boolean(src.message?.videoMessage || src.mtype === 'videoMessage')
    const hasAudio = Boolean(src.message?.audioMessage || src.mtype === 'audioMessage')
    const hasSticker = Boolean(src.message?.stickerMessage || src.mtype === 'stickerMessage')

    const isQuoted = Boolean(m.quoted)
    const originalText = (src.caption || src.text || '').trim()

    try {

      if (hasImage || hasVideo) {
        const media = await src.download()
        const options = { quoted: null, mentions }

        let captionFinal = ''

        if (isQuoted) {
          captionFinal = originalText ? originalText + firma : firma.trim()
        } else {
          captionFinal = userText ? userText + firma : firma.trim()
        }

        if (hasImage) {
          return client.sendMessage(m.chat, {
            image: media,
            caption: captionFinal,
            ...options
          })
        } else {
          return client.sendMessage(m.chat, {
            video: media,
            mimetype: 'video/mp4',
            caption: captionFinal,
            ...options
          })
        }
      }

      if (hasAudio) {
        const media = await src.download()
        return client.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mp4',
          fileName: 'hidetag.mp3',
          mentions
        }, { quoted: null })
      }

      if (hasSticker) {
        const media = await src.download()
        return client.sendMessage(m.chat, {
          sticker: media,
          mentions
        }, { quoted: null })
      }

      if (isQuoted && originalText) {
        return client.sendMessage(m.chat, {
          text: originalText + firma,
          mentions
        }, { quoted: null })
      }

      if (userText) {
        return client.sendMessage(m.chat, {
          text: userText + firma,
          mentions
        }, { quoted: null })
      }

      return m.reply(`《✧》 *Ingresa* un texto o *responde* a uno`)

    } catch (e) {
      return m.reply(`Error: ${e.message}`)
    }
  }
}