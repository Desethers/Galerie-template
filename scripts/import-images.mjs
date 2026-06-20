/**
 * Import toutes les images du dossier /images dans Sanity
 * via l'API directement (contourne le Studio UI)
 *
 * Usage : node scripts/import-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROJECT_ID = 'd0op0luu'
const DATASET = 'production'
const TOKEN = 'skVOHcPYT7StADTnR3c1HVVcG5Qo8BPUbBVkIvYgoN3jPC9VWmPhRvOnxyNWSK4ZOibBxax7isD3JROO0CujOfigF163chHewrMOHXc0kX3JvRAIUj7FAxaZc3U3gKdsIY3seDVSkjuJr0yH1OWSm6MY2tMe8dFenooq2KLae3pdbWuqbspg'
const IMAGES_DIR = path.join(__dirname, '../images')

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.tiff': 'image/tiff',
}

async function uploadImage(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext]
  if (!mimeType) return null

  const filename = path.basename(filePath)
  const buffer = fs.readFileSync(filePath)

  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v1/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': mimeType,
      },
      body: buffer,
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HTTP ${res.status}: ${err}`)
  }

  return await res.json()
}

function walkDir(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath))
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (Object.keys(MIME_TYPES).includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  return files
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Dossier introuvable : ${IMAGES_DIR}`)
    process.exit(1)
  }

  const images = walkDir(IMAGES_DIR)
  console.log(`\n📁 ${images.length} images trouvées dans /images\n`)

  const results = { success: [], failed: [] }

  for (const [i, filePath] of images.entries()) {
    const name = path.relative(IMAGES_DIR, filePath)
    process.stdout.write(`[${i + 1}/${images.length}] ${name} ... `)

    try {
      const doc = await uploadImage(filePath)
      const id = doc.document._id
      console.log(`✅ ${id}`)
      results.success.push({ name, id, url: doc.document.url })
    } catch (err) {
      console.log(`❌ ${err.message}`)
      results.failed.push({ name, error: err.message })
    }
  }

  console.log(`\n─────────────────────────────────────`)
  console.log(`✅ Succès : ${results.success.length}`)
  console.log(`❌ Échecs : ${results.failed.length}`)

  // Sauvegarde le mapping dans un fichier JSON
  const outputPath = path.join(__dirname, 'imported-images.json')
  fs.writeFileSync(outputPath, JSON.stringify(results.success, null, 2))
  console.log(`\n💾 Mapping sauvegardé → scripts/imported-images.json`)
  console.log(`   (Tu peux utiliser ces IDs pour lier les images dans Sanity)\n`)
}

main().catch(console.error)
