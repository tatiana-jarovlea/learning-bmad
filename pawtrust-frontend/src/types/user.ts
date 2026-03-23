export interface User {
  id: number
  name: string
  email: string
  role: 'buyer' | 'breeder' | 'sitter' | 'admin'
  locale: 'ro' | 'ru'
}

