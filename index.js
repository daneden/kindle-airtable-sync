require("dotenv").config()

const fs = require("fs")
const Airtable = require("airtable")

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
  CLIPPINGS_LOCATION,
} = process.env

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

const regexes = {
  pageNumber: /page ([0-9]+)/,
  location: /location ([0-9]+)-([0-9]+)/,
  title: /(.*) \((.*)\)$/,
  date: /Added on (.*)$/,
}

function chunkArray(arr, len) {
  let chunks = [],
    i = 0,
    n = arr.length

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)))
  }

  return chunks
}

const filterBlank = (el) => {
  return el !== null && el.trim() !== ""
}

const parseNote = (note) => {
  const lines = note.split(/[\n\r]/).filter((s) => s !== "")
  const [titleAndAuthor, metadata, highlight] = lines

  const { 1: title, 2: authors } = regexes.title.exec(titleAndAuthor)
  const author = authors
    .split(";")
    .map((author) => author.split(", ").reverse().join(" "))
    .join(", ")

  const pageNumberMatches = regexes.pageNumber.exec(metadata)
  const pageNumber = pageNumberMatches && parseInt(pageNumberMatches[1])
  const { 1: locStart, 2: locEnd } =
    regexes.location.test(metadata) && regexes.location.exec(metadata)
  const { 1: date } = regexes.date.test(metadata) && regexes.date.exec(metadata)

  const parsedNote = {
    title,
    author,
    date: new Date(date).toISOString(),
    note: highlight,
    pageNumber,
    locStart: parseInt(locStart),
    locEnd: parseInt(locEnd),
  }

  if (parsedNote.pageNumber === undefined) {
    delete parsedNote.pageNumber
  }

  return parsedNote
}

const notebook = fs.readFileSync(CLIPPINGS_LOCATION, "utf-8")

function postNotes(notebook) {
  const notes = notebook.split("==========").filter(filterBlank).map(parseNote)
  const chunkedNotes = chunkArray(notes, 10)

  chunkedNotes.map((notes) => {
    base(AIRTABLE_TABLE_NAME)
      .create(
        notes.map(
          (note) => {
            return {
              fields: note,
            }
          },
          { typecast: true },
          (err, records) => {
            if (err) {
              console.error(err)
              return
            }
          }
        )
      )
      .catch((err) => {
        console.error(err)
      })
  })
}

postNotes(notebook)
