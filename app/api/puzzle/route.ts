import { NextRequest, NextResponse } from 'next/server'

const PUZZLE_API_URL = 'https://gap.generationalpha.site'

export async function GET() {
  try {
    console.log('🔍 API Route - Fetching puzzle data from:', `${PUZZLE_API_URL}/puzzel/image`)
    
    const response = await fetch(`${PUZZLE_API_URL}/puzzel/image`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 API Route - Response status:', response.status)
    console.log('📡 API Route - Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Route - External API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ API Route - Successfully fetched puzzle data:', {
      current_image: data.current_image,
      image_link: data.image_link,
      status_length: data.status?.length
    })
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('❌ API Route - Error fetching puzzle data:', error)
    console.error('❌ API Route - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch puzzle data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
