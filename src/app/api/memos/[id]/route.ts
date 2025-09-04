import { NextRequest, NextResponse } from 'next/server';
import { MemoService } from '@/lib/quiz-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memo = await MemoService.findById(params.id);
    
    if (!memo) {
      return NextResponse.json(
        { error: 'メモが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memo });

  } catch (error) {
    console.error('Error fetching memo:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, text } = body;

    const memo = await MemoService.update(params.id, { title, text });
    
    if (!memo) {
      return NextResponse.json(
        { error: 'メモの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ memo });

  } catch (error) {
    console.error('Error updating memo:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await MemoService.delete(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'メモの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'メモを削除しました' });

  } catch (error) {
    console.error('Error deleting memo:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}