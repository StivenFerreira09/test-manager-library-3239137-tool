import 'dotenv/config'

const BASE = process.env.API_BASE_URL || 'http://localhost:8000/api/v1'
const USER = process.env.ADMIN_USERNAME || 'admin'
const PASS = process.env.ADMIN_PASSWORD || 'ChangeMeNow123!'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    console.error(`${method} ${path} → ${res.status}`, data)
    throw new Error(`HTTP ${res.status}`)
  }
  return data
}

const CATEGORY_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
]

const BOOK_TITLES = [
  ['Cien años de soledad', 'Gabriel García Márquez'],
  ['El amor en los tiempos del cólera', 'Gabriel García Márquez'],
  ['Don Quijote de la Mancha', 'Miguel de Cervantes'],
  ['La casa de los espíritus', 'Isabel Allende'],
  ['Rayuela', 'Julio Cortázar'],
  ['Ficciones', 'Jorge Luis Borges'],
  ['Pedro Páramo', 'Juan Rulfo'],
  ['Los detectives salvajes', 'Roberto Bolaño'],
  ['El túnel', 'Ernesto Sábato'],
  ['Sobre héroes y tumbas', 'Ernesto Sábato'],
  ['La ciudad y los perros', 'Mario Vargas Llosa'],
  ['Conversación en La Catedral', 'Mario Vargas Llosa'],
  ['El principito', 'Antoine de Saint-Exupéry'],
  ['1984', 'George Orwell'],
  ['Rebelión en la granja', 'George Orwell'],
  ['Un mundo feliz', 'Aldous Huxley'],
  ['Fahrenheit 451', 'Ray Bradbury'],
  ['Crónica de una muerte anunciada', 'Gabriel García Márquez'],
  ['El Aleph', 'Jorge Luis Borges'],
  ['Historia de dos ciudades', 'Charles Dickens'],
  ['Orgullo y prejuicio', 'Jane Austen'],
  ['Matar a un ruiseñor', 'Harper Lee'],
  ['El gran Gatsby', 'F. Scott Fitzgerald'],
  ['Moby Dick', 'Herman Melville'],
  ['La odisea', 'Homero'],
  ['La ilíada', 'Homero'],
  ['Hamlet', 'William Shakespeare'],
  ['Romeo y Julieta', 'William Shakespeare'],
  ['Drácula', 'Bram Stoker'],
  ['Frankenstein', 'Mary Shelley'],
  ['El código Da Vinci', 'Dan Brown'],
  ['Ángeles y demonios', 'Dan Brown'],
  ['Harry Potter y la piedra filosofal', 'J.K. Rowling'],
  ['El señor de los anillos', 'J.R.R. Tolkien'],
  ['El hobbit', 'J.R.R. Tolkien'],
  ['Dune', 'Frank Herbert'],
  ['Fundación', 'Isaac Asimov'],
  ['Neuromante', 'William Gibson'],
  ['Sapiens', 'Yuval Noah Harari'],
  ['Homo Deus', 'Yuval Noah Harari'],
  ['Breve historia del tiempo', 'Stephen Hawking'],
  ['El gen egoísta', 'Richard Dawkins']
]

function isbn13(n) {
  const base = String(9780000000000 + n).slice(0, 12)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3)
  }
  const check = (10 - (sum % 10)) % 10
  return base + String(check)
}

async function main() {
  console.log('Login...')
  const auth = await request('POST', '/auth/login', {
    username: USER,
    password: PASS
  })
  const token = auth.access_token
  console.log('OK, role:', auth.role)

  console.log('Creando libros...')
  const bookIds = []
  for (let i = 0; i < BOOK_TITLES.length; i++) {
    const [title, author] = BOOK_TITLES[i]
    const book = await request('POST', '/books', {
      title,
      author,
      isbn: isbn13(i + 1),
      category_id: CATEGORY_IDS[i % CATEGORY_IDS.length],
      total_copies: 3 + (i % 3)
    }, token)
    bookIds.push(book.id)
  }
  console.log(`Libros: ${bookIds.length}`)

  console.log('Creando socios...')
  const memberIds = []
  for (let i = 1; i <= 10; i++) {
    const member = await request('POST', '/members', {
      full_name: `Socio Demo ${i}`,
      document_number: `DOC${String(i).padStart(5, '0')}`
    }, token)
    memberIds.push(member.id)
  }
  console.log(`Socios: ${memberIds.length}`)

  console.log('Creando préstamos...')
  let loanCount = 0
  for (let i = 0; i < 15; i++) {
    const memberId = memberIds[i % memberIds.length]
    const b1 = bookIds[i % bookIds.length]
    const b2 = bookIds[(i + 7) % bookIds.length]
    const items = b1 === b2 ? [{ book_id: b1 }] : [{ book_id: b1 }, { book_id: b2 }]
    try {
      await request('POST', '/loans', {
        member_id: memberId,
        items
      }, token)
      loanCount++
    } catch {
      // puede fallar por límite de 3 o vencidos; se ignora en demo
    }
  }
  console.log(`Préstamos creados: ${loanCount}`)

  console.log('Listo. Verifica:')
  console.log('- GET /loans/overdue')
  console.log('- GET /reports/most-borrowed?from=...&to=...')
}

main().catch((err) => {
  console.error('Error en el sembrador:', err.message)
  process.exit(1)
})
