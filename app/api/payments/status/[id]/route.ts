import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Em produção, você deve consultar o status real no Mercado Pago
    // Por enquanto, retornamos um mock
    
    return NextResponse.json({
      status: 'pending',
      transaction_id: id
    })
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }
}

