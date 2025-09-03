import { supabase } from './supabase';
import { 
  User, 
  Memo, 
  Quiz, 
  Attempt, 
  NotificationLog, 
  QuizType, 
  QuizStatus,
  NotificationChannel,
  NotificationStatus 
} from '@/types';

// ユーザー関連の操作
export class UserService {
  static async findByLineUserId(lineUserId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('line_user_id', lineUserId)
      .single();

    if (error) {
      console.error('Error finding user by LINE ID:', error);
      return null;
    }

    return data;
  }

  static async create(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  static async update(id: string, userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  static async findOrCreateByLineId(lineUserId: string, userData: Partial<User>): Promise<User | null> {
    let user = await this.findByLineUserId(lineUserId);
    
    if (!user) {
      user = await this.create({
        ...userData,
        line_user_id: lineUserId
      });
    }

    return user;
  }
}

// メモ関連の操作
export class MemoService {
  static async create(memoData: Omit<Memo, 'id' | 'created_at' | 'updated_at'>): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .insert([memoData])
      .select()
      .single();

    if (error) {
      console.error('Error creating memo:', error);
      return null;
    }

    return data;
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching memos:', error);
      return [];
    }

    return data || [];
  }

  static async findById(id: string): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding memo:', error);
      return null;
    }

    return data;
  }

  static async update(id: string, memoData: Partial<Memo>): Promise<Memo | null> {
    const { data, error } = await supabase
      .from('memos')
      .update(memoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating memo:', error);
      return null;
    }

    return data;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting memo:', error);
      return false;
    }

    return true;
  }
}

// クイズ関連の操作
export class QuizService {
  static async create(quizData: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return null;
    }

    return data;
  }

  static async findByUserId(lineUserId: string, status?: QuizStatus): Promise<Quiz[]> {
    try {
      // line_user_idから実際のuser.idを取得
      const user = await UserService.findByLineUserId(lineUserId);
      if (!user) {
        console.log('User not found for lineUserId:', lineUserId);
        return [];
      }

      let query = supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching quizzes:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception in findByUserId:', err);
      return [];
    }
  }

  static async findById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error finding quiz:', error);
      return null;
    }

    return data;
  }

  static async findTodayQuizzes(lineUserId: string): Promise<Quiz[]> {
    console.log('QuizService.findTodayQuizzes - lineUserId:', lineUserId);
    
    try {
      // まず、line_user_idから実際のuser.idを取得
      const user = await UserService.findByLineUserId(lineUserId);
      if (!user) {
        console.log('User not found for lineUserId:', lineUserId);
        return [];
      }

      console.log('Found user:', { id: user.id, line_user_id: user.line_user_id });

      // 該当ユーザーの全クイズを確認
      const { data: allQuizzes, error: allError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id);

      console.log('All user quizzes:', { count: allQuizzes?.length || 0, error: allError });

      // 今日のクイズを取得
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'today');

      console.log('Today quizzes query result:', { 
        count: data?.length || 0, 
        error: error?.message || null,
        data: data?.map(q => ({ id: q.id, status: q.status, scheduled_at: q.scheduled_at }))
      });

      if (error) {
        console.error('Error fetching today quizzes:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception in findTodayQuizzes:', err);
      return [];
    }
  }

  static async findScheduledQuizzes(status: QuizStatus, beforeDate?: Date): Promise<Quiz[]> {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('status', status);

    if (beforeDate) {
      query = query.lte('scheduled_at', beforeDate.toISOString());
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled quizzes:', error);
      return [];
    }

    return data || [];
  }

  static async updateStatus(id: string, status: QuizStatus, scheduledAt?: Date): Promise<Quiz | null> {
    const updateData: any = { status };
    if (scheduledAt) {
      updateData.scheduled_at = scheduledAt.toISOString();
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz status:', error);
      return null;
    }

    return data;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }

    return true;
  }
}

// 回答関連の操作
export class AttemptService {
  static async create(attemptData: Omit<Attempt, 'id' | 'answered_at'>): Promise<Attempt | null> {
    const { data, error } = await supabase
      .from('attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) {
      console.error('Error creating attempt:', error);
      return null;
    }

    return data;
  }

