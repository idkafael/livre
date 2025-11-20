import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import IndexContent from './index-content'

export default async function Home() {
  let htmlContent = ''
  
  try {
    const filePath = join(process.cwd(), 'public', 'index-original.html')
    
    // Verificar se o arquivo existe antes de tentar ler
    if (!existsSync(filePath)) {
      console.error('HTML file not found at:', filePath)
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Arquivo HTML não encontrado</h1>
          <p>O arquivo index-original.html não foi encontrado em: {filePath}</p>
        </div>
      )
    }
    
    htmlContent = await readFile(filePath, 'utf-8')
    console.log('HTML file loaded successfully, size:', htmlContent.length)
  } catch (error: any) {
    console.error('Error reading HTML file:', error?.message || error)
    console.error('Stack:', error?.stack)
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Erro ao carregar página</h1>
        <p>{error?.message || 'Erro desconhecido ao ler o arquivo HTML'}</p>
        <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '20px', fontSize: '12px' }}>
          {error?.stack}
        </pre>
      </div>
    )
  }

  // Sempre retornar o componente, mesmo com HTML vazio
  // O componente IndexContent lida com HTML vazio
  return <IndexContent htmlContent={htmlContent} />
}