  static async findByQuizId(quizId: string): Promise<Attempt[]> {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .order('answered_at', { ascending: false });

    if (error) {
      console.error('Error fetching attempts:', error);
      return [];
    }

    return data || [];
  }

  static async findByUserId(lineUserId: string, limit: number = 100): Promise<Attempt[]> {
    try {
      // line_user_idから実際のuser.idを取得
      const user = await UserService.findByLineUserId(lineUserId);
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user attempts:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception in AttemptService.findByUserId:', err);
      return [];
    }
  }

  static async getStats(lineUserId: string, days: number = 7): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
  }> {
    try {
      // line_user_idから実際のuser.idを取得
      const user = await UserService.findByLineUserId(lineUserId);
      if (!user) {
        return { totalAttempts: 0, correctAttempts: 0, accuracy: 0 };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('attempts')
        .select('is_correct')
        .eq('user_id', user.id)
        .gte('answered_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching attempt stats:', error);
        return { totalAttempts: 0, correctAttempts: 0, accuracy: 0 };
      }

      const totalAttempts = data?.length || 0;
      const correctAttempts = data?.filter(attempt => attempt.is_correct).length || 0;
      const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      return { totalAttempts, correctAttempts, accuracy };
    } catch (err) {
      console.error('Exception in getStats:', err);
      return { totalAttempts: 0, correctAttempts: 0, accuracy: 0 };
    }
  }
}

// 通知ログ関連の操作
export class NotificationLogService {
  static async create(logData: Omit<NotificationLog, 'id' | 'sent_at'>): Promise<NotificationLog | null> {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification log:', error);
      return null;
    }

    return data;
  }

  static async findByQuizId(quizId: string): Promise<NotificationLog[]> {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching notification logs:', error);
      return [];
    }

    return data || [];
  }

  static async updateStatus(
    id: string, 
    status: NotificationStatus, 
    errorMessage?: string
  ): Promise<NotificationLog | null> {
    const updateData: any = { status };
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { data, error } = await supabase
      .from('notification_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification log:', error);
      return null;
    }

    return data;
  }

  static async incrementRetryCount(id: string): Promise<NotificationLog | null> {
    const { data, error } = await supabase
      .rpc('increment_retry_count', { log_id: id });

    if (error) {
      console.error('Error incrementing retry count:', error);
      return null;
    }

    return data;
  }
}

// 統計情報を取得するための関数
export class StatsService {
  static async getUserStats(lineUserId: string) {
    try {
      // line_user_idから実際のuser.idを取得
      const user = await UserService.findByLineUserId(lineUserId);
      if (!user) {
        return {
          memoCount: 0,
          quizCount: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          continuityDays: 0
        };
      }

      // メモ数
      const { count: memoCount } = await supabase
        .from('memos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // クイズ数
      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 回答統計
      const attemptStats = await AttemptService.getStats(lineUserId);

      // 継続日数（7日間の回答履歴）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentAttempts } = await supabase
        .from('attempts')
        .select('answered_at')
        .eq('user_id', user.id)
        .gte('answered_at', sevenDaysAgo.toISOString())
        .order('answered_at', { ascending: false });

      const continuityDays = this.calculateContinuityDays(recentAttempts || []);

      return {
        memoCount: memoCount || 0,
        quizCount: quizCount || 0,
        ...attemptStats,
        continuityDays
      };
    } catch (err) {
      console.error('Exception in getUserStats:', err);
      return {
        memoCount: 0,
        quizCount: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        continuityDays: 0
      };
    }
  }

  private static calculateContinuityDays(attempts: { answered_at: string }[]): number {
    if (attempts.length === 0) return 0;

    const dates = new Set(
      attempts.map(attempt => 
        new Date(attempt.answered_at).toDateString()
      )
    );

    let continuityDays = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (dates.has(checkDate.toDateString())) {
        continuityDays++;
      } else {
        break;
      }
    }

    return continuityDays;
  }
}